package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.Carrera;
import com.example.GeneradorHorarios.Modelo.DTO.CarreraRequest;
import com.example.GeneradorHorarios.Modelo.Repositorio.CarreraRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

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
        return ResponseEntity.ok(carreraRepositorio.save(nuevaCarrera));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCarrera(@PathVariable Long id, @RequestBody CarreraRequest request){
        Optional<Carrera> opt = carreraRepositorio.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("La carrera no existe");
        }
        Carrera c = opt.get();
        c.setNombreCarrera(request.getNombreCarrera());
        return ResponseEntity.ok(carreraRepositorio.save(c));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCarrera(@PathVariable Long id){
        if (!carreraRepositorio.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("La carrera no existe");
        }
        try {
            carreraRepositorio.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    "No se puede eliminar la carrera porque tiene grupos o planes asociados."
            );
        }
    }
}
