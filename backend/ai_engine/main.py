from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import random
import math

app = FastAPI(title="GovTech AI Risk Engine", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class UserProfile(BaseModel):
    ip: Optional[str] = "0.0.0.0"
    login_location: Optional[str] = "Delhi"
    request_frequency: Optional[int] = 50
    device_fingerprint: Optional[str] = "known"
    bot_prob: Optional[float] = 0.1
    hour_of_day: Optional[int] = 12
    failed_logins: Optional[int] = 0


def isolation_forest_score(profile: UserProfile) -> float:
    """
    Simulates Isolation Forest anomaly detection.
    Shorter path length = more anomalous.
    """
    score = 0.0
    known_locations = ["Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai"]

    # Location anomaly
    if profile.login_location not in known_locations:
        score += 0.35
    if profile.login_location == "unknown":
        score += 0.20

    # Request frequency anomaly (normal: 20-80/min)
    if profile.request_frequency > 150:
        score += 0.40
    elif profile.request_frequency > 100:
        score += 0.20

    # Off-hours access (12am - 5am)
    if 0 <= profile.hour_of_day <= 5:
        score += 0.15

    return min(score, 0.90)


def lstm_behavior_score(profile: UserProfile) -> float:
    """
    Simulates LSTM sequential behavior pattern detection.
    """
    score = 0.0

    # Bot probability from traffic pattern
    score += profile.bot_prob * 0.50

    # Failed login attempts
    if profile.failed_logins > 5:
        score += 0.40
    elif profile.failed_logins > 2:
        score += 0.15

    # Unknown device fingerprint
    if profile.device_fingerprint == "unknown":
        score += 0.20

    return min(score, 0.90)


def graph_ml_score(profile: UserProfile) -> float:
    """
    Simulates Graph ML — connectivity & relationship anomaly.
    """
    # Tor/VPN IPs commonly start with these ranges
    tor_ranges = ["185.220.", "198.51.", "45.142.", "92.118."]
    score = 0.0
    for r in tor_ranges:
        if profile.ip.startswith(r):
            score += 0.45
            break
    return min(score, 0.90)


@app.post("/predict")
async def predict_risk(profile: UserProfile):
    iso_score = isolation_forest_score(profile)
    lstm_score = lstm_behavior_score(profile)
    graph_score = graph_ml_score(profile)

    # Ensemble: weighted average
    final_score = round((iso_score * 0.4 + lstm_score * 0.4 + graph_score * 0.2), 2)
    final_score = min(final_score, 1.0)

    level = "high" if final_score > 0.7 else "medium" if final_score > 0.4 else "low"

    return {
        "risk_score": final_score,
        "risk_level": level,
        "model": "ensemble(isolation_forest + lstm + graph_ml)",
        "features_used": ["login_location", "request_frequency", "bot_prob", "device_fingerprint", "failed_logins", "hour_of_day", "ip"],
        "breakdown": {
            "isolation_forest": round(iso_score, 2),
            "lstm_behavioral": round(lstm_score, 2),
            "graph_ml": round(graph_score, 2),
        }
    }


@app.get("/health")
async def health():
    return {"status": "AI Engine active", "models": ["Isolation Forest", "LSTM", "Graph ML"]}


@app.get("/risk/distribution")
async def risk_distribution():
    return [
        {"name": "Low Risk", "value": 72, "color": "#DDF7EC"},
        {"name": "Medium Risk", "value": 23, "color": "#FFD9CC"},
        {"name": "High Risk", "value": 5, "color": "#FCA5A5"},
    ]
