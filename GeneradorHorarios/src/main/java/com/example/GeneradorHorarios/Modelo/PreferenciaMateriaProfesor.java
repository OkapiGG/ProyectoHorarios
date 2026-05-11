package com.example.GeneradorHorarios.Modelo;

import com.example.GeneradorHorarios.Modelo.enums.NivelPreferenciaMateria;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "preferencia_materia_profesor",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"id_profesor", "id_materia", "id_periodo_academico"}
        )
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class PreferenciaMateriaProfesor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_preferencia_materia")
    private Long idPreferenciaMateria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_profesor", nullable = false)
    private Profesor profesor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_materia", nullable = false)
    private Materia materia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_periodo_academico", nullable = false)
    private PeriodoAcademico periodoAcademico;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_preferencia", nullable = false)
    private NivelPreferenciaMateria nivelPreferencia = NivelPreferenciaMateria.MEDIA;

    @Column(length = 500)
    private String observaciones;
}
