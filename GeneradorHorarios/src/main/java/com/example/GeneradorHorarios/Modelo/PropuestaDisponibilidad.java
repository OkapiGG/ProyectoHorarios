package com.example.GeneradorHorarios.Modelo;

import com.example.GeneradorHorarios.Modelo.enums.EstadoPropuesta;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "propuesta_disponibilidad",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"id_profesor","id_periodo_academico"}
        )
)
@Data @NoArgsConstructor @AllArgsConstructor
public class PropuestaDisponibilidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pro_disponibilidad")
    private Long idProDisponibilidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_profesor", nullable = false)
    private Profesor profesor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_periodo_academico", nullable = false)
    private PeriodoAcademico periodoAcademico;

    @Column(name = "fecha_entrega")
    private LocalDate fechaEntrega;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPropuesta estado = EstadoPropuesta.BORRADOR;

}
