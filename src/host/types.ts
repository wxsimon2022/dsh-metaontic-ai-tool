export interface QueryOptions {
  baseUrl?: unknown;
  accessToken?: unknown;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

export interface RequestJsonOptions {
  accessToken?: string;
  fetchImpl: typeof fetch;
  timeoutMs: number;
  method?: string;
  body?: unknown;
}

export interface SettingsService {
  documentPath?: unknown;
}

export interface FetchRoute {
  path: string;
  methods: string[];
  requestBody: 'buffered';
  fetch: (request: Request) => Promise<Response>;
}

export interface PluginContext {
  settings?: SettingsService;
  configEditor?: SettingsService;
  get?: (name: string) => SettingsService | undefined;
  logger?: { warn?: (message: string) => void };
  connection?: {
    fetch?: {
      register?: (route: FetchRoute) => (() => void) | void;
    };
  };
}

export interface LoginRecord {
  baseUrl: string;
  accessToken: string;
  savedAt?: string;
}

export interface LoginStore {
  save(baseUrl: unknown, accessToken: unknown): Promise<void>;
  load(): Promise<LoginRecord | null>;
  clear(): Promise<void>;
}

export interface LoginStoreOptions {
  ctx?: PluginContext;
  directory?: string;
  moduleUrl?: string;
}
