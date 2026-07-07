package jobfinder;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

public class GenerateDummyCv {
    public static void main(String[] args) {
        try {
            PDDocument document = new PDDocument();
            PDPage page = new PDPage();
            document.addPage(page);

            PDPageContentStream contentStream = new PDPageContentStream(document, page);
            contentStream.beginText();
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 18);
            contentStream.newLineAtOffset(50, 700);
            contentStream.showText("Ahmed Mohamed - Software Engineer");
            
            contentStream.setFont(PDType1Font.HELVETICA, 12);
            contentStream.newLineAtOffset(0, -25);
            contentStream.showText("Email: ahmed@example.com | Phone: +201001234567 | Cairo, Egypt");

            contentStream.newLineAtOffset(0, -40);
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
            contentStream.showText("Professional Summary");
            contentStream.setFont(PDType1Font.HELVETICA, 12);
            contentStream.newLineAtOffset(0, -20);
            contentStream.showText("Experienced backend developer specializing in Java and Spring Boot.");
            contentStream.newLineAtOffset(0, -15);
            contentStream.showText("Passionate about building high-performance APIs and AI Integrations.");

            contentStream.newLineAtOffset(0, -40);
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
            contentStream.showText("Skills");
            contentStream.setFont(PDType1Font.HELVETICA, 12);
            contentStream.newLineAtOffset(0, -20);
            contentStream.showText("Java, Spring Boot, SQL, REST APIs, Microservices, React, Next.js");

            contentStream.newLineAtOffset(0, -40);
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
            contentStream.showText("Work Experience");
            contentStream.setFont(PDType1Font.HELVETICA, 12);
            contentStream.newLineAtOffset(0, -20);
            contentStream.showText("Backend Developer | Tech Solutions Inc. | Jan 2021 - Present");
            contentStream.newLineAtOffset(0, -15);
            contentStream.showText(" - Developed scalable APIs using Spring Boot and Hibernate.");
            contentStream.newLineAtOffset(0, -15);
            contentStream.showText(" - Integrated third-party Gemini AI services using WebClient.");

            contentStream.newLineAtOffset(0, -40);
            contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
            contentStream.showText("Education");
            contentStream.setFont(PDType1Font.HELVETICA, 12);
            contentStream.newLineAtOffset(0, -20);
            contentStream.showText("Bachelor Degree in Computer Science | Cairo University | 2016 - 2020");

            contentStream.endText();
            contentStream.close();

            String path = System.getProperty("user.home") + "/Desktop/Dummy_CV_Ahmed.pdf";
            document.save(path);
            document.close();
            System.out.println("✅ Created Dummy CV at: " + path);
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
