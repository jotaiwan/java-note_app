# INSTALLATION.md — Setup & Configuration

> **Languages / 語言：** [English](#english) · [中文](#中文)

---

<a name="english"></a>
# English

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Clone & Environment File](#clone--environment-file)
3. [Environment Variables](#environment-variables)
4. [PostgreSQL Setup](#postgresql-setup)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Java | 21+ | `java -version` |
| Maven | 3.8+ | `mvn -v` — or use included `./mvnw` (no install needed) |
| Node.js | LTS (18+) | `node -v` |
| npm | — | `npm -v` |
| Docker | 20.10+ | `docker --version` |
| Docker Compose | 1.29+ | `docker-compose --version` |
| PostgreSQL | 15 / 16 | local install required |

---

## Clone & Environment File

```bash
git clone https://github.com/yourname/note-app.git
cd note-app

cp .env.template .env
nano .env
```

---

## Environment Variables

Edit `.env` (used by `docker-compose.yml`) or `application-dev.properties` for local dev.

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `NOTE_APP_JDBC_DB_URL` | `jdbc:postgresql://localhost:5432/note` | | JDBC connection URL |
| `NOTE_APP_JDBC_DB_USER` | `dev` | | Database username |
| `NOTE_APP_JDBC_DB_PASSWORD` | — | ✅ | Database password |
| `SITES_CONFIGS_CREDENTIALS` | — | ✅ | Absolute path to `credentials.json` |

For local dev, these map to `src/main/resources/application-dev.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/note
spring.datasource.username=dev
spring.datasource.password=yourpassword
```

---

## PostgreSQL Setup

### Install

**Ubuntu:**
```bash
./postgres_ubuntu.sh
# or manually:
sudo apt install postgresql-16
```

**macOS:**
```bash
./postgres_macOs.sh
# or manually:
brew install postgresql@16
```

---

### Fix Authentication (if needed)

If you get `peer authentication failed`, edit `pg_hba.conf`:

```bash
sudo nano /etc/postgresql/16/main/pg_hba.conf
```

Find and replace:
```text
# Before
local   all   postgres   peer
local   all   all        peer

# After
local   all   postgres   scram-sha-256
local   all   all        scram-sha-256
```

Reload:
```bash
sudo systemctl reload postgresql@16-main
```

---

### Manage PostgreSQL Service

```bash
sudo systemctl status postgresql@16-main   # check status
sudo systemctl start  postgresql@16-main   # start
sudo systemctl reload postgresql@16-main   # reload config
```

---

### Create Database & Tables (first time)

Run the setup script — it creates the user, database, and all tables:

```bash
./db_setup.sh
```

By default uses user `dev` and database `note`. To use a different password:
```bash
DB_PASSWORD=mypassword ./db_setup.sh
```

To verify:
```bash
psql -U dev -d note -c "\dt"
```

---

### Backup & Restore

```bash
# Backup (pg_dump → note_backup.dump)
./db_setup.sh dump

# Restore (pg_restore ← note_backup.dump)
./db_setup.sh restore

# Custom file path
DUMP_FILE=/path/to/file.dump ./db_setup.sh dump
DUMP_FILE=/path/to/file.dump ./db_setup.sh restore
```

---

### Common psql Commands

```bash
psql -U dev -d note    # connect
\dt                    # list tables
\d notes               # describe table
\d note_attachments    # describe table
\c note                # switch database
\q                     # exit
```

---

## Troubleshooting

**"Port already in use"**
```bash
lsof -i :5099        # backend
lsof -i :5099        # frontend (nginx)
kill -9 $(lsof -ti :5099)
```

**"Database connection refused"**
- Check PostgreSQL is running: `sudo systemctl status postgresql@16-main`
- Verify credentials in `application-dev.properties`

**Java version wrong**
```bash
java -version        # must be 21+
export JAVA_HOME=/path/to/java21
```

**Maven build fails**
```bash
./mvnw clean package -DskipTests    # isolate build errors
```

**npm errors**
```bash
rm -rf frontend/node_modules
cd frontend && npm install
```

---
---

<a name="中文"></a>
# 中文

## 目錄
1. [系統要求](#系統要求)
2. [克隆與環境文件](#克隆與環境文件)
3. [環境變量](#環境變量)
4. [PostgreSQL 設置](#postgresql-設置)
5. [故障排除](#故障排除)

---

## 系統要求

| 工具 | 版本 | 備注 |
|------|------|------|
| Java | 21+ | `java -version` |
| Maven | 3.8+ | `mvn -v` — 或使用內附的 `./mvnw`（無需安裝）|
| Node.js | LTS (18+) | `node -v` |
| npm | — | `npm -v` |
| Docker | 20.10+ | `docker --version` |
| Docker Compose | 1.29+ | `docker-compose --version` |
| PostgreSQL | 15 / 16 | 需本地安裝 |

---

## 克隆與環境文件

```bash
git clone https://github.com/yourname/note-app.git
cd note-app

cp .env.template .env
nano .env
```

---

## 環境變量

編輯 `.env`（供 `docker-compose.yml` 使用）或編輯 `application-dev.properties`（本地開發）。

| 變量 | 默認值 | 必填 | 說明 |
|------|--------|------|------|
| `NOTE_APP_JDBC_DB_URL` | `jdbc:postgresql://localhost:5432/note` | | JDBC 連接 URL |
| `NOTE_APP_JDBC_DB_USER` | `dev` | | 數據庫用戶名 |
| `NOTE_APP_JDBC_DB_PASSWORD` | — | ✅ | 數據庫密碼 |
| `SITES_CONFIGS_CREDENTIALS` | — | ✅ | `credentials.json` 文件的絕對路徑 |

本地開發對應 `src/main/resources/application-dev.properties`：
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/note
spring.datasource.username=dev
spring.datasource.password=yourpassword
```

---

## PostgreSQL 設置

### 安裝

**Ubuntu：**
```bash
./postgres_ubuntu.sh
# 或手動安裝：
sudo apt install postgresql-16
```

**macOS：**
```bash
./postgres_macOs.sh
# 或手動安裝：
brew install postgresql@16
```

---

### 修復身份驗證（如有需要）

如果出現 `peer authentication failed`，編輯 `pg_hba.conf`：

```bash
sudo nano /etc/postgresql/16/main/pg_hba.conf
```

找到並替換：
```text
# 修改前
local   all   postgres   peer
local   all   all        peer

# 修改後
local   all   postgres   scram-sha-256
local   all   all        scram-sha-256
```

重新加載：
```bash
sudo systemctl reload postgresql@16-main
```

---

### 管理 PostgreSQL 服務

```bash
sudo systemctl status postgresql@16-main   # 查看狀態
sudo systemctl start  postgresql@16-main   # 啟動
sudo systemctl reload postgresql@16-main   # 重新加載配置
```

---

### 創建數據庫和數據表（首次）

運行安裝腳本 — 自動創建用戶、數據庫和所有數據表：

```bash
./db_setup.sh
```

默認使用用戶 `dev` 和數據庫 `note`。使用自定義密碼：
```bash
DB_PASSWORD=mypassword ./db_setup.sh
```

驗證：
```bash
psql -U dev -d note -c "\dt"
```

---

### 備份與還原

```bash
# 備份（pg_dump → note_backup.dump）
./db_setup.sh dump

# 還原（pg_restore ← note_backup.dump）
./db_setup.sh restore

# 自定義路徑
DUMP_FILE=/path/to/file.dump ./db_setup.sh dump
DUMP_FILE=/path/to/file.dump ./db_setup.sh restore
```

---

### 常用 psql 命令

```bash
psql -U dev -d note    # 連接
\dt                    # 列出所有表
\d notes               # 描述表結構
\d note_attachments    # 描述表結構
\c note                # 切換數據庫
\q                     # 退出
```

---

## 故障排除

**"端口已被佔用"**
```bash
lsof -i :5099        # 後端
lsof -i :5099        # 前端（nginx）
kill -9 $(lsof -ti :5099)
```

**"數據庫連接拒絕"**
- 確認 PostgreSQL 正在運行：`sudo systemctl status postgresql@16-main`
- 確認 `application-dev.properties` 中的憑據正確

**Java 版本錯誤**
```bash
java -version        # 必須是 21+
export JAVA_HOME=/path/to/java21
```

**Maven 構建失敗**
```bash
./mvnw clean package -DskipTests    # 隔離構建錯誤
```

**npm 錯誤**
```bash
rm -rf frontend/node_modules
cd frontend && npm install
```
