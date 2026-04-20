export const logger = {
  info(message, meta) {
    console.info(`[INFO] ${message}`, meta || '');
  },
  warn(message, meta) {
    console.warn(`[WARN] ${message}`, meta || '');
  },
  error(message, error) {
    console.error(`[ERROR] ${message}`, error || '');
  }
};

export async function safeCall(taskName, fn) {
  try {
    return await fn();
  } catch (error) {
    logger.error(taskName, error);
    throw error;
  }
}
