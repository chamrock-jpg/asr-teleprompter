from typing import Optional

from faster_whisper import WhisperModel
import numpy as np

from app.config import settings


class WhisperService:
    def __init__(self) -> None:
        self.model: Optional[WhisperModel] = None
        self.model_name: str = ""
        self.device_info: str = ""

    def load_model(self, model_size: str, device: str, compute_type: str) -> None:
        self.model = WhisperModel(model_size, device=device, compute_type=compute_type)
        self.model_name = model_size
        self.device_info = device

    def transcribe_chunk(self, audio_bytes: bytes) -> dict:
        """Transcribe a chunk of PCM audio (16-bit signed int, mono, 16kHz)."""
        if self.model is None:
            raise RuntimeError("Model not loaded")

        audio_np = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0

        segments, info = self.model.transcribe(
            audio_np,
            beam_size=1,
            language=settings.language,
            word_timestamps=True,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=300),
        )

        results = []
        for seg in segments:
            results.append(
                {
                    "text": seg.text.strip(),
                    "start": seg.start,
                    "end": seg.end,
                    "words": [
                        {
                            "word": w.word,
                            "start": w.start,
                            "end": w.end,
                            "probability": w.probability,
                        }
                        for w in (seg.words or [])
                    ],
                }
            )

        return {"segments": results, "language": info.language}

    def unload(self) -> None:
        self.model = None
