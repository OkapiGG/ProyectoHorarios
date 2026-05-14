package com.example.GeneradorHorarios.Servicio;

import com.example.GeneradorHorarios.Modelo.Aula;
import com.example.GeneradorHorarios.Modelo.BloqueTiempo;
import com.example.GeneradorHorarios.Modelo.CargaAcademica;
import com.example.GeneradorHorarios.Modelo.ComponenteCarga;
import com.example.GeneradorHorarios.Modelo.ConflictoGeneracion;
import com.example.GeneradorHorarios.Modelo.DTO.CambioPropuestoDTO;
import com.example.GeneradorHorarios.Modelo.DTO.SugerenciaDTO;
import com.example.GeneradorHorarios.Modelo.DTO.SugerenciaDTO.TipoAccion;
import com.example.GeneradorHorarios.Modelo.DetalleHorario;
import com.example.GeneradorHorarios.Modelo.PropuestaDisponibilidad;
import com.example.GeneradorHorarios.Modelo.Repositorio.AulaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.BloqueTiempoRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.ConflictoGeneracionRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.DetalleHorarioRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.GrupoAulaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PropuestaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.SesionClaseRepositorio;
import com.example.GeneradorHorarios.Modelo.SesionClase;
import com.example.GeneradorHorarios.Modelo.enums.EstadoPropuesta;
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
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Motor de busqueda local (depth-1) que produce sugerencias para destrabar
 * sesiones marcadas como conflicto durante la generacion Greedy.
 *
 * Estrategias soportadas:
 *  - MOVE : mover una sesion ocupante a otra aula libre del mismo bloque, y
 *           colocar la sesion conflictiva en el aula liberada.
 *  - SWAP : intercambiar el bloque de la sesion conflictiva con otra sesion
 *           del mismo profesor o grupo.
 *
 * El servicio opera en modo solo-lectura: construye un snapshot en memoria
 * del grid de ocupacion y simula los cambios sin persistir nada.
 */
@Service
public class SugerenciasOptimizacionService {

    private static final int SCORE_BLOQUE_PREFERIDO   = 10;
    private static final int SCORE_AULA_BASE          = 5;
    private static final int SCORE_BLOQUE_NEUTRO      = 0;
    private static final int PENAL_DESPLAZA_PREFERIDO = -8;
    private static final int LIMITE_SUGERENCIAS       = 15;

    @Autowired private ConflictoGeneracionRepositorio conflictoRepositorio;
    @Autowired private SesionClaseRepositorio sesionClaseRepositorio;
    @Autowired private BloqueTiempoRepositorio bloqueTiempoRepositorio;
    @Autowired private AulaRepositorio aulaRepositorio;
    @Autowired private GrupoAulaRepositorio grupoAulaRepositorio;
    @Autowired private PropuestaRepositorio propuestaRepositorio;
    @Autowired private DetalleHorarioRepositorio detalleHorarioRepositorio;

    @Transactional(readOnly = true)
    public List<SugerenciaDTO> calcularSugerencias(Long idConflicto) {
        ConflictoGeneracion conflicto = conflictoRepositorio.findById(idConflicto)
                .orElseThrow(() -> new IllegalArgumentException("Conflicto no existe: " + idConflicto));

        if (Boolean.TRUE.equals(conflicto.getResuelto())) {
            return List.of();
        }

        ComponenteCarga componente = conflicto.getComponenteCarga();
        CargaAcademica carga = conflicto.getCargaAcademica();
        if (componente == null || carga == null) {
            return List.of();
        }

        Long idPeriodo = conflicto.getPeriodoAcademico().getIdPeriodoAcademico();

        if (sesionYaProgramada(componente.getIdComponente(), conflicto.getNumeroSesion(), idPeriodo)) {
            return List.of();
        }

        Contexto ctx = construirContexto(idPeriodo, carga, componente);

        int bloquesPorSesion = componente.getBloquesPorSesion() == null ? 1 : componente.getBloquesPorSesion();
        boolean requiereConsecutivos = bloquesPorSesion > 1
                || Boolean.TRUE.equals(componente.getRequiereConsecutivos());

        List<SecuenciaBloques> secuencias = construirSecuencias(
                ctx.bloquesCandidatosOrdenados, bloquesPorSesion, requiereConsecutivos);

        List<SugerenciaDTO> sugerencias = new ArrayList<>();
        sugerencias.addAll(estrategiaMove(conflicto, ctx, secuencias, bloquesPorSesion));
        sugerencias.addAll(estrategiaSwap(conflicto, ctx, secuencias, bloquesPorSesion));

        return sugerencias.stream()
                .sorted(Comparator.comparingInt(SugerenciaDTO::getScoreImpact).reversed())
                .limit(LIMITE_SUGERENCIAS)
                .collect(Collectors.toList());
    }

