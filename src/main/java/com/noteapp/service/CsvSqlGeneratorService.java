package com.noteapp.service;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class CsvSqlGeneratorService {

    public Map<String, Object> generateSqlFromCsv(MultipartFile file) throws Exception {
        List<Map<String, String>> records = new ArrayList<>();
        List<String> sqlStatements = new ArrayList<>();

        byte[] bytes = file.getBytes();
        // Remove BOM if present
        int offset = 0;
        if (bytes.length >= 3 && bytes[0] == (byte) 0xEF && bytes[1] == (byte) 0xBB && bytes[2] == (byte) 0xBF) {
            offset = 3;
        }
        String content = new String(bytes, offset, bytes.length - offset, StandardCharsets.UTF_8);

        Reader reader = new java.io.StringReader(content);
        CSVParser parser = CSVFormat.DEFAULT
                .builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setTrim(true)
                .build()
                .parse(reader);

        for (CSVRecord record : parser) {
            Map<String, String> row = new LinkedHashMap<>();
            for (String header : parser.getHeaderNames()) {
                row.put(header, record.get(header));
            }
            records.add(row);
            String sql = buildInsertSql(row);
            sqlStatements.add(sql);
        }

        String preview = String.join("\n", sqlStatements.subList(0, Math.min(5, sqlStatements.size())));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("file_name", file.getOriginalFilename());
        result.put("file_size", file.getSize());
        result.put("record_count", records.size());
        result.put("records", records);
        result.put("sql_statements", sqlStatements);
        result.put("preview", preview);
        return result;
    }

    private String buildInsertSql(Map<String, String> row) {
        String ticket = escapeSql(row.getOrDefault("ticket", ""));
        String subject = escapeSql(row.getOrDefault("subject", ""));
        String note = escapeSql(row.getOrDefault("note", ""));
        String status = escapeSql(row.getOrDefault("status", "open"));
        String createdAt = row.getOrDefault("created_at", "NOW()");

        boolean hasSubject = !subject.isEmpty();
        if (hasSubject) {
            return String.format(
                "INSERT INTO notes (ticket, subject, note, status, created_at) VALUES ('%s', '%s', '%s', '%s', '%s');",
                ticket, subject, note, status, createdAt);
        } else {
            return String.format(
                "INSERT INTO notes (ticket, note, status, created_at) VALUES ('%s', '%s', '%s', '%s');",
                ticket, note, status, createdAt);
        }
    }

    private String escapeSql(String value) {
        if (value == null) return "";
        return value.replace("'", "''")
                    .replace("\\", "\\\\");
    }
}
