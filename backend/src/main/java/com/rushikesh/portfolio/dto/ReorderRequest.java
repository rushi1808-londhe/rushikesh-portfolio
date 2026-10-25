package com.rushikesh.portfolio.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/** Every id of the list, in the new order (first = top). */
public record ReorderRequest(@NotEmpty @Size(max = 1000) List<@NotNull Long> ids) {
}
