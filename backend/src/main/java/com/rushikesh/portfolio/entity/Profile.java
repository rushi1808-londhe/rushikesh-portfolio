package com.rushikesh.portfolio.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "profile")
public class Profile extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String title;

    private String tagline;
    private String location;
    private String phone;
    private String email;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "speech_lines", columnDefinition = "TEXT")
    private String speechLines;

    @Column(name = "resume_url")
    private String resumeUrl;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "hero_code", columnDefinition = "TEXT")
    private String heroCode;
}
