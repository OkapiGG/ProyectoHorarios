package com.example.GeneradorHorarios.Modelo;
/*
    queda pendiente lo del rol por como se va a declarar
    o si se va a validar

    luego en el ER las llaves foraneas se ocupa manytoone o
    onetoone algo asi para la relacion
 */

import com.example.GeneradorHorarios.Modelo.enums.Rol;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(nullable = false, unique = true)
    private String correo;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol rol;

    @Column(nullable = false)
    private Boolean activo = true;

    // si es null el y no tiene profesor asociado es un coordinador
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_profesor", nullable = true)
    private Profesor profesor;
}
