// Tactile haptic feedback for mobile Android browsers

export function vibrateLight() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(15);
    } catch {
      // Ignore if not permitted
    }
  }
}

export function vibrateSuccess() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([25, 40, 25]);
    } catch {
      // Ignore
    }
  }
}

export function vibrateLevelUp() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([40, 60, 40, 60, 80]);
    } catch {
      // Ignore
    }
  }
}