    // ------------------------------------------------------------------
    // Estrategia A - MOVE
    //  - bloquesPorSesion == 1: intenta colocar la sesion en cada bloque
    //    candidato. Si el aula esta libre, sugerencia directa. Si el aula
    //    esta ocupada por una sola sesion "X", intenta mover X a otra aula
    //    libre del mismo bloque (depth-1).
    //  - bloquesPorSesion > 1: solo se sugieren secuencias completamente
    //    libres en alguna aula (asignacion directa). No se desplazan
    //    multiples ocupantes a la vez para mantener la profundidad 1.
    // ------------------------------------------------------------------
    private List<SugerenciaDTO> estrategiaMove(ConflictoGeneracion conf, Contexto ctx,
                                               List<SecuenciaBloques> secuencias, int bloquesPorSesion) {
        List<SugerenciaDTO> out = new ArrayList<>();
        CargaAcademica carga = conf.getCargaAcademica();
        Long idProfesor = carga.getProfesor().getIdProfesor();
        Long idGrupo = carga.getGrupo().getIdGrupo();

        for (SecuenciaBloques seq : secuencias) {
            if (!secuenciaLibreParaProfesorYGrupo(seq, idProfesor, idGrupo, ctx)) continue;

            for (Aula aulaObjetivo : ctx.aulasCompatibles) {
                List<SesionClase> ocupantes = ocupantesDeSecuencia(seq, aulaObjetivo, ctx);

                if (ocupantes.isEmpty()) {
                    out.add(construirSugerenciaAsignacionDirecta(conf, ctx, seq, aulaObjetivo));
                    continue;
                }

                if (bloquesPorSesion > 1) {
                    continue;
                }

                SesionClase ocupante = ocupantes.get(0);
                BloqueTiempo bloque = seq.bloques().get(0);
                Long idBloque = bloque.getIdBloqueTiempo();

                Optional<Aula> destinoOcupante = ctx.aulasCompatiblesPara(ocupante).stream()
                        .filter(a -> !a.getIdAula().equals(aulaObjetivo.getIdAula()))
                        .filter(a -> ctx.sesionPorAulaBloque.get(key(a.getIdAula(), idBloque)) == null)
                        .findFirst();

                if (destinoOcupante.isEmpty()) continue;

                SugerenciaDTO sug = SugerenciaDTO.builder()
                        .idConflicto(conf.getIdConflicto())
                        .tipo(TipoAccion.MOVE)
                        .descripcion(String.format(
                                "Mover \"%s\" al aula %s; colocar \"%s\" en %s (%s)",
                                nombreMateria(ocupante.getComponenteCarga()),
                                destinoOcupante.get().getNombreAula(),
                                nombreMateria(conf.getComponenteCarga()),
                                aulaObjetivo.getNombreAula(),
                                describirBloque(bloque)))
                        .cambios(List.of(
                                CambioPropuestoDTO.builder()
                                        .idSesionAfectada(ocupante.getIdSesion())
                                        .idComponenteCarga(ocupante.getComponenteCarga().getIdComponente())
                                        .idBloqueTiempoNuevo(idBloque)
                                        .idAulaNueva(destinoOcupante.get().getIdAula())
                                        .descripcionBloque(describirBloque(bloque))
                                        .descripcionAula(destinoOcupante.get().getNombreAula())
                                        .build(),
                                CambioPropuestoDTO.builder()
                                        .idSesionAfectada(null)
                                        .idComponenteCarga(conf.getComponenteCarga().getIdComponente())
                                        .idBloqueTiempoNuevo(idBloque)
                                        .idAulaNueva(aulaObjetivo.getIdAula())
                                        .descripcionBloque(describirBloque(bloque))
                                        .descripcionAula(aulaObjetivo.getNombreAula())
                                        .build()))
                        .build();

                sug.setScoreImpact(calcularScore(sug, ctx));
                out.add(sug);
            }
        }
        return out;
    }

