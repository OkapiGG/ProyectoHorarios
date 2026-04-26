package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.BloqueTiempo;
import com.example.GeneradorHorarios.Modelo.DTO.DetalleHorarioRequest;
import com.example.GeneradorHorarios.Modelo.DetalleHorario;
import com.example.GeneradorHorarios.Modelo.PropuestaDisponibilidad;
import com.example.GeneradorHorarios.Modelo.Repositorio.BloqueTiempoRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.DetalleHorarioRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PropuestaRepositorio;
import com.example.GeneradorHorarios.Modelo.enums.TipoBloque;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/detalle_horario")
@CrossOrigin(origins = "http://localhost:5173")
public class DetalleHorarioControlador {

    @Autowired
    private DetalleHorarioRepositorio detalleHorarioRepositorio;

    @Autowired
    private PropuestaRepositorio propuestaRepositorio;

    @Autowired
    private BloqueTiempoRepositorio bloqueTiempoRepositorio;

    @GetMapping
    public ResponseEntity<List<DetalleHorario>> listarDetallesHorarios(){
        List<DetalleHorario> lista = detalleHorarioRepositorio.findAll();
        return ResponseEntity.ok(lista);
    }

    @PostMapping
    public ResponseEntity<?> crearDetalleHorario(@RequestBody DetalleHorarioRequest request){

        Optional<PropuestaDisponibilidad> propuestaDisponibilidadOpt = propuestaRepositorio.findById(request.getIdProDisponibilidad());
        Optional<BloqueTiempo> bloqueTiempoOpt = bloqueTiempoRepositorio.findById(request.getIdBloqueTiempo());

        if(!propuestaDisponibilidadOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, la Propuesta Disponibilidad no Existe");
        }
        if(!bloqueTiempoOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, el Bloque Tiempo no existe");
        }

        DetalleHorario nuevoDetalleHorario = new DetalleHorario();

        nuevoDetalleHorario.setTipoBloque(TipoBloque.valueOf(request.getTipoBloque().toUpperCase()));
        nuevoDetalleHorario.setPropuestaDisponibilidad(propuestaDisponibilidadOpt.get());
        nuevoDetalleHorario.setBloqueTiempo(bloqueTiempoOpt.get());

        DetalleHorario detalleHorarioGuardado = detalleHorarioRepositorio.save(nuevoDetalleHorario);

        return ResponseEntity.ok(detalleHorarioGuardado);

    }

}
