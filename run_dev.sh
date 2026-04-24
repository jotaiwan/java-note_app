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
NC=$(tput sgr0)

if ! command -v tput &> /dev/null; then
    GREEN='\033[0;32m'
    RED='\033[0;31m'
    BLUE='\033[0;34m'
    YELLOW='\033[1;33m'
    NC='\033[0m'
fi

# Your actual ports
REACT_PORT=5000
SPRING_PORT=5099

print_header() {
    echo "${BLUE}================================${NC}"
    echo "${BLUE}    Note App Dev Manager${NC}"
    echo "${BLUE}================================${NC}"
}

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

dev_up_both() {
    echo "${GREEN}Starting both frontend and backend...${NC}"
    
    # 啟動後端（後台運行）
    echo "${YELLOW}Starting Spring Boot backend on port ${SPRING_PORT}...${NC}"
    export SPRING_PROFILES_ACTIVE=dev
    export SERVER_PORT=${SPRING_PORT}
    ./mvnw spring-boot:run &
    BACKEND_PID=$!
    echo $BACKEND_PID > /tmp/note_backend.pid
    
    echo "${YELLOW}Waiting for backend to start...${NC}"
    sleep 8
    
    # 啟動前端（後台運行）
    echo "${YELLOW}Starting React frontend on port ${REACT_PORT}...${NC}"
    cd frontend
    PORT=${REACT_PORT} npm start &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > /tmp/note_frontend.pid
    cd ..
    
    echo "${GREEN}Both servers started!${NC}"
    echo "  Frontend: http://localhost:${REACT_PORT}"
    echo "  Backend: http://localhost:${SPRING_PORT}"
    
    wait
}

dev_up_frontend() {
    echo "${GREEN}Starting frontend only...${NC}"
    
    if is_react_running; then
        echo "${YELLOW}⚠ Frontend is already running on port ${REACT_PORT}${NC}"
        return 1
    fi
    
    echo "${YELLOW}Starting React frontend on port ${REACT_PORT}...${NC}"
    cd frontend
    PORT=${REACT_PORT} npm start &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > /tmp/note_frontend.pid
    cd ..
    
    echo "${GREEN}Frontend started! http://localhost:${REACT_PORT}${NC}"
    wait
}

dev_up_backend() {
    echo "${GREEN}Starting backend only...${NC}"
    
    if is_spring_running; then
        echo "${YELLOW}⚠ Backend is already running on port ${SPRING_PORT}${NC}"
        return 1
    fi
    
    echo "${YELLOW}Starting Spring Boot backend on port ${SPRING_PORT}...${NC}"
    export SPRING_PROFILES_ACTIVE=dev
    export SERVER_PORT=${SPRING_PORT}
    ./mvnw spring-boot:run &
    BACKEND_PID=$!
    echo $BACKEND_PID > /tmp/note_backend.pid
    
    echo "${GREEN}Backend started! http://localhost:${SPRING_PORT}${NC}"
    wait
}

dev_down_both() {
    echo "${RED}Stopping both frontend and backend...${NC}"
    
    # Kill Spring Boot
    if [ -f /tmp/note_backend.pid ]; then
        BACKEND_PID=$(cat /tmp/note_backend.pid)
        kill $BACKEND_PID 2>/dev/null && echo "${GREEN}✓ Spring Boot stopped (by PID)${NC}" || echo "${YELLOW}⚠ Spring Boot not running (by PID)${NC}"
        rm -f /tmp/note_backend.pid
    fi
    pkill -f "spring-boot:run" 2>/dev/null && echo "${GREEN}✓ Spring Boot stopped (by process name)${NC}" || echo "${YELLOW}⚠ Spring Boot not running${NC}"
    
    # Kill React
    if [ -f /tmp/note_frontend.pid ]; then
        FRONTEND_PID=$(cat /tmp/note_frontend.pid)
        kill $FRONTEND_PID 2>/dev/null && echo "${GREEN}✓ React stopped (by PID)${NC}" || echo "${YELLOW}⚠ React not running (by PID)${NC}"
        rm -f /tmp/note_frontend.pid
    fi
    pkill -f "react-scripts" 2>/dev/null && echo "${GREEN}✓ React stopped (by process name)${NC}" || true
    pkill -f "node.*react-scripts" 2>/dev/null && echo "${GREEN}✓ React stopped (by node)${NC}" || true
    
    # Kill by port
    fuser -k ${REACT_PORT}/tcp 2>/dev/null && echo "${GREEN}✓ Port ${REACT_PORT} freed${NC}" || true
    fuser -k ${SPRING_PORT}/tcp 2>/dev/null && echo "${GREEN}✓ Port ${SPRING_PORT} freed${NC}" || true
    
    echo "${GREEN}All servers stopped${NC}"
}

