package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.DTO.UsuarioRequest;
import com.example.GeneradorHorarios.Modelo.Profesor;
import com.example.GeneradorHorarios.Modelo.Repositorio.ProfesorRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.UsuarioRepositorio;
import com.example.GeneradorHorarios.Modelo.Usuario;
import com.example.GeneradorHorarios.Modelo.enums.Rol;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioControlador {

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    @Autowired
    private ProfesorRepositorio profesorRepositorio;

    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioRepositorio.findAll());
    }

    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody UsuarioRequest request) {
        if (request.getCorreo() == null || request.getCorreo().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El correo es obligatorio");
        }

        if (request.getPasswordHash() == null || request.getPasswordHash().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("La contraseña es obligatoria");
        }

        if (request.getRol() == null) {
            request.setRol(Rol.PROFESOR);
        }

        Optional<Usuario> usuarioExistente = usuarioRepositorio.findByCorreo(request.getCorreo().trim());
        if (usuarioExistente.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Ya existe un usuario con ese correo");
        }

        Profesor profesor = null;
        if (request.getIdProfesor() != null) {
            Optional<Profesor> profesorOpt = profesorRepositorio.findById(request.getIdProfesor());
            if (profesorOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("El profesor asociado no existe");
            }
            profesor = profesorOpt.get();

            Optional<Usuario> usuarioConProfesor = usuarioRepositorio.findByProfesor_IdProfesor(request.getIdProfesor());
            if (usuarioConProfesor.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Ese profesor ya tiene un usuario asociado");
            }
        }

        Usuario usuario = new Usuario();
        usuario.setCorreo(request.getCorreo().trim());
        usuario.setPasswordHash(request.getPasswordHash());
        usuario.setRol(request.getRol());
        usuario.setActivo(request.getActivo() == null ? Boolean.TRUE : request.getActivo());
        usuario.setProfesor(profesor);

        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioRepositorio.save(usuario));
    }
}
