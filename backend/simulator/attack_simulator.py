import time
import requests
import random

BACKEND_URL = "http://localhost:5000/api/events"
AI_ENGINE_URL = "http://localhost:8000/predict"

KNOWN_IPS = {
    "185.220.101.45": {"location": "unknown", "bot_prob": 0.95, "request_frequency": 200},
    "198.51.100.23":  {"location": "Moscow",  "bot_prob": 0.85, "request_frequency": 180},
    "203.0.113.89":   {"location": "Berlin",  "bot_prob": 0.70, "request_frequency": 130},
    "45.142.212.100": {"location": "unknown", "bot_prob": 0.92, "request_frequency": 220},
    "92.118.160.11":  {"location": "Beijing", "bot_prob": 0.80, "request_frequency": 160},
}
NORMAL_IPS = ["10.0.1.45", "192.168.0.12", "103.4.52.20"]


def get_risk_score(profile):
    try:
        res = requests.post(AI_ENGINE_URL, json=profile, timeout=2)
        return res.json()
    except:
        freq = profile.get("request_frequency", 50)
        score = min((freq / 300) + (0.4 if profile.get("bot_prob", 0) > 0.7 else 0), 1.0)
        return {"risk_score": round(score, 2), "risk_level": "high" if score > 0.7 else "low", "source": "local"}


def simulate_ddos():
    ip = random.choice(list(KNOWN_IPS))
    meta = KNOWN_IPS[ip]
    profile = {**meta, "ip": ip, "device_fingerprint": "unknown", "failed_logins": random.randint(2, 15)}
    risk = get_risk_score(profile)

    payload = {
        "type": "ddos_block",
        "ip": ip,
        "time": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "blocked": True,
        "source": "Cloudflare Edge",
        "risk_score": risk["risk_score"],
        "risk_level": risk["risk_level"],
        **meta
    }
    r = requests.post(BACKEND_URL, json=payload)
    print(f"  🔥 DDoS BLOCKED   | IP: {ip} | Risk: {risk['risk_score']} ({risk['risk_level']})")


def simulate_ai_alert():
    ip = random.choice(list(KNOWN_IPS))
    meta = KNOWN_IPS[ip]
    profile = {**meta, "ip": ip, "device_fingerprint": random.choice(["known", "unknown"]), "failed_logins": random.randint(0, 12), "hour_of_day": time.localtime().tm_hour}
    risk = get_risk_score(profile)

    payload = {
        "type": "ai_risk_alert",
        "ip": ip,
        "risk_score": risk["risk_score"],
        "risk_level": risk["risk_level"],
        "source": "AI Threat Engine (Isolation Forest + LSTM + Graph ML)",
        "time": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }
    requests.post(BACKEND_URL, json=payload)
    print(f"  🤖 AI RISK ALERT  | IP: {ip} | Score: {risk['risk_score']} | Level: {risk['risk_level'].upper()}")


def simulate_ids_alert():
    attack_types = ["SQL Injection", "XSS", "Port Scan", "Brute Force", "CSRF"]
    t = random.choice(attack_types)
    ip = random.choice(list(KNOWN_IPS))
    payload = {
        "type": "ids_alert",
        "attack_type": t,
        "ip": ip,
        "action": "Blocked",
        "source": "Suricata IDS",
        "severity": random.choice(["high", "medium", "low"]),
        "time": time.strftime("%Y-%m-%dT%H:%M:%S"),
    }
    requests.post(BACKEND_URL, json=payload)
    print(f"  🚨 SURICATA ALERT | {t} from {ip} — Blocked")


if __name__ == "__main__":
    print("=" * 55)
    print("  GovTech Security Pipeline — Attack Simulator Active")
    print("  Pipeline: Cloudflare → Suricata → AI Engine → Dashboard")
    print("=" * 55)

    while True:
        choice = random.choices(
            ["ddos", "ai", "ids", "none"],
            weights=[30, 40, 20, 10]
        )[0]

        try:
            if choice == "ddos":
                simulate_ddos()
            elif choice == "ai":
                simulate_ai_alert()
            elif choice == "ids":
                simulate_ids_alert()
        except Exception as e:
            print(f"  ⚠️  Backend offline: {e}")

        time.sleep(random.randint(4, 10))
