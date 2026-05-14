package com.example.GeneradorHorarios.Modelo.DTO;

import com.example.GeneradorHorarios.Modelo.ComponenteCarga;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ComponenteCargaResponse {
    private Long idComponente;
    private Long idCargaAcademica;
    private String tipoSesion;
    private Integer numSesiones;
    private Integer bloquesPorSesion;
    private Boolean requiereConsecutivos;

    public static ComponenteCargaResponse fromEntity(ComponenteCarga componenteCarga) {
        return new ComponenteCargaResponse(
                componenteCarga.getIdComponente(),
                componenteCarga.getCargaAcademica().getIdCargaAcademica(),
                componenteCarga.getTipoSesion().name(),
                componenteCarga.getNumSesiones(),
                componenteCarga.getBloquesPorSesion(),
                componenteCarga.getRequiereConsecutivos()
        );
    }
}
