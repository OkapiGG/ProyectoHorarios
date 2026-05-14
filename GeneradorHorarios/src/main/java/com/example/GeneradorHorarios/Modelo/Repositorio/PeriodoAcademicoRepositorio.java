package com.example.GeneradorHorarios.Modelo.Repositorio;

import com.example.GeneradorHorarios.Modelo.PeriodoAcademico;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PeriodoAcademicoRepositorio extends JpaRepository<PeriodoAcademico, Long> {
    Optional<PeriodoAcademico> findFirstByActivoTrue();
    List<PeriodoAcademico> findByActivoTrue();
    long countByActivoTrue();
}
