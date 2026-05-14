package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.CargaAcademica;
import com.example.GeneradorHorarios.Modelo.ComponenteCarga;
import com.example.GeneradorHorarios.Modelo.DetalleHorario;
import com.example.GeneradorHorarios.Modelo.DTO.AulaResponse;
import com.example.GeneradorHorarios.Modelo.DTO.BloqueTiempoResponse;
import com.example.GeneradorHorarios.Modelo.DTO.CargaAcademicaResponse;
import com.example.GeneradorHorarios.Modelo.DTO.ComponenteCargaResponse;
import com.example.GeneradorHorarios.Modelo.DTO.DetalleHorarioResponse;
import com.example.GeneradorHorarios.Modelo.DTO.GeneradorInputResponse;
import com.example.GeneradorHorarios.Modelo.DTO.GrupoAulaResponse;
import com.example.GeneradorHorarios.Modelo.DTO.PreferenciaMateriaProfesorResponse;
import com.example.GeneradorHorarios.Modelo.DTO.PropuestaCoordinacionResponse;
import com.example.GeneradorHorarios.Modelo.DTO.ValidacionGeneradorResponse;
import com.example.GeneradorHorarios.Modelo.PeriodoAcademico;
import com.example.GeneradorHorarios.Modelo.PreferenciaMateriaProfesor;
import com.example.GeneradorHorarios.Modelo.PropuestaDisponibilidad;
import com.example.GeneradorHorarios.Modelo.Repositorio.AulaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.BloqueTiempoRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.CargaAcademicaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.ComponenteCargaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.DetalleHorarioRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.GrupoAulaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PeriodoAcademicoRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PreferenciaMateriaProfesorRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PropuestaRepositorio;
import com.example.GeneradorHorarios.Modelo.enums.EstadoPropuesta;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/generador")
@CrossOrigin(origins = "http://localhost:5173")
public class GeneradorValidacionControlador {

    @Autowired
    private PeriodoAcademicoRepositorio periodoAcademicoRepositorio;

    @Autowired
    private CargaAcademicaRepositorio cargaAcademicaRepositorio;

    @Autowired
    private ComponenteCargaRepositorio componenteCargaRepositorio;

    @Autowired
    private BloqueTiempoRepositorio bloqueTiempoRepositorio;

    @Autowired
    private AulaRepositorio aulaRepositorio;

    @Autowired
    private PropuestaRepositorio propuestaRepositorio;

    @Autowired
    private GrupoAulaRepositorio grupoAulaRepositorio;

    @Autowired
    private DetalleHorarioRepositorio detalleHorarioRepositorio;

    @Autowired
    private PreferenciaMateriaProfesorRepositorio preferenciaMateriaProfesorRepositorio;

