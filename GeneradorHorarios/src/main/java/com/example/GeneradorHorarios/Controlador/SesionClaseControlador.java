package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.Aula;
import com.example.GeneradorHorarios.Modelo.BloqueTiempo;
import com.example.GeneradorHorarios.Modelo.ComponenteCarga;
import com.example.GeneradorHorarios.Modelo.DTO.SesionClaseRequest;
import com.example.GeneradorHorarios.Modelo.Repositorio.AulaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.BloqueTiempoRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.ComponenteCargaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.SesionClaseRepositorio;
import com.example.GeneradorHorarios.Modelo.SesionClase;
import com.example.GeneradorHorarios.Modelo.enums.EstadoSesion;
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

    @GetMapping
    public ResponseEntity<List<SesionClase>> listarSesionClase(){
        List<SesionClase> lista = sesionClaseRepositorio.findAll();
        return ResponseEntity.ok(lista);
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

        SesionClase sesionClaseGuardada = sesionClaseRepositorio.save(nuevaSesionClase);

        return ResponseEntity.ok(sesionClaseGuardada);
    }
}
