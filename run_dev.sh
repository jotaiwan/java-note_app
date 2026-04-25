#!/bin/bash
# Interactive dev script for Note App
# Usage: ./run_dev.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Colors using tput
GREEN=$(tput setaf 2)
RED=$(tput setaf 1)
BLUE=$(tput setaf 4)
YELLOW=$(tput setaf 3)
MAGENTA=$(tput setaf 5)
CYAN=$(tput setaf 6)
NC=$(tput sgr0)

if ! command -v tput &> /dev/null; then
    GREEN='\033[0;32m'
    RED='\033[0;31m'
    BLUE='\033[0;34m'
    YELLOW='\033[1;33m'
    MAGENTA='\033[0;35m'
    CYAN='\033[0;36m'
    NC='\033[0m'
fi

# Your actual ports
REACT_PORT=5000
SPRING_PORT=5099
DOCKER_COMPOSE_FILE="docker-compose.yml"

print_header() {
    echo "${CYAN}╔══════════════════════════════════════╗${NC}"
    echo "${CYAN}║       Note App Dev Manager          ║${NC}"
    echo "${CYAN}╚══════════════════════════════════════╝${NC}"
}

# ============================================
# CHECK FUNCTIONS
# ============================================

is_react_running() {
    if ss -tln | grep -q ":${REACT_PORT} "; then
        return 0
    fi
    if [ -f /tmp/note_frontend.pid ] && kill -0 $(cat /tmp/note_frontend.pid) 2>/dev/null; then
        return 0
    fi
    if pgrep -f "react-scripts" > /dev/null; then
        return 0
    fi
    if pgrep -f "node.*react-scripts" > /dev/null; then
        return 0
    fi
    return 1
}

is_spring_running() {
    if ss -tln | grep -q ":${SPRING_PORT} "; then
        return 0
    fi
    if pgrep -f "spring-boot:run" > /dev/null; then
        return 0
    fi
    return 1
}

is_docker_running() {
    if command -v docker &> /dev/null && docker ps &> /dev/null; then
        return 0
    fi
    return 1
}

is_docker_compose_running() {
    if [ -f "$DOCKER_COMPOSE_FILE" ] && docker compose ps &> /dev/null; then
        if docker compose ps | grep -q "Up"; then
            return 0
        fi
    fi
    return 1
}

# ============================================
# PORT AND PROCESS CLEANUP
# ============================================

free_ports_and_pids() {
    echo "${YELLOW}🧹 Freeing ports and killing processes...${NC}"
    
    # Kill Spring Boot processes
    if [ -f /tmp/note_backend.pid ]; then
        BACKEND_PID=$(cat /tmp/note_backend.pid)
        kill $BACKEND_PID 2>/dev/null && echo "${GREEN}✓ Spring Boot stopped (by PID)${NC}" || echo "${YELLOW}⚠ Spring Boot not running (by PID)${NC}"
        rm -f /tmp/note_backend.pid
    fi
    pkill -f "spring-boot:run" 2>/dev/null && echo "${GREEN}✓ Spring Boot stopped (by process name)${NC}" || true
    
    # Kill React processes
    if [ -f /tmp/note_frontend.pid ]; then
        FRONTEND_PID=$(cat /tmp/note_frontend.pid)
        kill $FRONTEND_PID 2>/dev/null && echo "${GREEN}✓ React stopped (by PID)${NC}" || echo "${YELLOW}⚠ React not running (by PID)${NC}"
        rm -f /tmp/note_frontend.pid
    fi
    pkill -f "react-scripts" 2>/dev/null && echo "${GREEN}✓ React stopped (by process name)${NC}" || true
    pkill -f "node.*react-scripts" 2>/dev/null && echo "${GREEN}✓ React stopped (by node)${NC}" || true
    
    # Free ports
    fuser -k ${REACT_PORT}/tcp 2>/dev/null && echo "${GREEN}✓ Port ${REACT_PORT} freed${NC}" || true
    fuser -k ${SPRING_PORT}/tcp 2>/dev/null && echo "${GREEN}✓ Port ${SPRING_PORT} freed${NC}" || true
    
    # Also kill any Java processes on common ports
    lsof -ti :${SPRING_PORT} | xargs kill -9 2>/dev/null || true
    lsof -ti :${REACT_PORT} | xargs kill -9 2>/dev/null || true
    
    echo "${GREEN}✅ All ports and processes cleaned up${NC}"
}

