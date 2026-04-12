package com.example.GeneradorHorarios.Contoller;

import com.example.GeneradorHorarios.Modelo.DTO.ProfesorRequest;
import com.example.GeneradorHorarios.Modelo.Profesor;
import com.example.GeneradorHorarios.Modelo.Repositorio.ProfesorRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profesores")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfesorControlador {

    @Autowired
    private ProfesorRepositorio profesorRepositorio;

    @GetMapping
    public ResponseEntity<List<Profesor>> listarProfesores(){
        List<Profesor> lista = profesorRepositorio.findAll();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<Profesor> crearProfesor(@RequestBody ProfesorRequest request){
        Profesor nuevoProfesor = new Profesor();
        nuevoProfesor.setNomProfesor(request.getNomProfesor());
        nuevoProfesor.setApPaternoProfesor(request.getApPaternoProfesor());
        nuevoProfesor.setApMaternoProfesor(request.getApPaternoMaterno());
        nuevoProfesor.setAreaConocimiento(request.getAreaConocimiento());
        nuevoProfesor.setTipoContrato(request.getTipoContrato());
        nuevoProfesor.setAniosAntiguedad(request.getAniosAntiguedad());
        nuevoProfesor.setMaxGradoEstudios(request.getMaxAniosEstudios());

        Profesor profesorGuardado = profesorRepositorio.save(nuevoProfesor);
        return ResponseEntity.ok(profesorGuardado);
    }
}
