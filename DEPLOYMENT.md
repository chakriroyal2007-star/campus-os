# CampusOS Deployment & Operations Guide

## 1. Containerized Deployment via Docker Compose

CampusOS provides a turnkey `docker-compose.yml` defining the complete production stack:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: campusos
      POSTGRES_USER: campusos_user
      POSTGRES_PASSWORD: campusos_secure_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    restart: always
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/campusos
      SPRING_DATASOURCE_USERNAME: campusos_user
      SPRING_DATASOURCE_PASSWORD: campusos_secure_password
      SPRING_DATA_REDIS_HOST: redis

  frontend:
    build: ./frontend
    restart: always
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8080/api/v1
```

### Launch Production Stack:
```bash
docker compose up -d --build
```

---

## 2. Environment Variables Specification

See [`.env.example`](file:///Users/rahul/CAMPUS-OS/.env.example) for required configuration:
- `JWT_SECRET`: 64-character cryptographically secure key for token signing.
- `SPRING_DATASOURCE_URL`: PostgreSQL JDBC connection string.
- `OPENAI_API_KEY`: External AI LLM API key.
- `OLLAMA_BASE_URL`: Local model endpoint (defaults to `http://localhost:11434`).
- `S3_BUCKET_NAME`: Private object storage bucket name.

---

## 3. Database Backups & Maintenance

### Take a Backup:
```bash
docker compose exec postgres pg_dump -U campusos_user campusos > campusos_backup_$(date +%Y%m%d).sql
```

### Restore from Backup:
```bash
docker compose exec -T postgres psql -U campusos_user campusos < campusos_backup.sql
```