# ============================================
# START FUNCTIONS (always clean before start)
# ============================================

start_both() {
    echo "${GREEN}🚀 Starting both frontend and backend...${NC}"
    
    # Always clean ports and processes before starting
    free_ports_and_pids
    
    # 啟動後端（後台運行）
    echo "${YELLOW}📦 Starting Spring Boot backend on port ${SPRING_PORT}...${NC}"
    export SPRING_PROFILES_ACTIVE=dev
    export SERVER_PORT=${SPRING_PORT}
    ./mvnw spring-boot:run &
    BACKEND_PID=$!
    echo $BACKEND_PID > /tmp/note_backend.pid
    
    echo "${YELLOW}⏳ Waiting for backend to start...${NC}"
    sleep 8
    
    # 啟動前端（後台運行）
    echo "${YELLOW}🎨 Starting React frontend on port ${REACT_PORT}...${NC}"
    cd frontend
    PORT=${REACT_PORT} npm start &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > /tmp/note_frontend.pid
    cd ..
    
    echo "${GREEN}✅ Both servers started!${NC}"
    echo "  🌐 Frontend: http://localhost:${REACT_PORT}"
    echo "  🔧 Backend: http://localhost:${SPRING_PORT}"
    
    wait
}

start_frontend_only() {
    echo "${GREEN}🎨 Starting frontend only...${NC}"
    
    # Clean frontend ports before starting
    echo "${YELLOW}Cleaning frontend port ${REACT_PORT}...${NC}"
    if [ -f /tmp/note_frontend.pid ]; then
        kill $(cat /tmp/note_frontend.pid) 2>/dev/null || true
        rm -f /tmp/note_frontend.pid
    fi
    pkill -f "react-scripts" 2>/dev/null || true
    pkill -f "node.*react-scripts" 2>/dev/null || true
    fuser -k ${REACT_PORT}/tcp 2>/dev/null || true
    
    echo "${YELLOW}Starting React frontend on port ${REACT_PORT}...${NC}"
    cd frontend
    PORT=${REACT_PORT} npm start &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > /tmp/note_frontend.pid
    cd ..
    
    echo "${GREEN}✅ Frontend started! http://localhost:${REACT_PORT}${NC}"
    wait
}

start_backend_only() {
    echo "${GREEN}🔧 Starting backend only...${NC}"
    
    # Clean backend port before starting
    echo "${YELLOW}Cleaning backend port ${SPRING_PORT}...${NC}"
    if [ -f /tmp/note_backend.pid ]; then
        kill $(cat /tmp/note_backend.pid) 2>/dev/null || true
        rm -f /tmp/note_backend.pid
    fi
    pkill -f "spring-boot:run" 2>/dev/null || true
    fuser -k ${SPRING_PORT}/tcp 2>/dev/null || true
    lsof -ti :${SPRING_PORT} | xargs kill -9 2>/dev/null || true
    
    echo "${YELLOW}Starting Spring Boot backend on port ${SPRING_PORT}...${NC}"
    export SPRING_PROFILES_ACTIVE=dev
    export SERVER_PORT=${SPRING_PORT}
    ./mvnw spring-boot:run &
    BACKEND_PID=$!
    echo $BACKEND_PID > /tmp/note_backend.pid
    
    echo "${GREEN}✅ Backend started! http://localhost:${SPRING_PORT}${NC}"
    wait
}

# ============================================
# STOP FUNCTIONS (remove PID and port totally)
# ============================================

