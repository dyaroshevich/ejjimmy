import { interpolate, Easing } from "remotion";

/**
 * Typewriter effect — посимвольное появление текста
 */
export function typewriter(text: string, frame: number, startFrame: number, charsPerFrame = 1): string {
  const elapsed = Math.max(0, frame - startFrame);
  const charsToShow = Math.min(Math.floor(elapsed * charsPerFrame), text.length);
  return text.slice(0, charsToShow);
}

export function isTyping(frame: number, startFrame: number, text: string, charsPerFrame = 1): boolean {
  const elapsed = Math.max(0, frame - startFrame);
  const charsShown = Math.floor(elapsed * charsPerFrame);
  return charsShown < text.length;
}

/**
 * Slide in — плавное появление снизу/сбоку
 */
export function slideIn(
  frame: number,
  start: number,
  dist = 60,
  duration = 20,
): number {
  if (frame < start) return dist;
  return interpolate(frame, [start, start + duration], [dist, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
  });
}

/**
 * Scale pop — overshoot эффект (1.08 → 1.0)
 */
export function scalePop(
  frame: number,
  start: number,
  duration = 20,
): number {
  if (frame < start) return 0.5;
  const t = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const overshoot = 1.08;
  const t1 = t - 1;
  return 1 + (t1 * t1 * ((overshoot + 1) * t1 + overshoot)) * -1;
}

/**
 * Anticipation — scale DOWN перед появлением (0.92 → 1.0)
 */
