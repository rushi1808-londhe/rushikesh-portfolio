package com.rushikesh.portfolio.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "skills")
public class Skill extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    /** Iconify icon JSON ({"body","width","height"}) chosen in the admin panel. */
    @Column(name = "icon_data", columnDefinition = "TEXT")
    private String iconData;

    /** Uploaded logo image (alternative to iconData). */
    @Column(name = "icon_url")
    private String iconUrl;
}
