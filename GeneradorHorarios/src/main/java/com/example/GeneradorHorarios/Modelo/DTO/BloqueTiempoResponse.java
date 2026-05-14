package com.example.GeneradorHorarios.Modelo.DTO;

import com.example.GeneradorHorarios.Modelo.BloqueTiempo;
import com.example.GeneradorHorarios.Modelo.enums.Turno;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalTime;

@Data
@AllArgsConstructor
public class BloqueTiempoResponse {
    private Long idBloqueTiempo;
    private String diaSemana;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Turno turno;

    public static BloqueTiempoResponse fromEntity(BloqueTiempo bloqueTiempo) {
        return new BloqueTiempoResponse(
                bloqueTiempo.getIdBloqueTiempo(),
                bloqueTiempo.getDiaSemana(),
                bloqueTiempo.getHoraInicio(),
                bloqueTiempo.getHoraFin(),
                bloqueTiempo.getTurno()
        );
    }
}
