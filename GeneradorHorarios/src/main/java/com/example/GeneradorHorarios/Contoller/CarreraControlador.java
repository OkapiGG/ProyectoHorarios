package com.example.GeneradorHorarios.Contoller;

import com.example.GeneradorHorarios.Modelo.Carrera;
import com.example.GeneradorHorarios.Modelo.DTO.CarreraRequest;
import com.example.GeneradorHorarios.Modelo.Repositorio.CarreraRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carreras")
@CrossOrigin(origins = "http://localhost:5173")
public class CarreraControlador {

    @Autowired
    private CarreraRepositorio carreraRepositorio;

    @GetMapping
    public ResponseEntity<List<Carrera>> listarCarrera(){
        List<Carrera> lista = carreraRepositorio.findAll();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<Carrera> crearCarrera(@RequestBody CarreraRequest request){

        Carrera nuevaCarrera = new Carrera();
        nuevaCarrera.setNombreCarrera(request.getNombreCarrera());

        Carrera carreraGuardada = carreraRepositorio.save(nuevaCarrera);
        return ResponseEntity.ok(carreraGuardada);

    }


}
