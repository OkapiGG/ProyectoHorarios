package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.Carrera;
import com.example.GeneradorHorarios.Modelo.DTO.PlanEstudioRequest;
import com.example.GeneradorHorarios.Modelo.PlanEstudio;
import com.example.GeneradorHorarios.Modelo.Repositorio.CarreraRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PlanEstudioRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/plan_estudio")
@CrossOrigin(origins = "http://localhost:5173")
public class PlanEstudioControlador {

    @Autowired
    private PlanEstudioRepositorio planEstudioRepositorio;

    @Autowired
    private CarreraRepositorio carreraRepositorio;

    @GetMapping
    public ResponseEntity<List<PlanEstudio>> listarPlanesEstudio(){
        return ResponseEntity.ok(planEstudioRepositorio.findAll());
    }

    @PostMapping
    public ResponseEntity<?> crearPlanEstudio(@RequestBody PlanEstudioRequest request){
        Optional<Carrera> carreraOpt = carreraRepositorio.findById(request.getIdCarrera());
        if(!carreraOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, la carrera no existe");
        }
        PlanEstudio nuevo = new PlanEstudio();
        aplicarCampos(nuevo, request, carreraOpt.get());
        return ResponseEntity.ok(planEstudioRepositorio.save(nuevo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPlanEstudio(@PathVariable Long id, @RequestBody PlanEstudioRequest request){
        Optional<PlanEstudio> opt = planEstudioRepositorio.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El plan de estudio no existe");
        }
        Optional<Carrera> carreraOpt = carreraRepositorio.findById(request.getIdCarrera());
        if(!carreraOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, la carrera no existe");
        }
        PlanEstudio p = opt.get();
        aplicarCampos(p, request, carreraOpt.get());
        return ResponseEntity.ok(planEstudioRepositorio.save(p));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarPlanEstudio(@PathVariable Long id){
        if (!planEstudioRepositorio.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El plan de estudio no existe");
        }
        try {
            planEstudioRepositorio.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    "No se puede eliminar el plan porque tiene detalles o cargas asociadas."
            );
        }
    }

    private void aplicarCampos(PlanEstudio p, PlanEstudioRequest r, Carrera carrera) {
        p.setDescripcion(r.getDescripcion());
        p.setVigenciaInicio(r.getVigenciaInicio());
        p.setVigenciaFin(r.getVigenciaFin());
        p.setActivo(r.getActivo());
        p.setCarrera(carrera);
    }
}
