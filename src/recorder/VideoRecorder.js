/**
 * VideoRecorder — Records canvas animation as WebM video
 */
export class VideoRecorder {
    constructor(canvas) {
        this.canvas = canvas;
        this.recorder = null;
        this.chunks = [];
        this.isRecording = false;
        this.startTime = 0;
        this.onStatusChange = null;
    }

    start() {
        if (this.isRecording) return;

        const stream = this.canvas.captureStream(30); // 30 fps
        this.chunks = [];

        const mimeTypes = [
            'video/webm;codecs=vp9',
            'video/webm;codecs=vp8',
            'video/webm',
        ];

        let mimeType = '';
        for (const mt of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mt)) {
                mimeType = mt;
                break;
            }
        }

        if (!mimeType) {
            alert('Video recording is not supported in this browser.');
            return;
        }

        this.recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 5000000, // 5 Mbps
        });

        this.recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                this.chunks.push(e.data);
            }
        };

        this.recorder.onstop = () => {
            this._download();
        };

        this.recorder.start(100); // collect data every 100ms
        this.isRecording = true;
        this.startTime = Date.now();

        if (this.onStatusChange) this.onStatusChange(true);
    }

    stop() {
        if (!this.isRecording || !this.recorder) return;
        this.recorder.stop();
        this.isRecording = false;

        if (this.onStatusChange) this.onStatusChange(false);
    }

    getElapsed() {
        if (!this.isRecording) return 0;
        return Date.now() - this.startTime;
    }

    _download() {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-design-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.chunks = [];
    }
}
