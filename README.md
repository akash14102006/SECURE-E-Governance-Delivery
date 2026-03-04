# SECURE SERVICE DELIVERY (SSD)

### **End-to-End Secure E-Governance Delivery Platform**
*A high-performance, Zero-Trust security control center designed for modern GovTech infrastructure.*

![Status](https://img.shields.io/badge/Status-Protected-success?style=flat-square) ![Security](https://img.shields.io/badge/Security-Zero--Trust-blue?style=flat-square) ![Auth](https://img.shields.io/badge/Auth-WebAuthn-blueviolet?style=flat-square)

---

## System Architecture

```mermaid
graph TD
    User((Citizen/Admin)) -->|WebAuthn/Biometric| Auth[Zero-Trust Auth Layer]
    Auth --> Dashboard[React Governance UI]
    
    subgraph "Backend Security Pipeline"
        Dashboard <-->|Socket.io / REST| API[Node.js Gateway]
        API -->|Publish Events| Kafka[(Event Stream)]
        Kafka --> Engine[AI Threat Engine]
        Engine -->|Analysis| OPA[Open Policy Agent]
        OPA -->|Decisions| API
    end
    
    subgraph "Detection Layer"
        Traffic[Network Traffic] --> Suricata[Suricata IDS]
        Suricata -->|Alerts| API
        Traffic --> Cloudflare[Cloudflare WAF/DDoS]
        Cloudflare -->|Metrics| API
        Endpoint[Server Logs] --> Wazuh[Wazuh SIEM]
        Wazuh -->|Security Events| API
    end

    subgraph "Intelligence"
        Engine ---|Isolation Forest| ML[Behavioral ML Models]
        Engine ---|LSTM| Pattern[Anomalous Pattern Detection]
    end
```

---

## Key Features

*   **Passwordless Identity**: Biometric authentication via **WebAuthn (FIDO2)**. No passwords stored, only ECC public keys.
*   **Real-time Threat Monitoring**: Live dashboard for DDoS mitigation, SQL Injection blocks, and Port Scan detection.
*   **AI Risk Scoring**: Behavioral analysis using **Isolation Forest** and **LSTM** models to identify hostile traffic.
*   **OPA Policy Engine**: Centralized policy-as-code for citizen data access logs and transparency.
*   **High-Fidelity Simulation**: Built-in security simulator to demonstrate active defense against SQLi, XSS, and Bruteforce.

---

## Tech Stack

**Frontend:**
- **React 18** + **Vite**
- **TailwindCSS** (Modern Soft-Panel Styling)
- **Lucide React** (Iconography)
- **Motion (Framer)** (Micro-animations)
- **Socket.io-client** (Real-time updates)

**Backend:**
- **Node.js** (Express API Gateway)
- **SimpleWebAuthn** (Hardware-backed security)
- **Socket.io** (Bidirectional event streaming)

**Security AI Engine:**
- **Python 3.11**
- **Scikit-learn** (ML Models)
- **FastAPI** (Machine Learning Service)

---

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.9+)

### 2. Backend Setup
```bash
cd backend
npm install
node server.js
```

### 3. AI Engine Setup
```bash
cd backend/ai_engine
pip install -r requirements.txt
uvicorn main:app --port 8000
```

### 4. Frontend Setup
```bash
npm install
npm run dev
```

---

## Security Compliance

- **Zero Trust Architecture**: Every request is verified via OPA and AI Risk Scoring.
- **Data Transparency**: Detailed citizen data access logs with real-time risk flagging.
- **Privacy First**: End-to-end encryption for all sensitive governance transmissions.

---
Developed by SecureGov Engineering Team.