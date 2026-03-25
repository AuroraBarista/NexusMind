# Seedflux (formerly NexusMind) 

> **Not an assistant. An execution engine.**

Seedflux is an authoritative, high-fidelity AI incubator and second brain designed to relentlessly push your ideas into reality. It shifts the paradigm from passive note-taking to an **Execution Push** philosophy: capturing raw inspiration globally, automatically connecting the dots, and forcing you to execute through systemic accountability.

Designed with a premium **"Midnight Luxe"** aesthetic—heavily inspired by Apple and Linear—Seedflux operates as a sleek, professional digital instrument.

---

## 🔥 Core Philosophy: The Momentum Loop

1. **Unconscious Capture**: Dump any raw idea, PDF, image, or web link via the web app or Chrome Extension.
2. **AI Gap Analysis (The Architect)**: Seedflux uses **`gpt-5.4`** to analyze your project, identify missing links (gaps), and suggest what evidence you need next.
3. **Execution Push**: The system is designed to combat procrastination through structural accountability—forcing micro-tasks, demanding daily interrogations, and decaying momentum on neglected projects.
4. **Synthesis**: Generate cohesive artifacts, documents, and architectures from your aggregated intelligence.

---

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 18)
- **Styling & UI**: Tailwind CSS, Vanilla styling, Custom Glassmorphism, and [GSAP](https://gsap.com/) for fluid, weighted micro-animations (`#0a0a0a` Midnight Luxe theme).
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage).
- **AI Engine**: 
  - **OpenAI `gpt-5.4`**: High-logic architectural reasoning and system gap analysis.
  - **OpenAI `gpt-5.4-mini`**: High-volume, low-latency parsing (Global Capture tagging, Chatbot interactions, Daily Briefings).
- **Icons**: Lucide React.
- **Chrome Extension**: Vanilla JS/HTML/CSS Manifest V3 extension explicitly designed for hyper-fast global capture.

---

## 💻 Features

- **The Command Palette (Capture Bar)**: A focused, spotlight-driven Omni-input for URLs, freeform text, and file drops.
- **Dynamic Project Matrix**: A dashboard mapped to your real-world progress (Academic, Creative, Work), bypassing traditional folder structures.
- **The Architect Window**: A persistent AI PM (Project Manager) that reviews your collected evidence and explicitly tells you what you are missing and what to do next.
- **Daily Briefings**: Curated top-level view of what demands your attention today, summarizing cross-project activity.

---

## 🚀 Getting Started

### 1. Environment Variables
Clone the repository and create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" # Required for webhook/backend overrides
OPENAI_API_KEY="sk-proj-your-key-here"
```

### 2. Database Setup (Supabase)
Ensure your Supabase PostgreSQL instance has the following tables available:
- `snippets`: (id, content, type, status, project_anchor, createdAt, file_url, summary, ai_tags, is_processed, embedding, user_id)
- `projects`: (id, name, description, user_id)
- `project_anchors`: (name, description)

*Make sure RLS (Row Level Security) is set up appropriately for your users.*

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Run the Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 4. Chrome Extension
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top right.
3. Click **Load unpacked** and select the `/nexus-extension` directory inside this repository.
4. Pin the extension to globally capture inspiration across the web.

---

## 🎨 Design System: "Midnight Luxe"
- **Primary Background**: Deep neutral black (`#0a0a0a`).
- **Cards/Containers**: Frosted dark (`#111` to `#151515`) with subtle `white/5` borders.
- **Typography**: Tracking-tight sans-serif, heavily reliant on contrast (pure white against mid-gray `.text-neutral-400`).
- **Accent/Glow**: Completely minimized. Eliminated legacy neon cyan/purple blurs in favor of structural clarity, hard contrasts, and crisp borders. 

---

*Seedflux — Turn potential energy into kinetic execution.*
