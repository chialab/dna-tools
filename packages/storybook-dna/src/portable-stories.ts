import type {
    Args,
    ComposedStoryFn,
    NamedOrDefaultProjectAnnotations,
    NormalizedProjectAnnotations,
    ProjectAnnotations,
    Store_CSFExports,
    StoriesWithPartialProps,
    StoryAnnotationsOrFn,
} from 'storybook/internal/types';

import {
    composeStories as originalComposeStories,
    composeStory as originalComposeStory,
    setProjectAnnotations as originalSetProjectAnnotations,
    setDefaultProjectAnnotations,
} from 'storybook/preview-api';

import { h } from '@chialab/dna';
import * as dnaAnnotations from './entry-preview';
import type { Meta } from './public-types';
import type { DnaRenderer } from './types';

/**
 * Function that sets the globalConfig of your storybook. The global config is the preview module of
 * your .storybook folder.
 *
 * It should be run a single time, so that your global config (e.g. decorators) is applied to your
 * stories when using `composeStories` or `composeStory`.
 *
 * Example:
 *
 * ```jsx
 * // setup-file.js
 * import { setProjectAnnotations } from '@chialab/storybook-dna';
 * import projectAnnotations from './.storybook/preview';
 *
 * setProjectAnnotations(projectAnnotations);
 * ```
 *
 * @param projectAnnotations - E.g. (import projectAnnotations from '../.storybook/preview')
 */
export function setProjectAnnotations<
    TRenderer extends DnaRenderer = DnaRenderer,
>(
    projectAnnotations:
        | NamedOrDefaultProjectAnnotations<TRenderer>
        | NamedOrDefaultProjectAnnotations<TRenderer>[]
): NormalizedProjectAnnotations<DnaRenderer> {
    setDefaultProjectAnnotations(dnaAnnotations);
    return originalSetProjectAnnotations(
        projectAnnotations
    ) as unknown as NormalizedProjectAnnotations<DnaRenderer>;
}

/**
 * Function that will receive a story along with meta (e.g. a default export from a .stories file)
 * and optionally projectAnnotations e.g. (import * from '../.storybook/preview) and will return a
 * composed component that has all args/parameters/decorators/etc combined and applied to it.
 *
 * It's very useful for reusing a story in scenarios outside of Storybook like unit testing.
 *
 * @param story
 * @param componentAnnotations - E.g. (import Meta from './Button.stories')
 * @param [projectAnnotations] - E.g. (import * as projectAnnotations from '../.storybook/preview')
 *   this can be applied automatically if you use `setProjectAnnotations` in your setup files.
 * @param [exportsName] - In case your story does not contain a name and you want it to have a name.
 */
export function composeStory<TArgs extends Args = Args>(
    story: StoryAnnotationsOrFn<DnaRenderer, TArgs>,
    componentAnnotations: Meta<TArgs | any>,
    projectAnnotations?: ProjectAnnotations<DnaRenderer>,
    exportsName?: string
): ComposedStoryFn<DnaRenderer, Partial<TArgs>> {
    const composedStory = originalComposeStory<DnaRenderer, TArgs>(
        story as StoryAnnotationsOrFn<DnaRenderer, Args>,
        componentAnnotations,
        projectAnnotations,
        globalThis.globalProjectAnnotations ?? dnaAnnotations,
        exportsName
    );

    const renderable = (...args: Parameters<typeof composedStory>) =>
        h(composedStory(...args));
    Object.assign(renderable, composedStory);

    return renderable as unknown as typeof composedStory;
}

/**
 * Function that will receive a stories import (e.g. `import * as stories from './Button.stories'`)
 * and optionally projectAnnotations (e.g. `import * from '../.storybook/preview`) and will return
 * an object containing all the stories passed, but now as a composed component that has all
 * args/parameters/decorators/etc combined and applied to it.
 *
 * It's very useful for reusing stories in scenarios outside of Storybook like unit testing.
 *
 * @param csfExports - E.g. (import * as stories from './Button.stories')
 * @param [projectAnnotations] - E.g. (import * as projectAnnotations from '../.storybook/preview')
 *   this can be applied automatically if you use `setProjectAnnotations` in your setup files.
 */
export function composeStories<
    TModule extends Store_CSFExports<DnaRenderer, any>,
>(csfExports: TModule, projectAnnotations?: ProjectAnnotations<DnaRenderer>) {
    const composedStories = originalComposeStories(
        csfExports,
        projectAnnotations as ProjectAnnotations<DnaRenderer>,
        composeStory
    );

    return composedStories as unknown as Omit<
        StoriesWithPartialProps<DnaRenderer, TModule>,
        keyof Store_CSFExports
    >;
}

/**
 * Prepares and renders a story into a given root element.
 *
 * This is useful for testing or embedding stories outside of Storybook.
 *
 * @param story
 * @param rootElement - The root element where to render the story.
 * @param args - Optional args to pass to the story.
 * @param componentAnnotations - E.g. (import Meta from './Button.stories')
 * @param [projectAnnotations] - E.g. (import * as projectAnnotations from '../.storybook/preview')
 *   this can be applied automatically if you use `setProjectAnnotations` in your setup files.
 * @param [exportsName] - In case your story does not contain a name and you want it to have a name.
 */
export async function renderStory<TArgs extends Args = Args>(
    story: StoryAnnotationsOrFn<DnaRenderer, TArgs>,
    rootElement: HTMLElement,
    args?: Partial<TArgs>,
    componentAnnotations?: Meta<TArgs | any>,
    projectAnnotations?: ProjectAnnotations<DnaRenderer>,
    exportsName?: string
) {
    const composedStory = composeStory(
        story,
        componentAnnotations || {},
        projectAnnotations,
        exportsName
    );

    await composedStory.run({
        canvasElement: rootElement,
        args: {
            ...(composedStory.args || {}),
            ...(args || {}),
        },
    });
}
