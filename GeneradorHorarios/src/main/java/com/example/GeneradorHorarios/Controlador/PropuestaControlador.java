package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.DTO.PropuestaCoordinacionResponse;
import com.example.GeneradorHorarios.Modelo.DTO.PropuestaProfesorHistorialResponse;
import com.example.GeneradorHorarios.Modelo.DTO.PropuestaRequest;
import com.example.GeneradorHorarios.Modelo.PeriodoAcademico;
import com.example.GeneradorHorarios.Modelo.Profesor;
import com.example.GeneradorHorarios.Modelo.PropuestaDisponibilidad;
import com.example.GeneradorHorarios.Modelo.Repositorio.BloqueTiempoRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.DetalleHorarioRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PeriodoAcademicoRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.ProfesorRepositorio;
import com.example.GeneradorHorarios.Modelo.Repositorio.PropuestaRepositorio;
import com.example.GeneradorHorarios.Modelo.enums.EstadoPropuesta;
import com.example.GeneradorHorarios.Modelo.enums.TipoBloque;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    @Autowired
    private DetalleHorarioRepositorio detalleHorarioRepositorio;

    @Autowired
    private BloqueTiempoRepositorio bloqueTiempoRepositorio;

    @GetMapping
    public ResponseEntity<List<PropuestaDisponibilidad>> listarPropuestas(){
        List<PropuestaDisponibilidad> lista = propuestaRepositorio.findAll();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<?> listarPropuestasPorEstado(
            @PathVariable String estado,
            @RequestParam(required = false) Long idPeriodoAcademico
    ){
        EstadoPropuesta estadoPropuesta;

        try {
            estadoPropuesta = EstadoPropuesta.valueOf(estado.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body("Estado de propuesta no valido");
        }

        List<PropuestaDisponibilidad> propuestas = idPeriodoAcademico != null
                ? propuestaRepositorio.findByEstadoAndPeriodoAcademico_IdPeriodoAcademico(estadoPropuesta, idPeriodoAcademico)
                : propuestaRepositorio.findByEstado(estadoPropuesta);

        List<PropuestaCoordinacionResponse> response = propuestas.stream()
                .map(PropuestaCoordinacionResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{idPropuesta}/coordinacion")
    public ResponseEntity<?> obtenerPropuestaParaCoordinacion(@PathVariable Long idPropuesta){
        Optional<PropuestaDisponibilidad> propuestaDisponibilidadOpt = propuestaRepositorio.findById(idPropuesta);

        if(!propuestaDisponibilidadOpt.isPresent()){
            return ResponseEntity.status(404).body("La propuesta no existe");
        }

        return ResponseEntity.ok(PropuestaCoordinacionResponse.fromEntity(propuestaDisponibilidadOpt.get()));
    }

    @GetMapping("/profesor/{idProfesor}")
    public ResponseEntity<?> listarPropuestasPorProfesor(
            @PathVariable Long idProfesor,
            @RequestParam(required = false) String estado
    ){
        EstadoPropuesta estadoPropuesta = null;

        if(estado != null && !estado.isBlank()){
            try {
                estadoPropuesta = EstadoPropuesta.valueOf(estado.toUpperCase());
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().body("Estado de propuesta no valido");
            }
        }

        List<PropuestaDisponibilidad> propuestas = estadoPropuesta != null
                ? propuestaRepositorio.findByProfesor_IdProfesorAndEstado(idProfesor, estadoPropuesta)
                : propuestaRepositorio.findByProfesor_IdProfesor(idProfesor);

        List<PropuestaProfesorHistorialResponse> response = propuestas.stream()
                .map(PropuestaProfesorHistorialResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping(value = "/profesor/{idProfesor}/periodo/{idPeriodo}")
    public ResponseEntity<?> obtenerPropuesta(@PathVariable Long idProfesor, @PathVariable Long idPeriodo){
        Optional<PropuestaDisponibilidad> propuestaDisponibilidadOpt = propuestaRepositorio.findByProfesor_IdProfesorAndPeriodoAcademico_IdPeriodoAcademico(idProfesor, idPeriodo);

        if(propuestaDisponibilidadOpt.isPresent()){
            return ResponseEntity.ok(propuestaDisponibilidadOpt.get());
        }
        return ResponseEntity.status(404).body("No existe propuesta para ese profesor en ese periodo");
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

        Optional<PropuestaDisponibilidad> propuestaDisponibilidadOpt = propuestaRepositorio.findByProfesor_IdProfesorAndPeriodoAcademico_IdPeriodoAcademico(request.getIdProfesor(), request.getIdPeriodoAcademico());

        if(propuestaDisponibilidadOpt.isPresent()){
            return ResponseEntity.badRequest().body("Ya existe una propuesta para este profesor en ese periodo");
        }

        PropuestaDisponibilidad nuevaPropuestaDisponibilidad = new PropuestaDisponibilidad();

        nuevaPropuestaDisponibilidad.setProfesor(profesorOpt.get());
        nuevaPropuestaDisponibilidad.setPeriodoAcademico(periodoAcademicoOpt.get());
        nuevaPropuestaDisponibilidad.setEstado(EstadoPropuesta.BORRADOR);

        PropuestaDisponibilidad propuestaDisponibilidadGuardada = propuestaRepositorio.save(nuevaPropuestaDisponibilidad);

        return ResponseEntity.ok(propuestaDisponibilidadGuardada);
    }

    @PutMapping(value = "/{idPropuesta}/enviar")
    public ResponseEntity<?> enviarPropuesta(@PathVariable Long idPropuesta){

        Optional<PropuestaDisponibilidad> propuestaDisponibilidadOpt = propuestaRepositorio.findById(idPropuesta);

        if(!propuestaDisponibilidadOpt.isPresent()){
            return ResponseEntity.status(404).body("La propuesta no existe");
        }

        PropuestaDisponibilidad propuesta = propuestaDisponibilidadOpt.get();

        if(propuesta.getEstado() != EstadoPropuesta.BORRADOR){
            return ResponseEntity.badRequest().body("Solo se puede enviar una propuesta en estado BORRADOR");
        }

        ResponseEntity<?> validacionDisponibilidad = validarDisponibilidadMinima(propuesta);
        if(validacionDisponibilidad != null){
            return validacionDisponibilidad;
        }

        propuesta.setEstado(EstadoPropuesta.ENVIADA);
        propuesta.setFechaEntrega(LocalDate.now());

        PropuestaDisponibilidad propuestaDisponibilidadGuardada = propuestaRepositorio.save(propuesta);

        return ResponseEntity.ok(propuestaDisponibilidadGuardada);
    }

    @PutMapping(value = "/{idPropuesta}/aprobar")
    public ResponseEntity<?> aprobarPropuesta(@PathVariable Long idPropuesta){

        Optional<PropuestaDisponibilidad> propuestaDisponibilidadOpt = propuestaRepositorio.findById(idPropuesta);

        if(!propuestaDisponibilidadOpt.isPresent()){
            return ResponseEntity.status(404).body("La propuesta no existe");
        }

        PropuestaDisponibilidad propuesta = propuestaDisponibilidadOpt.get();

        if(propuesta.getEstado() != EstadoPropuesta.ENVIADA){
            return ResponseEntity.badRequest().body("Solo se puede aprobar una propuesta en estado ENVIADA");
        }

        propuesta.setEstado(EstadoPropuesta.APROBADA);

        PropuestaDisponibilidad propuestaDisponibilidadGuardada = propuestaRepositorio.save(propuesta);

        return ResponseEntity.ok(propuestaDisponibilidadGuardada);
    }

    @PutMapping(value = "/{idPropuesta}/rechazar")
    public ResponseEntity<?> rechazarPropuesta(@PathVariable Long idPropuesta){

        Optional<PropuestaDisponibilidad> propuestaDisponibilidadOpt = propuestaRepositorio.findById(idPropuesta);

        if(!propuestaDisponibilidadOpt.isPresent()){
            return ResponseEntity.status(404).body("La propuesta no existe");
        }

        PropuestaDisponibilidad propuesta = propuestaDisponibilidadOpt.get();

        if(propuesta.getEstado() != EstadoPropuesta.ENVIADA){
            return ResponseEntity.badRequest().body("Solo se pueden rechazar propuestas en estado ENVIADA");
        }

        propuesta.setEstado(EstadoPropuesta.BORRADOR);

        PropuestaDisponibilidad propuestaDisponibilidadGuardada = propuestaRepositorio.save(propuesta);

        return ResponseEntity.ok(propuestaDisponibilidadGuardada);
    }

    private ResponseEntity<?> validarDisponibilidadMinima(PropuestaDisponibilidad propuesta){
        long totalBloques = bloqueTiempoRepositorio.count();

        if(totalBloques <= 0){
            return ResponseEntity.badRequest().body("No se puede enviar la propuesta porque no existen bloques de tiempo configurados");
        }

        long bloquesProhibidos = detalleHorarioRepositorio.countByPropuestaDisponibilidad_IdProDisponibilidadAndTipoBloque(
                propuesta.getIdProDisponibilidad(),
                TipoBloque.PROHIBIDO
        );
        long bloquesDisponibles = totalBloques - bloquesProhibidos;

        if(bloquesDisponibles <= 0){
            return ResponseEntity.badRequest().body(
                    "No se puede enviar la propuesta porque todos los bloques quedaron marcados como prohibidos"
            );
        }

        return null;
    }
}
