package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.Data;

@Data
public class ProfesorRequest {
    private String nomProfesor;
    private String apPaternoProfesor;
    private String apMaternoProfesor;
    private String areaConocimiento;
    private String tipoContrato;
    private String correo;
    private Integer aniosAntiguedad;
    private String maxGradoEstudios;
}
