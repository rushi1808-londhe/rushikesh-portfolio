package com.rushikesh.portfolio.repository;

import com.rushikesh.portfolio.entity.BucketListItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BucketListItemRepository extends JpaRepository<BucketListItem, Long> {

    List<BucketListItem> findAllByOrderByDisplayOrderAscIdAsc();
}
