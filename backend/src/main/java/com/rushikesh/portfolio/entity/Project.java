package com.rushikesh.portfolio.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "projects")
public class Project extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "short_description", nullable = false, columnDefinition = "TEXT")
    private String shortDescription;

    @Column(name = "full_description", columnDefinition = "TEXT")
    private String fullDescription;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "live_url")
    private String liveUrl;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<ProjectTag> tags = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<ProjectBullet> bullets = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<ProjectImage> images = new ArrayList<>();

    public void replaceImages(List<String[]> urlAndCaption) {
        images.clear();
        for (int i = 0; i < urlAndCaption.size(); i++) {
            ProjectImage image = new ProjectImage();
            image.setProject(this);
            image.setUrl(urlAndCaption.get(i)[0]);
            image.setCaption(urlAndCaption.get(i)[1]);
            image.setDisplayOrder(i + 1);
            images.add(image);
        }
    }

    public void replaceTags(List<String> names) {
        tags.clear();
        for (int i = 0; i < names.size(); i++) {
            ProjectTag tag = new ProjectTag();
            tag.setProject(this);
            tag.setName(names.get(i));
            tag.setDisplayOrder(i + 1);
            tags.add(tag);
        }
    }

    public void replaceBullets(List<String> contents) {
        bullets.clear();
        for (int i = 0; i < contents.size(); i++) {
            ProjectBullet bullet = new ProjectBullet();
            bullet.setProject(this);
            bullet.setContent(contents.get(i));
            bullet.setDisplayOrder(i + 1);
            bullets.add(bullet);
        }
    }
}
