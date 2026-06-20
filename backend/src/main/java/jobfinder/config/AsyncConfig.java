package jobfinder.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("EmailThread-");

        // 👈 إعدادات الإغلاق الآمن للإنتاج (Graceful Shutdown)
        // إلزام السيرفر بانتظار المهام الشغالة في الخلفية حتى تنتهي تماماً قبل أن يقفل
        executor.setWaitForTasksToCompleteOnShutdown(true);
        // حد أقصى للانتظار (مثلاً 60 ثانية) عشان السيرفر ما يعلقش لو فيه بروسيس هنجت
        executor.setAwaitTerminationSeconds(60);

        executor.initialize();
        return executor;
    }
}