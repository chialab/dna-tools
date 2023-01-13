import { describe, expect, test } from 'vitest';
import { customElementsManifestPlugin } from '@chialab/dna-storybook-vite';
import { dnaPlugin } from '@chialab/dna-manifest-analyzer-plugin';

describe('generate custom elements manifest', () => {
    test('DNA module', async () => {
        const plugin = customElementsManifestPlugin({
            renderer: '@chialab/dna-storybook-renderer',
            plugins: [dnaPlugin()],
        });

        const result = await plugin.transform(`import { customElement, Component } from '@chialab/dna';

@customElement('dna-test')
export class Test extends Component {
    @property() testProp?: string;
}
`, 'Test.ts');

        expect(result).toBeDefined();
        expect(result?.code).toEqual(`import * as __STORYBOOK_WEB_COMPONENTS__ from '@chialab/dna-storybook-renderer';
import { customElement, Component } from '@chialab/dna';

@customElement('dna-test')
export class Test extends Component {
    @property() testProp?: string;
}

;(function() {
    const { getCustomElements, setCustomElementsManifest } = __STORYBOOK_WEB_COMPONENTS__;
    if (!setCustomElementsManifest) {
        console.debug('Custom Element Manifest is not supported by this version of Storybook.');
        return;
    }

    const CUSTOM_ELEMENT_JSON = {"schemaVersion":"1.0.0","readme":"","modules":[{"kind":"javascript-module","path":"Test.ts","declarations":[{"kind":"class","description":"","name":"Test","members":[{"kind":"field","name":"testProp","type":{"text":"string | undefined"}}],"superclass":{"name":"Component","package":"@chialab/dna"}}],"exports":[{"kind":"js","name":"Test","declaration":{"name":"Test","module":"Test.ts"}}]}]};
    const CUSTOM_ELEMENTS_JSON = getCustomElements() || {};
    setCustomElementsManifest({
        ...CUSTOM_ELEMENTS_JSON,
        ...CUSTOM_ELEMENT_JSON,
        modules: [
            ...(CUSTOM_ELEMENTS_JSON.modules || []),
            ...(CUSTOM_ELEMENT_JSON.modules || []),
        ],
    });
}());`);
    });
});
