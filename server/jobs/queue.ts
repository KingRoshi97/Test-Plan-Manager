type JobHandler = (payload: Record<string, unknown>) => Promise<void>;

interface Job {
  id: string;
  name: string;
  payload: Record<string, unknown>;
  createdAt: Date;
}

interface JobQueue {
  jobs: Job[];
  handlers: Map<string, JobHandler>;
  processing: boolean;
  concurrency: number;
}

const queue: JobQueue = {
  jobs: [],
  handlers: new Map(),
  processing: false,
  concurrency: 2,
};

let activeJobs = 0;

export function registerHandler(name: string, handler: JobHandler): void {
  queue.handlers.set(name, handler);
}

export function enqueue(name: string, payload: Record<string, unknown>): string {
  const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  queue.jobs.push({
    id,
    name,
    payload,
    createdAt: new Date(),
  });
  processQueue();
  return id;
}

async function processQueue(): Promise<void> {
  if (queue.processing) {
    return;
  }

  queue.processing = true;

  while (queue.jobs.length > 0 && activeJobs < queue.concurrency) {
    const job = queue.jobs.shift();
    if (!job) {
      break;
    }

    const handler = queue.handlers.get(job.name);
    if (!handler) {
      console.error(`[JobQueue] No handler registered for job: ${job.name}`);
      continue;
    }

    activeJobs++;

    (async () => {
      try {
        console.log(`[JobQueue] Processing job ${job.id}: ${job.name}`);
        await handler(job.payload);
        console.log(`[JobQueue] Completed job ${job.id}: ${job.name}`);
      } catch (error) {
        console.error(`[JobQueue] Failed job ${job.id}: ${job.name}`, error);
      } finally {
        activeJobs--;
        if (queue.jobs.length > 0) {
          processQueue();
        }
      }
    })();
  }

  queue.processing = false;
}

export function getQueueStats(): { pending: number; active: number } {
  return {
    pending: queue.jobs.length,
    active: activeJobs,
  };
}
