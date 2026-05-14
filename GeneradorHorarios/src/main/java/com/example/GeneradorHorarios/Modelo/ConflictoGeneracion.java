package com.example.GeneradorHorarios.Modelo;

import com.example.GeneradorHorarios.Modelo.enums.MotivoConflicto;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "conflicto_generacion")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ConflictoGeneracion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_conflicto")
    private Long idConflicto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_periodo_academico", nullable = false)
    private PeriodoAcademico periodoAcademico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_carga_academica")
    private CargaAcademica cargaAcademica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_componente")
    private ComponenteCarga componenteCarga;

    @Column(name = "numero_sesion")
    private Integer numeroSesion;

    @Enumerated(EnumType.STRING)
    @Column(name = "motivo", nullable = false, length = 40)
    private MotivoConflicto motivo;

    @Column(name = "detalle", length = 500)
    private String detalle;

    @Column(name = "fecha_deteccion", nullable = false)
    private LocalDateTime fechaDeteccion;

    @Column(name = "resuelto", nullable = false)
    private Boolean resuelto;

    @Column(name = "motivo_resolucion", length = 300)
    private String motivoResolucion;

    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;

    @PrePersist
    void prePersist() {
        if (fechaDeteccion == null) fechaDeteccion = LocalDateTime.now();
        if (resuelto == null) resuelto = Boolean.FALSE;
    }
}
