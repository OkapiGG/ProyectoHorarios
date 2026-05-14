package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CambioPropuestoDTO {
    private Long idSesionAfectada;
    private Long idComponenteCarga;
    private Long idBloqueTiempoNuevo;
    private Long idAulaNueva;
    private String descripcionBloque;
    private String descripcionAula;
}
