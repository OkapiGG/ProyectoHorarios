package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.DTO.LoginResponse;
import com.example.GeneradorHorarios.Modelo.DTO.LoginRequest;
import com.example.GeneradorHorarios.Modelo.Repositorio.UsuarioRepositorio;
import com.example.GeneradorHorarios.Modelo.Usuario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class LoginControlador {

    @Autowired
    private UsuarioRepositorio usuarioRepositorio;

    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios(){
        List<Usuario> lista = usuarioRepositorio.findAll();
        return ResponseEntity.ok(lista);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request){

        Optional<Usuario> usuarioOpt = usuarioRepositorio.findByCorreo(request.getCorreo());

        if(usuarioOpt.isPresent()){
            Usuario usuario = usuarioOpt.get();
            if(usuario.getPasswordHash().equals(request.getPassword())){
                Long idProfesor = usuario.getProfesor() != null ? usuario.getProfesor().getIdProfesor() : null;
                String nombreProfesor = null;
                String areaConocimiento = null;

                if(usuario.getProfesor() != null){
                    nombreProfesor = String.join(" ",
                            usuario.getProfesor().getNomProfesor() != null ? usuario.getProfesor().getNomProfesor() : "",
                            usuario.getProfesor().getApPaternoProfesor() != null ? usuario.getProfesor().getApPaternoProfesor() : "",
                            usuario.getProfesor().getApMaternoProfesor() != null ? usuario.getProfesor().getApMaternoProfesor() : ""
                    ).trim().replaceAll("\\s+", " ");
                    areaConocimiento = usuario.getProfesor().getAreaConocimiento();
                }

                LoginResponse response = new LoginResponse(
                        usuario.getIdUsuario(),
                        usuario.getCorreo(),
                        usuario.getRol(),
                        usuario.getActivo(),
                        idProfesor,
                        nombreProfesor,
                        areaConocimiento
                );

                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(401).body("Correo o cotraseña incorrectos");
    }
}
