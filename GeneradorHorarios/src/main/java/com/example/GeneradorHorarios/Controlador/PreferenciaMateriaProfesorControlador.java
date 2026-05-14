package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.DTO.PreferenciaMateriaProfesorRequest;
import com.example.GeneradorHorarios.Modelo.DTO.PreferenciaMateriaProfesorResponse;
import com.example.GeneradorHorarios.Modelo.Materia;
import com.example.GeneradorHorarios.Modelo.PeriodoAcademico;
import com.example.GeneradorHorarios.Modelo.PreferenciaMateriaProfesor;
import com.example.GeneradorHorarios.Modelo.Profesor;
import com.example.GeneradorHorarios.Modelo.Repositorio.MateriaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PeriodoAcademicoRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PreferenciaMateriaProfesorRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.ProfesorRepositorio;
import com.example.GeneradorHorarios.Modelo.enums.NivelPreferenciaMateria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/preferencias-materia-profesor")
@CrossOrigin(origins = "http://localhost:5173")
public class PreferenciaMateriaProfesorControlador {

    @Autowired
    private PreferenciaMateriaProfesorRepositorio preferenciaRepositorio;

    @Autowired
    private ProfesorRepositorio profesorRepositorio;

    @Autowired
    private MateriaRepositorio materiaRepositorio;

    @Autowired
    private PeriodoAcademicoRepositorio periodoAcademicoRepositorio;