    // ------------------------------------------------------------------
    // Estrategia B - SWAP
    //  - bloquesPorSesion == 1: intercambia el bloque de la conflictiva con
    //    una sesion del mismo profesor o grupo de UN bloque.
    //  - bloquesPorSesion > 1: solo intercambia con sesiones que tengan el
    //    MISMO numero de bloques consecutivos, agrupando por
    //    (idSesion compartiendo numeroSesion + componente).
    // ------------------------------------------------------------------
    private List<SugerenciaDTO> estrategiaSwap(ConflictoGeneracion conf, Contexto ctx,
                                               List<SecuenciaBloques> secuenciasDestino, int bloquesPorSesion) {
        List<SugerenciaDTO> out = new ArrayList<>();
        CargaAcademica carga = conf.getCargaAcademica();
        Long idProfesor = carga.getProfesor().getIdProfesor();
        Long idGrupo = carga.getGrupo().getIdGrupo();

        List<List<SesionClase>> bloquesDeSesionesMovibles = agruparPorSesionLogica(ctx.sesionesPeriodo).stream()
                .filter(grupo -> {
                    CargaAcademica c = grupo.get(0).getComponenteCarga().getCargaAcademica();
                    return c.getProfesor().getIdProfesor().equals(idProfesor)
                            || c.getGrupo().getIdGrupo().equals(idGrupo);
                })
                .filter(grupo -> grupo.size() == bloquesPorSesion)
                .collect(Collectors.toList());

        for (SecuenciaBloques seqDestino : secuenciasDestino) {
            if (!secuenciaLibreParaProfesorYGrupo(seqDestino, idProfesor, idGrupo, ctx)) continue;

            for (List<SesionClase> sesionLogica : bloquesDeSesionesMovibles) {
                if (compartenBloques(sesionLogica, seqDestino)) continue;

                Aula aulaCandidata = sesionLogica.get(0).getAula();
                List<BloqueTiempo> bloquesOrigen = sesionLogica.stream()
                        .map(SesionClase::getBloqueTiempo)
                        .collect(Collectors.toList());

                if (!encajaSesionEnSecuencia(sesionLogica, seqDestino, ctx)) continue;
                if (!secuenciaLibreParaConflictiva(bloquesOrigen, aulaCandidata, conf, ctx, sesionLogica)) continue;

                List<CambioPropuestoDTO> cambios = new ArrayList<>();
                for (int i = 0; i < sesionLogica.size(); i++) {
                    SesionClase original = sesionLogica.get(i);
                    BloqueTiempo destino = seqDestino.bloques().get(i);
                    cambios.add(CambioPropuestoDTO.builder()
                            .idSesionAfectada(original.getIdSesion())
                            .idComponenteCarga(original.getComponenteCarga().getIdComponente())
                            .idBloqueTiempoNuevo(destino.getIdBloqueTiempo())
                            .idAulaNueva(aulaCandidata.getIdAula())
                            .descripcionBloque(describirBloque(destino))
                            .descripcionAula(aulaCandidata.getNombreAula())
                            .build());
                }
                for (BloqueTiempo bloqueOrigen : bloquesOrigen) {
                    cambios.add(CambioPropuestoDTO.builder()
                            .idSesionAfectada(null)
                            .idComponenteCarga(conf.getComponenteCarga().getIdComponente())
                            .idBloqueTiempoNuevo(bloqueOrigen.getIdBloqueTiempo())
                            .idAulaNueva(aulaCandidata.getIdAula())
                            .descripcionBloque(describirBloque(bloqueOrigen))
                            .descripcionAula(aulaCandidata.getNombreAula())
                            .build());
                }

                SugerenciaDTO sug = SugerenciaDTO.builder()
                        .idConflicto(conf.getIdConflicto())
                        .tipo(TipoAccion.SWAP)
                        .descripcion(String.format(
                                "Intercambiar \"%s\" (%s) con \"%s\" (%s)",
                                nombreMateria(sesionLogica.get(0).getComponenteCarga()),
                                describirBloque(bloquesOrigen.get(0)),
                                nombreMateria(conf.getComponenteCarga()),
                                describirBloque(seqDestino.bloques().get(0))))
                        .cambios(cambios)
                        .build();

                sug.setScoreImpact(calcularScore(sug, ctx));
                out.add(sug);
            }
        }
        return out;
    }

