# 📚 Radha Study Hall – AI Operations & Daily Reporting Automation

An intelligent, full-stack operational command system and AI assistant for **Radha Study Hall**. Admins simply chat with the AI assistant throughout the day with natural language updates (admissions, fee collections, shift attendance, or maintenance complaints). The system parses and stores the information in an Excel workbook (`.xlsx`) and synchronizes with Google Spreadsheets, compiling an automated daily report for WhatsApp delivery every evening at 8:00 PM IST.

---

## 🌟 Key Highlights

- 🤖 **Conversational AI Admin Assistant:** Understands natural updates like *"Today 5 new students joined"*, *"Collected ₹12,500 from 12 students"*, or *"Correction, today's admission count is 6, not 5"*.
- 📊 **Excel Database (`study_hall_database.xlsx`):** No complex SQL database servers required. Multi-tab persistent workbook storing Admissions, Fee Collections, Shift Attendance, Repairs, and Daily Reports.
- 📑 **Google Spreadsheet Sync & In-Sheet Approval:** Connects with the shared Google Sheet with an interactive `[x] Approve Report` checkbox and custom menu (`⚡ Radha Study Hall > Approve & Send to WhatsApp`).
- ⏰ **Automated 8:00 PM WhatsApp Reports:** Generates structured WhatsApp summaries automatically every evening with fallback dispatch at 8:15 PM.
- 📱 **Mobile & Tablet Optimized (PWA):** Beautiful, clean Scandinavian/Linear-style UI with frosted-glass navigation, installable as a native app on iOS, Android, and tablets.
- 🎨 **Bot Report Training Studio:** Customize report layouts, greetings, and dynamic `{TAGS}` with real-time WhatsApp simulation.

---

## 🏗️ Architecture

```
Radha Study Hall System Architecture
├── Frontend (React 18 + Vite + Tailwind CSS + Lucide Icons + PWA)
│   ├── Port: 5173
│   ├── Mobile Bottom Navigation & Responsive Layout
│   ├── AI Chat Widget with real-time entity pills
│   ├── Executive Dashboard with 4 KPI cards & WhatsApp preview
│   └── Google Spreadsheet Approval Modal
│
└── Backend (Java 21/25 + Spring Boot 3.3.5)
    ├── Port: 8080
    ├── AiExtractionService: NLP & regex entity parsing
    ├── ExcelDatabaseService: Apache POI read/write on study_hall_database.xlsx
    ├── DailyReportScheduler: Scheduled 8:00 PM draft & 8:15 PM reminder
    └── GoogleSheetsSyncService: Webhook & Apps Script bridge
```

---

## 🚀 Getting Started

### Prerequisites
- **Java 21+** (OpenJDK)
- **Node.js 18+** & `npm`
- **Maven** (included via `./mvnw`)

### 1. Start Spring Boot Backend
```bash
cd backend
./mvnw spring-boot:run
```
*API running on `http://localhost:8080`*

### 2. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend running on `http://localhost:5173`*

---

## 📲 WhatsApp & Google Sheet Setup

1. Open your shared Google Spreadsheet.
2. Go to **Extensions > Apps Script** and paste the script provided in the app dashboard (`Google Sheet Sync` modal).
3. Click **Run > setupSheet**.
4. Check the **Approve Report** box in cell `B26` to stamp `APPROVED ✅` and launch WhatsApp with the pre-filled report!

---

## 📄 License
MIT License. Built for Radha Study Hall.
