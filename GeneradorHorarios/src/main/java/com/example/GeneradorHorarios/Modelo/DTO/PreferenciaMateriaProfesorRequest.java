package com.example.GeneradorHorarios.Modelo.DTO;

import com.example.GeneradorHorarios.Modelo.enums.NivelPreferenciaMateria;
import lombok.Data;

@Data
public class PreferenciaMateriaProfesorRequest {
    private Long idProfesor;
    private Long idMateria;
    private Long idPeriodoAcademico;
    private NivelPreferenciaMateria nivelPreferencia;
    private String observaciones;
}
