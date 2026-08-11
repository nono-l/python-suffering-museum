/**
 * Extra production hostnames that serve THIS app (custom domains).
 *
 * Better Auth derives OAuth `redirect_uri` from the request Host. That host
 * must be allow-listed or it falls back to BETTER_AUTH_URL (the platform
 * `*.grok.me` host) — session cookies then stick on the wrong origin and login
 * appears broken on the custom domain.
 *
 * Add every custom domain here (hostname only, no protocol). Also accepted via
 * env `AUTH_ALLOWED_HOSTS` (comma-separated) without a code change.
 */
export const EXTRA_AUTH_HOSTS: readonly string[] = [
  "python.anti.pachimanzi.uk",
];
