import { customElementDecorator } from './customElementDecorator';
import { localeJSDocTags } from './localeJSDocTags';
import { memberDenyList } from './memberDenyList';
import { methodDenyList } from './methodDenyList';
import { propertyDecorator } from './propertyDecorator';
import { staticProperties } from './staticProperties';

export const dnaPlugins = () => [
    customElementDecorator(),
    localeJSDocTags(),
    methodDenyList(),
    memberDenyList(),
    propertyDecorator(),
    staticProperties(),
];
