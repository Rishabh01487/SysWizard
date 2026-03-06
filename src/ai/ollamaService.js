/**
 * Ollama API Service — connects to local Ollama for AI-powered explanations
 */

const OLLAMA_BASE = '/ollama'; // Proxied via Vite config

export class OllamaService {
    constructor() {
        this.model = 'deepseek-v3.1:671b-cloud';
        this.isAvailable = false;
        this.checkAvailability();
    }

    async checkAvailability() {
        try {
            const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(3000) });
            this.isAvailable = res.ok;
        } catch {
            this.isAvailable = false;
        }
        return this.isAvailable;
    }

    /**
     * Generate an explanation for the current animation step
     * @param {string} topic - Topic title
     * @param {string} stepDescription - Plain text description of the current step
     * @param {Function} onChunk - Called with each text chunk as it streams in
     * @returns {Promise<string>} Full response text
     */
    async generateExplanation(topic, stepDescription, onChunk) {
        const prompt = `You are a system design teacher. The student is viewing an animated visualization about "${topic}".

Current step being shown: "${stepDescription}"

Provide a clear, concise explanation (4-6 sentences) that:
1. Explains what's happening in this step in simple terms
2. Gives a real-world analogy if helpful
3. Mentions any important trade-offs or considerations

Keep it educational and beginner-friendly. Do NOT use markdown formatting.`;

        return this._stream(prompt, onChunk);
    }

    /**
     * Answer a question about a system design topic
     */
    async answerQuestion(topic, question, onChunk) {
        const prompt = `You are a system design expert teacher. The student is studying "${topic}" and asks:

"${question}"

Provide a clear, concise answer (4-8 sentences). Use simple language suitable for college students. Include real-world examples when helpful. Do NOT use markdown formatting.`;

        return this._stream(prompt, onChunk);
    }

    async _stream(prompt, onChunk) {
        if (!this.isAvailable) {
            await this.checkAvailability();
            if (!this.isAvailable) {
                throw new Error('Ollama is not running. Please start Ollama (ollama serve) and try again.');
            }
        }

        const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.model,
                prompt,
                stream: true,
                options: {
                    temperature: 0.7,
                    top_p: 0.9,
                    num_predict: 300,
                }
            })
        });

        if (!res.ok) {
            throw new Error(`Ollama error: ${res.status} ${res.statusText}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            // Ollama streams JSON lines
            const lines = chunk.split('\n').filter(l => l.trim());
            for (const line of lines) {
                try {
                    const json = JSON.parse(line);
                    if (json.response) {
                        fullText += json.response;
                        if (onChunk) onChunk(json.response, fullText);
                    }
                } catch { }
            }
        }

        return fullText;
    }
}
