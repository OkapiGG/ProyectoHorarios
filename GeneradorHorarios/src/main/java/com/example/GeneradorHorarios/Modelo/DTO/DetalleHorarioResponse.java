package com.example.GeneradorHorarios.Modelo.DTO;

import com.example.GeneradorHorarios.Modelo.DetalleHorario;
import com.example.GeneradorHorarios.Modelo.enums.TipoBloque;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalTime;

@Data
@AllArgsConstructor
public class DetalleHorarioResponse {
    private Long idDetalleHorario;
    private Long idProDisponibilidad;
    private Long idBloqueTiempo;
    private String diaSemana;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private String turno;
    private TipoBloque tipoBloque;

    public static DetalleHorarioResponse fromEntity(DetalleHorario detalleHorario) {
        return new DetalleHorarioResponse(
                detalleHorario.getIdDetalleHorario(),
                detalleHorario.getPropuestaDisponibilidad().getIdProDisponibilidad(),
                detalleHorario.getBloqueTiempo().getIdBloqueTiempo(),
                detalleHorario.getBloqueTiempo().getDiaSemana(),
                detalleHorario.getBloqueTiempo().getHoraInicio(),
                detalleHorario.getBloqueTiempo().getHoraFin(),
                detalleHorario.getBloqueTiempo().getTurno().name(),
                detalleHorario.getTipoBloque()
        );
    }
}
