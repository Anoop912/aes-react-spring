package com.example.aes.dto;

import jakarta.validation.constraints.NotBlank;

public record CryptoRequest(
        @NotBlank String data,
        @NotBlank String key,
        @NotBlank String mode,
        String iv) {}