    @GetMapping
    public ResponseEntity<List<PreferenciaMateriaProfesorResponse>> listarPreferencias() {
        List<PreferenciaMateriaProfesorResponse> response = preferenciaRepositorio.findAll().stream()
                .map(PreferenciaMateriaProfesorResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/profesor/{idProfesor}")
    public ResponseEntity<List<PreferenciaMateriaProfesorResponse>> listarPreferenciasPorProfesor(@PathVariable Long idProfesor) {
        List<PreferenciaMateriaProfesorResponse> response = preferenciaRepositorio.findByProfesor_IdProfesor(idProfesor).stream()
                .map(PreferenciaMateriaProfesorResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/profesor/{idProfesor}/periodo/{idPeriodoAcademico}")
    public ResponseEntity<List<PreferenciaMateriaProfesorResponse>> listarPreferenciasPorProfesorYPeriodo(
            @PathVariable Long idProfesor,
            @PathVariable Long idPeriodoAcademico
    ) {
        List<PreferenciaMateriaProfesorResponse> response = preferenciaRepositorio
                .findByProfesor_IdProfesorAndPeriodoAcademico_IdPeriodoAcademico(idProfesor, idPeriodoAcademico)
                .stream()
                .map(PreferenciaMateriaProfesorResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> crearPreferencia(@RequestBody PreferenciaMateriaProfesorRequest request) {
        ResponseEntity<?> validacion = validarRequest(request);
        if (validacion != null) {
            return validacion;
        }

        Optional<PreferenciaMateriaProfesor> preferenciaExistente = preferenciaRepositorio
                .findByProfesor_IdProfesorAndMateria_IdMateriaAndPeriodoAcademico_IdPeriodoAcademico(
                        request.getIdProfesor(),
                        request.getIdMateria(),
                        request.getIdPeriodoAcademico()
                );

        if (preferenciaExistente.isPresent()) {
            return ResponseEntity.badRequest().body("Ya existe una preferencia para ese profesor, materia y periodo");
        }

        PreferenciaMateriaProfesor preferencia = new PreferenciaMateriaProfesor();
        ResponseEntity<?> asignacion = asignarDatosPreferencia(preferencia, request);
        if (asignacion != null) {
            return asignacion;
        }

        PreferenciaMateriaProfesor preferenciaGuardada = preferenciaRepositorio.save(preferencia);
        return ResponseEntity.ok(PreferenciaMateriaProfesorResponse.fromEntity(preferenciaGuardada));
    }

    @PutMapping("/{idPreferenciaMateria}")
    public ResponseEntity<?> actualizarPreferencia(
            @PathVariable Long idPreferenciaMateria,
            @RequestBody PreferenciaMateriaProfesorRequest request
    ) {
        Optional<PreferenciaMateriaProfesor> preferenciaOpt = preferenciaRepositorio.findById(idPreferenciaMateria);

        if (!preferenciaOpt.isPresent()) {
            return ResponseEntity.status(404).body("La preferencia no existe");
        }

        ResponseEntity<?> validacion = validarRequest(request);
        if (validacion != null) {
            return validacion;
        }

        Optional<PreferenciaMateriaProfesor> preferenciaDuplicada = preferenciaRepositorio
                .findByProfesor_IdProfesorAndMateria_IdMateriaAndPeriodoAcademico_IdPeriodoAcademico(
                        request.getIdProfesor(),
                        request.getIdMateria(),
                        request.getIdPeriodoAcademico()
                );

        if (preferenciaDuplicada.isPresent()
                && !preferenciaDuplicada.get().getIdPreferenciaMateria().equals(idPreferenciaMateria)) {
            return ResponseEntity.badRequest().body("Ya existe una preferencia para ese profesor, materia y periodo");
        }

        PreferenciaMateriaProfesor preferencia = preferenciaOpt.get();
        ResponseEntity<?> asignacion = asignarDatosPreferencia(preferencia, request);
        if (asignacion != null) {
            return asignacion;
        }

        PreferenciaMateriaProfesor preferenciaGuardada = preferenciaRepositorio.save(preferencia);
        return ResponseEntity.ok(PreferenciaMateriaProfesorResponse.fromEntity(preferenciaGuardada));
    }

    @DeleteMapping("/{idPreferenciaMateria}")
    public ResponseEntity<?> eliminarPreferencia(@PathVariable Long idPreferenciaMateria) {
        if (!preferenciaRepositorio.existsById(idPreferenciaMateria)) {
            return ResponseEntity.status(404).body("La preferencia no existe");
        }

        preferenciaRepositorio.deleteById(idPreferenciaMateria);
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<?> validarRequest(PreferenciaMateriaProfesorRequest request) {
        if (request.getIdProfesor() == null) {
            return ResponseEntity.badRequest().body("El profesor es obligatorio");
        }

        if (request.getIdMateria() == null) {
            return ResponseEntity.badRequest().body("La materia es obligatoria");
        }

        if (request.getIdPeriodoAcademico() == null) {
            return ResponseEntity.badRequest().body("El periodo academico es obligatorio");
        }

        return null;
    }

    private ResponseEntity<?> asignarDatosPreferencia(
            PreferenciaMateriaProfesor preferencia,
            PreferenciaMateriaProfesorRequest request
    ) {
        Optional<Profesor> profesorOpt = profesorRepositorio.findById(request.getIdProfesor());
        Optional<Materia> materiaOpt = materiaRepositorio.findById(request.getIdMateria());
        Optional<PeriodoAcademico> periodoOpt = periodoAcademicoRepositorio.findById(request.getIdPeriodoAcademico());

        if (!profesorOpt.isPresent()) {
            return ResponseEntity.badRequest().body("El profesor no existe");
        }

        if (!materiaOpt.isPresent()) {
            return ResponseEntity.badRequest().body("La materia no existe");
        }

        if (!periodoOpt.isPresent()) {
            return ResponseEntity.badRequest().body("El periodo academico no existe");
        }

        preferencia.setProfesor(profesorOpt.get());
        preferencia.setMateria(materiaOpt.get());
        preferencia.setPeriodoAcademico(periodoOpt.get());
        preferencia.setNivelPreferencia(
                request.getNivelPreferencia() != null ? request.getNivelPreferencia() : NivelPreferenciaMateria.MEDIA
        );
        preferencia.setObservaciones(request.getObservaciones());

        return null;
    }
}
