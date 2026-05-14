package com.example.GeneradorHorarios.Controlador;


import com.example.GeneradorHorarios.Modelo.DTO.PeriodoAcademicoRequest;
import com.example.GeneradorHorarios.Modelo.PeriodoAcademico;
import com.example.GeneradorHorarios.Modelo.Repositorio.PeriodoAcademicoRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/periodos_academicos")
@CrossOrigin(origins = "http://localhost:5173")
public class PeriodoAcademicoControlador {

    @Autowired
    private PeriodoAcademicoRepositorio periodoAcademicoRepositorio;

    @GetMapping
    public ResponseEntity<List<PeriodoAcademico>> listarPeriodosAcademicos(){
        List<PeriodoAcademico> lista = periodoAcademicoRepositorio.findAll();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/activo")
    public ResponseEntity<?> obtenerPeriodoAcademicoActivo() {
        long totalActivos = periodoAcademicoRepositorio.countByActivoTrue();

        if (totalActivos > 1) {
            return ResponseEntity.status(409).body("Existen multiples periodos academicos activos");
        }

        Optional<PeriodoAcademico> periodoActivoOpt = periodoAcademicoRepositorio.findFirstByActivoTrue();

        if (!periodoActivoOpt.isPresent()) {
            return ResponseEntity.status(404).body("No existe un periodo academico activo");
        }

        return ResponseEntity.ok(periodoActivoOpt.get());
    }

    @PostMapping
    public ResponseEntity<PeriodoAcademico> crearPeriodoAcademico(@RequestBody PeriodoAcademicoRequest request){
        PeriodoAcademico nuevoPeriodoAcademico = new PeriodoAcademico();

        if (Boolean.TRUE.equals(request.getActivo())) {
            List<PeriodoAcademico> periodosActivos = periodoAcademicoRepositorio.findByActivoTrue();
            for (PeriodoAcademico periodoActivo : periodosActivos) {
                periodoActivo.setActivo(false);
            }
            if (!periodosActivos.isEmpty()) {
                periodoAcademicoRepositorio.saveAll(periodosActivos);
            }
        }

        nuevoPeriodoAcademico.setDescripcion(request.getDescripcion());
        nuevoPeriodoAcademico.setAnio(request.getAnio());
        nuevoPeriodoAcademico.setFechaInicio(request.getFechaInicio());
        nuevoPeriodoAcademico.setFechaFin(request.getFechaFin());
        nuevoPeriodoAcademico.setActivo(request.getActivo());

        PeriodoAcademico periodoAcademicoGuardado = periodoAcademicoRepositorio.save(nuevoPeriodoAcademico);
        return ResponseEntity.ok(periodoAcademicoGuardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPeriodoAcademico(@PathVariable Long id, @RequestBody PeriodoAcademicoRequest request) {
        Optional<PeriodoAcademico> opt = periodoAcademicoRepositorio.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El periodo no existe");
        }

        if (Boolean.TRUE.equals(request.getActivo())) {
            List<PeriodoAcademico> activos = periodoAcademicoRepositorio.findByActivoTrue();
            for (PeriodoAcademico p : activos) {
                if (!p.getIdPeriodoAcademico().equals(id)) p.setActivo(false);
            }
            if (!activos.isEmpty()) periodoAcademicoRepositorio.saveAll(activos);
        }

        PeriodoAcademico p = opt.get();
        p.setDescripcion(request.getDescripcion());
        p.setAnio(request.getAnio());
        p.setFechaInicio(request.getFechaInicio());
        p.setFechaFin(request.getFechaFin());
        p.setActivo(request.getActivo());
        return ResponseEntity.ok(periodoAcademicoRepositorio.save(p));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarPeriodoAcademico(@PathVariable Long id) {
        if (!periodoAcademicoRepositorio.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El periodo no existe");
        }
        try {
            periodoAcademicoRepositorio.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    "No se puede eliminar el periodo porque tiene cargas, propuestas u otros registros asociados."
            );
        }
    }
}
