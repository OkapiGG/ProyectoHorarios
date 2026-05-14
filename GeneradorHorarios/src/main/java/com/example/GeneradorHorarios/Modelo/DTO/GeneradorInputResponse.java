package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class GeneradorInputResponse {
    private Long idPeriodoAcademico;
    private String descripcionPeriodo;
    private Integer anioPeriodo;
    private Boolean activo;
    private List<CargaAcademicaResponse> cargasAcademicas;
    private List<ComponenteCargaResponse> componentesCarga;
    private List<PropuestaCoordinacionResponse> propuestasAprobadas;
    private List<DetalleHorarioResponse> detallesHorario;
    private List<PreferenciaMateriaProfesorResponse> preferenciasMateriaProfesor;
    private List<BloqueTiempoResponse> bloquesTiempo;
    private List<AulaResponse> aulas;
    private List<GrupoAulaResponse> gruposAula;
}
