# Note App

A note management web application.  
**Backend:** Java 21 · Spring Boot 3.2 · Maven · JPA · PostgreSQL  
**Frontend:** React · JavaScript · npm  
**Infrastructure:** Docker · nginx · Docker Compose

---

## What it does

- Create, edit, and organize notes with attachments and images
- Project/tag-based grouping and filtering
- Stock ticker widget (Alpaca Markets + Finnhub fallback)
- Credential-backed integrations via `credentials.json`

---

## Quick Start

```bash
git clone https://github.com/yourname/note-app.git
cd note-app

cp .env.template .env   # then fill in DB_PASSWORD & SITES_CONFIGS_CREDENTIALS

./lup.sh                # starts Spring Boot (5099) + frontend (5000 via nginx)
```

**Local dev:**
- Frontend: http://localhost:5000
- Backend API → http://localhost:5099

**Docker (nginx):**
- App (nginx serves React + proxies API) → http://localhost:5000
- Backend API → http://localhost:5099

---

## Documentation

| Document | 文件 | Description |
|----------|------|-------------|
| [INSTALLATION.md](INSTALLATION.md) | 安裝與設置 | Prerequisites, environment config, PostgreSQL setup |
| [USER_GUIDE.md](USER_GUIDE.md) | 使用指南 | How to run, build, test, develop, troubleshoot |

---

## Project Structure

```
note-app/
├── src/main/java/com/noteapp/
│   ├── controller/     REST API controllers
│   ├── service/        Business logic
│   ├── entity/         JPA entities
│   ├── repository/     Spring Data JPA
│   ├── dto/            Data Transfer Objects
│   └── config/         Spring configuration
├── src/main/resources/
│   ├── application.properties
│   ├── application-dev.properties
│   └── application-docker.properties
├── frontend/src/       React frontend
├── pom.xml             Maven build
├── Dockerfile          Backend image
├── nginx.Dockerfile    Nginx image
├── docker-compose.yml  Full Docker stack
├── lup.sh              Start local dev
├── ldown.sh            Stop local dev
└── docs/               Documentation (you are here)
```

---

---

# Note App（中文）

筆記管理 Web 應用程序。  
**後端：** Java 21 · Spring Boot 3.2 · Maven · JPA · PostgreSQL  
**前端：** React · JavaScript · npm  
**基礎設施：** Docker · nginx · Docker Compose

---

## 功能概覽

- 創建、編輯和組織筆記，支持附件和圖片
- 基於項目/標籤的分組和過濾
- 股票代碼小工具（Alpaca Markets + Finnhub 備用）
- 通過 `credentials.json` 支持憑據整合

---

## 快速開始

```bash
git clone https://github.com/yourname/note-app.git
cd note-app

cp .env.template .env   # 填寫 DB_PASSWORD 和 SITES_CONFIGS_CREDENTIALS

./lup.sh                # 啟動 Spring Boot（5099）+ 前端（5000 via nginx）
```

**本地開發：**
- 前端：http://localhost:5000
- 後端 API → http://localhost:5099

**Docker（nginx）：**
- 應用（nginx 提供 React + 代理 API）→ http://localhost:5000
- 後端 API → http://localhost:5099

---

## 文檔

| 文件 | 說明 |
|------|------|
| [INSTALLATION.md](INSTALLATION.md) | 系統要求、環境配置、PostgreSQL 設置 |
| [USER_GUIDE.md](USER_GUIDE.md) | 如何運行、構建、測試、開發、故障排除 |
