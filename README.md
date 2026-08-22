# SentinelAI

<p align="center">
  <strong>AI-Powered Infrastructure Monitoring & Incident Intelligence Platform</strong>
</p>

<p align="center">
  Monitor servers • Detect anomalies • Manage incidents • Analyze logs
</p>

---

## Overview

SentinelAI is an intelligent infrastructure monitoring platform that continuously observes machines and services, collects system metrics and logs, detects failures, and helps engineers investigate incidents before they become outages.

Instead of only displaying CPU or memory usage, SentinelAI correlates metrics, logs, and incidents to provide actionable insights through a modern dashboard.

---

## Features

### Machine Monitoring

- CPU utilization
- Memory usage
- Disk usage
- Network statistics
- Load Average
- System Uptime
- Hostname
- Operating System

---

### Service Health Monitoring

Monitor any running service including:

- API Servers
- Databases
- Background Workers
- Docker Containers
- Custom Applications
- Docker containers (`SENTINEL_WATCH_CONTAINERS`)

Health states:

- Healthy
- Warning
- Critical

Automatic incident creation when services become unhealthy.

---

### Incident Management

- Automatic incident generation
- Incident lifecycle tracking
- Open
- Investigating
- Resolved
- Historical incident records

---

### Log Management

- Centralized log ingestion
- Search logs by:
  - Machine
  - Service
  - Time
- Correlate logs with incidents

---

### Dashboard

Real-time visualization of:

- Machine metrics
- Service health
- Active incidents
- Historical metrics
- Logs
- Overall infrastructure health

---

### AI Capabilities *(Upcoming)*

- Root Cause Analysis
- Anomaly Detection
- Predictive Failure Detection
- AI-generated Incident Reports
- Intelligent Alert Summaries

---

## Getting Started

### 1. Start PostgreSQL (recommended)

```bash
docker compose up -d
```

Copy `backend/.env.example` to `backend/.env` and set:

```
DATABASE_URL=postgresql://sentinel:sentinel@127.0.0.1:5432/sentinel
```

SQLite still works for local development if you leave `DATABASE_URL` unset (`sentinel.db` in the backend folder).

### 2. Run the backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 3. Run the dashboard

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL (usually `http://127.0.0.1:5173`), create an account, then copy the agent install command from **Add a machine**.

### 4. Run the agent

```bash
cd agent
pip install -r requirements.txt
# Use the registration token from your dashboard account
set SENTINEL_API_BASE_URL=http://127.0.0.1:8000
set SENTINEL_AGENT_TOKEN=your-registration-token
set SENTINEL_WATCH_PROCESSES=nginx,postgres
set SENTINEL_WATCH_CONTAINERS=all
python agent.py
```

On macOS/Linux, export those same variables instead of `set`.

`SENTINEL_WATCH_PROCESSES` is a comma-separated list of process names.  
`SENTINEL_WATCH_CONTAINERS=all` reports Docker container health when the Docker CLI is installed; you can also list specific container names.

---

## Architecture

```
                 +-----------------------+
                 |   React Dashboard     |
                 +----------+------------+
                            |
                            |
                    FastAPI Backend
                            |
        +-------------------+-------------------+
        |                   |                   |
   Metrics API         Incident API        Logs API
        |                   |                   |
        +-------------------+-------------------+
                            |
                      PostgreSQL
                            |
                     Sentinel Agent
                            |
      -----------------------------------------
      CPU | Memory | Disk | Network | Services
```

---

## Tech Stack

### Frontend

- React
- TypeScript
- Tailwind CSS
- React Query

### Backend

- FastAPI
- Python
- SQLAlchemy
- Pydantic

### Database

- PostgreSQL

### Agent

- Python
- psutil

---

## Repository Structure

```
SentinelAI/
├── backend/                 # FastAPI app, models, auth, Alembic
├── frontend/                # React + TypeScript dashboard
├── agent/                   # psutil collector that posts metrics, health, logs
├── scripts/                 # Agent installer and Windows exe build
├── docker-compose.yml       # PostgreSQL
└── README.md
```

---

## How It Works

### 1. Install Sentinel Agent

Install the lightweight agent on any machine.

The agent continuously collects:

- CPU
- Memory
- Disk
- Network
- Uptime
- Hostname
- OS
- Service status

---

### 2. Send Metrics

The agent periodically sends collected data to the FastAPI backend.

---

### 3. Detect Issues

The backend evaluates incoming data.

If abnormal behavior is detected:

- Warning generated
- Incident created
- Dashboard updated

---

### 4. Investigate

Users can:

- View metrics
- Inspect logs
- Track incidents
- Resolve issues

---


## Future Vision

SentinelAI aims to become an AI-native observability platform capable of:

- Detecting infrastructure failures before they occur
- Explaining why an incident happened
- Recommending corrective actions
- Reducing Mean Time To Detect (MTTD)
- Reducing Mean Time To Resolve (MTTR)

---



<p align="center">
Built to make infrastructure monitoring simpler, smarter, and proactive.
</p>
