# Posterr - Social Media Application

A Twitter-like social media platform built as a Technical Assessment. Users can create posts, repost content, search, and browse a feed with infinite scrolling.

## Technology Stack

### Backend
- **Framework**: ASP.NET Core (.NET 10) Web API
- **Database**: SQL Server 2022
- **ORM**: Entity Framework Core
- **API Docs**: Swagger/OpenAPI
- **Architecture**: Clean Architecture (Core, Infrastructure, Api layers)

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Custom CSS (dark theme)

### Infrastructure
- **Database**: Docker container (SQL Server)
- **Containerization**: Docker Compose for full-stack deployment
- **Testing**: xUnit with Moq

## Prerequisites

- **Docker** and **Docker Compose**
- **Node.js** (v20+) - for local frontend development
- **.NET 10 SDK** - for local backend development

## Quick Start (Docker)

### 1. Clone and Run

```bash
git clone <repository-url>
cd posterr
docker compose up --build
```

This starts:
- **SQL Server** on port 1433
- **Backend API** on port 5000
- **Frontend** on port 3000

### 2. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Swagger Docs**: http://localhost:5000/swagger

The database is automatically seeded with 4 demo users:
- `alice_johnson` (default)
- `john_doe`
- `jane_smith`
- `bob_wilson`

## Local Development (Without Docker for App)

### 1. Start SQL Server in Docker

```bash
docker compose up sqlserver
```

### 2. Run the Backend

```bash
cd src/Posterr.Api
dotnet run
```

The backend starts on http://localhost:5000 and automatically runs migrations and seeds the database.

### 3. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on http://localhost:5173 by default.

## API Reference

### Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/posts` | Get paginated posts |
| `POST` | `/api/posts` | Create a new post |
| `POST` | `/api/posts/:id/repost` | Repost an existing post |

**Query Parameters for GET /api/posts:**
- `page` (int, default: 1)
- `limit` (int, default: 15)
- `sort` (string: "latest" or "trending", default: "latest")
- `search` (string, optional)

**Headers:**
- `Content-Type: application/json`
- `X-User-ID: <user-guid>` (required for POST requests)

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | Get all users |

## Business Rules

1. **Daily Post Limit**: Maximum 5 posts per user per day (including reposts)
2. **Character Limit**: Posts have a maximum of 777 characters
3. **Repost Rules**:
   - Only original posts can be reposted (not reposts)
   - Users cannot repost their own posts
   - Users cannot repost the same post twice
   - Users must confirm before reposting
4. **Search**: Only searches original posts (not reposts), exact keyword match
5. **Sorting**: "Latest" (by creation date desc) or "Trending" (by repost count desc)
6. **Pagination**: Initial load shows 15 posts, subsequent loads show 20 posts

## Running Tests

```bash
# From the root directory
dotnet test

# With verbose output
dotnet test --verbosity normal
```

Tests cover all business logic in the PostService including:
- Post creation (valid, empty, too long, daily limit)
- Reposting (valid, own post, repost of repost, duplicate, daily limit)
- Feed pagination

## Project Structure

```
posterr/
├── src/
│   ├── Posterr.Api/              # ASP.NET Core Web API
│   │   ├── Controllers/          # API endpoints
│   │   ├── Program.cs            # App configuration and DI
│   │   └── Dockerfile
│   ├── Posterr.Core/             # Domain layer (no dependencies)
│   │   ├── Entities/             # User, Post models
│   │   ├── DTOs/                 # Data transfer objects
│   │   ├── Interfaces/           # Repository & service contracts
│   │   └── Services/             # Business logic (PostService)
│   └── Posterr.Infrastructure/   # Data access layer
│       ├── Data/                 # DbContext, migrations, seeder
│       └── Repositories/         # EF Core repository implementations
├── tests/
│   └── Posterr.Tests/            # Unit tests (xUnit + Moq)
├── frontend/                     # React + TypeScript SPA
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── contexts/             # UserContext (state management)
│   │   ├── services/             # API client
│   │   └── types/                # TypeScript interfaces
│   └── Dockerfile
├── docker-compose.yml
└── Posterr.sln
```

## Architecture Decisions

- **Clean Architecture**: Core layer has zero dependencies, Infrastructure implements data access, API handles HTTP concerns. This makes the business logic testable in isolation.
- **Repository Pattern**: Database operations are separated from business logic (PostRepository, UserRepository), addressing the concern of "database operations handled at the use-case level."
- **Users from API**: User data comes from the database via the API, not hardcoded IDs in the frontend.
- **Early Return Pattern**: Used throughout to avoid nested conditionals and improve readability.

---

## Critique

### What I'd Improve With More Time

**Auth**: Right now users are identified via a `X-User-ID` header, which is obviously not production-ready. JWT with refresh tokens or an identity provider (Auth0, Azure AD) would be the next step.

**Real-time feed**: The feed requires a page refresh to see new posts. SignalR would solve this — live updates when new posts come in, notifications on reposts, etc.

**Better search**: Search is just `LIKE` queries right now. SQL Server has built-in Full-Text Search that handles stemming and relevance ranking, which would make the experience much better.

**Frontend tests**: No component tests yet. React Testing Library + Vitest would cover the main user flows (creating posts, reposting, error states).

**Integration tests**: Only unit tests exist. `WebApplicationFactory` would let me test the full API pipeline end-to-end against a real database.

**Observability**: Structured logging (Serilog), health checks, and APM integration (Application Insights or Datadog) for production monitoring.

### Scaling

The **database** would be the first bottleneck. The "trending" sort counts reposts across all posts, and `OFFSET/FETCH` pagination gets slower as data grows.

How I'd tackle it:

1. **Query optimization first** — switch to cursor-based pagination (keyset using `CreatedAt` + `Id`), materialize `RepostCount` as a column instead of counting via joins, and add Redis caching for hot data like the trending feed.

2. **Scale the API horizontally** — the stateless design already supports this. Add distributed caching with Redis and move rate limiting to an API gateway.

3. **Database scaling** — read replicas for feed queries, table partitioning by date on Posts, and potentially Elasticsearch for search to take that load off SQL Server.

4. **Bigger architectural changes** (only if needed) — message queue for async processing, CQRS to separate reads/writes, and microservices only when the monolith actually becomes a deployment bottleneck for the team.
