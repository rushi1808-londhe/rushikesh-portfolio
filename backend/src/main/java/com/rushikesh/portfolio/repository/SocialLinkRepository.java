package com.rushikesh.portfolio.repository;

import com.rushikesh.portfolio.entity.SocialLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SocialLinkRepository extends JpaRepository<SocialLink, Long> {

    List<SocialLink> findAllByOrderByDisplayOrderAscIdAsc();
}
