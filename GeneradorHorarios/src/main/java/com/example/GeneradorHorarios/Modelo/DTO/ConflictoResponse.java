package com.example.GeneradorHorarios.Modelo.DTO;

import com.example.GeneradorHorarios.Modelo.enums.MotivoConflicto;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConflictoResponse {
    private Long idConflicto;
    private Long idPeriodoAcademico;
    private Long idCargaAcademica;
    private Long idComponente;
    private Integer numeroSesion;
    private MotivoConflicto motivo;
    private String detalle;
    private LocalDateTime fechaDeteccion;
    private Boolean resuelto;
    private String motivoResolucion;
    private LocalDateTime fechaResolucion;

    private String nombreMateria;
    private String nombreProfesor;
    private String claveGrupo;
}
