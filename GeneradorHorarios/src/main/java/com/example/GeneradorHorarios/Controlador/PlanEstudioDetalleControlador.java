package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.DTO.PlanEstudioDetalleRequest;
import com.example.GeneradorHorarios.Modelo.Materia;
import com.example.GeneradorHorarios.Modelo.PlanEstudio;
import com.example.GeneradorHorarios.Modelo.PlanEstudioDetalle;
import com.example.GeneradorHorarios.Modelo.Repositorio.MateriaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PlanEstudioDetalleRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PlanEstudioRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/plan_detalle")
@CrossOrigin(origins = "http://localhost:5173")
public class PlanEstudioDetalleControlador {

    @Autowired
    private PlanEstudioDetalleRepositorio planEstudioDetalleRepositorio;

    @Autowired
    private PlanEstudioRepositorio planEstudioRepositorio;

    @Autowired
    private MateriaRepositorio materiaRepositorio;

    @GetMapping
    public ResponseEntity<List<PlanEstudioDetalle>> listarPlanEstudioDetalle(){
        List<PlanEstudioDetalle> lista = planEstudioDetalleRepositorio.findAll();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<?> crearPlanEstudioDetalle(@RequestBody PlanEstudioDetalleRequest request){

        Optional<PlanEstudio> planEstudioOpt = planEstudioRepositorio.findById(request.getIdPlanEstudio());
        Optional<Materia> materiaOpt = materiaRepositorio.findById(request.getIdMateria());

        if(!planEstudioOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, el Plan Estudio no existe");
        }
        if(!materiaOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, la Materia no existe");
        }

        PlanEstudioDetalle nuevoPlanEstudioDetalle = new PlanEstudioDetalle();

        nuevoPlanEstudioDetalle.setSemestre(request.getSemestre());
        nuevoPlanEstudioDetalle.setHorasTeoria(request.getHorasTeoria());
        nuevoPlanEstudioDetalle.setHorasLaboratorio(request.getHorasLaboratorio());
        nuevoPlanEstudioDetalle.setPlanEstudio(planEstudioOpt.get());
        nuevoPlanEstudioDetalle.setMateria(materiaOpt.get());

        PlanEstudioDetalle planEstudioDetalleGuardado = planEstudioDetalleRepositorio.save(nuevoPlanEstudioDetalle);

        return ResponseEntity.ok(planEstudioDetalleGuardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPlanEstudioDetalle(@PathVariable Long id, @RequestBody PlanEstudioDetalleRequest request) {
        Optional<PlanEstudioDetalle> opt = planEstudioDetalleRepositorio.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El detalle de plan no existe");
        }
        Optional<PlanEstudio> planEstudioOpt = planEstudioRepositorio.findById(request.getIdPlanEstudio());
        Optional<Materia> materiaOpt = materiaRepositorio.findById(request.getIdMateria());
        if(!planEstudioOpt.isPresent()) return ResponseEntity.badRequest().body("Error, el Plan Estudio no existe");
        if(!materiaOpt.isPresent()) return ResponseEntity.badRequest().body("Error, la Materia no existe");

        PlanEstudioDetalle d = opt.get();
        d.setSemestre(request.getSemestre());
        d.setHorasTeoria(request.getHorasTeoria());
        d.setHorasLaboratorio(request.getHorasLaboratorio());
        d.setPlanEstudio(planEstudioOpt.get());
        d.setMateria(materiaOpt.get());
        return ResponseEntity.ok(planEstudioDetalleRepositorio.save(d));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarPlanEstudioDetalle(@PathVariable Long id) {
        if (!planEstudioDetalleRepositorio.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El detalle no existe");
        }
        try {
            planEstudioDetalleRepositorio.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    "No se puede eliminar el detalle porque tiene cargas académicas asociadas."
            );
        }
    }
}
