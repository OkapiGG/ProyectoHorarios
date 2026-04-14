package com.example.GeneradorHorarios.Modelo;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profesor")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Profesor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_profesor")
    private Long idProfesor;

    @Column(name = "nom_profesor", nullable = false)
    private String nomProfesor;

    @Column(name = "ap_paterno_profesor")
    private String apPaternoProfesor;

    @Column(name = "ap_materno_profesor")
    private String apMaternoProfesor;

    @Column(name = "area_conocimiento")
    private String areaConocimiento;

    @Column(name = "tipo_contrato")
    private String tipoContrato;

    @Column(name = "correo", unique = true)
    private String correo;

    @Column(name = "anios_antiguedad")
    private Integer aniosAntiguedad;

    @Column(name = "max_grado_estudios")
    private String maxGradoEstudios;
}