    // ------------------------------------------------------------------
    // Scoring
    // ------------------------------------------------------------------
    private int calcularScore(SugerenciaDTO sug, Contexto ctx) {
        int total = 0;
        for (CambioPropuestoDTO c : sug.getCambios()) {
            ComponenteCarga comp = ctx.componentePorId(c.getIdComponenteCarga());
            if (comp == null) continue;
            CargaAcademica carga = comp.getCargaAcademica();
            Long idProf = carga.getProfesor().getIdProfesor();
            Long idGrupo = carga.getGrupo().getIdGrupo();

            if (ctx.esBloquePreferido(idProf, c.getIdBloqueTiempoNuevo())) {
                total += SCORE_BLOQUE_PREFERIDO;
            } else {
                total += SCORE_BLOQUE_NEUTRO;
            }

            Long idAulaBase = ctx.aulaBasePorGrupo.get(idGrupo);
            if (idAulaBase != null && idAulaBase.equals(c.getIdAulaNueva())) {
                total += SCORE_AULA_BASE;
            }

            if (c.getIdSesionAfectada() != null) {
                SesionClase original = ctx.sesionPorId.get(c.getIdSesionAfectada());
                if (original != null
                        && ctx.esBloquePreferido(idProf, original.getBloqueTiempo().getIdBloqueTiempo())
                        && !ctx.esBloquePreferido(idProf, c.getIdBloqueTiempoNuevo())) {
                    total += PENAL_DESPLAZA_PREFERIDO;
                }
            }
        }
        return total;
    }

    // ------------------------------------------------------------------
    // Helpers de simulacion sobre secuencias
    // ------------------------------------------------------------------

    /** El profesor y el grupo de la conflictiva estan libres en TODOS los bloques de la secuencia. */
    private boolean secuenciaLibreParaProfesorYGrupo(SecuenciaBloques seq, Long idProfesor, Long idGrupo, Contexto ctx) {
        for (BloqueTiempo b : seq.bloques()) {
            Long idB = b.getIdBloqueTiempo();
            if (ctx.profesorBloqueProhibido(idProfesor, idB)) return false;
            if (ctx.ocupadoProfesor.contains(key(idProfesor, idB))) return false;
            if (ctx.ocupadoGrupo.contains(key(idGrupo, idB))) return false;
        }
        return true;
    }

    /** Lista de sesiones (puede ser de longitud 0..N) que ocupan el aula en la secuencia. */
    private List<SesionClase> ocupantesDeSecuencia(SecuenciaBloques seq, Aula aula, Contexto ctx) {
        List<SesionClase> resultado = new ArrayList<>();
        for (BloqueTiempo b : seq.bloques()) {
            SesionClase s = ctx.sesionPorAulaBloque.get(key(aula.getIdAula(), b.getIdBloqueTiempo()));
            if (s != null && !resultado.contains(s)) {
                resultado.add(s);
            }
        }
        return resultado;
    }

    /**
     * Verifica que una sesion logica (lista de SesionClase pertenecientes al mismo
     * numeroSesion + componente) pueda moverse a la secuencia destino. Verifica
     * profesor/grupo/aula en cada bloque, excluyendo a la propia sesion logica.
     */
    private boolean encajaSesionEnSecuencia(List<SesionClase> sesionLogica, SecuenciaBloques destino, Contexto ctx) {
        if (sesionLogica.size() != destino.bloques().size()) return false;
        CargaAcademica c = sesionLogica.get(0).getComponenteCarga().getCargaAcademica();
        Long idProf = c.getProfesor().getIdProfesor();
        Long idGrupo = c.getGrupo().getIdGrupo();
        Long idAula = sesionLogica.get(0).getAula().getIdAula();
        Set<Long> bloquesExcluidos = sesionLogica.stream()
                .map(s -> s.getBloqueTiempo().getIdBloqueTiempo())
                .collect(Collectors.toSet());

        for (BloqueTiempo b : destino.bloques()) {
            Long idB = b.getIdBloqueTiempo();
            if (destino.bloques().get(0).getTurno() != c.getGrupo().getTurno()) return false;
            if (ctx.profesorBloqueProhibido(idProf, idB)) return false;
            if (ctx.ocupadoProfesor.contains(key(idProf, idB)) && !bloquesExcluidos.contains(idB)) return false;
            if (ctx.ocupadoGrupo.contains(key(idGrupo, idB)) && !bloquesExcluidos.contains(idB)) return false;
            if (ctx.sesionPorAulaBloque.containsKey(key(idAula, idB)) && !bloquesExcluidos.contains(idB)) return false;
        }
        return true;
    }

