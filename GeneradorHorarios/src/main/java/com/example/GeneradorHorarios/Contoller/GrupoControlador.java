package com.example.GeneradorHorarios.Contoller;

import com.example.GeneradorHorarios.Modelo.Grupo;
import com.example.GeneradorHorarios.Modelo.Repositorio.AulaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.GrupoRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/grupos")
@CrossOrigin(origins = "http://localhost:5173")
public class GrupoControlador {

    @Autowired
    private GrupoRepositorio grupoRepositorio;

    @Autowired
    private AulaRepositorio aulaRepositorio;

//    @GetMapping
//    public ResponseEntity<List<Grupo>> listarGrupos(){
//        List<Grupo> lista = grupoRepositorio.findAll();
//        return ResponseEntity.ok(lista);
//    }

}
