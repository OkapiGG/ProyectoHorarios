package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.Data;

import java.time.LocalTime;

@Data
public class BloqueTiempoRequest {
    private String diaSemana;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private String turno;
}
