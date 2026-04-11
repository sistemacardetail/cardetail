# Stage 1: build do JAR com Gradle
FROM amazoncorretto:21-alpine AS build
WORKDIR /app

# Copia os arquivos do Gradle wrapper e resolve dependências primeiro (cache de layer)
COPY gradle/ gradle/
COPY gradlew build.gradle settings.gradle ./
RUN chmod +x gradlew && ./gradlew dependencies --no-daemon

# Copia o código-fonte e compila
COPY src/ src/
RUN ./gradlew bootJar --no-daemon -x test

# Stage 2: imagem mínima apenas com o JAR
FROM amazoncorretto:21-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
