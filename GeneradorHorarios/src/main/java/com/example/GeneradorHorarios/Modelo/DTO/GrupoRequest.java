package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.Data;

@Data
public class GrupoRequest {
    private Long idCarrera;
    private Integer semestre;
    private String claveGrupo;
    private Integer cupoMaximo;
    private String turno;
}
