package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.Data;

@Data
public class CargaAcademicaRequest {
    private Long idPlanDetalle;
    private Long idGrupo;
    private Long idProfesor;
    private Long idPeriodoAcademico;
}
