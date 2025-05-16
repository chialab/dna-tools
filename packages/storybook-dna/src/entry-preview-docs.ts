import { SourceType, enhanceArgTypes } from 'storybook/internal/docs-tools';
import type {
    ArgTypesEnhancer,
    DecoratorFunction,
} from 'storybook/internal/types';
import {
    extractArgTypes,
    extractComponentDescription,
} from './docs/custom-elements';
import { prepareForInline } from './docs/prepareForInline';
import { sourceDecorator } from './docs/sourceDecorator';
import type { DnaRenderer } from './types';

export const decorators: DecoratorFunction<DnaRenderer>[] = [sourceDecorator];

export const parameters = {
    docs: {
        extractArgTypes,
        extractComponentDescription,
        story: {
            inline: true,
        },
        prepareForInline,
        source: {
            type: SourceType.DYNAMIC,
            language: 'html',
        },
    },
};

export const argTypesEnhancers: ArgTypesEnhancer<DnaRenderer>[] = [
    enhanceArgTypes,
];
