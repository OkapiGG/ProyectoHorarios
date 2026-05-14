package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.CargaAcademica;
import com.example.GeneradorHorarios.Modelo.ComponenteCarga;
import com.example.GeneradorHorarios.Modelo.DTO.ComponenteCargaRequest;
import com.example.GeneradorHorarios.Modelo.Repositorio.CargaAcademicaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.ComponenteCargaRepositorio;
import com.example.GeneradorHorarios.Modelo.enums.TipoSesion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/componente_carga")
@CrossOrigin(origins = "http://localhost:5173")
public class ComponenteCargaControlador {

    @Autowired
    private ComponenteCargaRepositorio componenteCargaRepositorio;

    @Autowired
    private CargaAcademicaRepositorio cargaAcademicaRepositorio;

    @GetMapping
    public ResponseEntity<List<ComponenteCarga>> listarComponenteCarga(){
        List<ComponenteCarga> lista = componenteCargaRepositorio.findAll();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<?> crearComponenteCarga(@RequestBody ComponenteCargaRequest request){
        Optional<CargaAcademica> cargaAcademicaOpt = cargaAcademicaRepositorio.findById(request.getIdCargaAcademica());

        if(!cargaAcademicaOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, la Carga Academica no existe");
        }

        TipoSesion tipoSesion;

        try {
            tipoSesion = TipoSesion.valueOf(request.getTipoSesion().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Error, el Tipo de Sesion no es valido");
        }

        if(request.getNumSesiones() == null || request.getNumSesiones() <= 0){
            return ResponseEntity.badRequest().body("Error, numSesiones debe ser mayor a 0");
        }

        if(request.getBloquesPorSesion() == null || request.getBloquesPorSesion() <= 0){
            return ResponseEntity.badRequest().body("Error, bloquesPorSesion debe ser mayor a 0");
        }

        boolean yaExiste = componenteCargaRepositorio
                .existsByCargaAcademica_IdCargaAcademicaAndTipoSesion(
                        request.getIdCargaAcademica(),
                        tipoSesion
                );

        if(yaExiste){
            return ResponseEntity.badRequest().body(
                    "Ya existe un componente de ese tipo para la carga academica"
            );
        }

        ComponenteCarga nuevoComponenteCarga = new ComponenteCarga();

        nuevoComponenteCarga.setTipoSesion(tipoSesion);
        nuevoComponenteCarga.setNumSesiones(request.getNumSesiones());
        nuevoComponenteCarga.setBloquesPorSesion(request.getBloquesPorSesion());
        nuevoComponenteCarga.setRequiereConsecutivos(Boolean.TRUE.equals(request.getRequiereConsecutivos()));
        nuevoComponenteCarga.setCargaAcademica(cargaAcademicaOpt.get());

        ComponenteCarga componenteCargaGuardado = componenteCargaRepositorio.save(nuevoComponenteCarga);
        return ResponseEntity.ok(componenteCargaGuardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarComponenteCarga(@PathVariable Long id, @RequestBody ComponenteCargaRequest request) {
        Optional<ComponenteCarga> opt = componenteCargaRepositorio.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El componente no existe");
        }
        Optional<CargaAcademica> cargaOpt = cargaAcademicaRepositorio.findById(request.getIdCargaAcademica());
        if(!cargaOpt.isPresent()) {
            return ResponseEntity.badRequest().body("Error, la Carga Academica no existe");
        }

        TipoSesion tipoSesion;
        try {
            tipoSesion = TipoSesion.valueOf(request.getTipoSesion().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Error, el Tipo de Sesion no es valido");
        }

        if(request.getNumSesiones() == null || request.getNumSesiones() <= 0)
            return ResponseEntity.badRequest().body("Error, numSesiones debe ser mayor a 0");
        if(request.getBloquesPorSesion() == null || request.getBloquesPorSesion() <= 0)
            return ResponseEntity.badRequest().body("Error, bloquesPorSesion debe ser mayor a 0");

        ComponenteCarga c = opt.get();
        c.setTipoSesion(tipoSesion);
        c.setNumSesiones(request.getNumSesiones());
        c.setBloquesPorSesion(request.getBloquesPorSesion());
        c.setRequiereConsecutivos(Boolean.TRUE.equals(request.getRequiereConsecutivos()));
        c.setCargaAcademica(cargaOpt.get());
        return ResponseEntity.ok(componenteCargaRepositorio.save(c));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarComponenteCarga(@PathVariable Long id) {
        if (!componenteCargaRepositorio.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El componente no existe");
        }
        try {
            componenteCargaRepositorio.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    "No se puede eliminar el componente porque tiene sesiones o conflictos asociados."
            );
        }
    }
}
