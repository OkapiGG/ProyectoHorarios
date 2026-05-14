package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.Aula;
import com.example.GeneradorHorarios.Modelo.DTO.GrupoAulaRequest;
import com.example.GeneradorHorarios.Modelo.DTO.GrupoAulaResponse;
import com.example.GeneradorHorarios.Modelo.Grupo;
import com.example.GeneradorHorarios.Modelo.GrupoAula;
import com.example.GeneradorHorarios.Modelo.PeriodoAcademico;
import com.example.GeneradorHorarios.Modelo.Repositorio.AulaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.GrupoAulaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.GrupoRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PeriodoAcademicoRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/grupo_aula")
@CrossOrigin(origins = "http://localhost:5173")
public class GrupoAulaControlador {

    @Autowired
    private GrupoAulaRepositorio grupoAulaRepositorio;

    @Autowired
    private GrupoRepositorio grupoRepositorio;

    @Autowired
    private AulaRepositorio aulaRepositorio;

    @Autowired
    private PeriodoAcademicoRepositorio periodoAcademicoRepositorio;

    @GetMapping
    public ResponseEntity<List<GrupoAulaResponse>> listarGrupoAula() {
        List<GrupoAulaResponse> response = grupoAulaRepositorio.findAll().stream()
                .map(GrupoAulaResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/periodo/{idPeriodoAcademico}")
    public ResponseEntity<List<GrupoAulaResponse>> listarGrupoAulaPorPeriodo(
            @PathVariable Long idPeriodoAcademico
    ) {
        List<GrupoAulaResponse> response = grupoAulaRepositorio
                .findByPeriodoAcademico_IdPeriodoAcademico(idPeriodoAcademico)
                .stream()
                .map(GrupoAulaResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> crearGrupoAula(@RequestBody GrupoAulaRequest request) {
        if (request.getIdGrupo() == null) {
            return ResponseEntity.badRequest().body("Error, el Grupo es obligatorio");
        }

        if (request.getIdAula() == null) {
            return ResponseEntity.badRequest().body("Error, el Aula es obligatoria");
        }

        if (request.getIdPeriodoAcademico() == null) {
            return ResponseEntity.badRequest().body("Error, el Periodo Academico es obligatorio");
        }

        Optional<Grupo> grupoOpt = grupoRepositorio.findById(request.getIdGrupo());
        Optional<Aula> aulaOpt = aulaRepositorio.findById(request.getIdAula());
        Optional<PeriodoAcademico> periodoOpt = periodoAcademicoRepositorio.findById(request.getIdPeriodoAcademico());

        if (!grupoOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Error, el Grupo no existe");
        }

        if (!aulaOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Error, el Aula no existe");
        }

        if (!periodoOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Error, el Periodo Academico no existe");
        }

        Optional<GrupoAula> grupoAulaExistente = grupoAulaRepositorio
                .findByGrupo_IdGrupoAndPeriodoAcademico_IdPeriodoAcademico(
                        request.getIdGrupo(),
                        request.getIdPeriodoAcademico()
                );

        if (grupoAulaExistente.isPresent()) {
            return ResponseEntity.badRequest().body(
                    "Ya existe una asignacion de aula para ese grupo en ese periodo"
            );
        }

        GrupoAula nuevoGrupoAula = new GrupoAula();
        nuevoGrupoAula.setGrupo(grupoOpt.get());
        nuevoGrupoAula.setAula(aulaOpt.get());
        nuevoGrupoAula.setPeriodoAcademico(periodoOpt.get());

        GrupoAula grupoAulaGuardado = grupoAulaRepositorio.save(nuevoGrupoAula);
        return ResponseEntity.ok(GrupoAulaResponse.fromEntity(grupoAulaGuardado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarGrupoAula(@PathVariable Long id, @RequestBody GrupoAulaRequest request) {
        Optional<GrupoAula> opt = grupoAulaRepositorio.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("La asignación no existe");
        }
        Optional<Grupo> grupoOpt = grupoRepositorio.findById(request.getIdGrupo());
        Optional<Aula> aulaOpt = aulaRepositorio.findById(request.getIdAula());
        Optional<PeriodoAcademico> periodoOpt = periodoAcademicoRepositorio.findById(request.getIdPeriodoAcademico());
        if (!grupoOpt.isPresent()) return ResponseEntity.badRequest().body("Error, el Grupo no existe");
        if (!aulaOpt.isPresent()) return ResponseEntity.badRequest().body("Error, el Aula no existe");
        if (!periodoOpt.isPresent()) return ResponseEntity.badRequest().body("Error, el Periodo Academico no existe");

        GrupoAula ga = opt.get();
        ga.setGrupo(grupoOpt.get());
        ga.setAula(aulaOpt.get());
        ga.setPeriodoAcademico(periodoOpt.get());
        return ResponseEntity.ok(GrupoAulaResponse.fromEntity(grupoAulaRepositorio.save(ga)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarGrupoAula(@PathVariable Long id) {
        if (!grupoAulaRepositorio.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("La asignación no existe");
        }
        try {
            grupoAulaRepositorio.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    "No se puede eliminar la asignación porque está siendo referenciada."
            );
        }
    }
}
