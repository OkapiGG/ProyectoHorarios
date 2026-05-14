package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AplicarSugerenciaRequest {
    private Long idConflicto;
    private SugerenciaDTO.TipoAccion tipo;
    private List<CambioPropuestoDTO> cambios;
}
