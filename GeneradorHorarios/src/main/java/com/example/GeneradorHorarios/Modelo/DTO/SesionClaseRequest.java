package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.Data;

@Data
public class SesionClaseRequest {
    private Long idComponenteCarga;
    private Long idBloqueTiempo;
    private Long idAula;
    private Integer numeroSesion;
    private String estado;
}
