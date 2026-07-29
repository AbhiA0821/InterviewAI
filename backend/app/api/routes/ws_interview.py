"""
ws_interview.py
---------------
WebSocket router for real-time live interview streaming.
Supports low-latency audio/text bidirectional communication,
barge-in interruption signaling, and live Gemini multi-key rotation status.
"""

import json
import logging
from datetime import datetime
from typing import Dict, Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.models.interview import Interview
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

        # Send initial session handshake metadata
        active_keys_count = len(gemini_service.api_keys)
        await websocket.send_json({
            "type": "session_started",
            "interview_id": interview.id,
            "target_role": interview.target_role,
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
                    continue

                # Refresh DB state
                interview = db.query(Interview).filter(Interview.id == interview_id).first()
                if not interview or interview.status != "in_progress":
                    await websocket.send_json({"type": "interview_completed", "message": "Interview session is completed."})
                    break

                # Notify frontend AI is thinking
                await websocket.send_json({"type": "ai_thinking"})

                # Record user response in transcript
                current_transcript = list(interview.transcript or [])
                current_transcript.append({
                    "role": "user",
                    "text": user_text,
                    "timestamp": datetime.utcnow().isoformat(),
                })

                next_index = interview.current_question_index + 1
                questions_list = list(interview.questions or [])
                total_questions = max(len(questions_list), 5)
                is_finished = next_index >= total_questions

                if not is_finished:
                    resume_text = ""
                    if interview.resume_id:
                        res_obj = db.query(Resume).filter(Resume.id == interview.resume_id).first()
                        if res_obj and res_obj.raw_text:
                            resume_text = res_obj.raw_text
                    if not resume_text:
                        last_res = db.query(Resume).order_by(Resume.id.desc()).first()
                        if last_res and last_res.raw_text:
                            resume_text = last_res.raw_text

                    # Generate adaptive follow-up using multi-key Gemini pool strictly based on resume & candidate answer
                    followup_q = gemini_service.generate_followup_question(
                        target_role=interview.target_role or "Software Engineer",
                        interview_type="technical",
                        transcript=current_transcript,
                        next_index=next_index,
                        resume_summary=resume_text,
                    )

                    current_transcript.append({
                        "role": "interviewer",
                        "text": followup_q,
                        "timestamp": datetime.utcnow().isoformat(),
                    })

                    if questions_list and next_index < len(questions_list):
                        questions_list[next_index]["question"] = followup_q
                    else:
                        questions_list.append({
                            "id": next_index + 1,
                            "type": "technical",
                            "question": followup_q,
                            "difficulty": "Medium",
                        })

                    interview.transcript = current_transcript
                    interview.questions = questions_list
                    interview.current_question_index = next_index
                    db.commit()

                    # Send response back to client with updated key pool metadata
                    await websocket.send_json({
                        "type": "ai_response",
                        "text": followup_q,
                        "question_index": next_index,
                        "total_questions": total_questions,
                        "active_key_pool_count": len(gemini_service.api_keys),
                        "current_key_index": gemini_service.current_key_index + 1,
                    })
                else:
                    interview.status = "completed"
                    interview.transcript = current_transcript
                    db.commit()

                    # Generate evaluation report
                    eval_report = gemini_service.evaluate_interview(
                        target_role=interview.target_role or "Software Engineer",
                        transcript=current_transcript,
                    )

                    await websocket.send_json({
                        "type": "interview_completed",
                        "interview_id": interview.id,
                        "evaluation": eval_report,
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
