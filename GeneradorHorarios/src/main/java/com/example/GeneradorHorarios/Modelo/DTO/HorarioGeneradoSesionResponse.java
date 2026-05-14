package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class HorarioGeneradoSesionResponse {
    private String claveSesion;
    private Long idComponente;
    private Integer numeroSesion;
    private String estado;
    private Long idPeriodoAcademico;
    private Long idGrupo;
    private String claveGrupo;
    private Integer semestreGrupo;
    private String turnoGrupo;
    private Integer cupoMaximoGrupo;
    private Long idProfesor;
    private String nombreProfesor;
    private Long idAula;
    private String nombreAula;
    private String tipoAula;
    private Long idMateria;
    private String claveMateria;
    private String nombreMateria;
    private String tipoSesion;
    private String diaSemana;
    private String horaInicio;
    private String horaFin;
    private Integer duracionHoras;
    private Long idBloqueInicial;
}
