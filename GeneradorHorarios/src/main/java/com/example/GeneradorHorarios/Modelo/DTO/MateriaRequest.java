package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.Data;

@Data
public class MateriaRequest {
    private String claveMateria;
    private String nombreMateria;
    private Integer creditos;
    private Integer horasSemanales;
}
