package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PeriodoAcademicoRequest {
    private String descripcion;
    private Integer anio;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Boolean activo;
}