stop_both() {
    echo "${RED}🛑 Stopping both frontend and backend...${NC}"
    free_ports_and_pids
    echo "${GREEN}✅ All servers stopped${NC}"
    echo ""
    read -p "Press Enter to return to menu..." 
}

stop_frontend_only() {
    echo "${RED}🛑 Stopping frontend only...${NC}"
    
    if [ -f /tmp/note_frontend.pid ]; then
        FRONTEND_PID=$(cat /tmp/note_frontend.pid)
        kill $FRONTEND_PID 2>/dev/null && echo "${GREEN}✓ React stopped (by PID)${NC}" || echo "${YELLOW}⚠ React not running (by PID)${NC}"
        rm -f /tmp/note_frontend.pid
    fi
    pkill -f "react-scripts" 2>/dev/null && echo "${GREEN}✓ React stopped (by process name)${NC}" || true
    pkill -f "node.*react-scripts" 2>/dev/null && echo "${GREEN}✓ React stopped (by node)${NC}" || true
    fuser -k ${REACT_PORT}/tcp 2>/dev/null && echo "${GREEN}✓ Port ${REACT_PORT} freed${NC}" || true
    lsof -ti :${REACT_PORT} | xargs kill -9 2>/dev/null || true
    
    echo "${GREEN}✅ Frontend stopped${NC}"
    echo ""
    read -p "Press Enter to return to menu..." 
}

stop_backend_only() {
    echo "${RED}🛑 Stopping backend only...${NC}"
    
    if [ -f /tmp/note_backend.pid ]; then
        BACKEND_PID=$(cat /tmp/note_backend.pid)
        kill $BACKEND_PID 2>/dev/null && echo "${GREEN}✓ Spring Boot stopped (by PID)${NC}" || echo "${YELLOW}⚠ Spring Boot not running (by PID)${NC}"
        rm -f /tmp/note_backend.pid
    fi
    pkill -f "spring-boot:run" 2>/dev/null && echo "${GREEN}✓ Spring Boot stopped (by process name)${NC}" || echo "${YELLOW}⚠ Spring Boot not running${NC}"
    fuser -k ${SPRING_PORT}/tcp 2>/dev/null && echo "${GREEN}✓ Port ${SPRING_PORT} freed${NC}" || true
    lsof -ti :${SPRING_PORT} | xargs kill -9 2>/dev/null || true
    
    echo "${GREEN}✅ Backend stopped${NC}"
    echo ""
    read -p "Press Enter to return to menu..." 
}

# ============================================
# DOCKER FUNCTIONS
# ============================================

docker_run() {
    echo "${MAGENTA}🐳 Docker: Run (down + clean port + build --no-cache + up)${NC}"
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        echo "${YELLOW}Step 1: Stopping existing containers...${NC}"
        docker compose down
        echo "${YELLOW}Step 2: Cleaning ports...${NC}"
        free_ports_and_pids
        echo "${YELLOW}Step 3: Building images with --no-cache...${NC}"
        docker compose build --no-cache
        echo "${YELLOW}Step 4: Starting containers...${NC}"
        docker compose up -d
        echo "${GREEN}✅ Docker containers started!${NC}"
        echo "  🔧 Backend: http://localhost:${SPRING_PORT}"
        echo "  🗄️  Database: postgresql://localhost:5432"
        docker compose ps
    else
        echo "${RED}✗ docker-compose.yml not found${NC}"
        return 1
    fi
    echo ""
    read -p "Press Enter to return to menu..." 
}

docker_build() {
    echo "${MAGENTA}🐳 Docker: Build (--no-cache)${NC}"
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        docker compose build --no-cache
        echo "${GREEN}✅ Docker images built successfully${NC}"
    else
        echo "${RED}✗ docker-compose.yml not found${NC}"
        return 1
    fi
    echo ""
    read -p "Press Enter to return to menu..." 
}

