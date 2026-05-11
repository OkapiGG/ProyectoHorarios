package com.example.GeneradorHorarios.Modelo.Repositorio;

import com.example.GeneradorHorarios.Modelo.CargaAcademica;
import com.example.GeneradorHorarios.Modelo.ComponenteCarga;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComponenteCargaRepositorio extends JpaRepository<ComponenteCarga, Long> {
    List<ComponenteCarga> findByCargaAcademicaIn(List<CargaAcademica> cargasAcademicas);
}
