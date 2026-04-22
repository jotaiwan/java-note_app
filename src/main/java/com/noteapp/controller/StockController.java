package com.noteapp.controller;

import com.noteapp.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private final StockService stockService;

    @Autowired
    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping("/{symbol}/{format}")
    public ResponseEntity<?> getStock(@PathVariable String symbol, @PathVariable String format,
                                      @RequestParam(required = false) String source) {
        try {
            // If source query param is provided, use it; otherwise use format
            String dataSource = (source != null && !source.isBlank()) ? source : format;
            return ResponseEntity.ok(stockService.getStock(symbol, dataSource));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<?> getStockDefault(@PathVariable String symbol,
                                             @RequestParam(required = false) String source) {
        try {
            String dataSource = (source != null && !source.isBlank()) ? source : "alpaca";
            return ResponseEntity.ok(stockService.getStock(symbol, dataSource));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/multiple")
    public ResponseEntity<?> getMultipleStocks(@RequestBody Map<String, Object> body) {
        try {
            @SuppressWarnings("unchecked")
            List<String> symbols = (List<String>) body.get("symbols");
            String format = (String) body.getOrDefault("format", "alpaca");
            if (symbols == null || symbols.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "symbols required"));
            }
            return ResponseEntity.ok(stockService.getMultipleStocks(symbols, format));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
