package com.example.GeneradorHorarios.Modelo.Repositorio;

import com.example.GeneradorHorarios.Modelo.PropuestaDisponibilidad;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PropuestaRepositorio extends JpaRepository<PropuestaDisponibilidad, Long> {
}
