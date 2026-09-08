# Stage 1: Build the Spring Boot application
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Lightweight runtime with memory tuning
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/eye_witness_aidectection-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

# Run with serial GC and strict heap allocation to fit 512MB RAM
ENTRYPOINT ["java", "-Xms128m", "-Xmx256m", "-XX:+UseSerialGC", "-jar", "app.jar"]