docker_start_restart() {
    echo "${MAGENTA}🐳 Docker: Start / Restart (up) + Clean ports${NC}"
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        echo "${YELLOW}Cleaning ports...${NC}"
        free_ports_and_pids
        echo "${YELLOW}Starting containers...${NC}"
        docker compose up -d
        echo "${GREEN}✅ Docker containers started!${NC}"
        echo "  🔧 Backend: http://localhost:${SPRING_PORT}"
        echo "  🗄️  Database: postgresql://localhost:5432"
        docker compose ps
    else
        echo "${RED}✗ docker-compose.yml not found${NC}"
        return 1
    fi
    echo ""
    read -p "Press Enter to return to menu..." 
}

docker_stop() {
    echo "${RED}🐳 Docker: Stop (down) + Clean ports${NC}"
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        docker compose down
        echo "${GREEN}✅ Docker containers stopped${NC}"
        echo "${YELLOW}Cleaning ports...${NC}"
        free_ports_and_pids
    else
        echo "${RED}✗ docker-compose.yml not found${NC}"
        return 1
    fi
    echo ""
    read -p "Press Enter to return to menu..." 
}

docker_build_and_start() {
    echo "${MAGENTA}🐳 Docker: Build & Start (build --no-cache + clean ports + up)${NC}"
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        echo "${YELLOW}Step 1: Cleaning ports...${NC}"
        free_ports_and_pids
        echo "${YELLOW}Step 2: Building images with --no-cache...${NC}"
        docker compose build --no-cache
        echo "${YELLOW}Step 3: Starting containers...${NC}"
        docker compose up -d
        echo "${GREEN}✅ Docker containers built and started!${NC}"
        echo "  🔧 Backend: http://localhost:${SPRING_PORT}"
        echo "  🗄️  Database: postgresql://localhost:5432"
        docker compose ps
    else
        echo "${RED}✗ docker-compose.yml not found${NC}"
        return 1
    fi
    echo ""
    read -p "Press Enter to return to menu..." 
}

docker_status() {
    echo "${BLUE}🐳 Docker status:${NC}"
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        docker compose ps
    else
        echo "${RED}✗ docker-compose.yml not found${NC}"
    fi
    echo ""
    read -p "Press Enter to return to menu..." 
}

docker_logs() {
    echo "${BLUE}🐳 Docker logs:${NC}"
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        docker compose logs --tail=50
    else
        echo "${RED}✗ docker-compose.yml not found${NC}"
    fi
    echo ""
    read -p "Press Enter to return to menu..." 
}

# ============================================
# BUILD FUNCTIONS (Optional)
# ============================================

