package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.*;
import com.example.GeneradorHorarios.Modelo.DTO.CargaAcademicaRequest;
import com.example.GeneradorHorarios.Modelo.Repositorio.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/carga_academica")
@CrossOrigin(origins = "http://localhost:5173")
public class CargaAcademicaControlador {

    @Autowired
    private CargaAcademicaRepositorio cargaAcademicaRepositorio;

    @Autowired
    private PlanEstudioDetalleRepositorio planEstudioDetalleRepositorio;

    @Autowired
    private GrupoRepositorio grupoRepositorio;

    @Autowired
    private ProfesorRepositorio profesorRepositorio;

    @Autowired
    private PeriodoAcademicoRepositorio periodoAcademicoRepositorio;

    @GetMapping
    public ResponseEntity<List<CargaAcademica>> listarCargasAcademicas(){
        List<CargaAcademica> lista = cargaAcademicaRepositorio.findAll();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<?> crearCargaAcademica(@RequestBody CargaAcademicaRequest request){

        Optional<PlanEstudioDetalle> planEstudioDetalleOpt = planEstudioDetalleRepositorio.findById(request.getIdPlanDetalle());
        Optional<Grupo> grupoOpt = grupoRepositorio.findById(request.getIdGrupo());
        Optional<Profesor> profesorOpt = profesorRepositorio.findById(request.getIdProfesor());
        Optional<PeriodoAcademico> periodoAcademicoOpt = periodoAcademicoRepositorio.findById(request.getIdPeriodoAcademico());

        if(!planEstudioDetalleOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, el Plan de Estudio Detalle no existe");
        }
        if(!grupoOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, el Grupo no existe");
        }
        if(!profesorOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, el Profesor no existe");
        }
        if(!periodoAcademicoOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, el Periodo Academico no existe");
        }

        boolean yaExiste = cargaAcademicaRepositorio
                .existsByPlanEstudioDetalle_IdPlanDetalleAndGrupo_IdGrupoAndPeriodoAcademico_IdPeriodoAcademico(
                        request.getIdPlanDetalle(),
                        request.getIdGrupo(),
                        request.getIdPeriodoAcademico()
                );

        if(yaExiste){
            return ResponseEntity.badRequest().body(
                    "Ya existe una carga academica para ese plan detalle, grupo y periodo"
            );
        }

        CargaAcademica nuevoCargaAcademica = new CargaAcademica();

        nuevoCargaAcademica.setPlanEstudioDetalle(planEstudioDetalleOpt.get());
        nuevoCargaAcademica.setGrupo(grupoOpt.get());
        nuevoCargaAcademica.setProfesor(profesorOpt.get());
        nuevoCargaAcademica.setPeriodoAcademico(periodoAcademicoOpt.get());

        CargaAcademica cargaAcademicaGuardada = cargaAcademicaRepositorio.save(nuevoCargaAcademica);
        return ResponseEntity.ok(cargaAcademicaGuardada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarCargaAcademica(@PathVariable Long id, @RequestBody CargaAcademicaRequest request) {
        Optional<CargaAcademica> opt = cargaAcademicaRepositorio.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("La carga no existe");
        }

        Optional<PlanEstudioDetalle> planDetalleOpt = planEstudioDetalleRepositorio.findById(request.getIdPlanDetalle());
        Optional<Grupo> grupoOpt = grupoRepositorio.findById(request.getIdGrupo());
        Optional<Profesor> profesorOpt = profesorRepositorio.findById(request.getIdProfesor());
        Optional<PeriodoAcademico> periodoOpt = periodoAcademicoRepositorio.findById(request.getIdPeriodoAcademico());

        if(!planDetalleOpt.isPresent()) return ResponseEntity.badRequest().body("Error, el Plan de Estudio Detalle no existe");
        if(!grupoOpt.isPresent()) return ResponseEntity.badRequest().body("Error, el Grupo no existe");
        if(!profesorOpt.isPresent()) return ResponseEntity.badRequest().body("Error, el Profesor no existe");
        if(!periodoOpt.isPresent()) return ResponseEntity.badRequest().body("Error, el Periodo Academico no existe");

        CargaAcademica c = opt.get();
        c.setPlanEstudioDetalle(planDetalleOpt.get());
        c.setGrupo(grupoOpt.get());
        c.setProfesor(profesorOpt.get());
        c.setPeriodoAcademico(periodoOpt.get());
        return ResponseEntity.ok(cargaAcademicaRepositorio.save(c));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCargaAcademica(@PathVariable Long id) {
        if (!cargaAcademicaRepositorio.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("La carga no existe");
        }
        try {
            cargaAcademicaRepositorio.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    "No se puede eliminar la carga porque tiene componentes o sesiones asociadas."
            );
        }
    }
}
