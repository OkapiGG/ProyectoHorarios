package com.example.GeneradorHorarios.Servicio;

import com.example.GeneradorHorarios.Modelo.Aula;
import com.example.GeneradorHorarios.Modelo.BloqueTiempo;
import com.example.GeneradorHorarios.Modelo.CargaAcademica;
import com.example.GeneradorHorarios.Modelo.ComponenteCarga;
import com.example.GeneradorHorarios.Modelo.ConflictoGeneracion;
import com.example.GeneradorHorarios.Modelo.DetalleHorario;
import com.example.GeneradorHorarios.Modelo.DTO.GeneracionHorarioResponse;
import com.example.GeneradorHorarios.Modelo.GrupoAula;
import com.example.GeneradorHorarios.Modelo.PeriodoAcademico;
import com.example.GeneradorHorarios.Modelo.PreferenciaMateriaProfesor;
import com.example.GeneradorHorarios.Modelo.PropuestaDisponibilidad;
import com.example.GeneradorHorarios.Modelo.Repositorio.AulaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.BloqueTiempoRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.CargaAcademicaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.ComponenteCargaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.ConflictoGeneracionRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.DetalleHorarioRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.GrupoAulaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PeriodoAcademicoRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PreferenciaMateriaProfesorRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PropuestaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.SesionClaseRepositorio;
import com.example.GeneradorHorarios.Modelo.SesionClase;
import com.example.GeneradorHorarios.Modelo.enums.EstadoPropuesta;
import com.example.GeneradorHorarios.Modelo.enums.EstadoSesion;
import com.example.GeneradorHorarios.Modelo.enums.MotivoConflicto;
import com.example.GeneradorHorarios.Modelo.enums.TipoAula;
import com.example.GeneradorHorarios.Modelo.enums.TipoBloque;
import com.example.GeneradorHorarios.Modelo.enums.TipoSesion;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GeneradorHorarioService {

    @Autowired
    private PeriodoAcademicoRepositorio periodoAcademicoRepositorio;

    @Autowired
    private CargaAcademicaRepositorio cargaAcademicaRepositorio;

    @Autowired
    private ComponenteCargaRepositorio componenteCargaRepositorio;

    @Autowired
    private PropuestaRepositorio propuestaRepositorio;

    @Autowired
    private DetalleHorarioRepositorio detalleHorarioRepositorio;

    @Autowired
    private PreferenciaMateriaProfesorRepositorio preferenciaMateriaProfesorRepositorio;

    @Autowired
    private BloqueTiempoRepositorio bloqueTiempoRepositorio;

    @Autowired
    private AulaRepositorio aulaRepositorio;

    @Autowired
    private GrupoAulaRepositorio grupoAulaRepositorio;

    @Autowired
    private SesionClaseRepositorio sesionClaseRepositorio;

    @Autowired
    private ConflictoGeneracionRepositorio conflictoGeneracionRepositorio;

    @Transactional
    public GeneracionHorarioResponse ejecutar(Long idPeriodoAcademico) {
        PeriodoAcademico periodo = obtenerPeriodo(idPeriodoAcademico);
        List<CargaAcademica> cargas = cargaAcademicaRepositorio.findByPeriodoAcademico_IdPeriodoAcademico(idPeriodoAcademico);
        List<ComponenteCarga> componentes = componenteCargaRepositorio.findByCargaAcademica_PeriodoAcademico_IdPeriodoAcademico(idPeriodoAcademico);

        if (cargas.isEmpty()) {
            throw new IllegalStateException("No existen cargas academicas para el periodo");
        }

        if (componentes.isEmpty()) {
            throw new IllegalStateException("No existen componentes de carga para el periodo");
        }

        List<BloqueTiempo> bloques = ordenarBloques(bloqueTiempoRepositorio.findAll());
        List<Aula> aulas = aulaRepositorio.findAll();

        if (bloques.isEmpty()) {
            throw new IllegalStateException("No existen bloques de tiempo registrados");
        }

        if (aulas.isEmpty()) {
            throw new IllegalStateException("No existen aulas registradas");
        }
        
        List<PropuestaDisponibilidad> propuestasAprobadas = propuestaRepositorio
                .findByEstadoAndPeriodoAcademico_IdPeriodoAcademico(EstadoPropuesta.APROBADA, idPeriodoAcademico);
        List<DetalleHorario> detalles = detalleHorarioRepositorio.findByPropuestaDisponibilidadIn(propuestasAprobadas);
        List<PreferenciaMateriaProfesor> preferencias = preferenciaMateriaProfesorRepositorio
                .findByPeriodoAcademico_IdPeriodoAcademico(idPeriodoAcademico);
        List<GrupoAula> gruposAula = grupoAulaRepositorio.findByPeriodoAcademico_IdPeriodoAcademico(idPeriodoAcademico);

        Map<Long, Set<Long>> bloquesProhibidosPorProfesor = construirMapaBloques(
                detalles,
                TipoBloque.PROHIBIDO
        );
        Map<Long, Set<Long>> bloquesPreferidosPorProfesor = construirMapaBloques(
                detalles,
                TipoBloque.PREFERIDO
        );
        Map<Long, GrupoAula> grupoAulaPorGrupo = gruposAula.stream()
                .collect(Collectors.toMap(item -> item.getGrupo().getIdGrupo(), item -> item));

        Map<String, PreferenciaMateriaProfesor> preferenciaPorProfesorMateria = preferencias.stream()
                .collect(Collectors.toMap(
                        item -> keyProfesorMateria(item.getProfesor().getIdProfesor(), item.getMateria().getIdMateria()),
                        item -> item,
                        (actual, reemplazo) -> actual
                ));

        List<SesionClase> sesionesPrevias = sesionClaseRepositorio
                .findByComponenteCarga_CargaAcademica_PeriodoAcademico_IdPeriodoAcademico(idPeriodoAcademico);
        int sesionesPreviasEliminadas = sesionesPrevias.size();
        if (!sesionesPrevias.isEmpty()) {
            sesionClaseRepositorio.deleteByPeriodoAcademico(idPeriodoAcademico);
            sesionClaseRepositorio.flush();
        }

        conflictoGeneracionRepositorio.deleteByPeriodo(idPeriodoAcademico);

        List<String> advertencias = new ArrayList<>();
        List<String> conflictos = new ArrayList<>();
        List<ConflictoGeneracion> conflictosDetectados = new ArrayList<>();
        List<SesionClase> sesionesGeneradas = new ArrayList<>();

        Set<String> bloquesOcupadosAula = new HashSet<>();
        Set<String> bloquesOcupadosProfesor = new HashSet<>();
        Set<String> bloquesOcupadosGrupo = new HashSet<>();

        List<ComponenteCarga> componentesOrdenados = ordenarComponentes(componentes);
        int sesionesSolicitadas = componentesOrdenados.stream()
                .mapToInt(ComponenteCarga::getNumSesiones)
                .sum();

        int sesionesProgramadas = 0;

        for (ComponenteCarga componente : componentesOrdenados) {
            CargaAcademica carga = componente.getCargaAcademica();
            GrupoAula grupoAulaAsignada = grupoAulaPorGrupo.get(carga.getGrupo().getIdGrupo());
            List<Aula> aulasCandidatas = filtrarAulasCandidatas(
                    aulas,
                    grupoAulaAsignada,
                    componente.getTipoSesion(),
                    carga.getGrupo().getCupoMaximo()
            );
            List<BloqueTiempo> bloquesCandidatos = filtrarBloquesCandidatos(
                    bloques,
                    carga,
                    bloquesProhibidosPorProfesor
            );

            if (aulasCandidatas.isEmpty()) {
                String msg = "La carga " + carga.getIdCargaAcademica() + " no tiene aulas compatibles";
                conflictos.add(msg);
                conflictosDetectados.add(construirConflicto(periodo, carga, componente, null,
                        MotivoConflicto.SIN_AULA, msg));
                continue;
            }

            if (bloquesCandidatos.isEmpty()) {
                String msg = "La carga " + carga.getIdCargaAcademica() + " no tiene bloques candidatos";
                conflictos.add(msg);
                conflictosDetectados.add(construirConflicto(periodo, carga, componente, null,
                        MotivoConflicto.SIN_BLOQUE_DISPONIBLE, msg));
                continue;
            }

            PreferenciaMateriaProfesor preferencia = preferenciaPorProfesorMateria.get(
                    keyProfesorMateria(
                            carga.getProfesor().getIdProfesor(),
                            carga.getPlanEstudioDetalle().getMateria().getIdMateria()
                    )
            );

            if (preferencia != null && "NO_APTO".equals(preferencia.getNivelPreferencia().name())) {
                advertencias.add(
                        "La carga " + carga.getIdCargaAcademica() +
                                " esta asignada a un profesor marcado como NO_APTO para la materia " +
                                carga.getPlanEstudioDetalle().getMateria().getNombreMateria()
                );
            }

            if (componente.getBloquesPorSesion() > 1 && !Boolean.TRUE.equals(componente.getRequiereConsecutivos())) {
                advertencias.add(
                        "El componente " + componente.getIdComponente() +
                                " solicita " + componente.getBloquesPorSesion() +
                                " bloques por sesion sin marcar consecutividad; se tratara como consecutivo"
                );
            }

            for (int numeroSesion = 1; numeroSesion <= componente.getNumSesiones(); numeroSesion++) {
                ResultadoBusquedaAsignacion resultadoBusqueda = buscarAsignacion(
                        componente,
                        carga,
                        numeroSesion,
                        bloquesCandidatos,
                        aulasCandidatas,
                        bloquesPreferidosPorProfesor.getOrDefault(carga.getProfesor().getIdProfesor(), Set.of()),
                        bloquesOcupadosAula,
                        bloquesOcupadosProfesor,
                        bloquesOcupadosGrupo
                );

                if (resultadoBusqueda.asignacion() == null) {
                    String msg = "No se pudo programar la sesion " + numeroSesion +
                            " del componente " + componente.getIdComponente() +
                            " de la carga " + carga.getIdCargaAcademica() +
                            ": " + resultadoBusqueda.motivo();
                    conflictos.add(msg);
                    conflictosDetectados.add(construirConflicto(periodo, carga, componente, numeroSesion,
                            mapearMotivo(resultadoBusqueda.motivo()), resultadoBusqueda.motivo()));
                    continue;
                }

                AsignacionSesion asignacion = resultadoBusqueda.asignacion();

                for (BloqueTiempo bloque : asignacion.bloques()) {
                    SesionClase sesionClase = new SesionClase();
                    sesionClase.setComponenteCarga(componente);
                    sesionClase.setBloqueTiempo(bloque);
                    sesionClase.setAula(asignacion.aula());
                    sesionClase.setNumeroSesion(numeroSesion);
                    sesionClase.setEstado(EstadoSesion.PROGRAMADA);
                    sesionesGeneradas.add(sesionClase);

                    bloquesOcupadosAula.add(keyAulaBloque(asignacion.aula().getIdAula(), bloque.getIdBloqueTiempo()));
                    bloquesOcupadosProfesor.add(keyPersonaBloque(carga.getProfesor().getIdProfesor(), bloque.getIdBloqueTiempo()));
                    bloquesOcupadosGrupo.add(keyPersonaBloque(carga.getGrupo().getIdGrupo(), bloque.getIdBloqueTiempo()));
                }

                sesionesProgramadas++;
            }
        }

        if (!sesionesGeneradas.isEmpty()) {
            sesionClaseRepositorio.saveAll(sesionesGeneradas);
        }

        if (!conflictosDetectados.isEmpty()) {
            conflictoGeneracionRepositorio.saveAll(conflictosDetectados);
        }

        return new GeneracionHorarioResponse(
                periodo.getIdPeriodoAcademico(),
                periodo.getDescripcion(),
                !conflictos.isEmpty(),
                componentesOrdenados.size(),
                sesionesSolicitadas,
                sesionesProgramadas,
                sesionesGeneradas.size(),
                sesionesPreviasEliminadas,
                conflictos.size(),
                advertencias,
                conflictos
        );
    }

    private PeriodoAcademico obtenerPeriodo(Long idPeriodoAcademico) {
        Optional<PeriodoAcademico> periodoOpt = periodoAcademicoRepositorio.findById(idPeriodoAcademico);

        if (!periodoOpt.isPresent()) {
            throw new IllegalStateException("El periodo academico no existe");
        }

        return periodoOpt.get();
    }

    private Map<Long, Set<Long>> construirMapaBloques(List<DetalleHorario> detalles, TipoBloque tipoBloque) {
        Map<Long, Set<Long>> resultado = new HashMap<>();

        for (DetalleHorario detalle : detalles) {
            if (detalle.getTipoBloque() != tipoBloque) {
                continue;
            }

            Long idProfesor = detalle.getPropuestaDisponibilidad().getProfesor().getIdProfesor();
            resultado.computeIfAbsent(idProfesor, key -> new HashSet<>())
                    .add(detalle.getBloqueTiempo().getIdBloqueTiempo());
        }

        return resultado;
    }

    private List<ComponenteCarga> ordenarComponentes(List<ComponenteCarga> componentes) {
        return componentes.stream()
                .sorted(
                        Comparator
                                .comparing(ComponenteCarga::getRequiereConsecutivos).reversed()
                                .thenComparing(ComponenteCarga::getBloquesPorSesion, Comparator.reverseOrder())
                                .thenComparing(ComponenteCarga::getNumSesiones, Comparator.reverseOrder())
                )
                .collect(Collectors.toList());
    }

    private List<BloqueTiempo> ordenarBloques(List<BloqueTiempo> bloques) {
        Map<String, Integer> ordenDias = Map.of(
                "LUNES", 1,
                "MARTES", 2,
                "MIERCOLES", 3,
                "JUEVES", 4,
                "VIERNES", 5,
                "SABADO", 6,
                "DOMINGO", 7
        );

        return bloques.stream()
                .sorted(
                        Comparator
                                .comparing((BloqueTiempo bloque) -> ordenDias.getOrDefault(bloque.getDiaSemana(), 99))
                                .thenComparing(BloqueTiempo::getHoraInicio)
                )
                .collect(Collectors.toList());
    }

    private List<Aula> filtrarAulasCandidatas(
            List<Aula> aulas,
            GrupoAula grupoAulaAsignada,
            TipoSesion tipoSesion,
            Integer cupoGrupo
    ) {
        List<Aula> compatibles = aulas.stream()
                .filter(aula -> esAulaCompatible(tipoSesion, aula.getTipoAula()))
                .filter(aula -> cupoGrupo == null || (aula.getCapacidad() != null && aula.getCapacidad() >= cupoGrupo))
                .collect(Collectors.toList());

        if (grupoAulaAsignada == null || grupoAulaAsignada.getAula() == null) {
            return compatibles;
        }

        Long idAulaBase = grupoAulaAsignada.getAula().getIdAula();

        List<Aula> ordenadas = new ArrayList<>();
        compatibles.stream()
                .filter(aula -> idAulaBase.equals(aula.getIdAula()))
                .findFirst()
                .ifPresent(ordenadas::add);

        compatibles.stream()
                .filter(aula -> !idAulaBase.equals(aula.getIdAula()))
                .forEach(ordenadas::add);

        return ordenadas;
    }

    private boolean esAulaCompatible(TipoSesion tipoSesion, TipoAula tipoAula) {
        if (tipoSesion == TipoSesion.TEORIA) {
            return true;
        }

        if (tipoSesion == TipoSesion.LABORATORIO) {
            return tipoAula == TipoAula.LABORATORIO;
        }

        if (tipoSesion == TipoSesion.TALLER) {
            return tipoAula == TipoAula.TALLER;
        }

        return false;
    }

    private List<BloqueTiempo> filtrarBloquesCandidatos(
            List<BloqueTiempo> bloques,
            CargaAcademica carga,
            Map<Long, Set<Long>> bloquesProhibidosPorProfesor
    ) {
        Set<Long> prohibidos = bloquesProhibidosPorProfesor.getOrDefault(
                carga.getProfesor().getIdProfesor(),
                Set.of()
        );

        return bloques.stream()
                .filter(bloque -> bloque.getTurno() == carga.getGrupo().getTurno())
                .filter(bloque -> !prohibidos.contains(bloque.getIdBloqueTiempo()))
                .collect(Collectors.toList());
    }

    private ResultadoBusquedaAsignacion buscarAsignacion(
            ComponenteCarga componente,
            CargaAcademica carga,
            int numeroSesion,
            List<BloqueTiempo> bloquesCandidatos,
            List<Aula> aulasCandidatas,
            Set<Long> bloquesPreferidos,
            Set<String> bloquesOcupadosAula,
            Set<String> bloquesOcupadosProfesor,
            Set<String> bloquesOcupadosGrupo
        ) {
        List<SecuenciaBloques> secuencias = construirSecuencias(
                bloquesCandidatos,
                componente.getBloquesPorSesion(),
                Boolean.TRUE.equals(componente.getRequiereConsecutivos())
        );

        secuencias.sort(
                Comparator
                        .comparing((SecuenciaBloques secuencia) -> contarPreferidos(secuencia.bloques(), bloquesPreferidos))
                        .reversed()
                        .thenComparing(secuencia -> secuencia.bloques().get(0).getHoraInicio())
        );

        if (secuencias.isEmpty()) {
            return new ResultadoBusquedaAsignacion(
                    null,
                    "no existe una secuencia valida de " + componente.getBloquesPorSesion() + " bloque(s) para esa sesion"
            );
        }

        int secuenciasConChoqueProfesor = 0;
        int secuenciasConChoqueGrupo = 0;
        int secuenciasSinAula = 0;

        for (SecuenciaBloques secuencia : secuencias) {
            EstadoChoqueSecuencia choque = evaluarChoqueSecuencia(
                    carga,
                    secuencia.bloques(),
                    bloquesOcupadosProfesor,
                    bloquesOcupadosGrupo
            );

            if (choque == EstadoChoqueSecuencia.PROFESOR) {
                secuenciasConChoqueProfesor++;
                continue;
            }

            if (choque == EstadoChoqueSecuencia.GRUPO) {
                secuenciasConChoqueGrupo++;
                continue;
            }

            boolean aulaDisponible = false;
            for (Aula aula : aulasCandidatas) {
                if (tieneChoqueAula(aula, secuencia.bloques(), bloquesOcupadosAula)) {
                    continue;
                }

                aulaDisponible = true;
                return new ResultadoBusquedaAsignacion(
                        new AsignacionSesion(numeroSesion, aula, secuencia.bloques()),
                        null
                );
            }

            if (!aulaDisponible) {
                secuenciasSinAula++;
            }
        }

        List<String> razones = new ArrayList<>();
        if (secuenciasConChoqueProfesor > 0) {
            razones.add("choque de profesor en " + secuenciasConChoqueProfesor + " secuencia(s)");
        }
        if (secuenciasConChoqueGrupo > 0) {
            razones.add("choque de grupo en " + secuenciasConChoqueGrupo + " secuencia(s)");
        }
        if (secuenciasSinAula > 0) {
            razones.add("sin aula disponible en " + secuenciasSinAula + " secuencia(s)");
        }

        String motivo = razones.isEmpty()
                ? "sin combinacion valida de bloque y aula"
                : String.join(", ", razones);

        return new ResultadoBusquedaAsignacion(null, motivo);
    }

    private List<SecuenciaBloques> construirSecuencias(
            List<BloqueTiempo> bloques,
            Integer bloquesPorSesion,
            boolean requiereConsecutivos
    ) {
        List<SecuenciaBloques> resultado = new ArrayList<>();

        if (bloquesPorSesion == null || bloquesPorSesion <= 0) {
            return resultado;
        }

        if (bloquesPorSesion == 1) {
            for (BloqueTiempo bloque : bloques) {
                resultado.add(new SecuenciaBloques(List.of(bloque)));
            }
            return resultado;
        }

        boolean usarConsecutivos = requiereConsecutivos || bloquesPorSesion > 1;

        if (!usarConsecutivos) {
            return resultado;
        }

        for (int i = 0; i <= bloques.size() - bloquesPorSesion; i++) {
            List<BloqueTiempo> secuencia = new ArrayList<>();
            secuencia.add(bloques.get(i));
            boolean valida = true;

            for (int j = 1; j < bloquesPorSesion; j++) {
                BloqueTiempo anterior = bloques.get(i + j - 1);
                BloqueTiempo actual = bloques.get(i + j);

                if (!anterior.getDiaSemana().equals(actual.getDiaSemana())
                        || anterior.getTurno() != actual.getTurno()
                        || !anterior.getHoraFin().equals(actual.getHoraInicio())) {
                    valida = false;
                    break;
                }

                secuencia.add(actual);
            }

            if (valida) {
                resultado.add(new SecuenciaBloques(secuencia));
            }
        }

        return resultado;
    }

    private int contarPreferidos(List<BloqueTiempo> bloques, Set<Long> bloquesPreferidos) {
        int total = 0;
        for (BloqueTiempo bloque : bloques) {
            if (bloquesPreferidos.contains(bloque.getIdBloqueTiempo())) {
                total++;
            }
        }
        return total;
    }

    private EstadoChoqueSecuencia evaluarChoqueSecuencia(
            CargaAcademica carga,
            List<BloqueTiempo> bloques,
            Set<String> bloquesOcupadosProfesor,
            Set<String> bloquesOcupadosGrupo
    ) {
        for (BloqueTiempo bloque : bloques) {
            if (bloquesOcupadosProfesor.contains(keyPersonaBloque(carga.getProfesor().getIdProfesor(), bloque.getIdBloqueTiempo()))) {
                return EstadoChoqueSecuencia.PROFESOR;
            }

            if (bloquesOcupadosGrupo.contains(keyPersonaBloque(carga.getGrupo().getIdGrupo(), bloque.getIdBloqueTiempo()))) {
                return EstadoChoqueSecuencia.GRUPO;
            }
        }

        return EstadoChoqueSecuencia.NINGUNO;
    }

    private boolean tieneChoqueAula(Aula aula, List<BloqueTiempo> bloques, Set<String> bloquesOcupadosAula) {
        for (BloqueTiempo bloque : bloques) {
            if (bloquesOcupadosAula.contains(keyAulaBloque(aula.getIdAula(), bloque.getIdBloqueTiempo()))) {
                return true;
            }
        }

        return false;
    }

    private String keyPersonaBloque(Long idPersona, Long idBloqueTiempo) {
        return idPersona + "-" + idBloqueTiempo;
    }

    private String keyAulaBloque(Long idAula, Long idBloqueTiempo) {
        return idAula + "-" + idBloqueTiempo;
    }

    private String keyProfesorMateria(Long idProfesor, Long idMateria) {
        return idProfesor + "-" + idMateria;
    }

    private ConflictoGeneracion construirConflicto(PeriodoAcademico periodo,
                                                   CargaAcademica carga,
                                                   ComponenteCarga componente,
                                                   Integer numeroSesion,
                                                   MotivoConflicto motivo,
                                                   String detalle) {
        return ConflictoGeneracion.builder()
                .periodoAcademico(periodo)
                .cargaAcademica(carga)
                .componenteCarga(componente)
                .numeroSesion(numeroSesion)
                .motivo(motivo)
                .detalle(detalle != null && detalle.length() > 500 ? detalle.substring(0, 500) : detalle)
                .resuelto(Boolean.FALSE)
                .build();
    }

    private MotivoConflicto mapearMotivo(String motivoTexto) {
        if (motivoTexto == null) return MotivoConflicto.SIN_COMBINACION;
        String t = motivoTexto.toLowerCase();
        if (t.contains("aula"))     return MotivoConflicto.SIN_AULA;
        if (t.contains("profesor")) return MotivoConflicto.CHOQUE_PROFESOR;
        if (t.contains("grupo"))    return MotivoConflicto.CHOQUE_GRUPO;
        if (t.contains("secuencia")) return MotivoConflicto.SIN_BLOQUE_DISPONIBLE;
        return MotivoConflicto.SIN_COMBINACION;
    }

    private enum EstadoChoqueSecuencia {
        NINGUNO,
        PROFESOR,
        GRUPO
    }

    private record SecuenciaBloques(List<BloqueTiempo> bloques) {}

    private record AsignacionSesion(int numeroSesion, Aula aula, List<BloqueTiempo> bloques) {}

    private record ResultadoBusquedaAsignacion(AsignacionSesion asignacion, String motivo) {}
}
