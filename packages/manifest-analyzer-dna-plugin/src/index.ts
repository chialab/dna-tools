import { customElementDecorator } from './customElementDecorator';
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
    inheritance(),
];
