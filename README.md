[![Supabase](https://img.shields.io/badge/Backend-Supabase-blue.svg)](https://supabase.com)

# Desk Control

**Desk Control** is a web platform for managing shifts and absence requests within Service Desk teams, featuring role-based approval flows (Analyst, Lead, Admin).


## 🔑 Key Features

- **Authentication & Roles**: Support for Analyst, Lead, and optional Admin accounts.
- **Analyst Dashboard**: View assigned shifts, pending tickets, and absence requests with statuses.
- **Lead Dashboard**: Approve or reject absence requests, assign shifts, and delegate tasks to Analysts.
- **Absence Request Form**: Create and track leave requests with Lead comments.
- **Collaborative Calendar**: Display approved absences and shifts in a shared calendar view.
- **Task Assignment**: Leads can assign courses or tasks; Analysts can mark them as completed.
- **Real-time Integration**: Powered by Supabase for database, authentication, and real-time updates.

---

## 🛠 Technology Stack

| Layer    | Technology                                            |
| -------- | ----------------------------------------------------- |
| Frontend | React · TypeScript · Vite · Tailwind CSS · shadcn/ui    |
| Backend  | Supabase (PostgreSQL · Auth · Realtime)               |
| Tooling  | Git · ESLint · PostCSS · Bun/Vite                       |

---

## 🔧 Prerequisites

- **Node.js** v18+ or **Bun**
- A **Supabase** account and a configured project
- A package manager: `npm`, `yarn`, or `bun`

---

## 🚀 Installation & Setup

1.  **Clone the repository**

    *REMEMBER to replace `your-username` with your actual GitHub username.*

    ```bash
    git clone [https://github.com/your-username/desk-control.git](https://github.com/your-username/desk-control.git)
    cd desk-control
    ```

2.  **Install dependencies**

    Use your preferred package manager:
    ```bash
    # With npm
    npm install

    # Or with Bun
    bun install
    ```

3.  **Configure environment variables**

    Create a `.env` file in the root of the project and add your Supabase project credentials. You can find these in your Supabase project's dashboard under `Project Settings > API`.

    ```env
    VITE_SUPABASE_URL="your_supabase_url"
    VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
    ```

4.  **Apply database migrations**

    If you are using the Supabase CLI for local development, push the database schema:
    ```bash
    supabase db push
    ```

---

## 📜 Available Scripts

-   `npm run dev`: Starts the development server using Vite.
-   `npm run build`: Creates a production-ready build of the application.
-   `npm run preview`: Serves the production build locally for previewing.
-   `supabase start`: Starts the local Supabase emulation for testing purposes.

---

## 📂 Project Structure

```plaintext
desk-control/
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── components/       # UI & form components
│   ├── pages/            # Route components: Auth, Dashboard, Settings, etc.
│   ├── integrations/     # Supabase client & types
│   ├── lib/              # Shared utilities
│   ├── App.tsx           # Main application component
│   └── main.tsx          # React & Tailwind bootstrap
├── supabase/
│   ├── config.toml       # Supabase CLI config
│   └── migrations/       # SQL migration files
├── .env                  # Environment variables (ignored by git)
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
