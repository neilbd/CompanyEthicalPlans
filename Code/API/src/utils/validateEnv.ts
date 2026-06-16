export const validateEnv = (): void => {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
  }

  // Backward compatibility for legacy env var name
  if (!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_KEY_TOKEN) {
    process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_KEY_TOKEN;
  }

  const requiredEnvVars = [
    'ANTHROPIC_API_KEY',
    'CLAUDE_VERSION',
    'MONGODB_URI',
    'SESSION_SECRET',
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'S3_BUCKET_NAME',
  ];
  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    console.error(
      `Error: Missing required environment variables: ${missingVars.join(', ')}`
    );
    process.exit(1);
  }
};
