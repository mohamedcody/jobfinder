# هنستخدم نسخة جافا 17 خفيفة
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# نقل ملف الـ JAR من فولدر target لداخل الدوكر
COPY target/job-finder-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

# أمر التشغيل
ENTRYPOINT ["java", "-jar", "app.jar"]