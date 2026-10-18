package com.rushikesh.portfolio.repository;

import com.rushikesh.portfolio.entity.Extracurricular;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExtracurricularRepository extends JpaRepository<Extracurricular, Long> {

    List<Extracurricular> findAllByOrderByDisplayOrderAscIdAsc();
}
