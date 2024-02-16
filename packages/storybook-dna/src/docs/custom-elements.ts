import { type PropDef, type PropDefaultValue, type PropType } from '@storybook/docs-tools';
import {
    type Attribute,
    type ClassMember,
    type CustomElement,
    type Package,
    type PropertyLike,
} from 'custom-elements-manifest';
import { getCustomElementDeclaration, getCustomElementsManifest } from '../framework-api';

export type StorybookPropDef = PropDef & {
    table?: {
        category?: string;
        type?: PropType;
        defaultValue?: PropDefaultValue;
        disable?: boolean;
    };

    control?: {
        type?: string | null;
    };
};

function mapData(data: (Attribute | ClassMember | PropertyLike)[], category: string) {
    return data.reduce(
        (acc: { [key: string]: PropDef }, item) => {
            if (!item) {
                return acc;
            }

            const name = item.name || '-';
            const isProperty = category === 'properties';
            const isState = category === 'states';
            const types =
                (isProperty || isState) &&
                ((item as PropertyLike).type?.text ?? '').split('|').map((item) => item.trim());

            const entry: StorybookPropDef = {
                name,
                required: types ? types.every((type) => type !== 'undefined') : false,
                description: category === 'attributes' ? `🔗 **${(item as Attribute).fieldName}**` : item.description,
                type: (types
                    ? {
                          name: types.filter((type) => type !== 'undefined')[0],
                          summary: types.filter((type) => type !== 'undefined')[0] || 'unknown',
                      }
                    : {}) as unknown as PropType,
                table: {
                    category,
                },
                control: isProperty
                    ? undefined
                    : {
                          type: null,
                      },
            };
            const defaultValue = (item as PropertyLike).default;
            if (typeof defaultValue === 'string') {
                entry.defaultValue = {
                    summary: defaultValue,
                };
            }

            if (isProperty) {
                acc[name] = entry;
            } else {
                acc[`${category}/${name}`] = entry;
            }
            return acc;
        },
        {} as { [key: string]: StorybookPropDef }
    );
}

export const extractArgTypesFromElements = (tagName: string, customElements: Package) => {
    const metaData = getCustomElementDeclaration(tagName, customElements) as CustomElement & {
        locale?: {
            value: string;
            description: string;
        }[];
        icons?: {
            name: string;
            description: string;
        }[];
    };
    if (!metaData) {
        return null;
    }

    return Object.assign(
        {} as { [key: string]: StorybookPropDef },
        metaData.members
            ? mapData(
                  metaData.members.filter(
                      (m) => m.kind === 'field' && !m.static && !m.static && (!m.privacy || m.privacy === 'public')
                  ),
                  'properties'
              )
            : {},
        metaData.members
            ? mapData(
                  metaData.members.filter(
                      (m) => m.kind === 'field' && !m.static && !m.static && m.privacy === 'protected'
                  ),
                  'states'
              )
            : {},
        metaData.attributes ? mapData(metaData.attributes, 'attributes') : {},
        metaData.events ? mapData(metaData.events, 'events') : {},
        metaData.slots ? mapData(metaData.slots, 'slots') : {},
        metaData.cssProperties ? mapData(metaData.cssProperties, 'css custom properties') : {},
        metaData.cssParts ? mapData(metaData.cssParts, 'css shadow parts') : {},
        metaData.members
            ? mapData(
                  metaData.members.filter((m) => m.kind === 'method' && !m.static),
                  'methods'
              )
            : {},
        metaData.members
            ? mapData(
                  metaData.members.filter((m) => m.kind === 'field' && m.static),
                  'static properties'
              )
            : {},
        metaData.members
            ? mapData(
                  metaData.members.filter((m) => m.kind === 'method' && m.static),
                  'static methods'
              )
            : {},
        metaData.locale
            ? metaData.locale.reduce(
                  (acc, locale) => ({
                      ...acc,
                      [`locale/${locale.value}`]: {
                          name: locale.value,
                          description: locale.description,
                          type: {},
                          table: {
                              category: 'locale',
                          },
                          control: undefined,
                      },
                  }),
                  {}
              )
            : {},
        metaData.icons
            ? metaData.icons.reduce(
                  (acc, icon) => ({
                      ...acc,
                      [`icons/${icon.name}`]: {
                          name: icon.name,
                          description: icon.description,
                          type: {},
                          table: {
                              category: 'icons',
                          },
                          control: undefined,
                      },
                  }),
                  {}
              )
            : {}
    );
};

export const extractArgTypes = (tagName: string) => {
    const customElements = getCustomElementsManifest();
    if (!customElements) {
        return null;
    }

    return extractArgTypesFromElements(tagName, customElements);
};

export const extractComponentDescription = (tagName: string) => {
    const customElementsManifest = getCustomElementsManifest();
    if (!customElementsManifest) {
        return null;
    }

    const metaData = getCustomElementDeclaration(tagName, customElementsManifest);
    if (!metaData) {
        return null;
    }

    return metaData.description;
};
