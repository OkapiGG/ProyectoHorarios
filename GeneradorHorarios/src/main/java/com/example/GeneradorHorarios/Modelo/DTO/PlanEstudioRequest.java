package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PlanEstudioRequest {
    private Long idCarrera;
    private String descripcion;
    private LocalDate vigenciaInicio;
    private LocalDate vigenciaFin;
    private Boolean activo;
}
