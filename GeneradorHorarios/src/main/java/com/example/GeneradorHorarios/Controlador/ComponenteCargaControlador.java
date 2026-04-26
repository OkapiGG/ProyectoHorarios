package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.CargaAcademica;
import com.example.GeneradorHorarios.Modelo.ComponenteCarga;
import com.example.GeneradorHorarios.Modelo.DTO.ComponenteCargaRequest;
import com.example.GeneradorHorarios.Modelo.Repositorio.CargaAcademicaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.ComponenteCargaRepositorio;
import com.example.GeneradorHorarios.Modelo.enums.TipoSesion;
import org.springframework.beans.factory.annotation.Autowired;
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

        ComponenteCarga nuevoComponenteCarga = new ComponenteCarga();

        nuevoComponenteCarga.setTipoSesion(TipoSesion.valueOf(request.getTipoSesion().toUpperCase()));
        nuevoComponenteCarga.setNumSesiones(request.getNumSesiones());
        nuevoComponenteCarga.setBloquesPorSesion(request.getBloquesPorSesion());
        nuevoComponenteCarga.setRequiereConsecutivos(request.getRequiereConsecutivos());
        nuevoComponenteCarga.setCargaAcademica(cargaAcademicaOpt.get());

        ComponenteCarga componenteCargaGuardado = componenteCargaRepositorio.save(nuevoComponenteCarga);
        return ResponseEntity.ok(componenteCargaGuardado);
    }

}