    /** La conflictiva cabe en los bloques liberados por la sesion logica (en una aula concreta). */
    private boolean secuenciaLibreParaConflictiva(List<BloqueTiempo> bloquesObjetivo, Aula aula,
                                                  ConflictoGeneracion conf, Contexto ctx,
                                                  List<SesionClase> excluyendo) {
        CargaAcademica c = conf.getCargaAcademica();
        Long idProf = c.getProfesor().getIdProfesor();
        Long idGrupo = c.getGrupo().getIdGrupo();
        Set<Long> bloquesExcluidos = excluyendo.stream()
                .map(s -> s.getBloqueTiempo().getIdBloqueTiempo())
                .collect(Collectors.toSet());

        for (BloqueTiempo b : bloquesObjetivo) {
            Long idB = b.getIdBloqueTiempo();
            if (b.getTurno() != c.getGrupo().getTurno()) return false;
            if (ctx.profesorBloqueProhibido(idProf, idB)) return false;
            if (ctx.ocupadoProfesor.contains(key(idProf, idB)) && !bloquesExcluidos.contains(idB)) return false;
            if (ctx.ocupadoGrupo.contains(key(idGrupo, idB)) && !bloquesExcluidos.contains(idB)) return false;
            if (ctx.sesionPorAulaBloque.containsKey(key(aula.getIdAula(), idB)) && !bloquesExcluidos.contains(idB)) return false;
        }
        return true;
    }

    private boolean compartenBloques(List<SesionClase> sesionLogica, SecuenciaBloques seq) {
        Set<Long> bloquesSesion = sesionLogica.stream()
                .map(s -> s.getBloqueTiempo().getIdBloqueTiempo())
                .collect(Collectors.toSet());
        return seq.bloques().stream()
                .anyMatch(b -> bloquesSesion.contains(b.getIdBloqueTiempo()));
    }

    /**
     * Agrupa las SesionClase por (componente + numeroSesion) para reconstruir las
     * "sesiones logicas" multi-bloque. Una clase de laboratorio de 3h consecutivas
     * son 3 filas en sesion_clase con el mismo numeroSesion y mismo componente.
     */
    private List<List<SesionClase>> agruparPorSesionLogica(List<SesionClase> sesiones) {
        Map<String, List<SesionClase>> mapa = new HashMap<>();
        for (SesionClase s : sesiones) {
            String k = s.getComponenteCarga().getIdComponente() + "-" + s.getNumeroSesion();
            mapa.computeIfAbsent(k, x -> new ArrayList<>()).add(s);
        }
        return mapa.values().stream()
                .map(grupo -> {
                    grupo.sort(Comparator.comparing(s -> s.getBloqueTiempo().getHoraInicio()));
                    return grupo;
                })
                .collect(Collectors.toList());
    }

