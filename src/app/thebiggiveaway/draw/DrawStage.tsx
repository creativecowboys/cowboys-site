"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Confetti, Sfx } from "./fx";
import { dedupe, detectColumns, fairIndex, isServiceType, toEntries, toSheet, type Columns, type Entry, type Field, type Sheet } from "./entries";
import "./draw.css";

type Phase = "ready" | "spinning" | "winner";
type Draw = { entry: Entry; at: Date; pool: number };

/** Columns the panel lets you pick, in the order shown. */
const PICKABLE: Array<[Field, string]> = [["business", "Business name (shown on screen)"], ["type", "Business type"], ["city", "City"]];

const SAMPLE = [
    "Peach State Plumbing", "Carroll County HVAC", "Villa Rica Roofing Co.", "Southern Pride Lawn Care",
    "Blue Ridge Electric", "Magnolia Pest Control", "Chattahoochee Pressure Washing", "Douglas Auto Repair",
    "West Georgia Garage Doors", "Tallapoosa Tree Service", "Hometown Handyman", "Big Oak Painting",
    "Fresh Start Cleaning", "Iron Horse Fencing", "Pine Needle Landscaping", "Summit Pool & Spa",
].map((business) => ({ business, type: "", city: "", contact: "", email: "", phone: "" }));

/** Reel timing: many fast clicks that ease out, ~6.5s in total. */
const TICKS = 48;
const tickDelay = (i: number) => 40 + 380 * Math.pow(i / TICKS, 3);

