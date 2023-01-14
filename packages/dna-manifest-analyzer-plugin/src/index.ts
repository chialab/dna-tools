import { customElementDecorator } from './customElementDecorator';
import { methodDenyList } from './methodDenyList';
import { memberDenyList } from './memberDenyList';
import { propertyDecorator } from './propertyDecorator';
import { staticProperties } from './staticProperties';

export const dnaPlugins = () => [
    customElementDecorator(),
    methodDenyList(),
    memberDenyList(),
    propertyDecorator(),
    staticProperties(),
];
