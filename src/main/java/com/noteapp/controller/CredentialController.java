package com.noteapp.controller;

import com.noteapp.util.CredentialReader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/credentials")
public class CredentialController {

    private final CredentialReader credentialReader;

    @Autowired
    public CredentialController(CredentialReader credentialReader) {
        this.credentialReader = credentialReader;
    }

    /**
     * GET /api/credentials/{credentialId}?key={subkey}
     * e.g. /api/credentials/ta?key=sso  → looks up credentials.json["ta"]["sso"]
     */
    @GetMapping("/{credentialId}")
    public ResponseEntity<?> getCredential(
            @PathVariable String credentialId,
            @RequestParam(required = false) String key) {

        String lookupKey = (key != null && !key.isBlank())
                ? credentialId + "." + key
                : credentialId;

        Optional<String> value = credentialReader.get(lookupKey);
        if (value.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "error", "Credential not found: " + lookupKey));
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "credential", value.get()));
    }
}
