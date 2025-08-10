import { useEffect, useRef, useState } from "react";

/**
 * BackgroundFX
 * - Fixed, pointer-events-none overlay behind the app
 * - Adds a subtle interactive blur + color glow following the cursor
 * - Fades back smoothly (~0.3s) after movement stops
 */
export const BackgroundFX = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);
  const fadeTimer = useRef<number | null>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;

      if (raf.current == null) {
        raf.current = requestAnimationFrame(() => {
          raf.current = null;
          if (ref.current) {
            ref.current.style.setProperty("--x", `${pos.current.x}px`);
            ref.current.style.setProperty("--y", `${pos.current.y}px`);
          }
        });
      }

      setActive(true);
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
      fadeTimer.current = window.setTimeout(() => setActive(false), 250);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove as any);
      if (raf.current) cancelAnimationFrame(raf.current);
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    };
  }, []);

  return (
    <div ref={ref} className="interactive-bg fixed inset-0 z-30 pointer-events-none" aria-hidden="true">
      <div className={`mouse-blur transition-opacity duration-300 ease-out ${active ? "opacity-70" : "opacity-0"}`} />
      <div className={`mouse-color transition-opacity duration-300 ease-out ${active ? "opacity-60" : "opacity-0"}`} />
    </div>
  );
};

export default BackgroundFX;
