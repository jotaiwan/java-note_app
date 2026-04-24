package com.noteapp.util;

import ch.qos.logback.classic.pattern.ClassicConverter;
import ch.qos.logback.classic.spi.ILoggingEvent;

/**
 * Custom Logback converter to remove "com.noteapp." prefix from logger names.
 */
public class LoggerNameConverter extends ClassicConverter {
    @Override
    public String convert(ILoggingEvent event) {
        String loggerName = event.getLoggerName();
        if (loggerName != null && loggerName.startsWith("com.noteapp.")) {
            return loggerName.substring("com.noteapp.".length());
        }
        return loggerName;
    }
}
