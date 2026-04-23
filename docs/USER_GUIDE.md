# USER_GUIDE.md — How to Run & Develop

> **Languages / 語言：** [English](#english) · [中文](#中文)

---

<a name="english"></a>
# English

## Table of Contents
1. [Start & Stop](#start--stop)
2. [Docker Stack](#docker-stack)
3. [Build](#build)
4. [Run Tests](#run-tests)
5. [Common Commands](#common-commands)
6. [Development Workflow](#development-workflow)
7. [Troubleshooting](#troubleshooting)

---

## Start & Stop

### Local Development (daily work)

```bash
./lup.sh      # starts Spring Boot (port 5099) + frontend (port 5000 via nginx)
./ldown.sh    # stops both
```

- Frontend: http://localhost:5000
- Backend API: http://localhost:5099
- `/api/*` requests are proxied to the backend automatically

**How `lup.sh` works:**
1. Runs `npm start` in `frontend/` (background)
2. Runs `./mvnw spring-boot:run` with `SPRING_PROFILES_ACTIVE=dev`

---

### Docker Stack (integration / production-like)

```bash
docker-compose up --build    # build images and start all containers
docker-compose down          # stop and remove containers
docker-compose down -v       # also remove volumes
```

**Services:**
```
backend   Spring Boot JAR   port 5099   network_mode: host
nginx     reverse proxy     port 5000   network_mode: host
                            (serves React static + proxies /api/* to :5099)
```

---

### Which to use?

| | `./lup.sh` (local) | `docker-compose` |
|---|---|---|
| Hot reload | ✅ | ❌ |
| Speed | Fast | Slower (build) |
| Needs Java + Node locally | ✅ | ❌ |
| Production-like | ❌ | ✅ |
| **App URL** | http://localhost:5000 | http://localhost:5000 |
| **API URL** | http://localhost:5099 | http://localhost:5099 |
| **Use for** | Daily coding | Integration testing |

---

## Docker Stack

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f nginx

# Rebuild without cache
docker-compose build --no-cache

# Restart a service
docker-compose restart backend

# Shell into container
docker exec -it note_backend bash
```

---

## Build

### Backend (Maven)

```bash
./mvnw clean package              # build JAR (runs tests)
./mvnw clean package -DskipTests  # build JAR (skip tests)
./mvnw clean                      # clean build output
./mvnw dependency:tree            # inspect dependencies
```

Output JAR: `target/note-app-*.jar`

### Frontend (npm)

```bash
cd frontend
npm install        # install dependencies
npm run build      # production build → frontend/build/
npm start          # dev server (React, on port 5000)
```

---

## Run Tests

### Backend (JUnit 5)

```bash
./mvnw test                                      # all tests
./mvnw test -Dtest=NoteServiceTest               # one class
./mvnw test -Dtest=NoteServiceTest#testCreate    # one method
./mvnw test -Dsurefire.useFile=false             # verbose output
```

Test files: `src/test/java/com/noteapp/`

### Frontend (Jest)

```bash
cd frontend
npm test                    # run tests (watch mode)
npm test -- --watchAll=false  # run once (CI mode)
npm test -- --coverage      # with coverage report
```

---

## Common Commands

### Spring Boot

```bash
./mvnw spring-boot:run                            # run locally
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run # explicit profile
```

### Profiles

| Profile | File | Used by |
|---------|------|---------|
| `dev` | `application-dev.properties` | `./lup.sh` (local) |
| `docker` | `application-docker.properties` | `docker-compose` |
| _(default)_ | `application.properties` | base config |

### Database

```bash
psql -U dev -d note             # connect
\dt                             # list tables
\d note                         # describe table
# Check port usage
lsof -i :5099   # Spring Boot backend (all modes)
lsof -i :5099   # nginx (Docker mode only)
lsof -i :5432   # PostgreSQL
```

### Stop a process on a port

```bash
kill -9 $(lsof -ti :5099)
```

---

## Development Workflow

### Add a new REST endpoint

```java
// src/main/java/com/noteapp/controller/MyController.java
@RestController
@RequestMapping("/api/my-resource")
public class MyController {
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(Map.of("success", true, "data", List.of()));
    }
}
```

### Add a new Service

```java
// src/main/java/com/noteapp/service/MyService.java
@Service
public class MyService { }
```

### Add a database column

1. Run the SQL directly:
```sql
psql -U dev -d note -c "ALTER TABLE notes ADD COLUMN tags VARCHAR(255);"
```
2. Update the JPA entity:
```java
@Column(name = "tags")
private String tags;
```

### Add a React component

```bash
mkdir -p frontend/src/components/MyComponent
# create MyComponent.jsx inside
```

### Daily cycle

```bash
git pull origin main
./lup.sh              # start dev

# ... code ...

./mvnw test           # before commit
cd frontend && npm test -- --watchAll=false

git add . && git commit -m "feat: ..." && git push
./ldown.sh            # end of day
```

---

## Troubleshooting

**Port in use**
```bash
kill -9 $(lsof -ti :5099)   # backend
kill -9 $(lsof -ti :5099)   # nginx (Docker)
```

**Spring Boot won't start**
```bash
./mvnw clean package -DskipTests    # check for compile errors
java -version                        # must be 21+
```

**Database connection error**
```bash
sudo systemctl status postgresql@16-main
psql -U dev -h 127.0.0.1 -d note -c "SELECT 1"
# also check application-dev.properties credentials
```


**Frontend won't start**
```bash
rm -rf frontend/node_modules && cd frontend && npm install && npm start
```

**Docker build fails**
```bash
docker-compose build --no-cache --progress=plain backend
docker system prune    # free up disk space if needed
```

---
---

<a name="中文"></a>
# 中文

## 目錄
1. [啟動與停止](#啟動與停止)
2. [Docker Stack](#docker-stack-1)
3. [構建](#構建)
4. [運行測試](#運行測試)
5. [常用命令](#常用命令)
6. [開發工作流程](#開發工作流程)
7. [故障排除](#故障排除-1)

---

## 啟動與停止

### 本地開發（日常使用）

```bash
./lup.sh      # 啟動 Spring Boot（端口 5099）+ 前端（端口 5000 via nginx）
./ldown.sh    # 停止兩者
```

- 前端：http://localhost:5000
- 後端 API：http://localhost:5099
- `/api/*` 請求自動代理到後端

**`lup.sh` 執行流程：**
1. 在 `frontend/` 中後台運行 `npm start`
2. 以 `SPRING_PROFILES_ACTIVE=dev` 運行 `./mvnw spring-boot:run`

---

### Docker Stack（集成測試 / 類生產環境）

```bash
docker-compose up --build    # 構建鏡像並啟動所有容器
docker-compose down          # 停止並刪除容器
docker-compose down -v       # 同時刪除數據卷
```

**服務：**
```
backend   Spring Boot JAR   端口 5099   network_mode: host
nginx     反向代理           端口 5000   network_mode: host
                            （提供 React 靜態文件 + 代理 /api/* 到 :5099）
```

---

### 選哪種方式？

| | `./lup.sh`（本地） | `docker-compose` |
|---|---|---|
| 熱重載 | ✅ | ❌ |
| 速度 | 快 | 較慢（需構建）|
| 需本地安裝 Java + Node | ✅ | ❌ |
| 類生產環境 | ❌ | ✅ |
| **應用 URL** | http://localhost:5099 | http://localhost:5099 |
| **API URL** | http://localhost:5000 | http://localhost:5000 |
| **適用場景** | 日常開發 | 集成測試 |

---

## Docker Stack

```bash
# 查看運行中的容器
docker-compose ps

# 查看日誌
docker-compose logs -f backend
docker-compose logs -f nginx

# 無緩存重建
docker-compose build --no-cache

# 重啟服務
docker-compose restart backend

# 進入容器 Shell
docker exec -it note_backend bash
```

---

## 構建

### 後端（Maven）

```bash
./mvnw clean package              # 構建 JAR（含測試）
./mvnw clean package -DskipTests  # 構建 JAR（跳過測試）
./mvnw clean                      # 清理構建輸出
./mvnw dependency:tree            # 查看依賴樹
```

輸出 JAR：`target/note-app-*.jar`

### 前端（npm）

```bash
cd frontend
npm install        # 安裝依賴
npm run build      # 生產構建 → frontend/build/
npm start          # 開發服務器（React，通過 nginx 端口 5099 提供）
```

---

## 運行測試

### 後端（JUnit 5）

```bash
./mvnw test                                      # 所有測試
./mvnw test -Dtest=NoteServiceTest               # 單個測試類
./mvnw test -Dtest=NoteServiceTest#testCreate    # 單個測試方法
./mvnw test -Dsurefire.useFile=false             # 詳細輸出
```

測試文件位置：`src/test/java/com/noteapp/`

### 前端（Jest）

```bash
cd frontend
npm test                          # 運行測試（監視模式）
npm test -- --watchAll=false      # 運行一次（CI 模式）
npm test -- --coverage            # 帶覆蓋率報告
```

---

## 常用命令

### Spring Boot

```bash
./mvnw spring-boot:run                            # 本地運行
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run # 指定 profile
```

### Profiles

| Profile | 文件 | 使用場景 |
|---------|------|---------|
| `dev` | `application-dev.properties` | `./lup.sh`（本地）|
| `docker` | `application-docker.properties` | `docker-compose` |
| _（默認）_ | `application.properties` | 基礎配置 |

### 數據庫

```bash
psql -U dev -d note                            # 連接
\dt                                            # 列出所有表
\d note                                        # 描述表結構

# 查看端口占用
lsof -i :5099   # Spring Boot 後端（所有模式）
lsof -i :5099   # nginx（僅 Docker 模式）
lsof -i :5432   # PostgreSQL
```

### 強制釋放端口

```bash
kill -9 $(lsof -ti :5099)
```

---

## 開發工作流程

### 添加新的 REST Endpoint

```java
// src/main/java/com/noteapp/controller/MyController.java
@RestController
@RequestMapping("/api/my-resource")
public class MyController {
    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(Map.of("success", true, "data", List.of()));
    }
}
```

### 添加新的 Service

```java
// src/main/java/com/noteapp/service/MyService.java
@Service
public class MyService { }
```

### 添加數據庫欄位

直接執行 SQL：
```sql
psql -U dev -d note -c "ALTER TABLE notes ADD COLUMN tags VARCHAR(255);"
```
然後更新 JPA 實體：
```java
@Column(name = "tags")
private String tags;
```

### 添加 React 組件

```bash
mkdir -p frontend/src/components/MyComponent
# 在目錄中創建 MyComponent.jsx
```

### 每日開發流程

```bash
git pull origin main
./lup.sh              # 啟動開發

# ... 編寫代碼 ...

./mvnw test           # 提交前測試
cd frontend && npm test -- --watchAll=false

git add . && git commit -m "feat: ..." && git push
./ldown.sh            # 結束開發
```

---

## 故障排除

**端口被佔用**
```bash
kill -9 $(lsof -ti :5099)   # 後端
kill -9 $(lsof -ti :5099)   # nginx（Docker）
```

**Spring Boot 無法啟動**
```bash
./mvnw clean package -DskipTests    # 檢查編譯錯誤
java -version                        # 必須是 21+
```

**數據庫連接錯誤**
```bash
sudo systemctl status postgresql@16-main
psql -U dev -h 127.0.0.1 -d note -c "SELECT 1"
# 檢查 application-dev.properties 中的憑據
```

**數據庫備份 / 還原**
```bash
# 備份
pg_dump -U dev -d note -F c -f note_backup.dump
# 還原
pg_restore -U dev -d note -F c note_backup.dump
```

**前端無法啟動**
```bash
rm -rf frontend/node_modules && cd frontend && npm install && npm start
```

**Docker 構建失敗**
```bash
docker-compose build --no-cache --progress=plain backend
docker system prune    # 如有需要釋放磁盤空間
```
