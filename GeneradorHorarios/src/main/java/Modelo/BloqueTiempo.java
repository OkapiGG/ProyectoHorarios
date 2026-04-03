package Modelo;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Entity
@Table(name = "bloque_tiempo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

//    @Enumerated(EnumType.STRING)
//    @Column(nullable = false)
//    private Turno turno;

}
