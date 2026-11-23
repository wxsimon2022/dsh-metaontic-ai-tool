type DshTranslate = (key: string, params?: Record<string, string | number>) => string;

interface DshLocaleService {
  register(namespace: string, dictionaries: Record<string, Record<string, string>>): unknown;
  bind(namespace: string): DshTranslate;
}

interface DshSlotsService {
  inject(slot: string, callback: () => unknown): unknown;
  register(definition: Record<string, unknown>, component: unknown): unknown;
}

interface DshClientContext {
  effect(callback: () => unknown, label?: string): unknown;
  locale: DshLocaleService;
  slots: DshSlotsService;
}

interface DshClientModule {
  inject: string[];
  apply(ctx: DshClientContext): void;
}

interface DshModuleLoader {
  load(options: {
    id: string;
    factory(require: (id: string) => unknown): DshClientModule;
  }): void;
}

interface Window {
  __ModuleLoader__: DshModuleLoader;
}