build_jar() {
    echo "${BLUE}📦 Building JAR file...${NC}"
    
    # Clean previous builds and create new JAR
    echo "${YELLOW}Running: ./mvnw clean package -DskipTests${NC}"
    ./mvnw clean package -DskipTests
    
    if [ -f "target/*.jar" ]; then
        JAR_FILE=$(ls target/*.jar | grep -v "sources" | head -1)
        echo "${GREEN}✅ JAR built successfully!${NC}"
        echo "  📁 Location: $JAR_FILE"
        echo "  📏 Size: $(du -h $JAR_FILE | cut -f1)"
        
        # Ask if user wants to run the JAR
        read -p "Do you want to run the JAR file? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "${YELLOW}Running: java -jar $JAR_FILE${NC}"
            java -jar $JAR_FILE
        fi
    else
        echo "${RED}❌ Build failed! JAR not found${NC}"
    fi
    echo ""
    read -p "Press Enter to return to menu..." 
}

build_clean() {
    echo "${BLUE}🧹 Cleaning build artifacts...${NC}"
    ./mvnw clean
    echo "${GREEN}✅ Clean completed!${NC}"
    echo "  Removed: target/ directory"
    echo ""
    read -p "Press Enter to return to menu..." 
}

build_test() {
    echo "${BLUE}🧪 Running tests...${NC}"
    ./mvnw test
    echo "${GREEN}✅ Tests completed!${NC}"
    echo ""
    read -p "Press Enter to return to menu..." 
}

# ============================================
# STATUS FUNCTION
# ============================================

show_status() {
    clear
    print_header
    echo ""
    echo "${CYAN}📊 Current Status${NC}"
    echo "${CYAN}────────────────${NC}"
    
    echo ""
    echo "${YELLOW}🖥️  Local Development:${NC}"
    if is_spring_running; then
        echo "  ${GREEN}✅ Spring Boot: Running (port ${SPRING_PORT})${NC}"
    else
        echo "  ${RED}❌ Spring Boot: Stopped${NC}"
    fi
    
    if is_react_running; then
        echo "  ${GREEN}✅ React: Running (port ${REACT_PORT})${NC}"
    else
        echo "  ${RED}❌ React: Stopped${NC}"
    fi
    
    echo ""
    echo "${MAGENTA}🐳 Docker:${NC}"
    if is_docker_compose_running; then
        echo "  ${GREEN}✅ Docker Compose: Running${NC}"
    elif is_docker_running; then
        echo "  ${YELLOW}⚠ Docker: Running but no compose containers${NC}"
    else
        echo "  ${RED}❌ Docker: Not running${NC}"
    fi
    
    echo ""
    echo "${BLUE}🔌 Port Status:${NC}"
    if ss -tln | grep -q ":${REACT_PORT} "; then
        echo "  ${GREEN}✅ Port ${REACT_PORT} (React): In use${NC}"
    else
        echo "  ${RED}❌ Port ${REACT_PORT} (React): Free${NC}"
    fi
    
    if ss -tln | grep -q ":${SPRING_PORT} "; then
        echo "  ${GREEN}✅ Port ${SPRING_PORT} (Spring Boot): In use${NC}"
    else
        echo "  ${RED}❌ Port ${SPRING_PORT} (Spring Boot): Free${NC}"
    fi
    
    echo ""
    read -p "Press Enter to return to menu..." 
}

# ============================================
# MENU
# ============================================

show_menu() {
    clear
    print_header
    show_status
    echo ""
    echo "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo "${GREEN}║         🚀 START / RESTART OPTIONS         ║${NC}"
    echo "${GREEN}╚════════════════════════════════════════════╝${NC}"
    echo "  ${GREEN}1)${NC} Start Both (Frontend + Backend) - Cleans ports first"
    echo "  ${GREEN}2)${NC} Start Frontend Only - Cleans port first"
    echo "  ${GREEN}3)${NC} Start Backend Only - Cleans port first"
    echo ""
    echo "${RED}╔════════════════════════════════════════════╗${NC}"
    echo "${RED}║              🛑 STOP OPTIONS                ║${NC}"
    echo "${RED}╚════════════════════════════════════════════╝${NC}"
    echo "  ${RED}4)${NC} Stop Both - Removes PID and ports totally"
    echo "  ${RED}5)${NC} Stop Frontend Only - Removes PID and port"
    echo "  ${RED}6)${NC} Stop Backend Only - Removes PID and port"
    echo ""
    echo "${MAGENTA}╔════════════════════════════════════════════╗${NC}"
    echo "${MAGENTA}║            🐳 DOCKER OPTIONS               ║${NC}"
    echo "${MAGENTA}╚════════════════════════════════════════════╝${NC}"
    echo "  ${MAGENTA}d1)${NC} Docker: Run (down + clean port + build --no-cache + up)"
    echo "  ${MAGENTA}d2)${NC} Docker: Build (--no-cache)"
    echo "  ${MAGENTA}d3)${NC} Docker: Start / Restart (up) + Clean ports"
    echo "  ${MAGENTA}d4)${NC} Docker: Stop (down) + Clean ports"
    echo "  ${MAGENTA}d5)${NC} Docker: Build & Start (build --no-cache + clean ports + up)"
    echo "  ${MAGENTA}d6)${NC} Docker: Show Status"
    echo "  ${MAGENTA}d7)${NC} Docker: Show Logs"
        echo ""
    echo "${CYAN}╔════════════════════════════════════════════╗${NC}"
    echo "${CYAN}║            📦 BUILD OPTIONS                 ║${NC}"
    echo "${CYAN}╚════════════════════════════════════════════╝${NC}"
    echo "  ${CYAN}b1)${NC} Build: Create JAR file (clean + package)"
    echo "  ${CYAN}b2)${NC} Build: Clean only (remove target/)"
    echo "  ${CYAN}b3)${NC} Build: Run tests only"
    echo ""
    echo "${YELLOW}╔════════════════════════════════════════════╗${NC}"
    echo "${YELLOW}║              🛠️  UTILITIES                 ║${NC}"
    echo "${YELLOW}╚════════════════════════════════════════════╝${NC}"
    echo "  ${YELLOW}0)${NC} Refresh Status"
    echo "  ${YELLOW}c)${NC} Cleanup (Force free ports & kill processes)"
    echo "  ${RED}e)${NC} Exit"
    echo ""
    echo "${CYAN}────────────────────────────────────────────${NC}"
    printf "%b" "Enter your choice: "
}

# ============================================
# COMMAND LINE ARGUMENTS
# ============================================

if [ $# -eq 1 ]; then
    case $1 in
        start|both) start_both ;;
        start-frontend) start_frontend_only ;;
        start-backend) start_backend_only ;;
        stop|down) stop_both ;;
        stop-frontend) stop_frontend_only ;;
        stop-backend) stop_backend_only ;;
        status) show_status ;;
        cleanup) free_ports_and_pids ;;
        docker-run) docker_run ;;
        docker-build) docker_build ;;
        docker-start|docker-restart) docker_start_restart ;;
        docker-stop) docker_stop ;;
        docker-build-start) docker_build_and_start ;;
        docker-status) docker_status ;;
        docker-logs) docker_logs ;;
        *) 
            echo "Usage: $0 [OPTION]"
            echo ""
            echo "Start Options (cleans ports first):"
            echo "  start, both              - Start frontend + backend"
            echo "  start-frontend          - Start frontend only"
            echo "  start-backend           - Start backend only"
            echo ""
            echo "Stop Options (removes PID and ports):"
            echo "  stop, down              - Stop frontend + backend"
            echo "  stop-frontend           - Stop frontend only"
            echo "  stop-backend            - Stop backend only"
            echo ""
            echo "Docker Options:"
            echo "  docker-run              - Full run (down + clean + build + up)"
            echo "  docker-build            - Build images with --no-cache"
            echo "  docker-start, docker-restart - Start/Restart + clean ports"
            echo "  docker-stop             - Stop containers + clean ports"
            echo "  docker-build-start      - Build & start containers"
            echo "  docker-status           - Show Docker status"
            echo "  docker-logs             - Show Docker logs"
            echo ""
            echo "Utilities:"
            echo "  status                  - Show current status"
            echo "  cleanup                 - Force free ports & kill processes"
            ;;
    esac
    exit 0
fi

# ============================================
# INTERACTIVE MODE
# ============================================

while true; do
    show_menu
    read choice
    
    case $choice in
        1) start_both ;;
        2) start_frontend_only ;;
        3) start_backend_only ;;
        4) stop_both ;;
        5) stop_frontend_only ;;
        6) stop_backend_only ;;
        d1|D1) docker_run ;;
        d2|D2) docker_build ;;
        d3|D3) docker_start_restart ;;
        d4|D4) docker_stop ;;
        d5|D5) docker_build_and_start ;;
        d6|D6) docker_status ;;
        d7|D7) docker_logs ;;
        0) show_status ;;
        c|C) free_ports_and_pids; echo ""; read -p "Press Enter to return to menu..." ;;
        e|E) echo "${RED}👋 Exiting...${NC}"; exit 0 ;;
        *) echo "${RED}❌ Invalid option${NC}"; sleep 1 ;;
    esac
done