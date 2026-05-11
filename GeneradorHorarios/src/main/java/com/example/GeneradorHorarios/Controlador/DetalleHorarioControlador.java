package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.BloqueTiempo;
import com.example.GeneradorHorarios.Modelo.DTO.DetalleHorarioResponse;
import com.example.GeneradorHorarios.Modelo.DTO.DetalleHorarioRequest;
import com.example.GeneradorHorarios.Modelo.DetalleHorario;
import com.example.GeneradorHorarios.Modelo.PropuestaDisponibilidad;
import com.example.GeneradorHorarios.Modelo.Repositorio.BloqueTiempoRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.DetalleHorarioRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PropuestaRepositorio;
import com.example.GeneradorHorarios.Modelo.enums.EstadoPropuesta;
import com.example.GeneradorHorarios.Modelo.enums.TipoBloque;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
    public ResponseEntity<List<DetalleHorarioResponse>> listarDetallesHorarios(){
        List<DetalleHorario> lista = detalleHorarioRepositorio.findAll();
        List<DetalleHorarioResponse> response = lista.stream()
                .map(DetalleHorarioResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/propuesta/{idProDisponibilidad}")
    public ResponseEntity<List<DetalleHorarioResponse>> listarDetallesPorPropuesta(@PathVariable Long idProDisponibilidad){
        List<DetalleHorario> lista = detalleHorarioRepositorio.findByPropuestaDisponibilidad_IdProDisponibilidad(idProDisponibilidad);
        List<DetalleHorarioResponse> response = lista.stream()
                .map(DetalleHorarioResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> crearDetalleHorario(@RequestBody DetalleHorarioRequest request){
        Optional<PropuestaDisponibilidad> propuestaDisponibilidadOpt = propuestaRepositorio.findById(request.getIdProDisponibilidad());
        Optional<BloqueTiempo> bloqueTiempoOpt = bloqueTiempoRepositorio.findById(request.getIdBloqueTiempo());

        ResponseEntity<?> validacion = validarRequestDetalleHorario(propuestaDisponibilidadOpt, bloqueTiempoOpt);
        if(validacion != null){
            return validacion;
        }

        Optional<DetalleHorario> detalleExistente = detalleHorarioRepositorio
                .findByPropuestaDisponibilidad_IdProDisponibilidadAndBloqueTiempo_IdBloqueTiempo(
                        request.getIdProDisponibilidad(),
                        request.getIdBloqueTiempo()
                );

        if(detalleExistente.isPresent()){
            return ResponseEntity.badRequest().body("Ya existe un detalle para ese bloque en la propuesta");
        }

        DetalleHorario nuevoDetalleHorario = new DetalleHorario();

        nuevoDetalleHorario.setTipoBloque(TipoBloque.valueOf(request.getTipoBloque().toUpperCase()));
        nuevoDetalleHorario.setPropuestaDisponibilidad(propuestaDisponibilidadOpt.get());
        nuevoDetalleHorario.setBloqueTiempo(bloqueTiempoOpt.get());

        DetalleHorario detalleHorarioGuardado = detalleHorarioRepositorio.save(nuevoDetalleHorario);

        return ResponseEntity.ok(DetalleHorarioResponse.fromEntity(detalleHorarioGuardado));

    }

    @PutMapping("/{idDetalleHorario}")
    public ResponseEntity<?> actualizarDetalleHorario(
            @PathVariable Long idDetalleHorario,
            @RequestBody DetalleHorarioRequest request
    ){
        Optional<DetalleHorario> detalleHorarioOpt = detalleHorarioRepositorio.findById(idDetalleHorario);

        if(!detalleHorarioOpt.isPresent()){
            return ResponseEntity.status(404).body("El detalle horario no existe");
        }

        Optional<PropuestaDisponibilidad> propuestaDisponibilidadOpt = propuestaRepositorio.findById(request.getIdProDisponibilidad());
        Optional<BloqueTiempo> bloqueTiempoOpt = bloqueTiempoRepositorio.findById(request.getIdBloqueTiempo());

        ResponseEntity<?> validacion = validarRequestDetalleHorario(propuestaDisponibilidadOpt, bloqueTiempoOpt);
        if(validacion != null){
            return validacion;
        }

        DetalleHorario detalleHorario = detalleHorarioOpt.get();
        detalleHorario.setPropuestaDisponibilidad(propuestaDisponibilidadOpt.get());
        detalleHorario.setBloqueTiempo(bloqueTiempoOpt.get());
        detalleHorario.setTipoBloque(TipoBloque.valueOf(request.getTipoBloque().toUpperCase()));

        DetalleHorario detalleHorarioGuardado = detalleHorarioRepositorio.save(detalleHorario);

        return ResponseEntity.ok(DetalleHorarioResponse.fromEntity(detalleHorarioGuardado));
    }

    @DeleteMapping("/{idDetalleHorario}")
    public ResponseEntity<?> eliminarDetalleHorario(@PathVariable Long idDetalleHorario){
        Optional<DetalleHorario> detalleHorarioOpt = detalleHorarioRepositorio.findById(idDetalleHorario);

        if(!detalleHorarioOpt.isPresent()){
            return ResponseEntity.status(404).body("El detalle horario no existe");
        }

        DetalleHorario detalleHorario = detalleHorarioOpt.get();
        PropuestaDisponibilidad propuesta = detalleHorario.getPropuestaDisponibilidad();

        if(propuesta.getEstado() != EstadoPropuesta.BORRADOR){
            return ResponseEntity.badRequest().body("Solo se puede modificar la disponibilidad de propuestas en estado BORRADOR");
        }

        detalleHorarioRepositorio.delete(detalleHorario);

        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<?> validarRequestDetalleHorario(
            Optional<PropuestaDisponibilidad> propuestaDisponibilidadOpt,
            Optional<BloqueTiempo> bloqueTiempoOpt
    ){
        if(!propuestaDisponibilidadOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, la Propuesta Disponibilidad no existe");
        }

        if(!bloqueTiempoOpt.isPresent()){
            return ResponseEntity.badRequest().body("Error, el Bloque Tiempo no existe");
        }

        PropuestaDisponibilidad propuesta = propuestaDisponibilidadOpt.get();

        if(propuesta.getEstado() != EstadoPropuesta.BORRADOR){
            return ResponseEntity.badRequest().body("Solo se puede modificar la disponibilidad de propuestas en estado BORRADOR");
        }

        return null;
    }

}
