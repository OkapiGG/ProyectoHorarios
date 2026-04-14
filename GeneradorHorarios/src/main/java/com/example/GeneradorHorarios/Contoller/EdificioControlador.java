package com.example.GeneradorHorarios.Contoller;

import com.example.GeneradorHorarios.Modelo.DTO.EdificioRequest;
import com.example.GeneradorHorarios.Modelo.Edificio;
import com.example.GeneradorHorarios.Modelo.Repositorio.EdificioRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/edificios")
@CrossOrigin(origins = "http://localhost:5173")
public class EdificioControlador {

    @Autowired
    private EdificioRepositorio edificioRepositorio;

    @GetMapping
    public ResponseEntity<List<Edificio>> listarEdificio(){
        List<Edificio> lista = edificioRepositorio.findAll();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<Edificio> crearEdificio(@RequestBody EdificioRequest request){
        Edificio nuevoEdificio = new Edificio();
        nuevoEdificio.setNombreEdificio(request.getNombreEdificio());

        Edificio edificioGuardado = edificioRepositorio.save(nuevoEdificio);
        return ResponseEntity.ok(edificioGuardado);
    }

}
