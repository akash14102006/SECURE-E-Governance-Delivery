package security.policy

default allow = false

# Allow tax officers specifically if risk is low
allow {
    input.role == "tax_officer"
    input.purpose == "tax_verification"
    input.risk_score < 0.7
}

# Allow admin for everything
allow {
    input.role == "admin"
}

# Log the decision reason
decision = {
    "allowed": allow,
    "reason": get_reason
}

get_reason = "Approved" {
    allow
}

get_reason = "Denied: Risk score too high or insufficient role" {
    not allow
}
