import { customElementDecorator } from './customElementDecorator';
import { firesDecorator } from './firesDecorator';
import { iconJSDocTags } from './iconJSDocTags';
import { inheritance } from './inheritance';
import { localeJSDocTags } from './localeJSDocTags';
import { memberDenyList } from './memberDenyList';
import { methodDenyList } from './methodDenyList';
import { propertyDecorator } from './propertyDecorator';
import { staticProperties } from './staticProperties';

export const dnaPlugins = () => [
    customElementDecorator(),
    localeJSDocTags(),
    iconJSDocTags(),
    methodDenyList(),
    memberDenyList(),
    propertyDecorator(),
    staticProperties(),
    firesDecorator(),
    inheritance(),
];
