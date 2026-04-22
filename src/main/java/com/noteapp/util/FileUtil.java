package com.noteapp.util;

import java.util.UUID;

public class FileUtil {

    public static String generateUniqueFileName(String originalName) {
        String safe = originalName == null ? "file" : originalName.replaceAll("[^a-zA-Z0-9._\\-]", "_");
        return UUID.randomUUID().toString().replace("-", "") + "_" + safe;
    }

    public static String determineCategory(String mimeType, String fileName) {
        if (mimeType == null) mimeType = "";
        if (fileName == null) fileName = "";
        String lowerMime = mimeType.toLowerCase();
        String lowerName = fileName.toLowerCase();

        if (lowerMime.startsWith("image/")) return "image";
        if (lowerMime.startsWith("video/")) return "video";
        if (lowerMime.startsWith("audio/")) return "audio";
        if ("application/pdf".equals(lowerMime) || lowerName.endsWith(".pdf")) return "pdf";
        if (lowerMime.contains("word") || lowerMime.contains("excel") || lowerMime.contains("powerpoint")
                || lowerMime.contains("spreadsheet") || lowerMime.contains("presentation")
                || lowerName.endsWith(".doc") || lowerName.endsWith(".docx")
                || lowerName.endsWith(".xls") || lowerName.endsWith(".xlsx")
                || lowerName.endsWith(".ppt") || lowerName.endsWith(".pptx")) {
            return "document";
        }
        if (lowerMime.startsWith("text/") || lowerName.endsWith(".txt") || lowerName.endsWith(".log")
                || lowerName.endsWith(".csv") || lowerName.endsWith(".md")) {
            return "text";
        }
        return "other";
    }

    private FileUtil() {}
}
