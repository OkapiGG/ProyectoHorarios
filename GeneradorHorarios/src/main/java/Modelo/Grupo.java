package Modelo;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Grupo")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Grupo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_grupo")
    private Integer idGrupo;

    @ManyToOne
    @JoinColumn(name = "id_carrera")
    private Carrera carrera;

    @Column(name = "semestre")
    private String semestre;

    @Column(name = "clave_grupo", nullable = false, unique = true)
    private String claveGrupo;

    @Column(name = "cupo_maximo")
    private Integer cupoMaximo;

    @Column(name = "turno")
    private String turno;

}
