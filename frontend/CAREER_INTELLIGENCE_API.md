# Career Intelligence Hub - Backend Integration Guide

## 📋 Overview
The **Career Intelligence Hub** is a premium feature in the profile page that provides AI-powered career insights and recommendations to users. This document outlines the backend API requirements to make it fully functional.

## 🎯 Feature Components

### 1. **Profile Score** (0-100%)
**Current Frontend Logic:**
- Bio completeness (25%)
- Years of experience (25%)
- Number of skills (25%)
- Expected salary filled (25%)

**Recommended Backend Enhancement:**
```
GET /api/profile/analytics/score

Response:
{
  "profileScore": 85,
  "components": {
    "bio": 25,
    "experience": 25,
    "skills": 20,
    "salary": 15
  },
  "recommendations": ["Add 2 more skills", "Update your bio"]
}
```

---

### 2. **Market Position Analysis**
**Current Frontend Logic:**
- Maps years of experience to career levels:
  - Entry-Level: 0-2 years
  - Mid-Level: 3-5 years
  - Senior: 6-9 years
  - Lead/Architect: 10+ years

**Recommended Backend Enhancement:**
```
GET /api/profile/analytics/market-position

Response:
{
  "currentLevel": "Mid-Level",
  "percentileRank": 68,
  "competitorCount": 4250,
  "marketDemand": "HIGH",
  "avgSalaryRange": {
    "min": 50000,
    "max": 80000,
    "currency": "EGP"
  }
}
```

---

### 3. **Skill Gap Analysis**
**Current Frontend Logic:**
- Checks if skills count < 5
- Checks if experience < 3 years and entry-level
- Checks if bio is empty

**Recommended Backend Enhancement:**
```
GET /api/profile/analytics/skill-gaps

Response:
{
  "gaps": [
    {
      "skill": "Kubernetes",
      "priority": "HIGH",
      "reason": "2/4 similar profiles have it",
      "jobOpportunities": 156
    },
    {
      "skill": "Python",
      "priority": "MEDIUM",
      "reason": "Trending in your field",
      "jobOpportunities": 89
    }
  ],
  "topMissingSkills": ["TypeScript", "AWS", "Docker"]
}
```

---

### 4. **Recommended Next Role**
**Current Frontend Logic:**
- Suggests career progression based on level

**Recommended Backend Enhancement:**
```
GET /api/profile/analytics/next-role

Response:
{
  "recommendedRole": "Senior Full-Stack Developer",
  "requiredExperience": "5+ years",
  "requiredSkills": ["React", "Node.js", "AWS", "PostgreSQL"],
  "suggestedSkillsToLearn": ["TypeScript", "Docker", "Kubernetes"],
  "similarRoles": [
    {
      "title": "Tech Lead",
      "demand": "HIGH",
      "avgSalary": 120000
    }
  ],
  "timelineMonths": 12
}
```

---

### 5. **Salary Potential Estimation**
**Current Frontend Logic:**
- Base salary × 1.2 (if 5+ skills)
- Base salary × 1.15 (if 5+ years experience)
- Base salary × 1.05 (if bio completed)

**Recommended Backend Enhancement:**
```
GET /api/profile/analytics/salary-potential

Response:
{
  "currentExpectedSalary": 75000,
  "potentialSalary": 95000,
  "potentialIncrease": 26.7,
  "factors": {
    "experience": 15000,
    "skills": 8000,
    "completeness": 2000
  },
  "benchmarks": {
    "role": "Mid-Level Developer",
    "median": 85000,
    "percentile90": 110000,
    "yourPercentile": 68
  }
}
```

---

### 6. **Career Insights & Recommendations**
**Current Frontend Logic:**
- Static recommendations based on profile completion

