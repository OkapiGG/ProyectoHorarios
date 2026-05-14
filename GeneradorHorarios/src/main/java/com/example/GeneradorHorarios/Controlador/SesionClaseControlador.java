package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.Aula;
import com.example.GeneradorHorarios.Modelo.BloqueTiempo;
import com.example.GeneradorHorarios.Modelo.ComponenteCarga;
import com.example.GeneradorHorarios.Modelo.DTO.HorarioGeneradoSesionResponse;
import com.example.GeneradorHorarios.Modelo.DTO.MoverSesionRequest;
import com.example.GeneradorHorarios.Modelo.DTO.SesionClaseRequest;
import com.example.GeneradorHorarios.Modelo.Repositorio.AulaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.BloqueTiempoRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.ComponenteCargaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.SesionClaseRepositorio;
import com.example.GeneradorHorarios.Modelo.SesionClase;
import com.example.GeneradorHorarios.Modelo.enums.EstadoSesion;
import com.example.GeneradorHorarios.Servicio.EdicionSesionService;
import com.example.GeneradorHorarios.Servicio.HorarioGeneradoConsultaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sesion_clase")
@CrossOrigin(origins = "http://localhost:5173")
public class SesionClaseControlador {

    @Autowired
    private SesionClaseRepositorio sesionClaseRepositorio;

    @Autowired
    private ComponenteCargaRepositorio componenteCargaRepositorio;

    @Autowired
    private BloqueTiempoRepositorio bloqueTiempoRepositorio;

    @Autowired
    private AulaRepositorio aulaRepositorio;

    @Autowired
    private HorarioGeneradoConsultaService horarioGeneradoConsultaService;

    @Autowired
    private EdicionSesionService edicionSesionService;

    @GetMapping
    public ResponseEntity<List<SesionClase>> listarSesionClase(){
        List<SesionClase> lista = sesionClaseRepositorio.findAll();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/periodo/{idPeriodoAcademico}/visualizacion")
    public ResponseEntity<List<HorarioGeneradoSesionResponse>> listarHorarioGeneradoPorPeriodo(
            @PathVariable Long idPeriodoAcademico
    ) {
        List<HorarioGeneradoSesionResponse> response = horarioGeneradoConsultaService
                .listarPorPeriodo(idPeriodoAcademico);

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> crearSesionClase(@RequestBody SesionClaseRequest request){

        Optional<ComponenteCarga> componenteCargaOpt = componenteCargaRepositorio.findById(request.getIdComponenteCarga());
        Optional<BloqueTiempo> bloqueTiempoOpt = bloqueTiempoRepositorio.findById(request.getIdBloqueTiempo());
        Optional<Aula> aulaOpt = aulaRepositorio.findById(request.getIdAula());

        if(!componenteCargaOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, el Componente Carga no existe");
        }
        if(!bloqueTiempoOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, el Bloque Tiempo no existe");
        }
        if(!aulaOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, el Aula no existe");
        }

        SesionClase nuevaSesionClase = new SesionClase();

        nuevaSesionClase.setEstado(EstadoSesion.valueOf(request.getEstado().toUpperCase()));
        nuevaSesionClase.setComponenteCarga(componenteCargaOpt.get());
        nuevaSesionClase.setBloqueTiempo(bloqueTiempoOpt.get());
        nuevaSesionClase.setAula(aulaOpt.get());
        nuevaSesionClase.setNumeroSesion(
                request.getNumeroSesion() != null && request.getNumeroSesion() > 0
                        ? request.getNumeroSesion()
                        : 1
        );

        SesionClase sesionClaseGuardada = sesionClaseRepositorio.save(nuevaSesionClase);

        return ResponseEntity.ok(sesionClaseGuardada);
    }

    /**
     * Mueve una sesion logica (componente + numeroSesion) a un nuevo bloque
     * inicial y/o aula. Para multi-bloque construye la secuencia consecutiva.
     * Devuelve 409 si hay choques con el grid actual.
     */
    @PatchMapping("/logica")
    public ResponseEntity<List<SesionClase>> moverSesionLogica(@RequestBody MoverSesionRequest request) {
        List<SesionClase> resultado = edicionSesionService.moverSesionLogica(request);
        return ResponseEntity.ok(resultado);
    }

    /**
     * Elimina por completo una sesion logica del horario (libera todos sus bloques).
     */
    @DeleteMapping("/logica")
    public ResponseEntity<Void> eliminarSesionLogica(
            @RequestParam Long idComponente,
            @RequestParam Integer numeroSesion
    ) {
        edicionSesionService.eliminarSesionLogica(idComponente, numeroSesion);
        return ResponseEntity.noContent().build();
    }
}
