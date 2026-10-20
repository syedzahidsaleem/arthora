/**
 * Returns the resolved backend API base URL with production fallback.
 * Ensures the client NEVER mistakenly hits localhost:4000 when deployed on Vercel or any live host.
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
  }

  // Automatic live production fallback for non-localhost browser environments
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return 'https://arthora-api.onrender.com';
  }

  return 'http://localhost:4000';
}
