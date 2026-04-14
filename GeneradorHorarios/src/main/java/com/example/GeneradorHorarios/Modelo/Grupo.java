package com.example.GeneradorHorarios.Modelo;

import com.example.GeneradorHorarios.Modelo.enums.Turno;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "grupo")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Grupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_grupo")
    private Long idGrupo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_carrera", nullable = false)
    private Carrera carrera;

    @Column(nullable = false)
    private Integer semestre;

    @Column(name = "clave_grupo", nullable = false, unique = true)
    private String claveGrupo;

    @Column(name = "cupo_maximo", nullable = false)
    private Integer cupoMaximo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Turno turno;
}
