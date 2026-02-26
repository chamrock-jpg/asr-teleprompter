class AudioProcessor:
    """Manages an audio buffer that accumulates WebSocket chunks.

    Uses a rolling buffer strategy:
    - Accumulate audio until we have enough for transcription (e.g. 2 seconds)
    - Overlap with previous chunk to avoid cutting words at boundaries
    """

    def __init__(
        self,
        sample_rate: int = 16000,
        chunk_seconds: float = 2.0,
        overlap_seconds: float = 0.5,
    ) -> None:
        self.sample_rate = sample_rate
        self.chunk_seconds = chunk_seconds
        self.overlap_seconds = overlap_seconds
        self.buffer = bytearray()
        # 2 bytes per sample (int16)
        self.chunk_size = int(sample_rate * chunk_seconds * 2)
        self.overlap_size = int(sample_rate * overlap_seconds * 2)

    def add_audio(self, data: bytes) -> bytes | None:
        """Add audio data. Returns a chunk ready for transcription, or None."""
        self.buffer.extend(data)
        if len(self.buffer) >= self.chunk_size:
            chunk = bytes(self.buffer[: self.chunk_size])
            self.buffer = self.buffer[self.chunk_size - self.overlap_size :]
            return chunk
        return None

    def flush(self) -> bytes | None:
        """Return remaining audio in buffer if there's enough."""
        if len(self.buffer) > self.sample_rate:  # At least 0.5s
            chunk = bytes(self.buffer)
            self.buffer = bytearray()
            return chunk
        return None

    def reset(self) -> None:
        self.buffer = bytearray()
