package com.example.aes.controller;

import com.example.aes.dto.CryptoRequest;
import com.example.aes.dto.CryptoResponse;
import com.example.aes.service.AesService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.security.GeneralSecurityException;

@RestController
@RequestMapping("/api/aes")
@CrossOrigin(origins = "http://localhost:5173")
public class AesController {

    private final AesService service;

    public AesController(AesService service) {
        this.service = service;
    }

    @PostMapping("/encrypt")
    public CryptoResponse encrypt(@Valid @RequestBody CryptoRequest req) throws GeneralSecurityException {
        return service.encrypt(req);
    }

    @PostMapping("/decrypt")
    public CryptoResponse decrypt(@Valid @RequestBody CryptoRequest req) throws GeneralSecurityException {
        return service.decrypt(req);
    }
}