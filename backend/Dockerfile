# المرحلة الأولى: بناء المشروع (المطبخ)
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# المرحلة التانية: التشغيل (التقديم)
FROM eclipse-temurin:17-jre-alpine
RUN addgroup -S spring && adduser -S spring -G spring
WORKDIR /app
# السطر ده بياخد الـ JAR اللي اتبنى في المرحلة الأولى
COPY --from=builder --chown=spring:spring /app/target/*.jar app.jar
USER spring:spring
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]