**Recommended Backend Enhancement:**
```
GET /api/profile/analytics/insights

Response:
{
  "insights": [
    {
      "id": "profile-strengths",
      "title": "Profile Strengths",
      "description": "Your tech stack aligns well with market demand for Full-Stack roles",
      "strength": "HIGH",
      "actionable": false
    },
    {
      "id": "target-roles",
      "title": "Target Roles",
      "description": "Based on your profile, you match 78% with Senior Developer roles",
      "matchPercentage": 78,
      "jobCount": 234,
      "actionable": true
    },
    {
      "id": "salary-benchmarking",
      "title": "Salary Benchmarking",
      "description": "Your expected salary is 12% above market median for your level",
      "comparison": "12% above median",
      "actionable": false
    },
    {
      "id": "certification-suggestions",
      "title": "Certification Suggestions",
      "description": "AWS Certified Solutions Architect is held by 45% of Senior Developers",
      "certifications": [
        {
          "name": "AWS Solutions Architect",
          "adoption": 45,
          "salaryBoost": 15000
        }
      ],
      "actionable": true
    }
  ]
}
```

---

## 🔄 Data Flow

```
┌─────────────────┐
│  User Profile   │
└────────┬────────┘
         │
         ▼
┌────────────────────────────┐
│ Trigger Analytics Pipeline │
└────────┬───────────────────┘
         │
         ├─► GET /api/profile/analytics/score
         ├─► GET /api/profile/analytics/market-position
         ├─► GET /api/profile/analytics/skill-gaps
         ├─► GET /api/profile/analytics/next-role
         ├─► GET /api/profile/analytics/salary-potential
         └─► GET /api/profile/analytics/insights
         │
         ▼
┌──────────────────────────────┐
│ CareerIntelligenceHub Display│
└──────────────────────────────┘
```

---

## 📡 Frontend Integration Points

### CareerIntelligenceHub Component
**Location:** `frontend/src/components/profile/career-intelligence-hub.tsx`

**Props:**
```typescript
interface CareerIntelligenceProps {
  profile: UserProfileResponse;
  isLoading?: boolean;
}
```

**Current Implementation:** Uses mock calculations
**Ready for Backend:** Add API calls in `useMemo` hook

### Suggested Hook for Backend Integration
```typescript
// Hook to fetch career analytics
export const useCareerAnalytics = (userId?: string) => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    const fetchAnalytics = async () => {
      try {
        const response = await Promise.all([
          apiClient.get(`/profile/analytics/score`),
          apiClient.get(`/profile/analytics/market-position`),
          apiClient.get(`/profile/analytics/skill-gaps`),
          apiClient.get(`/profile/analytics/next-role`),
          apiClient.get(`/profile/analytics/salary-potential`),
          apiClient.get(`/profile/analytics/insights`),
        ]);
        
        // Combine responses
        const combined = {
          score: response[0].data,
          position: response[1].data,
          gaps: response[2].data,
          nextRole: response[3].data,
          salary: response[4].data,
          insights: response[5].data,
        };
        
        setAnalytics(combined);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch analytics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId]);

  return { analytics, isLoading, error };
};
```

---

## 🔐 Security Considerations

1. **User Authorization**: Ensure `/api/profile/analytics/*` endpoints are protected
2. **Data Privacy**: Don't expose other users' salary or benchmarks without consent
3. **Rate Limiting**: Analytics calculations are heavy; implement caching
4. **Input Validation**: Validate user profile data before sending to analytics engine

---

## 🚀 Deployment Checklist

- [ ] Backend analytics endpoints implemented
- [ ] Database schema supports analytics storage
- [ ] Caching strategy for heavy calculations (Redis recommended)
- [ ] API documentation updated
- [ ] Frontend API integration complete
- [ ] Error handling & loading states tested
- [ ] Performance tested with 10K+ user profiles
- [ ] Analytics data validation in backend

---

## 📝 Notes for Backend Developer

- **Frontend is ready**: No blocking issues; component handles loading/error states
- **Mock calculations work**: Users can see insights immediately without backend
- **Easy to upgrade**: Replace `useMemo` calculations with API calls
- **Schema independent**: Current logic doesn't enforce specific database structure

---

## 🎯 Future Enhancements

1. **Historical Tracking**: Store monthly snapshots of career analytics
2. **Predictive Analytics**: Use ML to predict salary growth trajectory
3. **Peer Comparison**: Allow users to opt-in to anonymous peer benchmarking
4. **Job Match Engine**: Real-time matching based on profile analytics
5. **Notification System**: Alert users when new opportunities match their profile


