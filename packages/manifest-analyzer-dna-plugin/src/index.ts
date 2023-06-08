import { customElementDecorator } from './customElementDecorator';
import { memberDenyList } from './memberDenyList';
import { methodDenyList } from './methodDenyList';
import { propertyDecorator } from './propertyDecorator';
import { staticProperties } from './staticProperties';

export const dnaPlugins = () => [
    customElementDecorator(),
    methodDenyList(),
    memberDenyList(),
    propertyDecorator(),
    staticProperties(),
];
