package com.example.GeneradorHorarios.Servicio;

import com.example.GeneradorHorarios.Modelo.Aula;
import com.example.GeneradorHorarios.Modelo.BloqueTiempo;
import com.example.GeneradorHorarios.Modelo.CargaAcademica;
import com.example.GeneradorHorarios.Modelo.ComponenteCarga;
import com.example.GeneradorHorarios.Modelo.DTO.MoverSesionRequest;
import com.example.GeneradorHorarios.Modelo.DetalleHorario;
import com.example.GeneradorHorarios.Modelo.PropuestaDisponibilidad;
import com.example.GeneradorHorarios.Modelo.Repositorio.AulaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.BloqueTiempoRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.ComponenteCargaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.DetalleHorarioRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PropuestaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.SesionClaseRepositorio;
import com.example.GeneradorHorarios.Modelo.SesionClase;
import com.example.GeneradorHorarios.Modelo.enums.EstadoPropuesta;
import com.example.GeneradorHorarios.Modelo.enums.EstadoSesion;
import com.example.GeneradorHorarios.Modelo.enums.TipoAula;
import com.example.GeneradorHorarios.Modelo.enums.TipoBloque;
import com.example.GeneradorHorarios.Modelo.enums.TipoSesion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Edicion manual de sesiones programadas. Permite mover una sesion logica
 * (todas las filas que componen una sesion multi-bloque) a un nuevo bloque
 * inicial y/o aula, o eliminarla por completo.
 *
 * Toda operacion re-valida hard constraints contra el grid actual antes de
 * persistir. Si hay choque -> SugerenciaNoViableException (HTTP 409).
 */
@Service
public class EdicionSesionService {

    @Autowired private SesionClaseRepositorio sesionClaseRepositorio;
    @Autowired private ComponenteCargaRepositorio componenteCargaRepositorio;
    @Autowired private BloqueTiempoRepositorio bloqueTiempoRepositorio;
    @Autowired private AulaRepositorio aulaRepositorio;
    @Autowired private PropuestaRepositorio propuestaRepositorio;
    @Autowired private DetalleHorarioRepositorio detalleHorarioRepositorio;

