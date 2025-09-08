export const validateEnv = (): void => {
  const requiredEnvVars = ['NODE_ENV'];
  
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missingVars.join(', ')}`);
  }

  // Set defaults
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
  }
};
