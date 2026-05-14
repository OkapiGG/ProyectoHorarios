package com.example.GeneradorHorarios.Servicio;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Se lanza cuando una sugerencia previamente calculada ya no puede aplicarse
 * porque el grid cambio (otro coordinador movio una sesion, se programo
 * manualmente, etc.). El frontend debe recalcular sugerencias.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class SugerenciaNoViableException extends RuntimeException {
    public SugerenciaNoViableException(String mensaje) {
        super(mensaje);
    }
}
