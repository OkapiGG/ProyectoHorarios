package Modelo;
/*
    queda pendiente lo del rol por como se va a declarar
    o si se va a validar

    luego en el ER las llaves foraneas se ocupa manytoone o
    onetoone algo asi para la relacion
 */

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "usuario")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;
    // Asi jpa entiende la relacion
    @OneToOne()
    @JoinColumn(name = "id_profesor")
    private Profesor idProfesor;

    @Column(name = "correo")
    private String correo;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "rol")
    private String rol;

    @Column(name = "activo")
    private Boolean activo;


}
