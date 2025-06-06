import { type HTMLTagNameMap, render as dnaRender, h } from '@chialab/dna';
import {
    simulateDOMContentLoaded,
    simulatePageLoad,
} from 'storybook/internal/preview-api';
import type { ArgsStoryFn, RenderContext } from 'storybook/internal/types';
import { dedent } from 'ts-dedent';
import type { DnaRenderer } from './types';

export const render: ArgsStoryFn<DnaRenderer> = (args, context) => {
    const { id, component } = context;
    if (!component) {
        throw new Error(
            `Unable to render story ${id} as the component annotation is missing from the default export`
        );
    }

    return h(component as keyof HTMLTagNameMap, args);
};

export function renderToCanvas(
    {
        storyFn,
        title,
        name,
        showMain,
        showError,
        forceRemount,
    }: RenderContext<DnaRenderer>,
    canvasElement: DnaRenderer['canvasElement']
) {
    if (forceRemount) {
        dnaRender(null, canvasElement);
    }

    const element = storyFn();

    showMain();

    try {
        if (typeof element === 'string') {
            canvasElement.innerHTML = element;
            customElements.upgrade(canvasElement);
            simulatePageLoad(canvasElement);
        } else if (element instanceof Node) {
            // Don't re-mount the element if it didn't change and neither did the story
            if (canvasElement.firstChild === element && forceRemount === true) {
                return;
            }

            canvasElement.innerHTML = '';
            canvasElement.appendChild(element);
            simulateDOMContentLoaded();
        } else {
            dnaRender(h('div', { key: name }, element), canvasElement);
            simulatePageLoad(canvasElement);
        }
    } catch (err) {
        showError({
            title: `An error occurred rendering the story: "${name}" of "${title}".`,
            description: dedent((err as Error).message),
        });
    }

    return () => {
        dnaRender(null, canvasElement);
        canvasElement.innerHTML = '';
    };
}
