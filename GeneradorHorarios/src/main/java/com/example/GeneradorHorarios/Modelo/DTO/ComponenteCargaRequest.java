package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.Data;

@Data
public class ComponenteCargaRequest {
    private Long idCargaAcademica;
    private String tipoSesion;
    private Integer numSesiones;
    private Integer bloquesPorSesion;
    private Boolean requiereConsecutivos;
}
