import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION as string;
const bucket = process.env.S3_BUCKET_NAME as string;

// A single shared S3 client. Credentials are read from the standard
// AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY env vars by the SDK.
const s3Client = new S3Client({
  region,
  // S3_ENDPOINT is an optional hook for MinIO/LocalStack; unset for real AWS.
  ...(process.env.S3_ENDPOINT
    ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true }
    : {}),
});

export const s3Bucket = bucket;

// Upload a UTF-8 text body to the configured bucket under the given key.
export const putText = async (key: string, text: string): Promise<void> => {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: text,
      ContentType: 'text/plain; charset=utf-8',
    })
  );
};
