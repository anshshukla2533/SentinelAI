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

├── backend/
│   ├── api/
│   ├── models/
│   ├── services/
│   └── database/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── hooks/
│
├── agent/
│   ├── collector/
│   ├── services/
│   └── installer/
│
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
