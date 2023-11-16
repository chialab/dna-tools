import { enhanceArgTypes, SourceType } from '@storybook/docs-tools';
import { extractArgTypes, extractComponentDescription } from './customElements';
import { prepareForInline } from './prepareForInline';
import { sourceDecorator } from './sourceDecorator';

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
