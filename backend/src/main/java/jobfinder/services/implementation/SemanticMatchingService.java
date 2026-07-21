package jobfinder.services.implementation;


import jobfinder.model.entity.JobEntity;
import jobfinder.model.entity.UserProfile;
import jobfinder.model.entity.UserSkill;
import jobfinder.repository.JobRepository;
import jobfinder.services.ServiceAi.GeminiEmbeddingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SemanticMatchingService {

    private final GeminiEmbeddingService geminiEmbeddingService;
    private final JobRepository jobRepository;

    // Generate embedding vector from input text
    public float[] generateEmbedding(String text) {
        return geminiEmbeddingService.generateEmbedding(text);
    }

    public List<JobEntity> getBestJobsForUser(UserProfile profile ){


        // Build one text from user job title and skills
        StringBuilder aggregatedText = new StringBuilder();

        // Add current job title if available
        if (profile.getCurrentJobTitle() != null && !profile.getCurrentJobTitle().isBlank()) {
            aggregatedText.append(profile.getCurrentJobTitle().trim()).append(" ");
        }

        if (profile.getUser() != null && profile.getUser().getSkills() != null) {
            for (UserSkill us : profile.getUser().getSkills()) {
                if (us != null && us.getSkill() != null && us.getSkill().getName() != null && !us.getSkill().getName().isBlank()) {
                    aggregatedText.append(us.getSkill().getName().trim()).append(" ");
                }
            }
        }

        String userData = aggregatedText.toString().trim();

        if (userData.isEmpty()) {
            return Collections.emptyList();
        }

        // 2. نبعت النص ده لـ جوجل عشان يرجعلنا طابور الأرقام (Vector)
        float[] userVectorArray = generateEmbedding(userData);

        if (userVectorArray == null || userVectorArray.length == 0) {
            return Collections.emptyList(); // لو حصل مشكلة مع جوجل نرجع لستة فاضية
        }

        // 3. الـ PostgreSQL بتحتاج الأرقام دي تكون على شكل String زي كده "[0.1, 0.2, ...]" عشان الـ Native Query يقرأها
        String userVectorString = Arrays.toString(userVectorArray).replaceAll("\\s+", "");

        // 4. نكلم الـ Repository يجيب أفضل 10 وظايف مناسبة للرقم ده
        return jobRepository.findTopMatchingJobs(userVectorString, 10);
    }
    /*

    UserProfile
      │
      ▼
جمع بيانات المستخدم
      │
      ▼
تحويلها إلى نص واحد
      │
      ▼
إرسال النص إلى Gemini
      │
      ▼
Gemini يرجع Vector
      │
      ▼
تحويل الـ Vector إلى String
      │
      ▼
JobRepository
      │
      ▼
PostgreSQL (pgvector)
      │
      ▼
أفضل 10 وظائف
      │
      ▼
Return List<JobEntity>
     */
}
