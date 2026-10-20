package com.rushikesh.portfolio.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "experiences")
public class Experience extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String duration;

    private String location;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @OneToMany(mappedBy = "experience", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<ExperienceBullet> bullets = new ArrayList<>();

    public void replaceBullets(List<String> contents) {
        bullets.clear();
        for (int i = 0; i < contents.size(); i++) {
            ExperienceBullet bullet = new ExperienceBullet();
            bullet.setExperience(this);
            bullet.setContent(contents.get(i));
            bullet.setDisplayOrder(i + 1);
            bullets.add(bullet);
        }
    }
}
