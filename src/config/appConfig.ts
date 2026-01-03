export interface AppConfig {
  apiBaseUrl: string;
  auth0: {
    domain: string;
    clientId: string;
    audience?: string;
  };
}

export function loadAppConfig(): AppConfig {
  return {
    apiBaseUrl:
      (import.meta.env.VITE_API_BASE_URL as string) ??
      'http://localhost:7071/api',

    auth0: {
      domain: import.meta.env.VITE_AUTH0_DOMAIN as string,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID as string,
      audience: import.meta.env.VITE_AUTH0_AUDIENCE as string | undefined,
    },
  };
}

export const appConfig = loadAppConfig();

/**
 * ✅ Teacher-aligned Auth0 options (NO refresh tokens yet)
 */
export function buildAuth0Options(cfg: AppConfig) {
  return {
    domain: cfg.auth0.domain,
    clientId: cfg.auth0.clientId,
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: cfg.auth0.audience,
      scope: 'openid profile email',
    },
  };
}
