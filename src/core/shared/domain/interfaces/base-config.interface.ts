export interface BaseProviderConfig {
  timeoutMs?: number;
  maxRetries?: number;
  enabled?: boolean;
}

export const DEFAULT_PROVIDER_CONFIG: Required<BaseProviderConfig> = {
  timeoutMs: 30000,
  maxRetries: 3,
  enabled: true,
};
