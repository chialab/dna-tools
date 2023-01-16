import type { Addon_ClientStoryApi, Addon_Loadable } from '@storybook/types';
import { start } from '@storybook/preview-api';
import { renderToCanvas } from './render';
import type { DnaRenderer } from './types';

export interface ClientApi extends Addon_ClientStoryApi<DnaRenderer['storyResult']> {
    configure(loader: Addon_Loadable, module: NodeModule): void;
    forceReRender(): void;
    raw: () => any; // todo add type
    load: (...args: any[]) => void;
}

const FRAMEWORK = 'dna';
const api = start<DnaRenderer>(renderToCanvas);

export const storiesOf: ClientApi['storiesOf'] = (kind, m) =>
    (api.clientApi.storiesOf(kind, m) as ReturnType<ClientApi['storiesOf']>).addParameters({
        framework: FRAMEWORK,
    });

export const configure: ClientApi['configure'] = (...args) => api.configure(FRAMEWORK, ...args);
export const forceReRender: ClientApi['forceReRender'] = api.forceReRender;
export const raw: ClientApi['raw'] = api.clientApi.raw;
