package com.example.GeneradorHorarios.Contoller;

import com.example.GeneradorHorarios.Modelo.Repositorio.AulaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.GrupoRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/grupos")
@CrossOrigin(origins = "http://localhost:5173")
public class GrupoControlador {

    @Autowired
    private GrupoRepositorio grupoRepositorio;

    @Autowired
    private AulaRepositorio aulaRepositorio;


}
