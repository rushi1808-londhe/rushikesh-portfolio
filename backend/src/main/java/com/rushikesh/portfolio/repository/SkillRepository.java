package com.rushikesh.portfolio.repository;

import com.rushikesh.portfolio.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    List<Skill> findAllByOrderByDisplayOrderAscIdAsc();
}
