package com.example.GeneradorHorarios.Servicio;

import com.example.GeneradorHorarios.Modelo.Aula;
import com.example.GeneradorHorarios.Modelo.BloqueTiempo;
import com.example.GeneradorHorarios.Modelo.CargaAcademica;
import com.example.GeneradorHorarios.Modelo.ComponenteCarga;
import com.example.GeneradorHorarios.Modelo.ConflictoGeneracion;
import com.example.GeneradorHorarios.Modelo.DTO.AplicarSugerenciaRequest;
import com.example.GeneradorHorarios.Modelo.DTO.CambioPropuestoDTO;
import com.example.GeneradorHorarios.Modelo.DTO.ResultadoAplicacionDTO;
import com.example.GeneradorHorarios.Modelo.DetalleHorario;
import com.example.GeneradorHorarios.Modelo.PropuestaDisponibilidad;
import com.example.GeneradorHorarios.Modelo.Repositorio.AulaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.BloqueTiempoRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.ComponenteCargaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.ConflictoGeneracionRepositorio;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Aplica una sugerencia previamente calculada al horario.
 *
 * Estrategia transaccional:
 *  1. Re-valida la viabilidad de la sugerencia contra el estado ACTUAL del grid
 *     (puede haber cambiado desde que se calculo).
 *  2. Si hay choques residuales -> 409 Conflict via SugerenciaNoViableException.
 *  3. Si todo OK: elimina las sesiones afectadas, las re-inserta en su nueva
 *     posicion, inserta las sesiones nuevas y marca el conflicto como resuelto.
 *
 * El borrado+inserto evita choques transitorios con las UNIQUE constraints
 * (id_aula, id_bloque) y (id_componente, id_bloque) durante el SWAP.
 */
@Service
public class AplicadorSugerenciaService {

    @Autowired private ConflictoGeneracionRepositorio conflictoRepositorio;
    @Autowired private SesionClaseRepositorio sesionClaseRepositorio;
    @Autowired private BloqueTiempoRepositorio bloqueTiempoRepositorio;
    @Autowired private AulaRepositorio aulaRepositorio;
    @Autowired private ComponenteCargaRepositorio componenteCargaRepositorio;
    @Autowired private PropuestaRepositorio propuestaRepositorio;
    @Autowired private DetalleHorarioRepositorio detalleHorarioRepositorio;

