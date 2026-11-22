package com.example.aes.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.security.GeneralSecurityException;
import java.util.Map;
import java.util.Objects;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({GeneralSecurityException.class, IllegalArgumentException.class})
    public ResponseEntity<Map<String, String>> crypto(Exception e) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", Objects.requireNonNullElse(e.getMessage(), "Invalid input")));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> validation() {
        return ResponseEntity.badRequest().body(Map.of("error", "Data, key and mode are required"));
    }
}