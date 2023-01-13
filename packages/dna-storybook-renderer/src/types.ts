import type { WebRenderer } from '@storybook/types';
import type { Template, ComponentInstance } from '@chialab/dna';

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
