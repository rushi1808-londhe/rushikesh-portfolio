package com.rushikesh.portfolio.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "bucket_list_items")
public class BucketListItem extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private boolean done;

    @Column(name = "completed_on")
    private String completedOn;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
