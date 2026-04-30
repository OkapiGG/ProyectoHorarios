package com.example.GeneradorHorarios.Modelo.Repositorio;

import com.example.GeneradorHorarios.Modelo.DetalleHorario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DetalleHorarioRepositorio extends JpaRepository<DetalleHorario, Long> {
}
