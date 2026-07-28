"""
simli_service.py
------------------
Wrapper around the Simli API for real-time AI avatar rendering and WebRTC lip-sync sessions.
"""
import os
from typing import Dict, Any
import requests


class SimliService:
    def __init__(self):
        self.api_key = os.getenv("SIMLI_API_KEY", "")
        self.base_url = "https://api.simli.ai"
        # Face IDs for Female (Riya) and Male (Rohan) personas
        self.face_ids = {
            "female": os.getenv("SIMLI_FACE_ID_FEMALE", "tmp_female_avatar_id"),
            "male": os.getenv("SIMLI_FACE_ID_MALE", "tmp_male_avatar_id"),
        }

    def is_configured(self) -> bool:
        """Check if a valid Simli API key is configured in environment."""
        return bool(self.api_key and self.api_key != "your-simli-api-key")

    def create_session(self, gender: str = "female") -> Dict[str, Any]:
        """Create a Simli WebRTC audio-to-video lip-sync session."""
        gender_key = gender.lower() if gender.lower() in self.face_ids else "female"
        face_id = self.face_ids[gender_key]

        if not self.is_configured():
            return {
                "enabled": False,
                "mode": "canvas_lipsync",
                "reason": "Simli API Key not configured. Using real-time Web Audio Canvas Lip-Sync engine.",
                "face_id": face_id,
            }

        try:
            response = requests.post(
                f"{self.base_url}/startAudioToVideoSession",
                json={
                    "apiKey": self.api_key,
                    "faceId": face_id,
                    "handleSilence": True,
                    "maxSessionLength": 600,
                },
                timeout=5,
            )
            if response.status_code in (200, 201):
                data = response.json()
                return {
                    "enabled": True,
                    "mode": "simli_webrtc",
                    "session_id": data.get("session_id"),
                    "webrtc_url": data.get("webrtc_url"),
                    "face_id": face_id,
                }
        except Exception as e:
            print(f"[SimliService] Error creating session: {e}")

        return {
            "enabled": False,
            "mode": "canvas_lipsync",
            "reason": "Simli API unreachable. Falling back to real-time Web Audio Canvas Lip-Sync engine.",
            "face_id": face_id,
        }


simli_service = SimliService()
