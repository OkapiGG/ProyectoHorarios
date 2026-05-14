package com.example.GeneradorHorarios.Modelo.DTO;

import lombok.*;

/**
 * Solicitud para mover una sesion logica (componente + numeroSesion) a un
 * nuevo bloque inicial y/o aula. Si la sesion es multi-bloque, el motor
 * construye la secuencia consecutiva a partir del bloque inicial.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MoverSesionRequest {
    private Long idComponente;
    private Integer numeroSesion;
    private Long idBloqueInicialNuevo;
    private Long idAulaNueva;
}
