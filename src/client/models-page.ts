import { MODELS_PATH } from './constants.js';
import { formatNumber } from './runtime.js';
import type {
  CardProps,
  ChangeEventLike,
  ClientRuntime,
  ModelInfo,
  ModelsPayload,
} from './runtime.js';

export function createModelsPage({ React, h, t }: ClientRuntime) {
  return function ModelsPage({ data }: CardProps) {
    const [models, setModels] = React.useState<ModelInfo[]>([]);
    const [groups, setGroups] = React.useState<string[]>([]);
    const [query, setQuery] = React.useState<string>('');
    const [group, setGroup] = React.useState<string>('');
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string>('');

    async function loadModels(): Promise<void> {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(MODELS_PATH, { method: 'GET', cache: 'no-store' });
        let payload: ModelsPayload;
        try {
          payload = await response.json() as ModelsPayload;
        } catch {
          throw new Error(t('invalidResponse'));
        }
        if (!response.ok || !payload?.ok || !payload.data) {
          throw new Error(payload?.error?.message || t('modelsLoadFailed'));
        }
        const nextModels = Array.isArray(payload.data.models) ? payload.data.models : [];
        const nextGroups = Array.isArray(payload.data.groups) ? payload.data.groups : [];
        setModels(nextModels);
        setGroups(nextGroups);
        setGroup(previous => previous && nextGroups.includes(previous) ? previous : '');
      } catch (failure) {
        setError(failure instanceof Error && failure.message ? failure.message : t('modelsLoadFailed'));
      } finally {
        setLoading(false);
      }
    }

    React.useEffect(() => {
      void loadModels();
    }, [data.baseUrl]);

    const keyword = query.trim().toLowerCase();
    const filtered = models.filter(model => {
      if (group && !model.groups.includes(group)) return false;
      if (!keyword) return true;
      const haystack = [model.name, model.description, ...model.tags, ...model.groups, ...model.endpoints]
        .join(' ')
        .toLowerCase();
      return haystack.includes(keyword);
    });

    const toolbar = h('div', { key: 'toolbar', className: 'mat-model-toolbar' }, [
      h('label', { key: 'search', className: 'mat-field' }, [
        h('span', { key: 'label', className: 'mat-label' }, t('modelsSearch')),
        h('input', {
          key: 'input',
          className: 'mat-input',
          type: 'search',
          value: query,
          onChange: (event: ChangeEventLike) => setQuery(event.target.value),
          placeholder: t('modelsSearchPlaceholder'),
          disabled: loading,
        }),
      ]),
      h('label', { key: 'group', className: 'mat-field' }, [
        h('span', { key: 'label', className: 'mat-label' }, t('modelsGroupFilter')),
        h('select', {
          key: 'select',
          className: 'mat-input',
          value: group,
          onChange: (event: ChangeEventLike) => setGroup(event.target.value),
          disabled: loading || groups.length === 0,
        }, [
          h('option', { key: 'all', value: '' }, t('modelsAllGroups')),
          ...groups.map(item => h('option', { key: item, value: item }, item)),
        ]),
      ]),
    ]);

    const list = loading && models.length === 0
      ? h('p', { key: 'loading', className: 'mat-hint' }, t('modelsLoading'))
      : filtered.length === 0
      ? h('p', { key: 'empty', className: 'mat-hint' }, t('modelsEmpty'))
      : h('div', { key: 'list', className: 'mat-model-list' }, filtered.map(model => {
        const price = model.price !== null && model.price > 0
          ? t('modelsPrice', { price: `$${formatNumber(model.price)}` })
          : model.ratio !== null
          ? t('modelsRatio', { ratio: formatNumber(model.ratio) })
          : '';
        return h('article', { key: model.name, className: 'mat-model-item' }, [
          h('div', { key: 'head', className: 'mat-model-head' }, [
            h('div', { key: 'name', className: 'mat-model-name' }, model.name),
            price ? h('span', { key: 'price', className: 'mat-badge mat-model-price' }, price) : null,
          ]),
          model.description ? h('p', { key: 'desc', className: 'mat-model-desc' }, model.description) : null,
          model.tags.length > 0 ? h('div', { key: 'tags', className: 'mat-model-tags' }, model.tags.slice(0, 6).map(tag =>
            h('span', { key: tag, className: 'mat-model-tag' }, tag))) : null,
          h('div', { key: 'meta', className: 'mat-model-meta' }, [
            model.groups.length > 0 ? h('div', { key: 'groups', className: 'mat-model-meta-row' }, [
              h('span', { key: 'label', className: 'mat-model-meta-label' }, t('modelsGroups')),
              ...model.groups.slice(0, 8).map(item => h('span', { key: item, className: 'mat-badge' }, item)),
            ]) : null,
            model.endpoints.length > 0 ? h('div', { key: 'endpoints', className: 'mat-model-meta-row' }, [
              h('span', { key: 'label', className: 'mat-model-meta-label' }, t('modelsEndpoints')),
              ...model.endpoints.map(item => h('span', { key: item, className: 'mat-badge' }, item)),
            ]) : null,
          ]),
        ]);
      }));

    return h('section', { className: 'mat-card mat-models' }, [
      h('div', { key: 'head', className: 'mat-card-head' }, [
        h('div', { key: 'copy', className: 'mat-card-head-copy' }, [
          h('div', { key: 'title', className: 'mat-card-title' }, t('modelsPage')),
          h('div', { key: 'hint', className: 'mat-hint' }, t('modelsHint')),
        ]),
        h('button', {
          key: 'refresh',
          type: 'button',
          className: 'mat-btn mat-btn-sm',
          onClick: () => void loadModels(),
          disabled: loading,
        }, loading ? t('apiKeyRefreshing') : t('modelsRefresh')),
      ]),
      error ? h('div', { key: 'error', className: 'mat-error', role: 'alert', style: { marginBottom: 10 } }, error) : null,
      toolbar,
      h('div', { key: 'count', className: 'mat-model-count' }, t('modelsCount', { count: filtered.length })),
      list,
    ]);
  };
}
