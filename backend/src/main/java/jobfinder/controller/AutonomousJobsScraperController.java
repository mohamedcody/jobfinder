package jobfinder.controller;

import jobfinder.services.implementation.AutonomousJobScraperService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@Slf4j
@RestController
@RequestMapping("/api/v1/scraper") // مسار الـ API
@RequiredArgsConstructor
public class AutonomousJobsScraperController {

    private final AutonomousJobScraperService scraperService;

    @PostMapping("/trigger")
    public ResponseEntity<String> triggerScraperManually(@RequestParam String keyword) {
        log.info("🎯 Manual scrape triggered via API for keyword: {}", keyword);


        String result = scraperService.scrapeAndSaveAllInOne(keyword);

        return ResponseEntity.ok(result);
    }
}
