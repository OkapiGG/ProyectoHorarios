package com.example.GeneradorHorarios.Contoller;

import com.example.GeneradorHorarios.Modelo.DTO.MateriaRequest;
import com.example.GeneradorHorarios.Modelo.Materia;
import com.example.GeneradorHorarios.Modelo.Repositorio.MateriaRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materias")
@CrossOrigin(origins = "http://localhost:5173")
public class MateriaControlador {

    @Autowired
    private MateriaRepositorio materiaRepositorio;

    @GetMapping
    public ResponseEntity<List<Materia>> listarMaterias(){
        List<Materia> lista = materiaRepositorio.findAll();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<Materia> crearMateria(@RequestBody MateriaRequest request){
        Materia materiaNueva = new Materia();
        materiaNueva.setClaveMateria(request.getClaveMateria());
        materiaNueva.setNombreMateria(request.getNombreMateria());
        materiaNueva.setCreditos(request.getCreditos());
        materiaNueva.setHorasSemanales(request.getHorasSemanales());

        Materia materiaGuardada = materiaRepositorio.save(materiaNueva);
        return ResponseEntity.ok(materiaGuardada);
    }

}
