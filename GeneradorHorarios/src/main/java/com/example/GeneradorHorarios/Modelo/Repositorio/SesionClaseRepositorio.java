package com.example.GeneradorHorarios.Modelo.Repositorio;

import com.example.GeneradorHorarios.Modelo.SesionClase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SesionClaseRepositorio extends JpaRepository<SesionClase, Long> {
    List<SesionClase> findByComponenteCarga_CargaAcademica_PeriodoAcademico_IdPeriodoAcademico(Long idPeriodoAcademico);

    @Query("""
            select sc from SesionClase sc
            join fetch sc.bloqueTiempo bt
            join fetch sc.aula a
            join fetch sc.componenteCarga cc
            join fetch cc.cargaAcademica ca
            join fetch ca.grupo g
            join fetch ca.profesor p
            join fetch ca.planEstudioDetalle ped
            join fetch ped.materia m
            where ca.periodoAcademico.idPeriodoAcademico = :idPeriodoAcademico
            order by bt.diaSemana, bt.horaInicio, sc.numeroSesion, sc.idSesion
            """)
    List<SesionClase> findDetalleByPeriodoAcademico(@Param("idPeriodoAcademico") Long idPeriodoAcademico);

    @Modifying(flushAutomatically = true)
    @Query("""
            delete from SesionClase sc
            where sc.componenteCarga.cargaAcademica.periodoAcademico.idPeriodoAcademico = :idPeriodoAcademico
            """)
    int deleteByPeriodoAcademico(@Param("idPeriodoAcademico") Long idPeriodoAcademico);
}
