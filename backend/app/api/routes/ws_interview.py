"""
ws_interview.py
---------------
WebSocket router for real-time live interview streaming.
Supports low-latency audio/text bidirectional communication,
barge-in interruption signaling, and live Gemini multi-key rotation status.
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.models.interview import Interview
from app.models.resume import Resume
from app.services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws/interview/{interview_id}")
async def websocket_interview_endpoint(websocket: WebSocket, interview_id: int):
    """
    WebSocket endpoint for real-time interview interaction.
    Exchanges bidirectional audio/text frames and key rotation metrics with frontend.
    """
    await websocket.accept()
    logger.info(f"[WS] Client connected for interview session #{interview_id}")

    db: Session = SessionLocal()
    try:
        interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not interview:
            await websocket.send_json({"type": "error", "message": f"Interview #{interview_id} not found."})
            await websocket.close()
            return

        # Send initial session handshake metadata with stage tracking
        from app.interview_engine.session_manager import session_manager
        state = session_manager.get_state(interview)
        active_keys_count = len(gemini_service.api_keys)
        await websocket.send_json({
            "type": "session_started",
            "interview_id": interview.id,
            "target_role": interview.target_role,
            "stage": state.stage.value,
            "stage_description": state.get_stage_description(),
            "active_key_pool_count": active_keys_count,
            "current_key_index": gemini_service.current_key_index + 1,
            "total_questions": len(interview.questions or []),
            "current_question_index": interview.current_question_index,
        })

        while True:
            raw_data = await websocket.receive_text()
            try:
                msg = json.loads(raw_data)
            except Exception:
                msg = {"type": "user_answer", "text": raw_data}

            msg_type = msg.get("type", "user_answer")

            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})
                continue

            if msg_type == "user_answer":
                user_text = msg.get("text", "").strip()
                if not user_text:
                    await websocket.send_json({
                        "type": "error",
                        "message": "No answer detected. Please try again."
                    })
                    continue

                # Refresh DB state
                interview = db.query(Interview).filter(Interview.id == interview_id).first()
                if not interview or interview.status != "in_progress":
                    await websocket.send_json({"type": "interview_completed", "message": "Interview session is completed."})
                    break

                # Notify frontend AI is thinking
                await websocket.send_json({"type": "ai_thinking"})

                # Execute turn evaluation and dynamic question generation
                loop = asyncio.get_event_loop()
                result = await loop.run_in_executor(
                    None,
                    session_manager.process_candidate_answer,
                    db,
                    interview,
                    user_text,
                )

                if result.get("status") == "error":
                    await websocket.send_json({
                        "type": "error",
                        "message": result.get("error", "Failed to process candidate answer.")
                    })
                    continue

                next_question = result.get("question")
                is_completed = result.get("is_completed", False)

                if not is_completed:
                    await websocket.send_json({
                        "type": "ai_response",
                        "text": next_question,
                        "question_index": result.get("question_index"),
                        "total_questions": result.get("total_questions", 6),
                        "evaluation": result.get("evaluation"),
                        "active_key_pool_count": len(gemini_service.api_keys),
                        "current_key_index": gemini_service.current_key_index + 1,
                    })
                else:
                    await websocket.send_json({
                        "type": "interview_completed",
                        "interview_id": interview.id,
                        "evaluation": result.get("evaluation"),
                    })
                    break

    except WebSocketDisconnect:
        logger.info(f"[WS] Client disconnected from interview session #{interview_id}")
    except Exception as e:
        logger.error(f"[WS] Error handling interview session #{interview_id}: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
    finally:
        db.close()
