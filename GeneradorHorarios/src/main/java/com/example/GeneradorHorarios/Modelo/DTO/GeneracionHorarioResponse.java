package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class GeneracionHorarioResponse {
    private Long idPeriodoAcademico;
    private String descripcionPeriodo;
    private Boolean exitoParcial;
    private Integer componentesProcesados;
    private Integer sesionesSolicitadas;
    private Integer sesionesProgramadas;
    private Integer bloquesProgramados;
    private Integer sesionesPreviasEliminadas;
    private Integer conflictosTotales;
    private List<String> advertencias;
    private List<String> conflictos;
}
