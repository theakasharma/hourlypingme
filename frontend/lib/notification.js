/**
 * lib/notification.js
 * ─────────────────────────────────────────────────────────────
 * Utility functions for:
 *  - Requesting browser notification permission
 *  - Showing a native browser notification
 *  - Playing the notification sound (/public/notification.mp3)
 *  - Combining both into a single triggerNotification() call
 * ─────────────────────────────────────────────────────────────
 */

/**
 * Request browser notification permission.
 * Call this early (e.g., on form mount) so the browser prompts the user
 * before any reminder actually fires.
 * @returns {Promise<string>} 'granted' | 'denied' | 'default'
 */
export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('[Notification] Browser does not support notifications.');
    return 'denied';
  }

  if (Notification.permission === 'granted') return 'granted';

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('[Notification] Permission request failed:', err);
    return 'denied';
  }
}

/**
 * Show a native browser notification.
 * Silently skips if permission is not granted.
 *
 * @param {string} title  - Notification title  e.g. "Call Reminder"
 * @param {string} body   - Notification body   e.g. "Call Rahul in 10 minutes"
 * @param {object} [opts] - Extra Notification options (icon, badge, etc.)
 */
export function showBrowserNotification(title, body, opts = {}) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification(title, {
      body,
      icon: '/favicon.ico',   // Use existing favicon as icon
      badge: '/favicon.ico',
      requireInteraction: true, // Keeps notification visible until user acts
      ...opts,
    });
  } catch (err) {
    console.error('[Notification] Failed to show notification:', err);
  }
}

/**
 * Play the notification sound.
 * Attempts to play /notification.mp3 first; falls back to a Web Audio API
 * generated beep tone so alerts work even if the mp3 file is missing.
 */
export function playNotificationSound() {
  if (typeof window === 'undefined') return;

  // Primary: try playing the mp3 file
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.8;
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // If mp3 fails (file missing, autoplay blocked), use Web Audio fallback
        _playBeepFallback();
      });
    }
  } catch {
    _playBeepFallback();
  }
}

/**
 * @private
 * Generates a short beep using the Web Audio API as a fallback.
 */
function _playBeepFallback() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    // Create a pleasant two-tone chime effect
    const tones = [
      { freq: 880, start: 0,    duration: 0.15 },
      { freq: 1100, start: 0.15, duration: 0.15 },
      { freq: 880, start: 0.30, duration: 0.25 },
    ];

    tones.forEach(({ freq, start, duration }) => {
      const oscillator = ctx.createOscillator();
      const gainNode   = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type      = 'sine';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + start);

      // Smooth fade in / out to avoid clicks
      gainNode.gain.setValueAtTime(0, ctx.currentTime + start);
      gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + start + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + start + duration);

      oscillator.start(ctx.currentTime + start);
      oscillator.stop(ctx.currentTime + start + duration);
    });

    // Close context after all tones complete
    setTimeout(() => ctx.close(), 1000);
  } catch (err) {
    console.error('[Notification] Web Audio fallback failed:', err);
  }
}

/**
 * Trigger a full notification: browser alert + sound together.
 * This is the main function called by the scheduler.
 *
 * @param {string} name         - Contact name         e.g. "Rahul"
 * @param {string} phone        - Contact phone number e.g. "+91 98765 43210"
 * @param {number} minutesBefore - Minutes until the call (0 = "right now")
 */
export function triggerNotification(name, phone, minutesBefore) {
  const title = '📞 Call Reminder';

  let body;
  if (minutesBefore <= 0) {
    body = `⏰ Time to call ${name}! (${phone})`;
  } else {
    body = `Call ${name} in ${minutesBefore} minute${minutesBefore !== 1 ? 's' : ''} — ${phone}`;
  }

  // Show browser notification
  showBrowserNotification(title, body);

  // Play sound
  playNotificationSound();

  console.info(`[Notification] Triggered: "${body}"`);
}
