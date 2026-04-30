package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.DTO.PropuestaRequest;
import com.example.GeneradorHorarios.Modelo.PeriodoAcademico;
import com.example.GeneradorHorarios.Modelo.Profesor;
import com.example.GeneradorHorarios.Modelo.PropuestaDisponibilidad;
import com.example.GeneradorHorarios.Modelo.Repositorio.PeriodoAcademicoRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.ProfesorRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PropuestaRepositorio;
import com.example.GeneradorHorarios.Modelo.enums.EstadoPropuesta;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/propuestas")
@CrossOrigin(origins = "http://localhost:5173")
public class PropuestaControlador {

    @Autowired
    private PropuestaRepositorio propuestaRepositorio;

    @Autowired
    private ProfesorRepositorio profesorRepositorio;

    @Autowired
    private PeriodoAcademicoRepositorio periodoAcademicoRepositorio;

    @GetMapping
    public ResponseEntity<List<PropuestaDisponibilidad>> listarPropuestas(){
        List<PropuestaDisponibilidad> lista = propuestaRepositorio.findAll();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<?> crearPropuesta(@RequestBody PropuestaRequest request){

        Optional<Profesor> profesorOpt = profesorRepositorio.findById(request.getIdProfesor());
        Optional<PeriodoAcademico> periodoAcademicoOpt = periodoAcademicoRepositorio.findById(request.getIdPeriodoAcademico());

        if(!profesorOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, el Profesor no existe");
        }
        if(!periodoAcademicoOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, el Periodo Academico no existe");
        }

        PropuestaDisponibilidad nuevaPropuesta = new PropuestaDisponibilidad();
        nuevaPropuesta.setFechaEntrega(request.getFechaEntrega());
        nuevaPropuesta.setEstado(EstadoPropuesta.valueOf(request.getEstado()));
        nuevaPropuesta.setProfesor(profesorOpt.get());
        nuevaPropuesta.setPeriodoAcademico(periodoAcademicoOpt.get());

        PropuestaDisponibilidad propuestaGuardada = propuestaRepositorio.save(nuevaPropuesta);

        return ResponseEntity.ok(propuestaGuardada);

    }

}