export default function DrawStage() {
    const [all, setAll] = useState<Entry[]>([]);
    const [dupes, setDupes] = useState(0);
    const [off, setOff] = useState<Set<string>>(new Set());
    const [excluded, setExcluded] = useState<Set<Entry>>(new Set());
    const [draws, setDraws] = useState<Draw[]>([]);
    const [isSample, setIsSample] = useState(false);
    const [sheet, setSheet] = useState<Sheet | null>(null);
    const [cols, setCols] = useState<Columns | null>(null);

    const [phase, setPhase] = useState<Phase>("ready");
    const [reel, setReel] = useState<{ prev: string; cur: string; next: string; i: number; ms: number }>();
    const [winner, setWinner] = useState<Entry>();
    const [flash, setFlash] = useState(0);

    const [setupOpen, setSetupOpen] = useState(true);
    const [clean, setClean] = useState(false);
    const [vertical, setVertical] = useState(false);
    const [muted, setMuted] = useState(false);
    const [paste, setPaste] = useState("");

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const confetti = useRef<Confetti>(null);
    const sfx = useRef(new Sfx());
    const timers = useRef<number[]>([]);

    useEffect(() => {
        confetti.current = new Confetti(canvasRef.current!);
        const t = timers.current;
        return () => {
            t.forEach(clearTimeout);
            confetti.current?.stop();
        };
    }, []);
    useEffect(() => { sfx.current.muted = muted; }, [muted]);

    const types = useMemo(() => {
        const counts = new Map<string, number>();
        for (const e of all) if (e.type) counts.set(e.type, (counts.get(e.type) ?? 0) + 1);
        return [...counts].sort((a, b) => b[1] - a[1]);
    }, [all]);

    const pool = useMemo(
        () => all.filter((e) => !off.has(e.type) && !excluded.has(e)),
        [all, off, excluded],
    );

    function load(text: string, sample = false) {
        if (sample) {
            setSheet(null);
            setCols(null);
            applyEntries(SAMPLE, 0, true);
            return;
        }
        const next = toSheet(text);
        const detected = detectColumns(next);
        setSheet(next);
        setCols(detected);
        const { kept, removed } = dedupe(toEntries(next, detected));
        applyEntries(kept, removed, false);
    }

    function pickColumn(field: Field, i: number) {
        if (!sheet || !cols) return;
        const next = { ...cols, [field]: i };
        setCols(next);
        const { kept, removed } = dedupe(toEntries(sheet, next));
        applyEntries(kept, removed, false);
    }

    function applyEntries(kept: Entry[], removed: number, sample: boolean) {
        setAll(kept);
        setDupes(removed);
        setOff(new Set(kept.map((e) => e.type).filter((t) => t && !isServiceType(t))));
        setExcluded(new Set());
        setIsSample(sample);
        setPhase("ready");
        setWinner(undefined);
        confetti.current?.stop();
    }

    async function onFile(file?: File) {
        if (file) load(await file.text());
    }

    const go = useCallback(() => {
        if (phase !== "ready" || pool.length === 0) return;
        const names = pool.map((e) => e.business);
        const pick = pool[fairIndex(pool.length)];

        // Decoys for the reel, never the winner right before the stop so the
        // landing always reads as a change.
        const seq: string[] = [];
        for (let i = 0; i < TICKS; i++) {
            let n = names[(Math.random() * names.length) | 0];
            if (names.length > 1) while (n === pick.business || n === seq[i - 1]) n = names[(Math.random() * names.length) | 0];
            seq.push(n);
        }
        seq.push(pick.business, names[(Math.random() * names.length) | 0]);

        sfx.current.prime();
        setPhase("spinning");
        setWinner(undefined);
        confetti.current?.stop();

        let t = 0;
        for (let i = 0; i <= TICKS; i++) {
            const ms = tickDelay(i);
            timers.current.push(window.setTimeout(() => {
                setReel({ prev: seq[i - 1] ?? seq[TICKS + 1], cur: seq[i], next: seq[i + 1], i, ms });
                sfx.current.tick(i / TICKS);
            }, t));
            t += ms;
        }
        timers.current.push(window.setTimeout(() => {
            setWinner(pick);
            setPhase("winner");
            setFlash((f) => f + 1);
            setDraws((d) => [{ entry: pick, at: new Date(), pool: pool.length }, ...d]);
            confetti.current?.celebrate();
            sfx.current.fanfare();
        }, t + 450));
    }, [phase, pool]);

    const reset = useCallback((dropWinner: boolean) => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
        confetti.current?.stop();
        if (dropWinner && winner) setExcluded((s) => new Set(s).add(winner));
        setWinner(undefined);
        setReel(undefined);
        setPhase("ready");
    }, [winner]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.target as HTMLElement).closest("textarea, input")) return;
            const k = e.key.toLowerCase();
            if (k === " " || k === "enter") { e.preventDefault(); if (!setupOpen) go(); }
            else if (k === "f") {
                if (document.fullscreenElement) void document.exitFullscreen();
                else void document.documentElement.requestFullscreen();
            }
            else if (k === "h") setClean((c) => !c);
            else if (k === "v") setVertical((v) => !v);
            else if (k === "m") setMuted((m) => !m);
            else if (k === "s") setSetupOpen((o) => !o);
            else if (k === "r" && phase === "winner") reset(false);
            else if (k === "escape") setSetupOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [go, reset, phase, setupOpen]);

    // Sized to the name's length; the 9:16 frame is narrow, so there it runs
    // bigger and wraps onto more lines instead.
    const nameSize = (s: string) => {
        const len = Math.max(s.length, 1);
        const cqw = vertical ? Math.min(20, Math.max(11, 260 / len)) : Math.min(15, Math.max(7.5, 175 / len));
        return `${cqw}cqw`;
    };

    return (
        <div className={`gd-root${clean ? " gd-clean" : ""}`}>
            <div className={`gd-stage${vertical ? " gd-vertical" : ""}${phase === "winner" ? " gd-won" : ""}`}>
                <div className="gd-snow" aria-hidden />
                <div className="gd-rays" aria-hidden />

                <header className="gd-head">
                    <span className="gd-badge">CHRISTMAS IN SEPTEMBER</span>
                    <h1 className="gd-title">THE BIG GIVEAWAY</h1>
                    <p className="gd-sub">NEW WEBSITE + 12 MONTHS OF GROWTH MAX · $44,000 VALUE</p>
                </header>

                <main className="gd-center">
                    {phase === "ready" && (
                        <>
                            <p className="gd-count">
                                IT&apos;S TIME TO DRAW <b>THE WINNER</b>
                            </p>
                            <div className={`gd-go-wrap${pool.length === 0 ? " gd-go-off" : ""}`}>
                                <button className="gd-go" onClick={go} disabled={pool.length === 0}>
                                    <span>GO</span>
                                </button>
                            </div>
                        </>
                    )}

                    {phase === "spinning" && reel && (
                        <div className="gd-reel" style={{ "--ms": `${Math.min(reel.ms, 200)}ms` } as React.CSSProperties}>
                            <div className="gd-reel-col" key={reel.i}>
                                <div className="gd-row gd-dim">{reel.next}</div>
                                <div className="gd-row gd-cur" style={{ fontSize: `${Math.min(13, 150 / Math.max(reel.cur.length, 1))}cqw` }}>{reel.cur}</div>
                                <div className="gd-row gd-dim">{reel.prev}</div>
                            </div>
                        </div>
                    )}

                    {phase === "winner" && winner && (
                        <div className="gd-reveal">
                            <p className="gd-kicker">WE HAVE A WINNER!</p>
                            <h2 className="gd-name" style={{ fontSize: nameSize(winner.business) }}>{winner.business}</h2>
                            {winner.city && <p className="gd-city">{winner.city}</p>}
                        </div>
                    )}
                </main>

                <footer className="gd-foot">CREATIVECOWBOYS.CO</footer>
                <canvas ref={canvasRef} className="gd-confetti" />
                {flash > 0 && <div className="gd-flash" key={flash} />}
            </div>

            <nav className="gd-bar">
                <button onClick={() => setSetupOpen(true)}>Entries (S)</button>
                {phase === "winner" && <button onClick={() => reset(false)}>Reset (R)</button>}
                {phase === "winner" && <button onClick={() => reset(true)}>Redraw without this winner</button>}
                <button onClick={() => setVertical((v) => !v)}>{vertical ? "16:9" : "9:16"} frame (V)</button>
                <button onClick={() => setMuted((m) => !m)}>{muted ? "Sound off" : "Sound on"} (M)</button>
                <button onClick={() => document.documentElement.requestFullscreen()}>Fullscreen (F)</button>
                <button onClick={() => setClean(true)}>Hide controls (H)</button>
            </nav>

            {setupOpen && (
                <div className="gd-setup" onClick={(e) => e.target === e.currentTarget && all.length && setSetupOpen(false)}>
                    <div className="gd-panel">
                        <h2>Load the entries</h2>
                        <p className="gd-help">
                            In the entries Google Sheet, choose <b>File → Download → Comma-separated values (.csv)</b>, then drop the file here.
                            The list stays in this browser tab and isn&apos;t uploaded anywhere.
                        </p>

                        <label
                            className="gd-drop"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); void onFile(e.dataTransfer.files[0]); }}
                        >
                            <input type="file" accept=".csv,text/csv,text/plain" onChange={(e) => void onFile(e.target.files?.[0])} />
                            Drop the CSV here or click to choose it
                        </label>

                        <details className="gd-paste">
                            <summary>Or paste a list (one business per line, or CSV with a header row)</summary>
                            <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={6} />
                            <button onClick={() => load(paste)} disabled={!paste.trim()}>Use this list</button>
                        </details>

                        {sheet && cols && sheet.header.length > 1 && (
                            <div className="gd-cols">
                                <p className="gd-help">
                                    Check these columns before you draw. The business name column is what appears on screen.
                                </p>
                                {PICKABLE.map(([field, label]) => (
                                    <label key={field} className="gd-col">
                                        <span>{label}</span>
                                        <select value={cols[field]} onChange={(e) => pickColumn(field, Number(e.target.value))}>
                                            <option value={-1}>(none)</option>
                                            {sheet.header.map((h, i) => (
                                                <option key={i} value={i}>{h || `Column ${i + 1}`}</option>
                                            ))}
                                        </select>
                                    </label>
                                ))}
                                {all.length > 0 && (
                                    <p className="gd-preview">
                                        On screen it will look like: <b>{all.slice(0, 3).map((e) => e.business).join(" · ")}</b>
                                    </p>
                                )}
                                {all.some((e) => e.business.length > 60) && (
                                    <p className="gd-warn">Some names in this column are very long. Make sure it&apos;s the business name column, not notes.</p>
                                )}
                            </div>
                        )}

                        {all.length > 0 && (
                            <div className="gd-stats">
                                <p>
                                    <b>{all.length}</b> unique businesses loaded
                                    {dupes > 0 && <> · {dupes} duplicate {dupes === 1 ? "entry" : "entries"} removed (one entry per business)</>}
                                    {excluded.size > 0 && <> · {excluded.size} previous winner{excluded.size > 1 ? "s" : ""} removed</>}
                                    {" · "}<b>{pool.length}</b> in the draw
                                </p>
                                {isSample && <p className="gd-warn">These are made-up rehearsal names. Load the real CSV before the real take.</p>}

                                {types.length > 0 && (
                                    <>
                                        <p className="gd-help">
                                            Business types in the draw. Only <b>service-based businesses</b> are eligible, so non-service types start
                                            switched off. Click a type to switch it on or off.
                                        </p>
                                        <div className="gd-chips">
                                            {types.map(([t, n]) => (
                                                <button
                                                    key={t}
                                                    className={off.has(t) ? "gd-chip gd-chip-off" : "gd-chip"}
                                                    onClick={() => setOff((s) => {
                                                        const next = new Set(s);
                                                        if (next.has(t)) next.delete(t); else next.add(t);
                                                        return next;
                                                    })}
                                                >
                                                    {t} <span>{n}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {draws.length > 0 && (
                            <div className="gd-log">
                                <h3>Draw log</h3>
                                {draws.map((d, i) => (
                                    <div key={i} className="gd-log-row">
                                        <b>{d.entry.business}</b>
                                        <span>{[d.entry.contact, d.entry.phone, d.entry.email].filter(Boolean).join(" · ")}</span>
                                        <span className="gd-muted">{d.at.toLocaleString()} · drawn from {d.pool}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="gd-actions">
                            <button className="gd-ghost" onClick={() => load("", true)}>Load rehearsal names</button>
                            <button className="gd-primary" disabled={pool.length === 0} onClick={() => setSetupOpen(false)}>
                                Go to the stage
                            </button>
                        </div>
                        <p className="gd-keys">
                            On stage: <kbd>Space</kbd> GO · <kbd>F</kbd> fullscreen · <kbd>H</kbd> hide controls · <kbd>V</kbd> 9:16 frame ·{" "}
                            <kbd>M</kbd> sound · <kbd>R</kbd> reset · <kbd>S</kbd> entries
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
