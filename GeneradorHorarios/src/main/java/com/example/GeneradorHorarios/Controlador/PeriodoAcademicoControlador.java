package com.example.GeneradorHorarios.Controlador;


import com.example.GeneradorHorarios.Modelo.DTO.PeriodoAcademicoRequest;
import com.example.GeneradorHorarios.Modelo.PeriodoAcademico;
import com.example.GeneradorHorarios.Modelo.Repositorio.PeriodoAcademicoRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
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
        Optional<PeriodoAcademico> periodoActivoOpt = periodoAcademicoRepositorio.findFirstByActivoTrue();

        if (!periodoActivoOpt.isPresent()) {
            return ResponseEntity.status(404).body("No existe un periodo academico activo");
        }

        return ResponseEntity.ok(periodoActivoOpt.get());
    }

    @PostMapping
    public ResponseEntity<PeriodoAcademico> crearPeriodoAcademico(@RequestBody PeriodoAcademicoRequest request){
        PeriodoAcademico nuevoPeriodoAcademico = new PeriodoAcademico();

        nuevoPeriodoAcademico.setDescripcion(request.getDescripcion());
        nuevoPeriodoAcademico.setAnio(request.getAnio());
        nuevoPeriodoAcademico.setFechaInicio(request.getFechaInicio());
        nuevoPeriodoAcademico.setFechaFin(request.getFechaFin());
        nuevoPeriodoAcademico.setActivo(request.getActivo());

        PeriodoAcademico periodoAcademicoGuardado = periodoAcademicoRepositorio.save(nuevoPeriodoAcademico);
        return ResponseEntity.ok(periodoAcademicoGuardado);
    }
}
