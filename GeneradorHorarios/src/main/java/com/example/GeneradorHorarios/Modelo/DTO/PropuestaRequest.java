package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.Data;

import java.time.LocalDate;

@Data
public class PropuestaRequest {
    private Long idProfesor;
    private Long idPeriodoAcademico;
    private LocalDate fechaEntrega;
    private String estado;
}
