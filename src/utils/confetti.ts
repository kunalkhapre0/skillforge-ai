/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import confetti from 'canvas-confetti';

export function triggerConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'],
    });
  } catch (e) {
    // ignore
  }
}

export function triggerMilestoneConfetti() {
  try {
    const end = Date.now() + 1.2 * 1000;
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch (e) {
    // ignore
  }
}
