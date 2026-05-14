package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.DTO.MateriaRequest;
import com.example.GeneradorHorarios.Modelo.Materia;
import com.example.GeneradorHorarios.Modelo.Repositorio.MateriaRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarMateria(@PathVariable Long id, @RequestBody MateriaRequest request){
        Optional<Materia> opt = materiaRepositorio.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("La materia no existe");
        }
        Materia m = opt.get();
        m.setClaveMateria(request.getClaveMateria());
        m.setNombreMateria(request.getNombreMateria());
        m.setCreditos(request.getCreditos());
        m.setHorasSemanales(request.getHorasSemanales());
        return ResponseEntity.ok(materiaRepositorio.save(m));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarMateria(@PathVariable Long id){
        if (!materiaRepositorio.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("La materia no existe");
        }
        try {
            materiaRepositorio.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    "No se puede eliminar la materia porque tiene planes o cargas asociados."
            );
        }
    }
}
