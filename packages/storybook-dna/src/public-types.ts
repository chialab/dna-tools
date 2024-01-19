import type {
    AnnotatedStoryFn,
    Args,
    ComponentAnnotations,
    DecoratorFunction,
    StoryContext as GenericStoryContext,
    LoaderFunction,
    ProjectAnnotations,
    StoryAnnotations,
    StrictArgs,
} from '@storybook/types';
import type { DnaRenderer } from './types';

export type { Args, ArgTypes, Parameters, StrictArgs } from '@storybook/types';
export type { DnaRenderer };

/**
 * Metadata to configure the stories for a component.
 *
 * @see [Default export](https://storybook.js.org/docs/formats/component-story-format/#default-export)
 */
export type Meta<TArgs = Args> = ComponentAnnotations<DnaRenderer, TArgs>;

/**
 * Story function that represents a CSFv2 component example.
 *
 * @see [Named Story exports](https://storybook.js.org/docs/formats/component-story-format/#named-story-exports)
 */
export type StoryFn<TArgs = Args> = AnnotatedStoryFn<DnaRenderer, TArgs>;

/**
 * Story object that represents a CSFv3 component example.
 *
 * @see [Named Story exports](https://storybook.js.org/docs/formats/component-story-format/#named-story-exports)
 */
export type StoryObj<TArgs = Args> = StoryAnnotations<DnaRenderer, TArgs>;

export type Decorator<TArgs = StrictArgs> = DecoratorFunction<DnaRenderer, TArgs>;
export type Loader<TArgs = StrictArgs> = LoaderFunction<DnaRenderer, TArgs>;
export type StoryContext<TArgs = StrictArgs> = GenericStoryContext<DnaRenderer, TArgs>;
export type Preview = ProjectAnnotations<DnaRenderer>;
