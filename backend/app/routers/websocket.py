import base64
import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.audio_processor import AudioProcessor

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws/asr")
async def asr_websocket(ws: WebSocket) -> None:
    await ws.accept()
    whisper = ws.app.state.whisper  # type: ignore[attr-defined]
    processor = AudioProcessor()

    await ws.send_json({"type": "status", "status": "ready"})

    try:
        while True:
            data = await ws.receive_text()
            msg = json.loads(data)

            if msg["type"] == "audio_chunk":
                audio_bytes = base64.b64decode(msg["data"])
                chunk = processor.add_audio(audio_bytes)

                if chunk is not None:
                    try:
                        result = whisper.transcribe_chunk(chunk)
                        for seg in result["segments"]:
                            if seg["text"].strip():
                                await ws.send_json(
                                    {
                                        "type": "transcription",
                                        "segment": seg,
                                        "is_partial": False,
                                    }
                                )
                    except Exception as e:
                        logger.error("Transcription error: %s", e)
                        await ws.send_json(
                            {
                                "type": "status",
                                "status": "error",
                                "message": str(e),
                            }
                        )

            elif msg["type"] == "stop":
                remaining = processor.flush()
                if remaining:
                    try:
                        result = whisper.transcribe_chunk(remaining)
                        for seg in result["segments"]:
                            if seg["text"].strip():
                                await ws.send_json(
                                    {
                                        "type": "transcription",
                                        "segment": seg,
                                        "is_partial": False,
                                    }
                                )
                    except Exception as e:
                        logger.error("Flush transcription error: %s", e)
                break

    except WebSocketDisconnect:
        logger.info("Client disconnected")
    except Exception as e:
        logger.error("WebSocket error: %s", e)
    finally:
        processor.reset()
