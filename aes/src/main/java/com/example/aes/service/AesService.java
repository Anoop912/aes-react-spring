package com.example.aes.service;

import com.example.aes.dto.CryptoRequest;
import com.example.aes.dto.CryptoResponse;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.security.spec.AlgorithmParameterSpec;
import java.util.Base64;

import static java.nio.charset.StandardCharsets.UTF_8;

@Service
public class AesService {

    private final SecureRandom random = new SecureRandom();

    public CryptoResponse encrypt(CryptoRequest req) throws GeneralSecurityException {
        String mode = req.mode().toUpperCase();
        byte[] iv = new byte[ivLength(mode)];
        random.nextBytes(iv);

        Cipher cipher = cipher(Cipher.ENCRYPT_MODE, mode, req.key(), iv);
        String result = Base64.getEncoder().encodeToString(cipher.doFinal(req.data().getBytes(UTF_8)));
        String ivOut = iv.length > 0 ? Base64.getEncoder().encodeToString(iv) : null;
        return new CryptoResponse(result, ivOut);
    }

    public CryptoResponse decrypt(CryptoRequest req) throws GeneralSecurityException {
        String mode = req.mode().toUpperCase();
        byte[] iv = ivLength(mode) > 0 && req.iv() != null
                ? Base64.getDecoder().decode(req.iv())
                : new byte[0];

        Cipher cipher = cipher(Cipher.DECRYPT_MODE, mode, req.key(), iv);
        byte[] plain = cipher.doFinal(Base64.getDecoder().decode(req.data()));
        return new CryptoResponse(new String(plain, UTF_8), null);
    }

    private Cipher cipher(int opMode, String mode, String key, byte[] iv) throws GeneralSecurityException {
        Cipher cipher = Cipher.getInstance(switch (mode) {
            case "ECB" -> "AES/ECB/PKCS5Padding";
            case "CBC" -> "AES/CBC/PKCS5Padding";
            case "CTR" -> "AES/CTR/NoPadding";
            case "GCM" -> "AES/GCM/NoPadding";
            default -> throw new IllegalArgumentException("Unsupported mode: " + mode);
        });
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(UTF_8), "AES");
        AlgorithmParameterSpec spec = switch (mode) {
            case "GCM" -> new GCMParameterSpec(128, iv);
            case "CBC", "CTR" -> new IvParameterSpec(iv);
            default -> null;
        };
        if (spec == null) {
            cipher.init(opMode, secretKey);
        } else {
            cipher.init(opMode, secretKey, spec);
        }
        return cipher;
    }

    private int ivLength(String mode) {
        return switch (mode) {
            case "GCM" -> 12;
            case "CBC", "CTR" -> 16;
            default -> 0;
        };
    }
}