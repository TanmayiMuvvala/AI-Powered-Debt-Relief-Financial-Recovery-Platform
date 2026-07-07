# ============================================================
# utils/formatters.py - Reusable Formatting Utilities
# Responsibility: Pure helper functions for formatting
# financial values, labels, and messages consistently
# across services and response payloads.
# ============================================================


def format_inr(amount: float) -> str:
    """
    Format a float as Indian Rupee string.
    Example: 500000 → '₹5,00,000.00'
    """
    return f"₹{amount:,.2f}"


def format_percentage(value: float, decimals: int = 2) -> str:
    """Format a float as a percentage string."""
    return f"{value:.{decimals}f}%"


def clamp(value: float, min_val: float, max_val: float) -> float:
    """Clamp a float between min and max bounds."""
    return max(min_val, min(max_val, value))


def dti_label(dti_ratio: float) -> str:
    """
    Convert a DTI ratio to a human-readable label.
    DTI = (Monthly EMI / Monthly Income) * 100
    """
    if dti_ratio < 20:
        return "Excellent"
    elif dti_ratio < 35:
        return "Good"
    elif dti_ratio < 50:
        return "Moderate"
    elif dti_ratio < 65:
        return "High"
    else:
        return "Critical"


def overdue_label(months: int) -> str:
    """Convert overdue months to severity label."""
    if months == 0:
        return "Current"
    elif months <= 3:
        return "Early Delinquency"
    elif months <= 6:
        return "Substandard"
    elif months <= 12:
        return "Doubtful"
    else:
        return "Loss Asset"
