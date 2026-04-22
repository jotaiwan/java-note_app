# ---- Build stage ----
    FROM maven:3.9.6-eclipse-temurin-21 AS builder
    
    WORKDIR /app
    
    # Cache dependencies
    COPY pom.xml .
    RUN mvn dependency:go-offline -B
    
    # Copy source and build JAR
    COPY src ./src
    # Build and ensure we only have one fat JAR to copy
    RUN mvn package -DskipTests -B && rm -f target/*-plain.jar
    
    # ---- Runtime stage ----
    # 直接使用 maven 镜像（已包含 JDK + Maven）
    FROM maven:3.9.6-eclipse-temurin-21
    
    WORKDIR /app
    
    # Create non-root user
    RUN groupadd -r noteapp && useradd -m -r -g noteapp noteapp
    
    # Copy Maven cache from builder
    COPY --from=builder /root/.m2 /home/noteapp/.m2
    
    # Set JAVA_HOME explicitly to ensure the compiler is found in DEV mode
    ENV JAVA_HOME=/opt/java/openjdk
    COPY --from=builder /app/target/note-app-*.jar app.jar
    COPY --from=builder /app/pom.xml .
    COPY --from=builder /app/src ./src
    
    # Docs directory
    RUN mkdir -p /app/docs && \
        printf '#!/bin/bash\nif [ "$DEV" = "true" ]; then\n  echo "Running in DEV mode with hot reload"\n  mvn spring-boot:run\nelse\n  echo "Running in PROD mode with JAR"\n  java -jar app.jar\nfi' > /app/entrypoint.sh && \
        chmod +x /app/entrypoint.sh && \
        chown -R noteapp:noteapp /app && \
        chown -R noteapp:noteapp /home/noteapp
    
    USER noteapp
    
    EXPOSE 5099
    
    ENTRYPOINT ["/app/entrypoint.sh"]