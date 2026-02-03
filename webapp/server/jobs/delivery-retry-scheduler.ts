import { storage } from "../storage";
import { processDelivery } from "../adapters";

const POLL_INTERVAL_MS = 10 * 1000; // 10 seconds
const BASE_URL = process.env.REPLIT_DEV_DOMAIN 
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : "http://localhost:5000";

let schedulerInterval: ReturnType<typeof setInterval> | null = null;
let isProcessing = false;

export async function processQueuedDeliveries(): Promise<number> {
  if (isProcessing) {
    return 0;
  }

  isProcessing = true;
  let processed = 0;

  try {
    const deliveries = await storage.getQueuedDeliveriesForRetry();
    
    for (const delivery of deliveries) {
      try {
        console.log(`[DeliveryRetry] Processing delivery ${delivery.id} (attempt ${(delivery.attempts || 0) + 1})`);
        await processDelivery(delivery.id, BASE_URL);
        processed++;
      } catch (error) {
        console.error(`[DeliveryRetry] Error processing delivery ${delivery.id}:`, error);
      }
    }

    if (processed > 0) {
      console.log(`[DeliveryRetry] Processed ${processed} queued deliveries`);
    }
  } finally {
    isProcessing = false;
  }

  return processed;
}

export function startDeliveryRetryScheduler(): void {
  if (schedulerInterval) {
    console.log("[DeliveryRetry] Scheduler already running");
    return;
  }

  console.log(`[DeliveryRetry] Starting scheduler (polling every ${POLL_INTERVAL_MS / 1000}s)`);
  
  schedulerInterval = setInterval(async () => {
    try {
      await processQueuedDeliveries();
    } catch (error) {
      console.error("[DeliveryRetry] Scheduler error:", error);
    }
  }, POLL_INTERVAL_MS);

  processQueuedDeliveries().catch(console.error);
}

export function stopDeliveryRetryScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("[DeliveryRetry] Scheduler stopped");
  }
}

export function isSchedulerRunning(): boolean {
  return schedulerInterval !== null;
}
