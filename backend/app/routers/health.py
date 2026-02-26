from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/health")
async def health_check(request: Request) -> dict:
    whisper = request.app.state.whisper
    return {
        "status": "ok",
        "model_loaded": whisper.model is not None,
        "model_name": whisper.model_name,
        "device": whisper.device_info,
    }