    @Transactional
    public ResultadoAplicacionDTO aplicar(AplicarSugerenciaRequest req) {
        if (req == null || req.getIdConflicto() == null || req.getCambios() == null || req.getCambios().isEmpty()) {
            throw new IllegalArgumentException("Solicitud invalida: faltan datos");
        }

        ConflictoGeneracion conflicto = conflictoRepositorio.findById(req.getIdConflicto())
                .orElseThrow(() -> new IllegalArgumentException("Conflicto no existe: " + req.getIdConflicto()));

        if (Boolean.TRUE.equals(conflicto.getResuelto())) {
            throw new SugerenciaNoViableException("El conflicto ya esta resuelto");
        }

        Long idPeriodo = conflicto.getPeriodoAcademico().getIdPeriodoAcademico();

        Map<Long, BloqueTiempo> bloquesPorId = bloqueTiempoRepositorio.findAll().stream()
                .collect(Collectors.toMap(BloqueTiempo::getIdBloqueTiempo, b -> b));
        Map<Long, Aula> aulasPorId = aulaRepositorio.findAll().stream()
                .collect(Collectors.toMap(Aula::getIdAula, a -> a));

        Set<Long> idSesionesAfectadas = req.getCambios().stream()
                .map(CambioPropuestoDTO::getIdSesionAfectada)
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        Map<Long, SesionClase> sesionesAfectadas = new HashMap<>();
        for (Long id : idSesionesAfectadas) {
            SesionClase s = sesionClaseRepositorio.findById(id)
                    .orElseThrow(() -> new SugerenciaNoViableException(
                            "La sesion " + id + " ya no existe (otro usuario la modifico)"));
            sesionesAfectadas.put(id, s);
        }

        List<SesionClase> sesionesPeriodo = sesionClaseRepositorio
                .findByComponenteCarga_CargaAcademica_PeriodoAcademico_IdPeriodoAcademico(idPeriodo);
        List<SesionClase> remanentes = sesionesPeriodo.stream()
                .filter(s -> !idSesionesAfectadas.contains(s.getIdSesion()))
                .collect(Collectors.toList());

        Map<Long, Set<Long>> prohibidosPorProfesor = cargarBloquesProhibidos(idPeriodo);

        List<SesionClase> nuevasSesiones = new ArrayList<>();

        Set<String> ocupadoAula = new HashSet<>();
        Set<String> ocupadoProfesor = new HashSet<>();
        Set<String> ocupadoGrupo = new HashSet<>();
        Set<String> ocupadoComponente = new HashSet<>();

        for (SesionClase r : remanentes) {
            CargaAcademica c = r.getComponenteCarga().getCargaAcademica();
            Long idB = r.getBloqueTiempo().getIdBloqueTiempo();
            ocupadoAula.add(key(r.getAula().getIdAula(), idB));
            ocupadoProfesor.add(key(c.getProfesor().getIdProfesor(), idB));
            ocupadoGrupo.add(key(c.getGrupo().getIdGrupo(), idB));
            ocupadoComponente.add(key(r.getComponenteCarga().getIdComponente(), idB));
        }

        for (CambioPropuestoDTO cambio : req.getCambios()) {
            BloqueTiempo bloque = bloquesPorId.get(cambio.getIdBloqueTiempoNuevo());
            Aula aula = aulasPorId.get(cambio.getIdAulaNueva());
            if (bloque == null) {
                throw new SugerenciaNoViableException(
                        "El bloque " + cambio.getIdBloqueTiempoNuevo() + " no existe");
            }
            if (aula == null) {
                throw new SugerenciaNoViableException(
                        "El aula " + cambio.getIdAulaNueva() + " no existe");
            }

            ComponenteCarga componente;
            Integer numeroSesion;
            if (cambio.getIdSesionAfectada() != null) {
                SesionClase original = sesionesAfectadas.get(cambio.getIdSesionAfectada());
                componente = original.getComponenteCarga();
                numeroSesion = original.getNumeroSesion();
            } else {
                componente = conflicto.getComponenteCarga();
                numeroSesion = conflicto.getNumeroSesion() != null ? conflicto.getNumeroSesion() : 1;
            }

            CargaAcademica carga = componente.getCargaAcademica();
            Long idProf = carga.getProfesor().getIdProfesor();
            Long idGrupo = carga.getGrupo().getIdGrupo();
            Long idBloque = bloque.getIdBloqueTiempo();

            if (bloque.getTurno() != carga.getGrupo().getTurno()) {
                throw new SugerenciaNoViableException(
                        "El bloque destino no pertenece al turno del grupo");
            }
            if (prohibidosPorProfesor.getOrDefault(idProf, Set.of()).contains(idBloque)) {
                throw new SugerenciaNoViableException(
                        "El profesor tiene bloque PROHIBIDO en el destino");
            }
            if (!esAulaCompatible(componente.getTipoSesion(), aula.getTipoAula())) {
                throw new SugerenciaNoViableException(
                        "El aula destino no es compatible con el tipo de sesion");
            }
            if (carga.getGrupo().getCupoMaximo() != null && aula.getCapacidad() != null
                    && aula.getCapacidad() < carga.getGrupo().getCupoMaximo()) {
                throw new SugerenciaNoViableException(
                        "El aula destino no tiene capacidad suficiente");
            }

            if (!ocupadoAula.add(key(aula.getIdAula(), idBloque))) {
                throw new SugerenciaNoViableException(
                        "Choque de aula: " + aula.getNombreAula() + " ya esta ocupada en ese bloque");
            }
            if (!ocupadoProfesor.add(key(idProf, idBloque))) {
                throw new SugerenciaNoViableException(
                        "Choque de profesor en " + bloque.getDiaSemana() + " " + bloque.getHoraInicio());
            }
            if (!ocupadoGrupo.add(key(idGrupo, idBloque))) {
                throw new SugerenciaNoViableException(
                        "Choque de grupo en " + bloque.getDiaSemana() + " " + bloque.getHoraInicio());
            }
            if (!ocupadoComponente.add(key(componente.getIdComponente(), idBloque))) {
                throw new SugerenciaNoViableException(
                        "El componente ya tiene una sesion programada en ese bloque");
            }

            SesionClase nueva = new SesionClase();
            nueva.setComponenteCarga(componente);
            nueva.setBloqueTiempo(bloque);
            nueva.setAula(aula);
            nueva.setNumeroSesion(numeroSesion);
            nueva.setEstado(EstadoSesion.PROGRAMADA);
            nuevasSesiones.add(nueva);
        }

        int eliminadas = 0;
        if (!sesionesAfectadas.isEmpty()) {
            sesionClaseRepositorio.deleteAll(sesionesAfectadas.values());
            sesionClaseRepositorio.flush();
            eliminadas = sesionesAfectadas.size();
        }

        List<SesionClase> guardadas = sesionClaseRepositorio.saveAll(nuevasSesiones);
        sesionClaseRepositorio.flush();

        conflicto.setResuelto(Boolean.TRUE);
        conflicto.setMotivoResolucion("Sugerencia " + req.getTipo() + " aplicada");
        conflicto.setFechaResolucion(LocalDateTime.now());
        conflictoRepositorio.save(conflicto);

        return ResultadoAplicacionDTO.builder()
                .exito(true)
                .mensaje("Sugerencia aplicada correctamente")
                .idConflicto(conflicto.getIdConflicto())
                .sesionesEliminadas(eliminadas)
                .sesionesCreadas(guardadas.size())
                .idSesionesCreadas(guardadas.stream().map(SesionClase::getIdSesion).sorted(Comparator.naturalOrder()).collect(Collectors.toList()))
                .build();
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
