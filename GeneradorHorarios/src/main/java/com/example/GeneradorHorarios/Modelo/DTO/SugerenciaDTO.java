package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SugerenciaDTO {

    public enum TipoAccion { MOVE, SWAP }

    private Long idConflicto;
    private TipoAccion tipo;
    private String descripcion;
    private int scoreImpact;
    private List<CambioPropuestoDTO> cambios;
}