    @Transactional
    public List<SesionClase> moverSesionLogica(MoverSesionRequest req) {
        if (req == null || req.getIdComponente() == null || req.getNumeroSesion() == null
                || req.getIdBloqueInicialNuevo() == null || req.getIdAulaNueva() == null) {
            throw new IllegalArgumentException("Solicitud incompleta: idComponente, numeroSesion, idBloqueInicialNuevo e idAulaNueva son obligatorios");
        }

        ComponenteCarga componente = componenteCargaRepositorio.findById(req.getIdComponente())
                .orElseThrow(() -> new IllegalArgumentException("Componente no existe: " + req.getIdComponente()));
        CargaAcademica carga = componente.getCargaAcademica();
        Long idPeriodo = carga.getPeriodoAcademico().getIdPeriodoAcademico();

        Aula aulaNueva = aulaRepositorio.findById(req.getIdAulaNueva())
                .orElseThrow(() -> new IllegalArgumentException("Aula no existe: " + req.getIdAulaNueva()));

        BloqueTiempo bloqueInicial = bloqueTiempoRepositorio.findById(req.getIdBloqueInicialNuevo())
                .orElseThrow(() -> new IllegalArgumentException("Bloque no existe: " + req.getIdBloqueInicialNuevo()));

        // Validaciones de hard constraints
        if (bloqueInicial.getTurno() != carga.getGrupo().getTurno()) {
            throw new SugerenciaNoViableException(
                    "El bloque destino no pertenece al turno del grupo");
        }
        if (!esAulaCompatible(componente.getTipoSesion(), aulaNueva.getTipoAula())) {
            throw new SugerenciaNoViableException(
                    "El aula destino no es compatible con el tipo de sesion (" + componente.getTipoSesion() + ")");
        }
        if (carga.getGrupo().getCupoMaximo() != null && aulaNueva.getCapacidad() != null
                && aulaNueva.getCapacidad() < carga.getGrupo().getCupoMaximo()) {
            throw new SugerenciaNoViableException(
                    "El aula destino no tiene capacidad suficiente (" + aulaNueva.getCapacidad()
                            + " < " + carga.getGrupo().getCupoMaximo() + ")");
        }

        // Cargar sesiones existentes de la sesion logica y construir secuencia destino
        List<SesionClase> sesionesActuales = sesionClaseRepositorio
                .findByComponenteCarga_CargaAcademica_PeriodoAcademico_IdPeriodoAcademico(idPeriodo);

        List<SesionClase> sesionesAfectadas = sesionesActuales.stream()
                .filter(s -> s.getComponenteCarga().getIdComponente().equals(req.getIdComponente()))
                .filter(s -> req.getNumeroSesion().equals(s.getNumeroSesion()))
                .collect(Collectors.toList());

        if (sesionesAfectadas.isEmpty()) {
            throw new IllegalArgumentException(
                    "No existe la sesion logica para componente " + req.getIdComponente()
                            + " sesion " + req.getNumeroSesion());
        }

        int bloquesNecesarios = sesionesAfectadas.size();
        boolean requiereConsecutivos = bloquesNecesarios > 1;

        List<BloqueTiempo> secuenciaDestino = construirSecuenciaDesde(
                bloqueInicial, bloquesNecesarios, requiereConsecutivos);

        if (secuenciaDestino == null) {
            throw new SugerenciaNoViableException(
                    "No se pueden construir " + bloquesNecesarios + " bloques consecutivos desde "
                            + bloqueInicial.getDiaSemana() + " " + bloqueInicial.getHoraInicio());
        }

        // Validar PROHIBIDOS del profesor para cada bloque destino
        Map<Long, Set<Long>> prohibidos = cargarBloquesProhibidos(idPeriodo);
        Long idProfesor = carga.getProfesor().getIdProfesor();
        for (BloqueTiempo b : secuenciaDestino) {
            if (prohibidos.getOrDefault(idProfesor, Set.of()).contains(b.getIdBloqueTiempo())) {
                throw new SugerenciaNoViableException(
                        "El profesor tiene bloque PROHIBIDO en "
                                + b.getDiaSemana() + " " + b.getHoraInicio());
            }
        }

        // Validar choques en el grid ACTUAL excluyendo las sesiones afectadas
        Set<Long> idsAfectadas = sesionesAfectadas.stream()
                .map(SesionClase::getIdSesion)
                .collect(Collectors.toSet());

        Set<String> ocupadoAula = new HashSet<>();
        Set<String> ocupadoProfesor = new HashSet<>();
        Set<String> ocupadoGrupo = new HashSet<>();
        Set<String> ocupadoComponente = new HashSet<>();

        Long idGrupo = carga.getGrupo().getIdGrupo();

        for (SesionClase s : sesionesActuales) {
            if (idsAfectadas.contains(s.getIdSesion())) continue;
            Long idB = s.getBloqueTiempo().getIdBloqueTiempo();
            CargaAcademica c = s.getComponenteCarga().getCargaAcademica();
            ocupadoAula.add(key(s.getAula().getIdAula(), idB));
            ocupadoProfesor.add(key(c.getProfesor().getIdProfesor(), idB));
            ocupadoGrupo.add(key(c.getGrupo().getIdGrupo(), idB));
            ocupadoComponente.add(key(s.getComponenteCarga().getIdComponente(), idB));
        }

        for (BloqueTiempo bDest : secuenciaDestino) {
            Long idB = bDest.getIdBloqueTiempo();
            if (ocupadoAula.contains(key(aulaNueva.getIdAula(), idB))) {
                throw new SugerenciaNoViableException(
                        "El aula " + aulaNueva.getNombreAula() + " ya esta ocupada en "
                                + bDest.getDiaSemana() + " " + bDest.getHoraInicio());
            }
            if (ocupadoProfesor.contains(key(idProfesor, idB))) {
                throw new SugerenciaNoViableException(
                        "Choque de profesor en " + bDest.getDiaSemana() + " " + bDest.getHoraInicio());
            }
            if (ocupadoGrupo.contains(key(idGrupo, idB))) {
                throw new SugerenciaNoViableException(
                        "Choque de grupo en " + bDest.getDiaSemana() + " " + bDest.getHoraInicio());
            }
            if (ocupadoComponente.contains(key(req.getIdComponente(), idB))) {
                throw new SugerenciaNoViableException(
                        "El componente ya tiene otra sesion en ese bloque");
            }
        }

        // Borrar afectadas + flush para liberar UNIQUE constraints
        sesionClaseRepositorio.deleteAll(sesionesAfectadas);
        sesionClaseRepositorio.flush();

        // Insertar en nueva posicion
        List<SesionClase> nuevas = new ArrayList<>();
        for (BloqueTiempo bDest : secuenciaDestino) {
            SesionClase nueva = new SesionClase();
            nueva.setComponenteCarga(componente);
            nueva.setBloqueTiempo(bDest);
            nueva.setAula(aulaNueva);
            nueva.setNumeroSesion(req.getNumeroSesion());
            nueva.setEstado(EstadoSesion.PROGRAMADA);
            nuevas.add(nueva);
        }
        return sesionClaseRepositorio.saveAll(nuevas);
    }

