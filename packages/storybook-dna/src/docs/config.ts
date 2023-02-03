import { SourceType, enhanceArgTypes } from '@storybook/docs-tools';
import { extractArgTypes, extractComponentDescription } from './customElements';
import { sourceDecorator } from './sourceDecorator';
import { prepareForInline } from './prepareForInline';

export const argTypesEnhancers = [enhanceArgTypes];
export const decorators = [sourceDecorator];
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