export function anticipate(
  frame: number,
  start: number,
  prepDuration = 6,
  targetScale = 0.92,
): number {
  if (frame < start - prepDuration) return 1;
  if (frame >= start) return 1;
  return interpolate(frame, [start - prepDuration, start], [1, targetScale], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/**
 * Pulse — плавная синусоида для CTA
 */
export function pulse(
  frame: number,
  start: number,
  speed = 0.12,
  amplitude = 0.03,
): number {
  if (frame < start) return 1;
  return 1 + Math.sin((frame - start) * speed) * amplitude;
}

/**
 * Shake — затухающая вибрация
 */
export function shake(
  frame: number,
  start: number,
  duration = 20,
  frequency = 4,
  amplitude = 6,
): number {
  if (frame < start || frame > start + duration) return 0;
  const decay = interpolate(frame, [start, start + duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.sin(frame * frequency) * amplitude * decay;
}

/**
 * Bounce — пружинный отскок (damped spring)
 */
export function bounce(
  frame: number,
  start: number,
  damping = 0.6,
  frequency = 0.3,
): number {
  if (frame < start) return 0;
  const t = frame - start;
  return 1 - Math.exp(-damping * t) * Math.cos(frequency * t);
}

/**
 * Stagger delay — задержка для дочерних элементов
 */
export function stagger(index: number, delayPerItem = 4, startDelay = 0): number {
  return startDelay + index * delayPerItem;
}

// ═══════════════════════════════════════════════════════════════════
// KINETIC TYPOGRAPHY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Letter-by-letter с overshoot — каждая буква появляется отдельно
 */
export function letterByLetter(
  text: string,
  frame: number,
  startFrame: number,
  framesPerLetter = 3,
): string {
  const elapsed = Math.max(0, frame - startFrame);
  const charsToShow = Math.min(Math.floor(elapsed / framesPerLetter), text.length);
  return text.slice(0, charsToShow);
}

/**
 * Letter opacity — прозрачность каждой буквы для kinetic эффекта
 */
export function letterOpacity(
  index: number,
  frame: number,
  startFrame: number,
  framesPerLetter = 3,
  fadeDuration = 6,
): number {
  const letterStart = startFrame + index * framesPerLetter;
  return interpolate(frame, [letterStart, letterStart + fadeDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/**
 * Letter scale — масштаб каждой буквы для kinetic эффекта
 */
export function letterScale(
  index: number,
  frame: number,
  startFrame: number,
  framesPerLetter = 3,
  overshoot = 1.3,
): number {
  const letterStart = startFrame + index * framesPerLetter;
  const t = interpolate(frame, [letterStart, letterStart + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  if (t === 0) return 0.5;
  const t1 = t - 1;
  return 1 + (t1 * t1 * ((overshoot + 1) * t1 + overshoot)) * -1;
}

/**
 * Word reveal — слова появляются одно за другим
 */
export function wordReveal(
  text: string,
  frame: number,
  startFrame: number,
  framesPerWord = 8,
): string {
  const words = text.split(" ");
  const elapsed = Math.max(0, frame - startFrame);
  const wordsToShow = Math.min(Math.floor(elapsed / framesPerWord), words.length);
  return words.slice(0, wordsToShow).join(" ");
}

/**
 * Word opacity — прозрачность каждого слова
 */
export function wordOpacity(
  index: number,
  frame: number,
  startFrame: number,
  framesPerWord = 8,
  fadeDuration = 10,
): number {
  const wordStart = startFrame + index * framesPerWord;
  return interpolate(frame, [wordStart, wordStart + fadeDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/**
 * Word slide — смещение каждого слова
 */
export function wordSlide(
  index: number,
  frame: number,
  startFrame: number,
  framesPerWord = 8,
  dist = 40,
): number {
  const wordStart = startFrame + index * framesPerWord;
  return interpolate(frame, [wordStart, wordStart + 15], [dist, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
}

/**
 * Counter animation — число считает вверх/вниз
 */
export function counterAnimation(
  target: number,
  frame: number,
  startFrame: number,
  duration = 40,
  decimals = 0,
): number {
  const t = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return Number((target * t).toFixed(decimals));
}

/**
 * Counter with prefix/suffix — formatted counter
 */
export function counterFormatted(
  target: number,
  frame: number,
  startFrame: number,
  duration = 40,
  prefix = "",
  suffix = "",
  decimals = 0,
): string {
  const value = counterAnimation(target, frame, startFrame, duration, decimals);
  return `${prefix}${value.toLocaleString()}${suffix}`;
}

/**
 * Glow pulse — пульсирующее свечение (CSS box-shadow)
 */
export function glowPulse(
  frame: number,
  start: number,
  color = "#FF8A00",
  intensity = 20,
  speed = 0.15,
): string {
  if (frame < start) return "none";
  const glow = intensity + Math.sin((frame - start) * speed) * (intensity * 0.4);
  return `0 0 ${glow}px ${color}60, 0 0 ${glow * 2}px ${color}30`;
}

/**
 * Glow burst — одноразовая вспышка свечения
 */
export function glowBurst(
  frame: number,
  start: number,
  duration = 20,
  color = "#FF8A00",
  maxIntensity = 40,
): string {
  if (frame < start || frame > start + duration) return "none";
  const intensity = interpolate(frame, [start, start + duration * 0.3, start + duration], [0, maxIntensity, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return `0 0 ${intensity}px ${color}80, 0 0 ${intensity * 2}px ${color}40`;
}

/**
 * Particle burst — возвращает массив частиц
 */
export function particleBurst(
  frame: number,
  start: number,
  count = 12,
  spread = 200,
): Array<{ x: number; y: number; opacity: number; scale: number; rotation: number }> {
  if (frame < start) return [];
  const elapsed = frame - start;
  const particles = [];
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const distance = interpolate(elapsed, [0, 30], [0, spread], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    const opacity = interpolate(elapsed, [0, 10, 30], [0, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const scale = interpolate(elapsed, [0, 8, 30], [0, 1.2, 0.3], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    
    particles.push({
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      opacity,
      scale,
      rotation: elapsed * 3 + i * 30,
    });
  }
  return particles;
}

/**
 * Bar grow — рост бара с overshoot
 */
export function barGrow(
  frame: number,
  start: number,
  duration = 25,
  maxHeight = 100,
): number {
  if (frame < start) return 0;
  const t = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const overshoot = 1.1;
  const t1 = t - 1;
  const scale = 1 + (t1 * t1 * ((overshoot + 1) * t1 + overshoot)) * -1;
  return maxHeight * Math.min(scale, 1);
}

/**
 * Timeline progress — прогресс по таймлайну
 */
export function timelineProgress(
  frame: number,
  start: number,
  duration = 60,
  steps = 5,
): { progress: number; currentStep: number } {
  const t = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const currentStep = Math.min(Math.floor(t * steps), steps - 1);
  return { progress: t, currentStep };
}

/**
 * Dramatic reveal — медленное появление с glow
 */
export function dramaticReveal(
  frame: number,
  start: number,
  duration = 30,
): { opacity: number; scale: number; glow: number } {
  if (frame < start) return { opacity: 0, scale: 0.8, glow: 0 };
  
  const opacity = interpolate(frame, [start, start + duration * 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  
  const scale = interpolate(frame, [start, start + duration], [0.8, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  
  const glow = interpolate(frame, [start, start + duration * 0.3, start + duration], [0, 30, 10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  
  return { opacity, scale, glow };
}

/**
 * Shake intense — более интенсивная вибрация для драматических моментов
 */
export function shakeIntense(
  frame: number,
  start: number,
  duration = 15,
  amplitude = 12,
): { x: number; y: number; rotation: number } {
  if (frame < start || frame > start + duration) return { x: 0, y: 0, rotation: 0 };
  
  const decay = interpolate(frame, [start, start + duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  
  return {
    x: Math.sin(frame * 5) * amplitude * decay,
    y: Math.cos(frame * 7) * amplitude * 0.6 * decay,
    rotation: Math.sin(frame * 3) * 2 * decay,
  };
}

/**
 * Background text — декоративный фоновый текст
 */
export function backgroundText(
  frame: number,
  start: number,
  duration = 60,
  x = 0,
  y = 0,
): { opacity: number; scale: number; x: number; y: number } {
  const t = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  
  return {
    opacity: interpolate(t, [0, 0.2, 0.8, 1], [0, 0.06, 0.06, 0]),
    scale: interpolate(t, [0, 1], [1.2, 0.9]),
    x: x + interpolate(t, [0, 1], [0, -50]),
    y,
  };
}