dev_down_frontend() {
    echo "${RED}Stopping frontend only...${NC}"
    
    if [ -f /tmp/note_frontend.pid ]; then
        FRONTEND_PID=$(cat /tmp/note_frontend.pid)
        kill $FRONTEND_PID 2>/dev/null && echo "${GREEN}✓ React stopped (by PID)${NC}" || echo "${YELLOW}⚠ React not running (by PID)${NC}"
        rm -f /tmp/note_frontend.pid
    fi
    pkill -f "react-scripts" 2>/dev/null && echo "${GREEN}✓ React stopped (by process name)${NC}" || true
    pkill -f "node.*react-scripts" 2>/dev/null && echo "${GREEN}✓ React stopped (by node)${NC}" || true
    fuser -k ${REACT_PORT}/tcp 2>/dev/null && echo "${GREEN}✓ Port ${REACT_PORT} freed${NC}" || true
    
    echo "${GREEN}Frontend stopped${NC}"
}

dev_down_backend() {
    echo "${RED}Stopping backend only...${NC}"
    
    if [ -f /tmp/note_backend.pid ]; then
        BACKEND_PID=$(cat /tmp/note_backend.pid)
        kill $BACKEND_PID 2>/dev/null && echo "${GREEN}✓ Spring Boot stopped (by PID)${NC}" || echo "${YELLOW}⚠ Spring Boot not running (by PID)${NC}"
        rm -f /tmp/note_backend.pid
    fi
    pkill -f "spring-boot:run" 2>/dev/null && echo "${GREEN}✓ Spring Boot stopped (by process name)${NC}" || echo "${YELLOW}⚠ Spring Boot not running${NC}"
    fuser -k ${SPRING_PORT}/tcp 2>/dev/null && echo "${GREEN}✓ Port ${SPRING_PORT} freed${NC}" || true
    
    echo "${GREEN}Backend stopped${NC}"
}

dev_run_both() {
    echo "${BLUE}Restarting both frontend and backend...${NC}"
    dev_down_both
    sleep 2
    dev_up_both
}

dev_run_frontend() {
    echo "${BLUE}Restarting frontend only...${NC}"
    dev_down_frontend
    sleep 2
    dev_up_frontend
}

dev_run_backend() {
    echo "${BLUE}Restarting backend only...${NC}"
    dev_down_backend
    sleep 2
    dev_up_backend
}

show_status() {
    echo "${BLUE}Current status:${NC}"
    
    if is_spring_running; then
        echo "  ${GREEN}✓ Spring Boot: Running (port ${SPRING_PORT})${NC}"
    else
        echo "  ${RED}✗ Spring Boot: Stopped${NC}"
    fi
    
    if is_react_running; then
        echo "  ${GREEN}✓ React: Running (port ${REACT_PORT})${NC}"
    else
        echo "  ${RED}✗ React: Stopped${NC}"
    fi
    
    echo "${BLUE}Port status:${NC}"
    if ss -tln | grep -q ":${REACT_PORT} "; then
        echo "  ${GREEN}✓ Port ${REACT_PORT} (React): In use${NC}"
    else
        echo "  ${RED}✗ Port ${REACT_PORT} (React): Free${NC}"
    fi
    
    if ss -tln | grep -q ":${SPRING_PORT} "; then
        echo "  ${GREEN}✓ Port ${SPRING_PORT} (Spring Boot): In use${NC}"
    else
        echo "  ${RED}✗ Port ${SPRING_PORT} (Spring Boot): Free${NC}"
    fi
}

