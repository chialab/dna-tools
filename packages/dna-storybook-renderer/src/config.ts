import { parameters as docsParams } from './docs/config';

export { renderToCanvas, render } from './render';
export { argTypesEnhancers, decorators } from './docs/config';
export const parameters = { framework: 'dna' as const, ...docsParams };
