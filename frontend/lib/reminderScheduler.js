/**
 * lib/reminderScheduler.js
 * ─────────────────────────────────────────────────────────────
 * Schedules multiple browser notifications before a call reminder:
 *   • 30 minutes before
 *   • 15 minutes before
 *   • 10 minutes before
 *   •  5 minutes before
 *   •  At reminder time (0 minutes before)
 * ─────────────────────────────────────────────────────────────
 */

import { triggerNotification } from './notification';

/**
 * The offsets (in minutes) before the reminder time at which
 * notifications should fire. 0 = at the exact reminder time.
 */
const REMINDER_OFFSETS_MINUTES = [30, 15, 10, 5, 0];

/**
 * Schedule multiple reminder notifications before a call.
 *
 * @param {string} name         - Contact name (e.g. "Rahul Sharma")
 * @param {string} phone        - Contact phone number (e.g. "+91 98765 43210")
 * @param {string|Date} reminderTime - The scheduled call time (ISO string or Date object)
 * @returns {number[]} Array of setTimeout timer IDs — useful if you need to cancel them later.
 *
 * @example
 * // After creating a reminder:
 * const timerIds = scheduleReminderNotifications('Rahul', '+91 98765', '2024-01-01T13:00:00');
 *
 * // To cancel all scheduled notifications (e.g. if reminder is deleted):
 * timerIds.forEach(id => clearTimeout(id));
 */
export function scheduleReminderNotifications(name, phone, reminderTime) {
  if (typeof window === 'undefined') return []; // SSR guard

  const callTime = new Date(reminderTime);

  // Validate the reminder time
  if (isNaN(callTime.getTime())) {
    console.warn('[ReminderScheduler] Invalid reminderTime:', reminderTime);
    return [];
  }

  const now       = Date.now();
  const timerIds  = [];
  const scheduled = [];

  REMINDER_OFFSETS_MINUTES.forEach((minutesBefore) => {
    // Calculate when this notification should fire
    const fireAt   = new Date(callTime.getTime() - minutesBefore * 60 * 1000);
    const delayMs  = fireAt.getTime() - now;

    // Skip notifications that are already in the past
    if (delayMs < 0) {
      console.info(
        `[ReminderScheduler] Skipping ${minutesBefore}m-before alert (already past).`
      );
      return;
    }

    const timerId = setTimeout(() => {
      triggerNotification(name, phone, minutesBefore);
    }, delayMs);

    timerIds.push(timerId);
    scheduled.push({ minutesBefore, fireAt: fireAt.toLocaleTimeString() });
  });

  if (scheduled.length > 0) {
    console.info(
      `[ReminderScheduler] Scheduled ${scheduled.length} notification(s) for "${name}":`,
      scheduled
    );
  } else {
    console.warn('[ReminderScheduler] No future notifications scheduled (all offsets in the past).');
  }

  return timerIds;
}

/**
 * Cancel all scheduled notifications for a reminder.
 * Pass the array of timer IDs returned by scheduleReminderNotifications().
 *
 * @param {number[]} timerIds - Array of setTimeout timer IDs to cancel.
 */
export function cancelReminderNotifications(timerIds = []) {
  timerIds.forEach((id) => clearTimeout(id));
  console.info(`[ReminderScheduler] Cancelled ${timerIds.length} notification timer(s).`);
}
