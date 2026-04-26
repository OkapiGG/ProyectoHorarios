package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.DTO.PlanEstudioDetalleRequest;
import com.example.GeneradorHorarios.Modelo.Materia;
import com.example.GeneradorHorarios.Modelo.PlanEstudio;
import com.example.GeneradorHorarios.Modelo.PlanEstudioDetalle;
import com.example.GeneradorHorarios.Modelo.Repositorio.MateriaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PlanEstudioDetalleRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PlanEstudioRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
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

}
