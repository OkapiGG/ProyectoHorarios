package Modelo;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "periodoAcademico")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PeriodoAcademico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_periodo_academico")
    private Long idPeriodoAcademico;

    @OneToMany(mappedBy = "periodoAcademico")
    private List<CargaAcademica> cargasAcademicas;

    @Column(nullable = false)
    private String descripcion;

    @Column(nullable = false)
    private Integer anio;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(nullable = false)
    private Boolean activo = false;

}
