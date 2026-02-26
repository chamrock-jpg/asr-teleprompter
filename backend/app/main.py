import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import health, websocket
from app.services.whisper_service import WhisperService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

whisper_service = WhisperService()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    logger.info(
        "Loading Whisper model: %s (device=%s, compute=%s)",
        settings.model_size,
        settings.device,
        settings.compute_type,
    )
    whisper_service.load_model(
        settings.model_size, settings.device, settings.compute_type
    )
    app.state.whisper = whisper_service
    logger.info("Whisper model loaded successfully")
    yield
    whisper_service.unload()
    logger.info("Whisper model unloaded")


app = FastAPI(title="Teleprompter ASR Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(websocket.router)
