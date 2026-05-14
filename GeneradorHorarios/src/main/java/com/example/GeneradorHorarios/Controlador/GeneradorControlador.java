package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.DTO.GeneracionHorarioResponse;
import com.example.GeneradorHorarios.Servicio.GeneradorHorarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/generador")
@CrossOrigin(origins = "http://localhost:5173")
public class GeneradorControlador {

    @Autowired
    private GeneradorHorarioService generadorHorarioService;

    @PostMapping("/ejecutar/{idPeriodoAcademico}")
    public ResponseEntity<?> ejecutarGenerador(@PathVariable Long idPeriodoAcademico) {
        try {
            GeneracionHorarioResponse response = generadorHorarioService.ejecutar(idPeriodoAcademico);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
