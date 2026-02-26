from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_size: str = "base"
    device: str = "auto"
    compute_type: str = "int8"
    sample_rate: int = 16000
    chunk_duration_ms: int = 2000
    chunk_overlap_ms: int = 500
    language: str | None = None
    host: str = "0.0.0.0"
    port: int = 8000

    model_config = {"env_prefix": "ASR_"}


settings = Settings()
