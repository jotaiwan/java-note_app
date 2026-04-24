package com.noteapp.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.Optional;

@Component
public class CredentialReader {

    private static final Logger log = LoggerFactory.getLogger(CredentialReader.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    // Resolved from application property note.app.credential-file.
    // This is typically set via SITES_CONFIGURATION_CREDENTIALS or HOME_SITE_CONFIGS.
    // Fallback path: ${HOME_SITE_CONFIGS}/credentials.json, then ${user.home}/configs/sites/credentials.json.
    @Value("${note.app.credential-file:${HOME_SITE_CONFIGS:${user.home}/configs/sites}/credentials.json}")
    private String credentialFilePath;

    private JsonNode cachedCredentials;

    public Optional<String> get(String key) {
        JsonNode node = loadCredentials();
        if (node == null) return Optional.empty();
        // Support both flat key and dot-notation (e.g. "finnhub.api_key")
        if (key.contains(".")) {
            String[] parts = key.split("\\.", 2);
            JsonNode parent = node.get(parts[0]);
            if (parent == null || !parent.has(parts[1])) return Optional.empty();
            return Optional.of(parent.get(parts[1]).asText());
        }
        if (!node.has(key)) return Optional.empty();
        return Optional.of(node.get(key).asText());
    }

    public Optional<String> getFinnhubApiKey() {
        return get("finnhub.api_key");
    }

    public Optional<String> getAlpacaKey() {
        return get("alpacamarkets.api_key");
    }

    public Optional<String> getAlpacaSecret() {
        return get("alpacamarkets.secret");
    }

    public Optional<String> getAlpacaDataUrl() {
        return get("alpacamarkets.data_url");
    }

    public Optional<String> getVaultToken() {
        return get("vault.int");
    }

    private JsonNode loadCredentials() {
        if (cachedCredentials != null) return cachedCredentials;
        // app.credential-file is already resolved from SITES_CONFIGS_CREDENTIALS
        // via Spring property binding in application*.properties — use it directly.
        String path = credentialFilePath;
        log.info("Loading credentials from: {}", path);
        File file = new File(path);
        if (!file.exists() || !file.isFile()) {
            log.warn("Credential file not found: {} — stock/API features will be unavailable", path);
            return null;
        }
        try {
            cachedCredentials = MAPPER.readTree(file);
            log.info("Credentials loaded successfully from: {}", path);
            return cachedCredentials;
        } catch (Exception e) {
            log.error("Failed to parse credential file: {}", path, e);
            return null;
        }
    }
}
