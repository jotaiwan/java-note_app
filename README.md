# Note App

A note management web application.  
**Backend:** Java 21 · Spring Boot 3.2 · Maven · JPA · PostgreSQL  
**Frontend:** React · JavaScript · npm  
**Infrastructure:** Docker · nginx · Docker Compose

## Quick Start

```bash
# Local dev (hot reload)
./lup.sh       # starts Spring Boot (port 5099) + React dev server
./ldown.sh     # stop

# Docker (production-like)
docker-compose up --build
```

- App: http://localhost:5000
- Backend API: http://localhost:5099

## Documentation

| Document | Description |
|----------|-------------|
| [docs/INSTALLATION.md](docs/INSTALLATION.md) | Prerequisites, environment config, PostgreSQL setup |
| [docs/USER_GUIDE.md](docs/USER_GUIDE.md) | How to run, build, test, develop, troubleshoot |
