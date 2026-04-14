package com.example.GeneradorHorarios.Contoller;


import com.example.GeneradorHorarios.Modelo.Aula;
import com.example.GeneradorHorarios.Modelo.DTO.AulaRequest;
import com.example.GeneradorHorarios.Modelo.Edificio;
import com.example.GeneradorHorarios.Modelo.Repositorio.AulaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.EdificioRepositorio;
import com.example.GeneradorHorarios.Modelo.enums.TipoAula;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/aulas")
@CrossOrigin(origins = "http://localhost:5173")
public class AulaControlador {

        @Autowired
        private AulaRepositorio aulaRepositorio;

        @Autowired
        private EdificioRepositorio edificioRepositorio;

        @GetMapping
        public ResponseEntity<List<Aula>> listar(){
            List<Aula> lista = aulaRepositorio.findAll();
            return ResponseEntity.ok(lista);
        }

        @PostMapping
        public ResponseEntity<?> crearAula(@RequestBody AulaRequest request){

            Optional<Edificio> edificioOpt = edificioRepositorio.findById(request.getIdEdificio());

            if (!edificioOpt.isPresent()){
                return ResponseEntity.badRequest().body("Error, el edificio especificado no existe");
            }

            Aula nuevaAula = new Aula();
            nuevaAula.setNombreAula(request.getNombreAula());
            nuevaAula.setCapacidad(request.getCapacidad());
            nuevaAula.setTipoAula(TipoAula.valueOf(request.getAula().toUpperCase()));
            nuevaAula.setEdificio(edificioOpt.get());

            Aula aulaGuardada = aulaRepositorio.save(nuevaAula);
            return ResponseEntity.ok(aulaGuardada);
        }



}
