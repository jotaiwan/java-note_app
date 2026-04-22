package com.noteapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.noteapp.util.CredentialReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class StockService {

    private static final Logger log = LoggerFactory.getLogger(StockService.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final ZoneId SYDNEY_ZONE = ZoneId.of("Australia/Sydney");
    private static final ZoneId UTC_ZONE = ZoneId.of("UTC");

    private final CredentialReader credentialReader;
    private final HttpClient httpClient;

    @Autowired
    public StockService(CredentialReader credentialReader) {
        this.credentialReader = credentialReader;
        this.httpClient = HttpClient.newBuilder().build();
    }

    public Map<String, Object> getStock(String symbol, String format) {
        String src = (format == null || format.isBlank()) ? "alpaca" : format.toLowerCase();
        if ("finnhub".equals(src)) {
            return getFromFinnhub(symbol);
        }
        return getFromAlpaca(symbol);
    }

    public List<Map<String, Object>> getMultipleStocks(List<String> symbols, String format) {
        List<Map<String, Object>> results = new ArrayList<>();
        for (String symbol : symbols) {
            try {
                results.add(getStock(symbol, format));
            } catch (Exception e) {
                Map<String, Object> err = new LinkedHashMap<>();
                err.put("symbol", symbol);
                err.put("error", e.getMessage());
                results.add(err);
            }
        }
        return results;
    }

    private Map<String, Object> getFromFinnhub(String symbol) {
        String apiKey = credentialReader.getFinnhubApiKey()
                .orElseThrow(() -> new RuntimeException("Finnhub API key not configured"));

        String url = "https://finnhub.io/api/v1/quote?symbol=" + symbol + "&token=" + apiKey;
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode json = MAPPER.readTree(response.body());

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("symbol", symbol);
            result.put("source", "finnhub");
            result.put("current", json.path("c").asDouble());
            result.put("open", json.path("o").asDouble());
            result.put("high", json.path("h").asDouble());
            result.put("low", json.path("l").asDouble());
            result.put("previous_close", json.path("pc").asDouble());

            double current = json.path("c").asDouble();
            double prevClose = json.path("pc").asDouble();
            double change = current - prevClose;
            double changePct = prevClose != 0 ? (change / prevClose) * 100 : 0;
            result.put("rise_or_drop", Map.of(
                    "change", String.format("%.2f", change),
                    "change_percent", String.format("%.2f%%", changePct),
                    "opening", json.path("o").asDouble(),
                    "latest_close", current
            ));
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Finnhub API error for " + symbol + ": " + e.getMessage(), e);
        }
    }

    private Map<String, Object> getFromAlpaca(String symbol) {
        String apiKey = credentialReader.getAlpacaKey()
                .orElseThrow(() -> new RuntimeException("Alpaca API key not configured"));
        String apiSecret = credentialReader.getAlpacaSecret()
                .orElseThrow(() -> new RuntimeException("Alpaca API secret not configured"));
        String dataUrl = credentialReader.getAlpacaDataUrl()
                .orElse("https://data.alpaca.markets");

        // end is exclusive in Alpaca API — use tomorrow to include today's bar.
        // start covers 14 days to handle weekends, holidays and low-volume symbols.
        LocalDate end = LocalDate.now(UTC_ZONE).plusDays(1);
        LocalDate start = end.minusDays(14);
        // dataUrl may already include /v2 (e.g. "https://data.alpaca.markets/v2")
        String base = dataUrl.replaceAll("/v2/?$", "");
        String url = base + "/v2/stocks/" + symbol + "/bars" +
                "?timeframe=1Day&start=" + start + "&end=" + end + "&limit=10&adjustment=raw&feed=iex";
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("APCA-API-KEY-ID", apiKey)
                    .header("APCA-API-SECRET-KEY", apiSecret)
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            log.debug("Alpaca response for {}: HTTP {} body={}", symbol, response.statusCode(), response.body());
            JsonNode json = MAPPER.readTree(response.body());
            JsonNode bars = json.path("bars");

            if (!bars.isArray() || bars.size() == 0) {
                // Fallback to Finnhub if Alpaca has no data for this symbol
                log.warn("No data returned from Alpaca for {}, falling back to Finnhub", symbol);
                try {
                    return getFromFinnhub(symbol);
                } catch (Exception fe) {
                    throw new RuntimeException("No data returned from Alpaca for " + symbol +
                            " (Finnhub fallback also failed: " + fe.getMessage() + ")");
                }
            }

            // Latest bar
            JsonNode latest = bars.get(bars.size() - 1);
            double open = latest.path("o").asDouble();
            double close = latest.path("c").asDouble();
            double high = latest.path("h").asDouble();
            double low = latest.path("l").asDouble();
            String timestamp = latest.path("t").asText();

            // Find highest high across all bars
            double dailyHigh = Double.MIN_VALUE;
            String dailyHighTimestamp = "";
            for (JsonNode bar : bars) {
                double h = bar.path("h").asDouble();
                if (h > dailyHigh) {
                    dailyHigh = h;
                    dailyHighTimestamp = bar.path("t").asText();
                }
            }

            // Convert timestamp to Sydney time
            String sydneyTime = convertToSydney(dailyHighTimestamp);

            // Earliest bar
            JsonNode earliest = bars.get(0);
            String earliestTimestamp = earliest.path("t").asText();
            long daysAgo = calculateDaysAgo(earliestTimestamp);

            double change = close - open;
            double changePct = open != 0 ? (change / open) * 100 : 0;

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("symbol", symbol);
            result.put("source", "alpaca");
            result.put("rise_or_drop", Map.of(
                    "change", String.format("%.2f", change),
                    "change_percent", String.format("%.2f%%", changePct),
                    "opening", open,
                    "latest_close", close
            ));
            result.put("daily_highest", Map.of(
                    "price", dailyHigh,
                    "timestamp_utc", dailyHighTimestamp,
                    "timestamp_sydney", sydneyTime
            ));
            result.put("earliest_open_days", Map.of(
                    "timestamp", earliestTimestamp,
                    "days_ago", daysAgo
            ));
            result.put("high", high);
            result.put("low", low);
            return result;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Alpaca API error for " + symbol + ": " + e.getMessage(), e);
        }
    }

    private String convertToSydney(String utcTimestamp) {
        try {
            ZonedDateTime utc = ZonedDateTime.parse(utcTimestamp);
            ZonedDateTime sydney = utc.withZoneSameInstant(SYDNEY_ZONE);
            return sydney.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z"));
        } catch (Exception e) {
            return utcTimestamp;
        }
    }

    private long calculateDaysAgo(String timestamp) {
        try {
            ZonedDateTime dt = ZonedDateTime.parse(timestamp);
            return ChronoUnit.DAYS.between(dt.toLocalDate(), LocalDate.now(UTC_ZONE));
        } catch (Exception e) {
            return 0;
        }
    }
}
