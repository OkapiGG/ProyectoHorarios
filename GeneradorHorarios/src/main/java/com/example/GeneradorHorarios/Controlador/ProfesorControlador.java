package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.DTO.ProfesorRequest;
import com.example.GeneradorHorarios.Modelo.Profesor;
import com.example.GeneradorHorarios.Modelo.Repositorio.ProfesorRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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
        aplicarCampos(nuevoProfesor, request);
        return ResponseEntity.ok(profesorRepositorio.save(nuevoProfesor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarProfesor(@PathVariable Long id, @RequestBody ProfesorRequest request){
        Optional<Profesor> opt = profesorRepositorio.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El profesor no existe");
        }
        Profesor p = opt.get();
        aplicarCampos(p, request);
        return ResponseEntity.ok(profesorRepositorio.save(p));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarProfesor(@PathVariable Long id){
        if (!profesorRepositorio.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El profesor no existe");
        }
        try {
            profesorRepositorio.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    "No se puede eliminar el profesor porque tiene cargas, propuestas u otros registros asociados."
            );
        }
    }

    private void aplicarCampos(Profesor p, ProfesorRequest r) {
        p.setNomProfesor(r.getNomProfesor());
        p.setApPaternoProfesor(r.getApPaternoProfesor());
        p.setApMaternoProfesor(r.getApMaternoProfesor());
        p.setAreaConocimiento(r.getAreaConocimiento());
        p.setCorreo(r.getCorreo());
        p.setTipoContrato(r.getTipoContrato());
        p.setAniosAntiguedad(r.getAniosAntiguedad());
        p.setMaxGradoEstudios(r.getMaxGradoEstudios());
    }
}
