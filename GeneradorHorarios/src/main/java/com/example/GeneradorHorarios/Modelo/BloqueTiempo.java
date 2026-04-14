package com.example.GeneradorHorarios.Modelo;


import com.example.GeneradorHorarios.Modelo.enums.Turno;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Table(name = "bloque_tiempo")
@Data @NoArgsConstructor @AllArgsConstructor
public class BloqueTiempo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_bloque_tiempo")
    private Long idBloqueTiempo;

    @Column(name = "dia_semana", nullable = false)
    private String diaSemana;

    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Turno turno;

}
