import type { Template } from '@chialab/dna';
import type { StoryContext as StoryContextBase, WebRenderer } from '@storybook/types';

export type { RenderContext } from '@storybook/types';

export type StoryFnDnaReturnType = Template;

export type StoryContext = StoryContextBase<DnaRenderer>;

export interface DnaRenderer extends WebRenderer {
    component: string;
    storyResult: StoryFnDnaReturnType;
}

export interface ShowErrorArgs {
    title: string;
    description: string;
}
