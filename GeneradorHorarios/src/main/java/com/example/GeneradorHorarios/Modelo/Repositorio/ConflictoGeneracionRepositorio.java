package com.example.GeneradorHorarios.Modelo.Repositorio;

import com.example.GeneradorHorarios.Modelo.ConflictoGeneracion;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ConflictoGeneracionRepositorio extends JpaRepository<ConflictoGeneracion, Long> {

    List<ConflictoGeneracion> findByPeriodoAcademico_IdPeriodoAcademicoAndResueltoFalse(Long idPeriodoAcademico);

    List<ConflictoGeneracion> findByPeriodoAcademico_IdPeriodoAcademico(Long idPeriodoAcademico);

    @Modifying
    @Transactional
    @Query("delete from ConflictoGeneracion c where c.periodoAcademico.idPeriodoAcademico = :idPeriodo")
    void deleteByPeriodo(@Param("idPeriodo") Long idPeriodo);
}
