"use client";

import { useEffect, useState } from "react";
import ProposalDialog from "./ProposalDialog";

/**
 * Client-side behaviour for the Night Ride homepage. The markup is server-rendered; this adds:
 *  - the proposal form, opened by any element with a `data-proposal="<source>"` attribute
 *  - the hero recordings: play on hover (or when centred on screen on phones), pause otherwise
 *  - the footer wordmark, scaled to fill the row
 *
 * The form is shown without a phone field: on the homepage the GoHighLevel chat widget has to be
 * the only place a phone number is collected (A2P 10DLC registration).
 */
export default function HomeEffects() {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState("home");

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-proposal]");
      if (!el) return;
      e.preventDefault();
      setSource(el.dataset.proposal || "home");
      setOpen(true);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".nr-home");
    if (!root) return;
    const clips = Array.from(root.querySelectorAll<HTMLElement>(".clip"));
    const status = root.querySelector<HTMLElement>("#reel-status");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const idle = canHover ? "STANDBY · HOVER A SITE TO PLAY" : "STANDBY · SCROLL TO PLAY";
    const setStatus = (t: string) => { if (status) status.textContent = t; };
    if (!canHover) setStatus(idle);
    const label = (clip: HTMLElement, t: string) => { const n = clip.querySelector(".play")?.lastChild; if (n) n.textContent = t; };

    const stop = (clip: HTMLElement) => {
      clip.classList.remove("playing");
      clip.querySelector("video")?.pause();
      if (!clips.some((c) => c.classList.contains("playing"))) setStatus(idle);
    };
    const play = (clip: HTMLElement) => {
      const v = clip.querySelector("video");
      if (!v) return;
      clips.forEach((c) => { if (c !== clip) stop(c); });
      clip.classList.add("playing");
      setStatus("PLAYING · " + (clip.dataset.name || "").toUpperCase());
      void v.play().catch(() => {});
    };

    const off: Array<() => void> = [];
    const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement, type: K, fn: (e: HTMLElementEventMap[K]) => void) => {
      el.addEventListener(type, fn);
      off.push(() => el.removeEventListener(type, fn));
    };

    clips.forEach((clip) => {
      const v = clip.querySelector("video");
      const bar = clip.querySelector<HTMLElement>(".prog b");
      if (v && bar) on(v, "timeupdate", () => { if (v.duration) bar.style.width = (v.currentTime / v.duration) * 100 + "%"; });
      if (reduce) label(clip, "Tap to play");
      on(clip, "mouseenter", () => { if (canHover && !reduce) play(clip); });
      on(clip, "mouseleave", () => { if (canHover && !reduce) stop(clip); });
      on(clip, "focus", () => play(clip));
      on(clip, "blur", () => stop(clip));
      on(clip, "click", () => (clip.classList.contains("playing") ? stop(clip) : play(clip)));
    });

    // Phones and tablets have no hover, so play whichever recording is centred on screen.
    let io: IntersectionObserver | undefined;
    if (!canHover && !reduce && "IntersectionObserver" in window) {
      clips.forEach((c) => label(c, "Plays in view"));
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting ? play(e.target as HTMLElement) : stop(e.target as HTMLElement)));
      }, { threshold: 0.75 });
      clips.forEach((c) => io!.observe(c));
    }

    // Footer wordmark: grow the type until the word fills the row.
    const wm = root.querySelector<HTMLElement>(".wordmark");
    const inner = wm?.querySelector<HTMLElement>(".wm-fit");
    const fit = () => {
      if (!wm || !inner) return;
      wm.style.fontSize = "100px";
      const r = wm.clientWidth / inner.getBoundingClientRect().width;
      wm.style.fontSize = Math.min(220, 100 * r * 0.985) + "px";
    };
    fit();
    void document.fonts?.ready.then(fit);
    window.addEventListener("resize", fit);

    return () => {
      off.forEach((f) => f());
      io?.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  return <ProposalDialog isOpen={open} onClose={() => setOpen(false)} source={source} hidePhone />;
}