    @Transactional
    public int eliminarSesionLogica(Long idComponente, Integer numeroSesion) {
        if (idComponente == null || numeroSesion == null) {
            throw new IllegalArgumentException("idComponente y numeroSesion son obligatorios");
        }
        ComponenteCarga componente = componenteCargaRepositorio.findById(idComponente)
                .orElseThrow(() -> new IllegalArgumentException("Componente no existe: " + idComponente));
        Long idPeriodo = componente.getCargaAcademica().getPeriodoAcademico().getIdPeriodoAcademico();

        List<SesionClase> afectadas = sesionClaseRepositorio
                .findByComponenteCarga_CargaAcademica_PeriodoAcademico_IdPeriodoAcademico(idPeriodo)
                .stream()
                .filter(s -> s.getComponenteCarga().getIdComponente().equals(idComponente))
                .filter(s -> numeroSesion.equals(s.getNumeroSesion()))
                .collect(Collectors.toList());

        if (afectadas.isEmpty()) return 0;

        sesionClaseRepositorio.deleteAll(afectadas);
        sesionClaseRepositorio.flush();
        return afectadas.size();
    }

    private List<BloqueTiempo> construirSecuenciaDesde(BloqueTiempo inicio, int n, boolean requiereConsecutivos) {
        if (n <= 0) return null;
        if (n == 1) return List.of(inicio);
        if (!requiereConsecutivos) return List.of(inicio);

        Map<String, Integer> ordenDias = Map.of(
                "LUNES", 1, "MARTES", 2, "MIERCOLES", 3, "JUEVES", 4,
                "VIERNES", 5, "SABADO", 6, "DOMINGO", 7);

        List<BloqueTiempo> ordenados = bloqueTiempoRepositorio.findAll().stream()
                .filter(b -> b.getTurno() == inicio.getTurno())
                .filter(b -> b.getDiaSemana().equals(inicio.getDiaSemana()))
                .sorted(Comparator
                        .comparing((BloqueTiempo b) -> ordenDias.getOrDefault(b.getDiaSemana(), 99))
                        .thenComparing(BloqueTiempo::getHoraInicio))
                .collect(Collectors.toList());

        int idx = -1;
        for (int i = 0; i < ordenados.size(); i++) {
            if (ordenados.get(i).getIdBloqueTiempo().equals(inicio.getIdBloqueTiempo())) {
                idx = i;
                break;
            }
        }
        if (idx < 0 || idx + n > ordenados.size()) return null;

        List<BloqueTiempo> sec = new ArrayList<>();
        sec.add(ordenados.get(idx));
        for (int j = 1; j < n; j++) {
            BloqueTiempo prev = ordenados.get(idx + j - 1);
            BloqueTiempo cur = ordenados.get(idx + j);
            if (!prev.getHoraFin().equals(cur.getHoraInicio())) return null;
            sec.add(cur);
        }
        return sec;
    }

    private Map<Long, Set<Long>> cargarBloquesProhibidos(Long idPeriodo) {
        List<PropuestaDisponibilidad> aprobadas = propuestaRepositorio
                .findByEstadoAndPeriodoAcademico_IdPeriodoAcademico(EstadoPropuesta.APROBADA, idPeriodo);
        List<DetalleHorario> detalles = detalleHorarioRepositorio.findByPropuestaDisponibilidadIn(aprobadas);
        Map<Long, Set<Long>> mapa = new HashMap<>();
        for (DetalleHorario d : detalles) {
            if (d.getTipoBloque() == TipoBloque.PROHIBIDO) {
                mapa.computeIfAbsent(d.getPropuestaDisponibilidad().getProfesor().getIdProfesor(), k -> new HashSet<>())
                        .add(d.getBloqueTiempo().getIdBloqueTiempo());
            }
        }
        return mapa;
    }

    private boolean esAulaCompatible(TipoSesion ts, TipoAula ta) {
        if (ts == TipoSesion.TEORIA) return true;
        if (ts == TipoSesion.LABORATORIO) return ta == TipoAula.LABORATORIO;
        if (ts == TipoSesion.TALLER) return ta == TipoAula.TALLER;
        return false;
    }

    private String key(Long a, Long b) { return a + "-" + b; }
}
