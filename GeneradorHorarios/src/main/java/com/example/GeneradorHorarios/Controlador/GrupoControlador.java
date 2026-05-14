package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.Carrera;
import com.example.GeneradorHorarios.Modelo.DTO.GrupoRequest;
import com.example.GeneradorHorarios.Modelo.Grupo;
import com.example.GeneradorHorarios.Modelo.Repositorio.CarreraRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.GrupoRepositorio;
import com.example.GeneradorHorarios.Modelo.enums.Turno;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/grupos")
@CrossOrigin(origins = "http://localhost:5173")
public class GrupoControlador {

    @Autowired
    private GrupoRepositorio grupoRepositorio;

    @Autowired
    private CarreraRepositorio carreraRepositorio;

    @GetMapping
    public ResponseEntity<List<Grupo>> listarGrupos(){
        return ResponseEntity.ok(grupoRepositorio.findAll());
    }

    @PostMapping
    public ResponseEntity<?> crearGrupo(@RequestBody GrupoRequest request){
        Optional<Carrera> carreraOpt = carreraRepositorio.findById(request.getIdCarrera());
        if(!carreraOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, la carrera no existe");
        }
        Grupo nuevoGrupo = new Grupo();
        aplicarCampos(nuevoGrupo, request, carreraOpt.get());
        return ResponseEntity.ok(grupoRepositorio.save(nuevoGrupo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarGrupo(@PathVariable Long id, @RequestBody GrupoRequest request){
        Optional<Grupo> opt = grupoRepositorio.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El grupo no existe");
        }
        Optional<Carrera> carreraOpt = carreraRepositorio.findById(request.getIdCarrera());
        if(!carreraOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, la carrera no existe");
        }
        Grupo g = opt.get();
        aplicarCampos(g, request, carreraOpt.get());
        return ResponseEntity.ok(grupoRepositorio.save(g));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarGrupo(@PathVariable Long id){
        if (!grupoRepositorio.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El grupo no existe");
        }
        try {
            grupoRepositorio.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    "No se puede eliminar el grupo porque tiene cargas o sesiones asociadas."
            );
        }
    }

    private void aplicarCampos(Grupo g, GrupoRequest r, Carrera carrera) {
        g.setSemestre(r.getSemestre());
        g.setClaveGrupo(r.getClaveGrupo());
        g.setCupoMaximo(r.getCupoMaximo());
        g.setTurno(Turno.valueOf(r.getTurno()));
        g.setCarrera(carrera);
    }
}
