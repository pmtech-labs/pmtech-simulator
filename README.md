# PMP Master Pro

Simulador examen PMP: 
RESUMEN: Build a modern, high-fidelity PMP Exam Simulator Web App tailored for Spain and LATAM professionals. It must have a clean, premium B2B SaaS aesthetic (similar to Linear or modern Duolingo for executives) using Tailwind CSS and Lucide icons. 

The interface language must be in neutral Spanish.

Create the following layout and views using robust mock data for a seamless interactive experience:

1. DASHBOARD / HOME (Student Portal):

- Header with user profile, license tier badge ("Licencia Premium - 6 meses restantes") and a clean navigation sidebar.

- Welcome banner with current overall readiness score (e.g., 68%) and progress metrics (exams taken, hours trained).

- Main actions: "Iniciar Simulación Real (180 preguntas)", "Práctica por Dominios (Personas, Procesos, Entorno Business)", and "Ver Historial de Exámenes".

2. DYNAMIC EXAM INTERACTION INTERFACE (The Core Engine):

- Top bar showing Exam Progress (e.g., Pregunta 14 de 180), Time Remaining Countdown Clock, and a "Pausar" / "Finalizar" button.

- Sidebar for rapid question navigation (a grid of numbers showing skipped, answered, and flagged-for-review questions).

- Main workspace that dynamically renders 3 modern PMI question formats based on selected questions:

  * Format A (Case Study split view): Left side shows an interactive financial/textual corporate scenario with an interactive SVG chart (Earned Value graph). Right side shows a multiple-choice question (A, B, C, D) based on that scenario.

  * Format B (Drag and Drop): Interactive card matching. Left column has 4 Risk Scenarios, right column has 4 Agile/Predictive responses. User can drag and match them.

  * Format C (Situational Choice with Flag): Standard complex situational question text with a toggle button to "Marcar para revisión" (Flag).

3. REAL-TIME REVIEW & EXPLANATION MODAL / VIEW:

- When a user submits an answer in practice mode or reviews a finished exam, show an in-depth breakdown.

- Highlight the correct option in green and incorrect ones in red.

- Include a comprehensive "Explicación Detallada" section dividing: "Por qué es correcta la opción elegida" and "Por qué los distractores A, B o C son incorrectos según el PMBOK", ensuring deep strategic learning.

4. USER PROFILE & SUBSCRIPTION SETTINGS:

- Simple settings tab showing account info, exam statistics by domain (People, Process, Business Environment), and license status (Active 3-month basic or 6-month premium) with a simulated checkout option.

Make the UI fully responsive (mobile-friendly for studying on the go), highly polished, and use state management for simulated answers so the user can actually click, drag, and complete a mini-exam of 5 mock questions to test the flow.

Si algo de esto es contradictorio con lo que aparece en los documentos anexos de diseño, prevalece lo dicho en los documentos

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d0275307-0103-456f-ac7b-4d46680a4894).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
