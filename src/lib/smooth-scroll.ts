/**
 * Shared smooth-scroll driver.
 *
 * Native wheel scrolling is stepped (especially on Windows mice), which makes
 * the document ruler jump. This is a small, dependency-free version of the
 * behaviour ArtCraft gets from Lenis: wheel movement and ruler drags chase the
 * target with a lerp, while clicks use an ease-out jump.
 */

type Mode = "idle" | "chase" | "jump";

const EASE_OUT_EXPO = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

let mode: Mode = "idle";
let frame = 0;
let target = 0;
let jumpFrom = 0;
let jumpStart = 0;
let jumpDuration = 0;
let lastFrame = 0;
let chaseLerp = 0.18;
let chaseY = 0;

function maxScroll(): number {
  return Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
}

function clamp(value: number): number {
  return Math.max(0, Math.min(maxScroll(), value));
}

function writeScroll(top: number): void {
  // `instant` bypasses the global smooth-scroll CSS so the driver owns the
  // easing curve instead of the browser restarting a smooth scroll each frame.
  window.scrollTo({ top, behavior: "instant" as ScrollBehavior });
}

function stopFrame(): void {
  if (frame) {
    window.cancelAnimationFrame(frame);
    frame = 0;
  }
}

function tick(now: number): void {
  if (mode === "jump") {
    const progress = Math.min(1, (now - jumpStart) / jumpDuration);
    writeScroll(jumpFrom + (target - jumpFrom) * EASE_OUT_EXPO(progress));
    if (progress >= 1) {
      mode = "idle";
      frame = 0;
      return;
    }
    frame = window.requestAnimationFrame(tick);
    return;
  }

  if (mode === "chase") {
    const delta = Math.min(32, now - (lastFrame || now)) || 16;
    lastFrame = now;
    const distance = target - chaseY;
    if (Math.abs(distance) < 1) {
      writeScroll(target);
      mode = "idle";
      frame = 0;
      return;
    }
    // Lerp is expressed per 60fps frame, like ArtCraft's Lenis values, rather
    // than as a raw exponential rate. `chaseY` is virtual because browsers
    // round window.scrollY to integers; reading it back would stall a chase.
    chaseY +=
      distance * (1 - Math.pow(1 - chaseLerp, delta / 16.6667));
    writeScroll(Math.round(chaseY));
    frame = window.requestAnimationFrame(tick);
    return;
  }

  frame = 0;
}

/** Cancel any in-flight smooth scroll. */
export function stopSmoothScroll(): void {
  stopFrame();
  mode = "idle";
}

/** Scroll to an absolute position with ArtCraft's ease-out jump timing. */
export function smoothScrollTo(top: number, duration?: number): void {
  const destination = clamp(top);
  const distance = Math.abs(destination - window.scrollY);
  if (distance < 1) return;

  stopFrame();
  target = destination;
  jumpFrom = window.scrollY;
  jumpStart = performance.now();
  jumpDuration =
    duration ??
    1250 * (0.4 + 0.6 * Math.min(1, distance / (2.5 * window.innerHeight)));
  mode = "jump";
  frame = window.requestAnimationFrame(tick);
}

/** Chase an absolute position (used while dragging the ruler). */
export function chaseTo(top: number, lerp = 0.18): void {
  const destination = clamp(top);
  if (mode === "jump") {
    stopFrame();
  }
  target = destination;
  chaseLerp = lerp;
  if (mode !== "chase") {
    mode = "chase";
    chaseY = window.scrollY;
    lastFrame = performance.now();
    stopFrame();
    frame = window.requestAnimationFrame(tick);
  }
}

/** Add a wheel delta to the current chase target. */
export function chaseBy(delta: number, lerp = 0.12): void {
  if (mode !== "chase") {
    stopFrame();
    chaseY = window.scrollY;
    target = window.scrollY;
    mode = "chase";
    lastFrame = performance.now();
  }
  target = clamp(target + delta);
  chaseLerp = lerp;
  if (!frame) frame = window.requestAnimationFrame(tick);
}
