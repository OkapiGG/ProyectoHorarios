package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.DTO.EdificioRequest;
import com.example.GeneradorHorarios.Modelo.Edificio;
import com.example.GeneradorHorarios.Modelo.Repositorio.EdificioRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/edificios")
@CrossOrigin(origins = "http://localhost:5173")
public class EdificioControlador {

    @Autowired
    private EdificioRepositorio edificioRepositorio;

    @GetMapping
    public ResponseEntity<List<Edificio>> listarEdificio(){
        List<Edificio> lista = edificioRepositorio.findAll();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<Edificio> crearEdificio(@RequestBody EdificioRequest request){
        Edificio nuevoEdificio = new Edificio();
        nuevoEdificio.setNombreEdificio(request.getNombreEdificio());

        Edificio edificioGuardado = edificioRepositorio.save(nuevoEdificio);
        return ResponseEntity.ok(edificioGuardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarEdificio(@PathVariable Long id, @RequestBody EdificioRequest request) {
        Optional<Edificio> edificioOpt = edificioRepositorio.findById(id);
        if (!edificioOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El edificio no existe");
        }
        Edificio edificio = edificioOpt.get();
        edificio.setNombreEdificio(request.getNombreEdificio());
        return ResponseEntity.ok(edificioRepositorio.save(edificio));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarEdificio(@PathVariable Long id) {
        if (!edificioRepositorio.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El edificio no existe");
        }
        try {
            edificioRepositorio.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    "No se puede eliminar el edificio porque tiene aulas asociadas."
            );
        }
    }
}
