package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.BloqueTiempo;
import com.example.GeneradorHorarios.Modelo.DTO.BloqueTiempoRequest;
import com.example.GeneradorHorarios.Modelo.Repositorio.BloqueTiempoRepositorio;
import com.example.GeneradorHorarios.Modelo.enums.Turno;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bloque_tiempo")
@CrossOrigin(origins = "http://localhost:5173")
public class BloqueTiempoControlador {

    @Autowired
    private BloqueTiempoRepositorio bloqueTiempoRepositorio;

    @GetMapping
    public ResponseEntity<List<BloqueTiempo>> listarBloqueTiempo(){
        List<BloqueTiempo> lista = bloqueTiempoRepositorio.findAll();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<BloqueTiempo> crearBloqueTiempo(@RequestBody BloqueTiempoRequest request){

        BloqueTiempo nuevoBloqueTiempo = new BloqueTiempo();

        nuevoBloqueTiempo.setDiaSemana(request.getDiaSemana());
        nuevoBloqueTiempo.setHoraInicio(request.getHoraInicio());
        nuevoBloqueTiempo.setHoraFin(request.getHoraFin());
        nuevoBloqueTiempo.setTurno(Turno.valueOf(request.getTurno()));

        BloqueTiempo bloqueTiempoGuardado = bloqueTiempoRepositorio.save(nuevoBloqueTiempo);
        return ResponseEntity.ok(bloqueTiempoGuardado);
    }

}
