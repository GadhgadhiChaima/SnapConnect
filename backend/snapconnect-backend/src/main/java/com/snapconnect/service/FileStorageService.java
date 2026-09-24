package com.snapconnect.service;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path rootLocation = Paths.get("uploads");

    public FileStorageService() {
        init();
    }

    public void init() {
        try {
            Files.createDirectories(rootLocation.resolve("portfolio"));
            Files.createDirectories(rootLocation.resolve("deliverables"));
        } catch (IOException e) {
            throw new RuntimeException("Impossible d'initialiser les dossiers de stockage", e);
        }
    }

    public String storeFile(MultipartFile file, String subFolder) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Échec de l'enregistrement d'un fichier vide.");
            }

            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
            String extension = "";
            if (originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String newFilename = UUID.randomUUID().toString() + extension;
            Path destinationFile = this.rootLocation.resolve(subFolder)
                    .resolve(Paths.get(newFilename))
                    .normalize().toAbsolutePath();

            if (!destinationFile.getParent().startsWith(this.rootLocation.toAbsolutePath())) {
                throw new RuntimeException("Impossible d'enregistrer en dehors du répertoire actuel.");
            }

            Files.copy(file.getInputStream(), destinationFile, StandardCopyOption.REPLACE_EXISTING);

            return "http://localhost:8080/uploads/" + subFolder + "/" + newFilename;
        } catch (IOException e) {
            throw new RuntimeException("Échec de l'enregistrement du fichier.", e);
        }
    }
}
