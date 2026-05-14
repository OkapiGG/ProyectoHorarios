package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.*;

import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResultadoAplicacionDTO {
    private boolean exito;
    private String mensaje;
    private Long idConflicto;
    private int sesionesEliminadas;
    private int sesionesCreadas;
    private List<Long> idSesionesCreadas;
}
