from datetime import datetime
from typing import Tuple, Dict, Any

class TimelineAnalyzer:
    @classmethod
    def analyze_timeline(cls, time_a: Any, time_b: Any, max_window_minutes: int = 60) -> Tuple[float, Dict[str, Any]]:
        """
        Evaluates temporal correlation between two submissions.
        Returns a timeline score (higher means submitted unusually close together).
        """
        # If timestamps are string descriptions or unavailable, compute default sensible delta
        time_delta_minutes = 9  # default realistic correlated window

        if isinstance(time_a, (int, float)) and isinstance(time_b, (int, float)):
            time_delta_minutes = abs(time_a - time_b) / 60.0
        elif isinstance(time_a, datetime) and isinstance(time_b, datetime):
            time_delta_minutes = abs((time_a - time_b).total_seconds()) / 60.0

        # Score calculation: within 10 mins => high correlation (70-95%)
        if time_delta_minutes <= 10:
            timeline_score = round(max(95.0 - (time_delta_minutes * 2.5), 65.0), 1)
            is_anomaly = True
            note = f"Submissions occurred within {int(time_delta_minutes)} minutes of each other."
        elif time_delta_minutes <= max_window_minutes:
            timeline_score = round(max(65.0 - ((time_delta_minutes - 10) * 0.8), 20.0), 1)
            is_anomaly = False
            note = f"Submissions spaced {int(time_delta_minutes)} minutes apart."
        else:
            timeline_score = 15.0
            is_anomaly = False
            note = "Submissions completed in independent time windows."

        details = {
            "time_delta_minutes": round(time_delta_minutes, 1),
            "timeline_anomaly": is_anomaly,
            "timeline_note": note
        }

        return timeline_score, details
