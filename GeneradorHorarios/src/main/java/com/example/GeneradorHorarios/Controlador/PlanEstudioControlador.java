package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.Carrera;
import com.example.GeneradorHorarios.Modelo.DTO.PlanEstudioRequest;
import com.example.GeneradorHorarios.Modelo.PlanEstudio;
import com.example.GeneradorHorarios.Modelo.Repositorio.CarreraRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PlanEstudioRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
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
        List<PlanEstudio> lista = planEstudioRepositorio.findAll();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<?> crearPlanEstudio(@RequestBody PlanEstudioRequest request){
        Optional<Carrera> carreraOpt = carreraRepositorio.findById(request.getIdCarrera());

        if(!carreraOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, la carrera no existe");
        }

        PlanEstudio nuevoPlanEstudio = new PlanEstudio();

        nuevoPlanEstudio.setDescripcion(request.getDescripcion());
        nuevoPlanEstudio.setVigenciaInicio(request.getVigenciaInicio());
        nuevoPlanEstudio.setVigenciaFin(request.getVigenciaFin());
        nuevoPlanEstudio.setActivo(request.getActivo());
        nuevoPlanEstudio.setCarrera(carreraOpt.get());

        PlanEstudio planEstudioGuardado = planEstudioRepositorio.save(nuevoPlanEstudio);

        return ResponseEntity.ok(planEstudioGuardado);

    }

}
