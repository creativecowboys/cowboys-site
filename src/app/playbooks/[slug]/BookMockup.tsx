/**
 * A paperback mockup built from the real cover art: the cover as the front
 * face, a spine, a page block and a soft floor shadow, in CSS 3D. No
 * generated pixels, so the cover text stays exactly as designed.
 *
 * Cover art: US letter (612 x 792), so the book keeps an 8.5 x 11 ratio.
 */

const STYLES = `
.bk{--w:220px;--h:calc(var(--w)*1.294);--d:14px;width:var(--w);height:var(--h);position:relative;perspective:1400px;perspective-origin:40% 50%;}
.bk-scene{position:absolute;inset:0;transform-style:preserve-3d;transform:rotateY(-22deg) rotateX(2deg);}
.bk-front{position:absolute;inset:0;transform:translateZ(calc(var(--d)/2));border-radius:2px 5px 5px 2px;overflow:hidden;box-shadow:inset 6px 0 10px -6px rgba(0,0,0,.55),inset -1px 0 0 rgba(255,255,255,.12);background:#0b0d0f;}
.bk-front img{display:block;width:100%;height:100%;object-fit:cover;}
.bk-front::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,0) 28%,rgba(255,255,255,0) 70%,rgba(255,255,255,.06) 100%);pointer-events:none;}
.bk-spine{position:absolute;top:0;left:0;width:var(--d);height:var(--h);transform:rotateY(-90deg) translateZ(0) translateX(calc(var(--d)/-2));transform-origin:left center;background:linear-gradient(90deg,#0a0c0e,#2a2e33 55%,#0a0c0e);border-radius:2px 0 0 2px;}
.bk-pages{position:absolute;top:3px;right:0;width:var(--d);height:calc(var(--h) - 6px);transform:rotateY(90deg) translateZ(0) translateX(calc(var(--d)/2));transform-origin:right center;background:repeating-linear-gradient(90deg,#f4f1ea 0 1px,#d9d4c8 1px 2px);}
.bk-back{position:absolute;inset:0;transform:translateZ(calc(var(--d)/-2));background:#15181b;border-radius:2px 5px 5px 2px;}
.bk-shadow{position:absolute;left:8%;right:-6%;bottom:-18px;height:26px;background:radial-gradient(ellipse at center,rgba(26,26,26,.45),rgba(26,26,26,0) 70%);filter:blur(4px);}
@media (min-width:640px){.bk{--w:260px}}
.bk.bk-lg{--w:260px}
@media (min-width:640px){.bk.bk-lg{--w:320px;--d:18px}}
@media (min-width:1024px){.bk.bk-lg{--w:340px}}
`;

export default function BookMockup({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
    return (
        <div className={`bk ${className}`}>
            <style dangerouslySetInnerHTML={{ __html: STYLES }} />
            <div className="bk-shadow" aria-hidden="true" />
            <div className="bk-scene">
                <div className="bk-back" aria-hidden="true" />
                <div className="bk-pages" aria-hidden="true" />
                <div className="bk-spine" aria-hidden="true" />
                <div className="bk-front">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={alt} width={612} height={792} loading="eager" decoding="async" />
                </div>
            </div>
        </div>
    );
}
