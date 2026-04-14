package com.example.GeneradorHorarios.Contoller;

import com.example.GeneradorHorarios.Modelo.DTO.LoginRequest;
import com.example.GeneradorHorarios.Modelo.Repositorio.UsuarioRepositorio;
import com.example.GeneradorHorarios.Modelo.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class LoginControlador {

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){

        Optional<Usuario> usuarioOpt = usuarioRepositorio.findByCorreo(request.getCorreo());

        if(usuarioOpt.isPresent()){
            Usuario usuario = usuarioOpt.get();
            if(usuario.getPasswordHash().equals(request.getPassword())){
                usuario.setPasswordHash("");
                return ResponseEntity.ok(usuario);
            }
        }

        return ResponseEntity.status(401).body("Correo o cotraseña incorrectos");

    }
}