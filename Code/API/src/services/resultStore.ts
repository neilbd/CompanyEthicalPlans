import retry from 'async-retry';
import { Types } from 'mongoose';
import { Analysis, IAnalysis } from '../models/Analysis';
import { putText } from '../config/s3';

// Max upload attempts before a record is marked 'failed' and left for inspection.
const MAX_ATTEMPTS = 5;
// Retries inside a single uploadOne call (exponential backoff via async-retry).
const RETRIES_PER_ATTEMPT = 3;
// Default sweeper interval.
const SWEEP_INTERVAL_MS = 60_000;

const s3KeyFor = (userId: Types.ObjectId, id: Types.ObjectId): string =>
  `analyses/${userId.toString()}/${id.toString()}.txt`;

// Upload one pending record's text to S3 with exponential backoff. On success
// the record is marked done and its payload cleared. Never throws — failures
// bump attempts and leave the record pending (or failed once exhausted) so the
// sweeper can pick it up later.
const uploadOne = async (doc: IAnalysis): Promise<void> => {
  if (!doc.resultText) return;

  try {
    const key = s3KeyFor(doc.userId, doc._id as Types.ObjectId);
    await retry(() => putText(key, doc.resultText as string), {
      retries: RETRIES_PER_ATTEMPT,
      factor: 2,
      minTimeout: 500,
    });

    doc.status = 'done';
    doc.s3Key = key;
    doc.resultText = null;
    await doc.save();
  } catch (err) {
    doc.attempts += 1;
    doc.status = doc.attempts >= MAX_ATTEMPTS ? 'failed' : 'pending';
    await doc.save();
    console.error(
      `ResultStore: upload failed for analysis ${doc._id} (attempt ${doc.attempts}, status ${doc.status})`,
      err
    );
  }
};

export class ResultStore {
  private sweeping = false;

  // Persist a result: insert the pending record (fast, awaited by the caller)
  // then attempt the S3 upload in the background without blocking the response.
  async save({
    userId,
    resultText,
  }: {
    userId: string;
    resultText: string;
  }): Promise<void> {
    const doc = await Analysis.create({
      userId: new Types.ObjectId(userId),
      status: 'pending',
      attempts: 0,
      resultText,
    });

    // Fire-and-forget; errors are handled inside uploadOne.
    void uploadOne(doc);
  }

  // Retry every still-pending record that hasn't exhausted its attempts.
  async runSweep(): Promise<void> {
    if (this.sweeping) return;
    this.sweeping = true;
    try {
      const pending = await Analysis.find({
        status: 'pending',
        attempts: { $lt: MAX_ATTEMPTS },
      });
      for (const doc of pending) {
        await uploadOne(doc);
      }
    } catch (err) {
      console.error('ResultStore: sweep failed', err);
    } finally {
      this.sweeping = false;
    }
  }

  startSweeper(intervalMs: number = SWEEP_INTERVAL_MS): void {
    setInterval(() => void this.runSweep(), intervalMs);
  }
}

export const resultStore = new ResultStore();