    @GetMapping("/validacion-previa/{idPeriodoAcademico}")
    public ResponseEntity<?> validarPeriodoParaGeneracion(@PathVariable Long idPeriodoAcademico) {
        Optional<PeriodoAcademico> periodoOpt = periodoAcademicoRepositorio.findById(idPeriodoAcademico);

        if (!periodoOpt.isPresent()) {
            return ResponseEntity.status(404).body("El periodo academico no existe");
        }

        PeriodoAcademico periodo = periodoOpt.get();
        List<CargaAcademica> cargas = cargaAcademicaRepositorio.findByPeriodoAcademico_IdPeriodoAcademico(idPeriodoAcademico);
        List<ComponenteCarga> componentes = componenteCargaRepositorio.findByCargaAcademica_PeriodoAcademico_IdPeriodoAcademico(idPeriodoAcademico);

        long totalBloques = bloqueTiempoRepositorio.count();
        long totalAulas = aulaRepositorio.count();
        long totalPropuestasAprobadas = propuestaRepositorio.countByEstadoAndPeriodoAcademico_IdPeriodoAcademico(
                EstadoPropuesta.APROBADA,
                idPeriodoAcademico
        );
        long totalGruposConAula = grupoAulaRepositorio.countByPeriodoAcademico_IdPeriodoAcademico(idPeriodoAcademico);

        Set<Long> cargasConComponente = componentes.stream()
                .map(componente -> componente.getCargaAcademica().getIdCargaAcademica())
                .collect(Collectors.toSet());

        int cargasSinComponentes = (int) cargas.stream()
                .filter(carga -> !cargasConComponente.contains(carga.getIdCargaAcademica()))
                .count();

        List<String> errores = new ArrayList<>();
        List<String> advertencias = new ArrayList<>();

        if (totalBloques <= 0) {
            errores.add("No existen bloques de tiempo registrados");
        }

        if (totalAulas <= 0) {
            errores.add("No existen aulas registradas");
        }

        if (cargas.isEmpty()) {
            errores.add("No existen cargas academicas para el periodo");
        }

        if (componentes.isEmpty()) {
            errores.add("No existen componentes de carga para el periodo");
        }

        if (cargasSinComponentes > 0) {
            errores.add("Existen " + cargasSinComponentes + " cargas academicas sin componentes de carga");
        }

        if (totalPropuestasAprobadas <= 0) {
            advertencias.add("No hay propuestas de disponibilidad aprobadas para el periodo");
        }

        if (totalGruposConAula <= 0) {
            advertencias.add(
                    "No hay relaciones grupo-aula para el periodo; el generador usara cualquier aula compatible disponible"
            );
        }

        if (!periodo.getActivo()) {
            advertencias.add("El periodo no esta marcado como activo");
        }

        ValidacionGeneradorResponse response = new ValidacionGeneradorResponse(
                errores.isEmpty(),
                periodo.getIdPeriodoAcademico(),
                periodo.getDescripcion(),
                (int) totalBloques,
                (int) totalAulas,
                cargas.size(),
                componentes.size(),
                (int) totalPropuestasAprobadas,
                (int) totalGruposConAula,
                cargasSinComponentes,
                errores,
                advertencias
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/input/{idPeriodoAcademico}")
    public ResponseEntity<?> obtenerInputGenerador(@PathVariable Long idPeriodoAcademico) {
        Optional<PeriodoAcademico> periodoOpt = periodoAcademicoRepositorio.findById(idPeriodoAcademico);

        if (!periodoOpt.isPresent()) {
            return ResponseEntity.status(404).body("El periodo academico no existe");
        }

        PeriodoAcademico periodo = periodoOpt.get();
        List<CargaAcademica> cargas = cargaAcademicaRepositorio.findByPeriodoAcademico_IdPeriodoAcademico(idPeriodoAcademico);
        List<ComponenteCarga> componentes = componenteCargaRepositorio.findByCargaAcademica_PeriodoAcademico_IdPeriodoAcademico(idPeriodoAcademico);
        List<PropuestaDisponibilidad> propuestasAprobadas = propuestaRepositorio.findByEstadoAndPeriodoAcademico_IdPeriodoAcademico(
                EstadoPropuesta.APROBADA,
                idPeriodoAcademico
        );
        List<DetalleHorario> detallesHorario = detalleHorarioRepositorio.findByPropuestaDisponibilidadIn(propuestasAprobadas);
        List<PreferenciaMateriaProfesor> preferencias = preferenciaMateriaProfesorRepositorio.findByPeriodoAcademico_IdPeriodoAcademico(idPeriodoAcademico);

        GeneradorInputResponse response = new GeneradorInputResponse(
                periodo.getIdPeriodoAcademico(),
                periodo.getDescripcion(),
                periodo.getAnio(),
                periodo.getActivo(),
                cargas.stream().map(CargaAcademicaResponse::fromEntity).collect(Collectors.toList()),
                componentes.stream().map(ComponenteCargaResponse::fromEntity).collect(Collectors.toList()),
                propuestasAprobadas.stream().map(PropuestaCoordinacionResponse::fromEntity).collect(Collectors.toList()),
                detallesHorario.stream().map(DetalleHorarioResponse::fromEntity).collect(Collectors.toList()),
                preferencias.stream().map(PreferenciaMateriaProfesorResponse::fromEntity).collect(Collectors.toList()),
                bloqueTiempoRepositorio.findAll().stream().map(BloqueTiempoResponse::fromEntity).collect(Collectors.toList()),
                aulaRepositorio.findAll().stream().map(AulaResponse::fromEntity).collect(Collectors.toList()),
                grupoAulaRepositorio.findByPeriodoAcademico_IdPeriodoAcademico(idPeriodoAcademico)
                        .stream()
                        .map(GrupoAulaResponse::fromEntity)
                        .collect(Collectors.toList())
        );

        return ResponseEntity.ok(response);
    }
}
