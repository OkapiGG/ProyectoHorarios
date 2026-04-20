package com.example.GeneradorHorarios.Contoller;

import com.example.GeneradorHorarios.Modelo.Aula;
import com.example.GeneradorHorarios.Modelo.Carrera;
import com.example.GeneradorHorarios.Modelo.DTO.AulaRequest;
import com.example.GeneradorHorarios.Modelo.DTO.GrupoRequest;
import com.example.GeneradorHorarios.Modelo.Edificio;
import com.example.GeneradorHorarios.Modelo.Grupo;
import com.example.GeneradorHorarios.Modelo.Repositorio.AulaRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.CarreraRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.GrupoRepositorio;
import com.example.GeneradorHorarios.Modelo.enums.TipoAula;
import com.example.GeneradorHorarios.Modelo.enums.Turno;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/grupos")
@CrossOrigin(origins = "http://localhost:5173")
public class GrupoControlador {

    @Autowired
    private GrupoRepositorio grupoRepositorio;

    @Autowired
    private CarreraRepositorio carreraRepositorio;

    @GetMapping
    public ResponseEntity<List<Grupo>> listarGrupos(){
        List<Grupo> lista = grupoRepositorio.findAll();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<?> crearGrupo(@RequestBody GrupoRequest request){

        Optional<Carrera> carreraOpt = carreraRepositorio.findById(request.getIdCarrera());

        if(!carreraOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, la carrera no existe");
        }

        Grupo nuevoGrupo = new Grupo();
        nuevoGrupo.setSemestre(request.getSemestre());
        nuevoGrupo.setClaveGrupo(request.getClaveGrupo());
        nuevoGrupo.setCupoMaximo(request.getCupoMaximo());
        nuevoGrupo.setTurno(Turno.valueOf(request.getTurno()));

        nuevoGrupo.setCarrera(carreraOpt.get());

        Grupo grupoGuardado = grupoRepositorio.save(nuevoGrupo);
        return ResponseEntity.ok(grupoGuardado);
    }

}
