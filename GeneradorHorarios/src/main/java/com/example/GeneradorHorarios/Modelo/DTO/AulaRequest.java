package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.Data;

@Data
public class AulaRequest {
    private Long idEdificio;
    private String nombreAula;
    private Integer capacidad;
    private String aula;
}

