package com.rushikesh.portfolio.exception;

public class NotFoundException extends RuntimeException {

    public NotFoundException(String resource, Object id) {
        super(resource + " with id " + id + " not found");
    }

    public NotFoundException(String message) {
        super(message);
    }
}
