package com.rushikesh.portfolio.service;

import com.rushikesh.portfolio.dto.BucketListItemDto;
import com.rushikesh.portfolio.entity.BucketListItem;
import com.rushikesh.portfolio.exception.BadRequestException;
import com.rushikesh.portfolio.exception.NotFoundException;
import com.rushikesh.portfolio.repository.BucketListItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static com.rushikesh.portfolio.service.ProfileService.blankToNull;

@Service
public class BucketListService {

    private final BucketListItemRepository repository;

    public BucketListService(BucketListItemRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<BucketListItemDto> findAll() {
        return repository.findAllByOrderByDisplayOrderAscIdAsc().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public BucketListItemDto findById(Long id) {
        return toDto(load(id));
    }

    @Transactional
    public BucketListItemDto create(BucketListItemDto dto) {
        BucketListItem item = new BucketListItem();
        apply(item, dto);
        return toDto(repository.save(item));
    }

    @Transactional
    public BucketListItemDto update(Long id, BucketListItemDto dto) {
        BucketListItem item = load(id);
        apply(item, dto);
        return toDto(repository.save(item));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(load(id));
    }

    /** Renumbers the whole list 1..n in the given order; the ids must be exactly the current items. */
    @Transactional
    public List<BucketListItemDto> reorder(List<Long> ids) {
        Map<Long, BucketListItem> byId = repository.findAll().stream()
                .collect(Collectors.toMap(BucketListItem::getId, Function.identity()));
        if (ids.size() != byId.size() || !new HashSet<>(ids).equals(byId.keySet())) {
            throw new BadRequestException("The order must list every bucket list item exactly once");
        }
        for (int i = 0; i < ids.size(); i++) {
            byId.get(ids.get(i)).setDisplayOrder(i + 1);
        }
        return findAll();
    }

    private BucketListItem load(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Bucket list item", id));
    }

    private void apply(BucketListItem item, BucketListItemDto dto) {
        item.setTitle(dto.title().trim());
        item.setDescription(blankToNull(dto.description()));
        item.setDone(dto.done());
        // A completion date only makes sense once it's done.
        item.setCompletedOn(dto.done() ? blankToNull(dto.completedOn()) : null);
        item.setDisplayOrder(dto.displayOrder());
    }

    private BucketListItemDto toDto(BucketListItem item) {
        return new BucketListItemDto(item.getId(), item.getTitle(), item.getDescription(), item.isDone(),
                item.getCompletedOn(), item.getDisplayOrder());
    }
}
