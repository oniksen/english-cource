# English Course Platform

Веб-платформа для отслеживания прогресса изучения английского языка.

## Tech Stack

- **Runtime**: Node.js
- **Database**: Supabase (Postgres)
- **Deployment**: Vercel
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage

## Project Structure

```
/
├── src/
│   ├── app/          # Next.js App Router pages
│   ├── components/   # React components
│   ├── lib/          # Shared utilities, API clients
│   └── styles/       # Global styles
├── supabase/
│   └── migrations/   # Database migrations
├── public/           # Static assets
├── data/             # Local SQLite for development
└── .opencode/        # OpenCode configuration
```

## Conventions

- TypeScript strict mode
- Use Supabase MCP tools for database operations
- Generate TypeScript types from Supabase schema
- Tests follow RED-GREEN-REFACTOR from superpowers TDD
- All new features start with brainstorming skill

## MCP Servers Available

| Server    | Purpose                                    |
|-----------|--------------------------------------------|
| Supabase  | Database, auth, storage, edge functions    |
| Vercel    | Deployments, projects, logs                |
| SQLite    | Local dev database                         |
| Memory    | Knowledge graph for session context        |
| Magic UI  | UI component search and install            |
| GitHub    | Repository management, PRs, issues         |
