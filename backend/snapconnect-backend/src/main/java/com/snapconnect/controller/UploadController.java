package com.snapconnect.controller;

import com.snapconnect.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class UploadController {

    private final FileStorageService fileStorageService;

    @PostMapping("/portfolio")
    public ResponseEntity<Map<String, String>> uploadPortfolio(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.storeFile(file, "portfolio");
        return ResponseEntity.ok(Collections.singletonMap("url", url));
    }

    @PostMapping("/deliverables")
    public ResponseEntity<Map<String, String>> uploadDeliverable(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.storeFile(file, "deliverables");
        return ResponseEntity.ok(Collections.singletonMap("url", url));
    }
}
