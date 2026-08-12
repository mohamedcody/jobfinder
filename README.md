<div align="center">
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/NextJS-Dark.svg" alt="Next.js" width="40" height="40"/>
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Spring-Dark.svg" alt="Spring Boot" width="40" height="40"/>
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/PostgreSQL-Dark.svg" alt="PostgreSQL" width="40" height="40"/>
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Docker.svg" alt="Docker" width="40" height="40"/>

  <h1 align="center">JobFinder PRO Platform</h1>

  <p align="center">
    <strong>An AI-powered, autonomous job aggregation and matching SaaS platform.</strong>
  </p>

  <p align="center">
    <a href="https://github.com/mohamedcody/jobfinder">
      <img src="https://img.shields.io/github/last-commit/mohamedcody/jobfinder?style=flat-square&color=3b82f6" alt="Last Commit">
    </a>
    <img src="https://img.shields.io/badge/Architecture-Microservices-8b5cf6?style=flat-square" alt="Architecture">
    <img src="https://img.shields.io/badge/AI-Gemini-10b981?style=flat-square" alt="AI Gemini">
  </p>
</div>

---

## 🚀 Overview

**JobFinder** acts as an intelligent career assistant. Candidates simply upload their CVs, and our system uses **Google Gemini AI** to build a rich profile. The platform autonomously scrapes external job boards daily (e.g., LinkedIn) via **Apify**, scores the jobs using an AI matching engine, and sends out curated daily email alerts for top matches.

Say goodbye to manual job hunting. Welcome to the future of recruitment.

---

## ✨ Key Features

- 🧠 **AI CV Parsing:** Upload your PDF resume and let Gemini AI automatically generate your full profile.
- 🤖 **Autonomous Scraping:** Scheduled workers search and pull jobs based on actual user demand using Apify.
- 🎯 **Smart Job Matching:** Advanced scoring algorithm comparing skills, experience, and location.
- 📧 **Automated Alerts:** Get the best job matches delivered directly to your inbox every morning.
- 🎨 **Premium UI/UX:** Built with Next.js App Router, Tailwind CSS v4, and Framer Motion for a fluid, physics-based motion experience.
- 🔒 **Secure Architecture:** JWT-based authentication, OTP verifications, and rate limiting with Spring Security.

---

## 🛠️ Technology Stack

### Frontend (User Interface)
* **Framework:** Next.js 16.2.6 (App Router)
* **Library:** React 19
* **Styling & UI:** Tailwind CSS v4, Radix UI, Framer Motion
* **Forms:** React Hook Form, Zod

### Backend (Core Logic)
* **Framework:** Spring Boot 3.5.10 (Java 17)
* **Database:** PostgreSQL (Spring Data JPA, Hibernate, Flyway)
* **Resilience:** Resilience4j Circuit Breaker
* **AI & Automation:** Google Gemini API, Apify (WebClient)

### Infrastructure & DevOps
* **Containerization:** Docker & Docker Compose
* **Reverse Proxy:** Nginx
* **Monitoring:** Prometheus, Grafana, Spring Boot Actuator

---

## 🏗️ Getting Started (Local Development)

### 1. Prerequisites
- Docker & Docker Compose
- Java 17+
- Node.js 18+

### 2. Environment Variables
You need to set up `.env` files for both frontend and backend based on the provided `.env.example`.
- Obtain a **Gemini API Key**.
- Obtain an **Apify API Token**.
- Configure PostgreSQL and SMTP credentials.

### 3. Run Infrastructure
To launch the entire stack (Database, Nginx, Prometheus, Grafana):
```bash
docker-compose up -d
```

### 4. Start Application
- **Backend:** Run the Spring Boot application (port `8080`).
- **Frontend:** 
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

---

## 📝 License
This project is proprietary and confidential. Unauthorized copying of this file, via any medium, is strictly prohibited.
