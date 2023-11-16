import type { ComponentInstance, Template } from '@chialab/dna';
import type { WebRenderer } from '@storybook/types';

export type { RenderContext } from '@storybook/types';

export type StoryFnDnaReturnType = Template;

export interface ShowErrorArgs {
    title: string;
    description: string;
}

export interface DnaRenderer extends WebRenderer {
    component: ComponentInstance;
    storyResult: StoryFnDnaReturnType;
}