    /** Construye secuencias de N bloques contiguos, igual que el generador. */
    private List<SecuenciaBloques> construirSecuencias(List<BloqueTiempo> bloques, int bloquesPorSesion,
                                                       boolean requiereConsecutivos) {
        List<SecuenciaBloques> resultado = new ArrayList<>();
        if (bloquesPorSesion <= 0) return resultado;

        if (bloquesPorSesion == 1) {
            for (BloqueTiempo b : bloques) resultado.add(new SecuenciaBloques(List.of(b)));
            return resultado;
        }

        if (!requiereConsecutivos) return resultado;

        for (int i = 0; i <= bloques.size() - bloquesPorSesion; i++) {
            List<BloqueTiempo> sec = new ArrayList<>();
            sec.add(bloques.get(i));
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
                sec.add(actual);
            }
            if (valida) resultado.add(new SecuenciaBloques(sec));
        }
        return resultado;
    }

    private SugerenciaDTO construirSugerenciaAsignacionDirecta(ConflictoGeneracion conf, Contexto ctx,
                                                               SecuenciaBloques seq, Aula aula) {
        List<CambioPropuestoDTO> cambios = new ArrayList<>();
        for (BloqueTiempo b : seq.bloques()) {
            cambios.add(CambioPropuestoDTO.builder()
                    .idSesionAfectada(null)
                    .idComponenteCarga(conf.getComponenteCarga().getIdComponente())
                    .idBloqueTiempoNuevo(b.getIdBloqueTiempo())
                    .idAulaNueva(aula.getIdAula())
                    .descripcionBloque(describirBloque(b))
                    .descripcionAula(aula.getNombreAula())
                    .build());
        }
        BloqueTiempo primero = seq.bloques().get(0);
        BloqueTiempo ultimo = seq.bloques().get(seq.bloques().size() - 1);
        String rangoTexto = seq.bloques().size() == 1
                ? describirBloque(primero)
                : primero.getDiaSemana() + " " + primero.getHoraInicio() + "-" + ultimo.getHoraFin();

        SugerenciaDTO sug = SugerenciaDTO.builder()
                .idConflicto(conf.getIdConflicto())
                .tipo(TipoAccion.MOVE)
                .descripcion(String.format("Asignar \"%s\" en %s (%s) - hueco libre",
                        nombreMateria(conf.getComponenteCarga()),
                        aula.getNombreAula(), rangoTexto))
                .cambios(cambios)
                .build();
        sug.setScoreImpact(calcularScore(sug, ctx));
        return sug;
    }

    private record SecuenciaBloques(List<BloqueTiempo> bloques) {}

    // ------------------------------------------------------------------
    // Contexto inmutable de simulacion
    // ------------------------------------------------------------------
    private Contexto construirContexto(Long idPeriodo, CargaAcademica carga, ComponenteCarga comp) {
        Contexto ctx = new Contexto();

        ctx.sesionesPeriodo = sesionClaseRepositorio
                .findByComponenteCarga_CargaAcademica_PeriodoAcademico_IdPeriodoAcademico(idPeriodo);
        ctx.sesionPorId = ctx.sesionesPeriodo.stream()
                .collect(Collectors.toMap(SesionClase::getIdSesion, s -> s, (a, b) -> a));

        for (SesionClase s : ctx.sesionesPeriodo) {
            Long idB = s.getBloqueTiempo().getIdBloqueTiempo();
            CargaAcademica c = s.getComponenteCarga().getCargaAcademica();
            ctx.ocupadoAula.add(key(s.getAula().getIdAula(), idB));
            ctx.ocupadoProfesor.add(key(c.getProfesor().getIdProfesor(), idB));
            ctx.ocupadoGrupo.add(key(c.getGrupo().getIdGrupo(), idB));
            ctx.sesionPorAulaBloque.put(key(s.getAula().getIdAula(), idB), s);
        }

        List<BloqueTiempo> bloques = bloqueTiempoRepositorio.findAll();
        Map<String, Integer> ordenDias = Map.of(
                "LUNES", 1, "MARTES", 2, "MIERCOLES", 3, "JUEVES", 4,
                "VIERNES", 5, "SABADO", 6, "DOMINGO", 7);
        ctx.bloquesCandidatosOrdenados = bloques.stream()
                .filter(b -> b.getTurno() == carga.getGrupo().getTurno())
                .sorted(Comparator
                        .comparing((BloqueTiempo b) -> ordenDias.getOrDefault(b.getDiaSemana(), 99))
                        .thenComparing(BloqueTiempo::getHoraInicio))
                .collect(Collectors.toList());

        ctx.aulasCompatibles = aulaRepositorio.findAll().stream()
                .filter(a -> esAulaCompatible(comp.getTipoSesion(), a.getTipoAula()))
                .filter(a -> carga.getGrupo().getCupoMaximo() == null
                        || a.getCapacidad() == null
                        || a.getCapacidad() >= carga.getGrupo().getCupoMaximo())
                .collect(Collectors.toList());

        grupoAulaRepositorio.findByPeriodoAcademico_IdPeriodoAcademico(idPeriodo).forEach(ga -> {
            if (ga.getAula() != null) {
                ctx.aulaBasePorGrupo.put(ga.getGrupo().getIdGrupo(), ga.getAula().getIdAula());
            }
        });

        List<PropuestaDisponibilidad> aprobadas = propuestaRepositorio
                .findByEstadoAndPeriodoAcademico_IdPeriodoAcademico(EstadoPropuesta.APROBADA, idPeriodo);
        List<DetalleHorario> detalles = detalleHorarioRepositorio.findByPropuestaDisponibilidadIn(aprobadas);
        for (DetalleHorario d : detalles) {
            Long idP = d.getPropuestaDisponibilidad().getProfesor().getIdProfesor();
            Long idB = d.getBloqueTiempo().getIdBloqueTiempo();
            if (d.getTipoBloque() == TipoBloque.PREFERIDO) {
                ctx.preferidosPorProfesor.computeIfAbsent(idP, k -> new HashSet<>()).add(idB);
            } else if (d.getTipoBloque() == TipoBloque.PROHIBIDO) {
                ctx.prohibidosPorProfesor.computeIfAbsent(idP, k -> new HashSet<>()).add(idB);
            }
        }

        ctx.componentesPorId = ctx.sesionesPeriodo.stream()
                .map(SesionClase::getComponenteCarga)
                .collect(Collectors.toMap(ComponenteCarga::getIdComponente, x -> x, (a, b) -> a));
        ctx.componentesPorId.putIfAbsent(comp.getIdComponente(), comp);

        return ctx;
    }

    private boolean esAulaCompatible(TipoSesion ts, TipoAula ta) {
        if (ts == TipoSesion.TEORIA) return true;
        if (ts == TipoSesion.LABORATORIO) return ta == TipoAula.LABORATORIO;
        if (ts == TipoSesion.TALLER) return ta == TipoAula.TALLER;
        return false;
    }

    private String key(Long a, Long b) { return a + "-" + b; }

    private String describirBloque(BloqueTiempo b) {
        return b.getDiaSemana() + " " + b.getHoraInicio() + "-" + b.getHoraFin();
    }

    private String nombreMateria(ComponenteCarga c) {
        return c.getCargaAcademica().getPlanEstudioDetalle().getMateria().getNombreMateria();
    }

    /**
     * Indica si la sesion conflictiva ya fue programada por una edicion posterior
     * (manual o por aplicacion de otra sugerencia). En ese caso no tiene sentido
     * recomendar nada.
     */
    private boolean sesionYaProgramada(Long idComponente, Integer numeroSesion, Long idPeriodo) {
        if (numeroSesion == null) return false;
        return sesionClaseRepositorio
                .findByComponenteCarga_CargaAcademica_PeriodoAcademico_IdPeriodoAcademico(idPeriodo)
                .stream()
                .anyMatch(s -> s.getComponenteCarga().getIdComponente().equals(idComponente)
                        && numeroSesion.equals(s.getNumeroSesion()));
    }

    private static class Contexto {
        List<SesionClase> sesionesPeriodo = new ArrayList<>();
        Map<Long, SesionClase> sesionPorId = new HashMap<>();
        Map<String, SesionClase> sesionPorAulaBloque = new HashMap<>();
        Set<String> ocupadoAula = new HashSet<>();
        Set<String> ocupadoProfesor = new HashSet<>();
        Set<String> ocupadoGrupo = new HashSet<>();
        List<BloqueTiempo> bloquesCandidatosOrdenados = new ArrayList<>();
        List<Aula> aulasCompatibles = new ArrayList<>();
        Map<Long, Long> aulaBasePorGrupo = new HashMap<>();
        Map<Long, Set<Long>> preferidosPorProfesor = new HashMap<>();
        Map<Long, Set<Long>> prohibidosPorProfesor = new HashMap<>();
        Map<Long, ComponenteCarga> componentesPorId = new HashMap<>();

        boolean esBloquePreferido(Long idProf, Long idBloque) {
            return preferidosPorProfesor.getOrDefault(idProf, Set.of()).contains(idBloque);
        }

        boolean profesorBloqueProhibido(Long idProf, Long idBloque) {
            return prohibidosPorProfesor.getOrDefault(idProf, Set.of()).contains(idBloque);
        }

        ComponenteCarga componentePorId(Long id) { return componentesPorId.get(id); }

        List<Aula> aulasCompatiblesPara(SesionClase s) {
            TipoSesion ts = s.getComponenteCarga().getTipoSesion();
            Integer cupo = s.getComponenteCarga().getCargaAcademica().getGrupo().getCupoMaximo();
            return aulasCompatibles.stream()
                    .filter(a -> {
                        if (ts == TipoSesion.TEORIA) return true;
                        if (ts == TipoSesion.LABORATORIO) return a.getTipoAula() == TipoAula.LABORATORIO;
                        if (ts == TipoSesion.TALLER) return a.getTipoAula() == TipoAula.TALLER;
                        return false;
                    })
                    .filter(a -> cupo == null || a.getCapacidad() == null || a.getCapacidad() >= cupo)
                    .collect(Collectors.toList());
        }
    }
}
