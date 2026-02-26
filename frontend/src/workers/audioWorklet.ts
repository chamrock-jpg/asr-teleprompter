/** AudioWorklet processor that captures PCM audio and sends to main thread. */
class PCMProcessor extends AudioWorkletProcessor {
  private buffer: Float32Array[] = [];
  private bufferSize = 0;
  private readonly TARGET_BUFFER = 4096; // ~256ms at 16kHz

  process(inputs: Float32Array[][]): boolean {
    const input = inputs[0]?.[0]; // Mono channel
    if (!input || input.length === 0) return true;

    this.buffer.push(new Float32Array(input));
    this.bufferSize += input.length;

    if (this.bufferSize >= this.TARGET_BUFFER) {
      const merged = this.mergeBuffers();
      this.port.postMessage({ type: 'audio', data: merged }, [merged.buffer]);
      this.buffer = [];
      this.bufferSize = 0;
    }

    return true;
  }

  private mergeBuffers(): Float32Array {
    const result = new Float32Array(this.bufferSize);
    let offset = 0;
    for (const buf of this.buffer) {
      result.set(buf, offset);
      offset += buf.length;
    }
    return result;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
