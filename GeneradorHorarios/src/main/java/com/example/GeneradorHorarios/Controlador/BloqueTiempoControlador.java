package com.example.GeneradorHorarios.Controlador;

import com.example.GeneradorHorarios.Modelo.BloqueTiempo;
import com.example.GeneradorHorarios.Modelo.DTO.BloqueTiempoResponse;
import com.example.GeneradorHorarios.Modelo.DTO.BloqueTiempoRequest;
import com.example.GeneradorHorarios.Modelo.Repositorio.BloqueTiempoRepositorio;
import com.example.GeneradorHorarios.Modelo.enums.Turno;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bloque_tiempo")
@CrossOrigin(origins = "http://localhost:5173")
public class BloqueTiempoControlador {

    @Autowired
    private BloqueTiempoRepositorio bloqueTiempoRepositorio;

    @GetMapping
    public ResponseEntity<List<BloqueTiempoResponse>> listarBloqueTiempo(){
        List<BloqueTiempo> lista = bloqueTiempoRepositorio.findAll();
        List<BloqueTiempoResponse> response = lista.stream()
                .map(BloqueTiempoResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<BloqueTiempoResponse> crearBloqueTiempo(@RequestBody BloqueTiempoRequest request){

        BloqueTiempo nuevoBloqueTiempo = new BloqueTiempo();

        nuevoBloqueTiempo.setDiaSemana(request.getDiaSemana());
        nuevoBloqueTiempo.setHoraInicio(request.getHoraInicio());
        nuevoBloqueTiempo.setHoraFin(request.getHoraFin());
        nuevoBloqueTiempo.setTurno(Turno.valueOf(request.getTurno()));

        BloqueTiempo bloqueTiempoGuardado = bloqueTiempoRepositorio.save(nuevoBloqueTiempo);
        return ResponseEntity.ok(BloqueTiempoResponse.fromEntity(bloqueTiempoGuardado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarBloqueTiempo(@PathVariable Long id, @RequestBody BloqueTiempoRequest request) {
        Optional<BloqueTiempo> opt = bloqueTiempoRepositorio.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El bloque no existe");
        }
        BloqueTiempo b = opt.get();
        b.setDiaSemana(request.getDiaSemana());
        b.setHoraInicio(request.getHoraInicio());
        b.setHoraFin(request.getHoraFin());
        b.setTurno(Turno.valueOf(request.getTurno()));
        return ResponseEntity.ok(BloqueTiempoResponse.fromEntity(bloqueTiempoRepositorio.save(b)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarBloqueTiempo(@PathVariable Long id) {
        if (!bloqueTiempoRepositorio.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("El bloque no existe");
        }
        try {
            bloqueTiempoRepositorio.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    "No se puede eliminar el bloque porque tiene sesiones o disponibilidades asociadas."
            );
        }
    }
}