show_menu() {
    print_header
    echo ""
    show_status
    echo ""
    echo "${YELLOW}════════════════════════════════════════${NC}"
    echo "${YELLOW}              START OPTIONS${NC}"
    echo "${YELLOW}════════════════════════════════════════${NC}"
    echo "  ${GREEN}1) dev_up (both)${NC}       - Start frontend + backend"
    echo "  ${GREEN}2) dev_up (frontend only)${NC}  - Start frontend only"
    echo "  ${GREEN}3) dev_up (backend only)${NC}   - Start backend only"
    echo ""
    echo "${YELLOW}════════════════════════════════════════${NC}"
    echo "${YELLOW}              STOP OPTIONS${NC}"
    echo "${YELLOW}════════════════════════════════════════${NC}"
    echo "  ${RED}4) dev_down (both)${NC}      - Stop frontend + backend"
    echo "  ${RED}5) dev_down (frontend only)${NC} - Stop frontend only"
    echo "  ${RED}6) dev_down (backend only)${NC}  - Stop backend only"
    echo ""
    echo "${YELLOW}════════════════════════════════════════${NC}"
    echo "${YELLOW}             RESTART OPTIONS${NC}"
    echo "${YELLOW}════════════════════════════════════════${NC}"
    echo "  ${BLUE}7) dev_run (both)${NC}       - Restart frontend + backend"
    echo "  ${BLUE}8) dev_run (frontend only)${NC}  - Restart frontend only"
    echo "  ${BLUE}9) dev_run (backend only)${NC}   - Restart backend only"
    echo ""
    echo "${YELLOW}════════════════════════════════════════${NC}"
    echo "  ${YELLOW}0) status${NC}              - Show current status"
    echo "  ${RED}e) Exit${NC}"
    echo "${YELLOW}════════════════════════════════════════${NC}"
    echo ""
    printf "%b" "Enter your choice: "
}

# Handle command line argument
if [ $# -eq 1 ]; then
    case $1 in
        up|dev_up) dev_up_both ;;
        up-frontend) dev_up_frontend ;;
        up-backend) dev_up_backend ;;
        down|dev_down) dev_down_both ;;
        down-frontend) dev_down_frontend ;;
        down-backend) dev_down_backend ;;
        run|dev_run) dev_run_both ;;
        run-frontend) dev_run_frontend ;;
        run-backend) dev_run_backend ;;
        status) show_status ;;
        *) echo "Usage: $0 [up|up-frontend|up-backend|down|down-frontend|down-backend|run|run-frontend|run-backend|status]" ;;
    esac
    exit 0
fi

# Interactive mode
while true; do
    show_menu
    read choice
    
    case $choice in
        1) dev_up_both; break ;;
        2) dev_up_frontend; break ;;
        3) dev_up_backend; break ;;
        4) dev_down_both; break ;;
        5) dev_down_frontend; break ;;
        6) dev_down_backend; break ;;
        7) dev_run_both; break ;;
        8) dev_run_frontend; break ;;
        9) dev_run_backend; break ;;
        0) 
            clear
            show_status
            echo ""
            printf "%b" "Press Enter to continue..."
            read
            clear
            ;;
        e|E) echo "${RED}Exiting...${NC}"; exit 0 ;;
        *) echo "${RED}Invalid option${NC}"; sleep 1; clear ;;
    esac
done