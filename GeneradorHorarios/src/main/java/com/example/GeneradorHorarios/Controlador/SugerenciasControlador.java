package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.CargaAcademica;
import com.example.GeneradorHorarios.Modelo.ConflictoGeneracion;
import com.example.GeneradorHorarios.Modelo.DTO.AplicarSugerenciaRequest;
import com.example.GeneradorHorarios.Modelo.DTO.ConflictoResponse;
import com.example.GeneradorHorarios.Modelo.DTO.DescartarConflictoRequest;
import com.example.GeneradorHorarios.Modelo.DTO.ResultadoAplicacionDTO;
import com.example.GeneradorHorarios.Modelo.DTO.SugerenciaDTO;
import com.example.GeneradorHorarios.Modelo.Profesor;
import com.example.GeneradorHorarios.Modelo.Repositorio.ConflictoGeneracionRepositorio;
import com.example.GeneradorHorarios.Servicio.AplicadorSugerenciaService;
import com.example.GeneradorHorarios.Servicio.SugerenciasOptimizacionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/conflictos")
@org.springframework.web.bind.annotation.CrossOrigin(origins = "http://localhost:5173")
public class SugerenciasControlador {

    @Autowired private SugerenciasOptimizacionService sugerenciasService;
    @Autowired private AplicadorSugerenciaService aplicadorService;
    @Autowired private ConflictoGeneracionRepositorio conflictoRepositorio;

    @GetMapping("/periodo/{idPeriodo}")
    @Transactional(readOnly = true)
    public List<ConflictoResponse> bandeja(@PathVariable Long idPeriodo) {
        return conflictoRepositorio
                .findByPeriodoAcademico_IdPeriodoAcademicoAndResueltoFalse(idPeriodo)
                .stream().map(this::aResponse).collect(Collectors.toList());
    }

    @GetMapping("/periodo/{idPeriodo}/todos")
    @Transactional(readOnly = true)
    public List<ConflictoResponse> bandejaCompleta(@PathVariable Long idPeriodo) {
        return conflictoRepositorio
                .findByPeriodoAcademico_IdPeriodoAcademico(idPeriodo)
                .stream().map(this::aResponse).collect(Collectors.toList());
    }

    @GetMapping("/{idConflicto}/sugerencias")
    public ResponseEntity<List<SugerenciaDTO>> sugerencias(@PathVariable Long idConflicto) {
        return ResponseEntity.ok(sugerenciasService.calcularSugerencias(idConflicto));
    }

    @PostMapping("/{idConflicto}/aplicar")
    public ResponseEntity<ResultadoAplicacionDTO> aplicar(@PathVariable Long idConflicto,
                                                          @RequestBody AplicarSugerenciaRequest req) {
        if (req.getIdConflicto() == null) {
            req.setIdConflicto(idConflicto);
        } else if (!req.getIdConflicto().equals(idConflicto)) {
            throw new IllegalArgumentException("idConflicto del path no coincide con el body");
        }
        return ResponseEntity.ok(aplicadorService.aplicar(req));
    }

    @PatchMapping("/{idConflicto}/descartar")
    @Transactional
    public ResponseEntity<ConflictoResponse> descartar(@PathVariable Long idConflicto,
                                                       @RequestBody(required = false) DescartarConflictoRequest req) {
        ConflictoGeneracion conf = conflictoRepositorio.findById(idConflicto)
                .orElseThrow(() -> new IllegalArgumentException("Conflicto no existe: " + idConflicto));
        if (!Boolean.TRUE.equals(conf.getResuelto())) {
            conf.setResuelto(Boolean.TRUE);
            conf.setMotivoResolucion(req != null && req.getMotivo() != null && !req.getMotivo().isBlank()
                    ? req.getMotivo()
                    : "Descartado por el coordinador");
            conf.setFechaResolucion(LocalDateTime.now());
            conf = conflictoRepositorio.save(conf);
        }
        return ResponseEntity.ok(aResponse(conf));
    }

    private ConflictoResponse aResponse(ConflictoGeneracion c) {
        ConflictoResponse.ConflictoResponseBuilder b = ConflictoResponse.builder()
                .idConflicto(c.getIdConflicto())
                .idPeriodoAcademico(c.getPeriodoAcademico() != null ? c.getPeriodoAcademico().getIdPeriodoAcademico() : null)
                .numeroSesion(c.getNumeroSesion())
                .motivo(c.getMotivo())
                .detalle(c.getDetalle())
                .fechaDeteccion(c.getFechaDeteccion())
                .resuelto(c.getResuelto())
                .motivoResolucion(c.getMotivoResolucion())
                .fechaResolucion(c.getFechaResolucion());

        CargaAcademica carga = c.getCargaAcademica();
        if (carga != null) {
            b.idCargaAcademica(carga.getIdCargaAcademica());
            if (carga.getPlanEstudioDetalle() != null
                    && carga.getPlanEstudioDetalle().getMateria() != null) {
                b.nombreMateria(carga.getPlanEstudioDetalle().getMateria().getNombreMateria());
            }
            Profesor p = carga.getProfesor();
            if (p != null) {
                String nombre = String.join(" ",
                        nullSafe(p.getNomProfesor()),
                        nullSafe(p.getApPaternoProfesor()),
                        nullSafe(p.getApMaternoProfesor())).trim();
                b.nombreProfesor(nombre.isEmpty() ? p.getCorreo() : nombre);
            }
            if (carga.getGrupo() != null) {
                b.claveGrupo(carga.getGrupo().getClaveGrupo());
            }
        }
        if (c.getComponenteCarga() != null) {
            b.idComponente(c.getComponenteCarga().getIdComponente());
        }
        return b.build();
    }

    private String nullSafe(String s) { return s == null ? "" : s; }
}
