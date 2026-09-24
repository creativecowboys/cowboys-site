/**
 * Confetti and sound for the winner reveal. Canvas + Web Audio, no libraries,
 * so nothing can fail to load halfway through a take.
 */

const COLORS = ["#B5330E", "#F2EBDA", "#DBC792", "#1F6B3A", "#E23D28", "#FFFFFF", "#F26522"];

type Piece = {
    x: number; y: number; vx: number; vy: number;
    rot: number; vr: number; flip: number; vf: number;
    w: number; h: number; color: string; shape: 0 | 1 | 2; life: number;
};

export class Confetti {
    private pieces: Piece[] = [];
    private raf = 0;
    private ctx: CanvasRenderingContext2D;
    private rainUntil = 0;

    constructor(private canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d")!;
    }

    private resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const { clientWidth: w, clientHeight: h } = this.canvas;
        if (this.canvas.width !== w * dpr || this.canvas.height !== h * dpr) {
            this.canvas.width = w * dpr;
            this.canvas.height = h * dpr;
        }
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    private add(x: number, y: number, angle: number, spread: number, speed: number, count: number) {
        const scale = Math.max(this.canvas.clientWidth, 600) / 1200;
        for (let i = 0; i < count; i++) {
            const a = angle + (Math.random() - 0.5) * spread;
            const v = speed * (0.45 + Math.random() * 0.75) * scale;
            this.pieces.push({
                x, y,
                vx: Math.cos(a) * v, vy: Math.sin(a) * v,
                rot: Math.random() * Math.PI * 2, vr: (Math.random() - 0.5) * 0.35,
                flip: Math.random() * Math.PI, vf: 0.08 + Math.random() * 0.2,
                w: (8 + Math.random() * 9) * scale, h: (5 + Math.random() * 6) * scale,
                color: COLORS[(Math.random() * COLORS.length) | 0],
                shape: (Math.random() < 0.6 ? 0 : Math.random() < 0.6 ? 1 : 2) as 0 | 1 | 2,
                life: 0,
            });
        }
        if (!this.raf) this.raf = requestAnimationFrame(this.frame);
    }

    /** The reveal: two cannons from the bottom corners, a center pop, then a slow rain. */
    celebrate() {
        const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
        this.add(0, h, -Math.PI / 3, 0.7, 34, 220);
        this.add(w, h, (-2 * Math.PI) / 3, 0.7, 34, 220);
        setTimeout(() => this.add(w / 2, h * 0.45, -Math.PI / 2, Math.PI * 2, 22, 260), 180);
        setTimeout(() => {
            this.add(0, h * 0.8, -Math.PI / 4, 0.6, 30, 120);
            this.add(w, h * 0.8, (-3 * Math.PI) / 4, 0.6, 30, 120);
        }, 900);
        this.rainUntil = performance.now() + 7000;
    }

    stop() {
        this.pieces = [];
        this.rainUntil = 0;
        cancelAnimationFrame(this.raf);
        this.raf = 0;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private frame = () => {
        this.resize();
        const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, w, h);

        if (performance.now() < this.rainUntil) {
            for (let i = 0; i < 3; i++) this.add(Math.random() * w, -20, Math.PI / 2, 0.6, 3, 1);
        }

        this.pieces = this.pieces.filter((p) => p.y < h + 40 && p.life < 900);
        for (const p of this.pieces) {
            p.life++;
            p.vx *= 0.985;
            p.vy = p.vy * 0.985 + 0.32;
            p.x += p.vx + Math.sin(p.life * 0.07 + p.flip) * 0.6;
            p.y += p.vy;
            p.rot += p.vr;
            p.flip += p.vf;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.scale(1, Math.cos(p.flip));
            ctx.fillStyle = p.color;
            if (p.shape === 0) ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            else if (p.shape === 1) {
                ctx.beginPath();
                ctx.arc(0, 0, p.h * 0.7, 0, Math.PI * 2);
                ctx.fill();
            } else star(ctx, p.w * 0.7);
            ctx.restore();
        }

        this.raf = this.pieces.length || performance.now() < this.rainUntil ? requestAnimationFrame(this.frame) : 0;
    };
}

function star(ctx: CanvasRenderingContext2D, r: number) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
        const rad = i % 2 ? r * 0.45 : r;
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fill();
}

/** Synthesised sound, so there are no audio files to load or license. */
export class Sfx {
    private ac: AudioContext | null = null;
    muted = false;

    private get ctx() {
        if (!this.ac) this.ac = new AudioContext();
        if (this.ac.state === "suspended") void this.ac.resume();
        return this.ac;
    }

    private tone(freq: number, dur: number, type: OscillatorType, gain: number, at = 0) {
        if (this.muted) return;
        const ac = this.ctx;
        const t = ac.currentTime + at;
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g).connect(ac.destination);
        osc.start(t);
        osc.stop(t + dur + 0.02);
    }

    /** One reel click; pitch climbs as the reel slows so the tension builds. */
    tick(progress: number) {
        this.tone(700 + progress * 700, 0.05, "square", 0.05);
    }

    /** Wake the audio context on the GO press so the first tick isn't lost. */
    prime() {
        if (!this.muted) void this.ctx;
    }

    fanfare() {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((f, i) => this.tone(f, 0.18, "triangle", 0.22, i * 0.09));
        [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f) => this.tone(f, 1.6, "sawtooth", 0.045, 0.4));
        [1046.5, 1318.5, 1567.98].forEach((f) => this.tone(f, 1.8, "triangle", 0.12, 0.4));
    }
}
