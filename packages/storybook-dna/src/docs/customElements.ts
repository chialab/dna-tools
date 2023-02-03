import { type Package, type CustomElement, type Attribute, type ClassMember, type PropertyLike, type ClassField } from 'custom-elements-manifest';
import { getCustomElementsManifest, getCustomElementDeclaration } from '../framework-api';
import { type PropDef, type PropType, type PropDefaultValue } from '@storybook/docs-tools';

type StorybookPropDef = PropDef & {
    table?: {
        category?: string;
        type?: PropType;
        defaultValue?: PropDefaultValue;
        disable?: boolean;
    };

    control?: {
        type?: string|null;
    };
};

function mapData(data: (Attribute|ClassMember|PropertyLike)[], category: string) {
    return data.reduce((acc: { [key: string]: PropDef }, item) => {
        if (!item) {
            return acc;
        }
        if (!item.name) {
            return acc;
        }

        const isProperty = category === 'properties' || category === 'states';
        const types = isProperty && ((item as PropertyLike).type?.text ?? '').split('|').map((item) => item.trim());

        const entry: StorybookPropDef = {
            name: item.name,
            required: types ? types.every((type) => type !== 'undefined') : false,
            description: item.description,
            type: (types ? {
                name: types.filter((type) => type !== 'undefined')[0],
                summary: types.filter((type) => type !== 'undefined')[0] || 'unknown',
            } : {}) as unknown as PropType,
            table: {
                category,
            },
            control: isProperty ? undefined : {
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
            acc[item.name] = entry;
        } else {
            acc[`${category}/${item.name}`] = entry;
        }
        return acc;
    }, {} as { [key: string]: PropDef });
}

export const extractArgTypesFromElements = (tagName: string, customElements: Package) => {
    const metaData = getCustomElementDeclaration(tagName, customElements);
    if (!metaData) {
        return null;
    }

    const result = {};
    if (metaData.superclass) {
        const mod = customElements.modules?.find((m) =>
            m.declarations?.find((d) => d.kind === 'class' && d.name === metaData.superclass?.name)
        );
        const decl = mod?.declarations?.find((d) => d.kind === 'class' && d.name === metaData.superclass?.name) as CustomElement;
        if (decl?.tagName) {
            const metaData = getCustomElementDeclaration(decl.tagName, customElements);
            if (metaData) {
                Object.assign(
                    result,
                    metaData.attributes ? mapData(metaData.attributes, 'attributes') : {},
                    metaData.members ? mapData(metaData.members.filter((m) => m.kind === 'field' && !m.static && !(m as ClassField & { state?: boolean }).state), 'properties') : {},
                    metaData.members ? mapData(metaData.members.filter((m) => m.kind === 'field' && !m.static && (m as ClassField & { state?: boolean }).state), 'states') : {},
                    metaData.events ? mapData(metaData.events, 'events') : {},
                    metaData.slots ? mapData(metaData.slots, 'slots') : {},
                    metaData.cssProperties ? mapData(metaData.cssProperties, 'css custom properties') : {},
                    metaData.cssParts ? mapData(metaData.cssParts, 'css shadow parts') : {},
                    metaData.members ? mapData(metaData.members.filter((m) => m.kind === 'method' && !m.static), 'methods') : {},
                    metaData.members ? mapData(metaData.members.filter((m) => m.kind === 'field' && m.static), 'static properties') : {},
                    metaData.members ? mapData(metaData.members.filter((m) => m.kind === 'method' && m.static), 'static methods') : {}
                );
            }
        }
    }
    Object.assign(
        result,
        metaData.members ? mapData(metaData.members.filter((m) => m.kind === 'field' && !m.static && !m.static && !(m as ClassField & { state?: boolean }).state), 'properties') : {},
        metaData.members ? mapData(metaData.members.filter((m) => m.kind === 'field' && !m.static && !m.static && (m as ClassField & { state?: boolean }).state), 'states') : {},
        metaData.attributes ? mapData(metaData.attributes, 'attributes') : {},
        metaData.events ? mapData(metaData.events, 'events') : {},
        metaData.slots ? mapData(metaData.slots, 'slots') : {},
        metaData.cssProperties ? mapData(metaData.cssProperties, 'css custom properties') : {},
        metaData.cssParts ? mapData(metaData.cssParts, 'css shadow parts') : {},
        metaData.members ? mapData(metaData.members.filter((m) => m.kind === 'method' && !m.static), 'methods') : {},
        metaData.members ? mapData(metaData.members.filter((m) => m.kind === 'field' && m.static), 'static properties') : {},
        metaData.members ? mapData(metaData.members.filter((m) => m.kind === 'method' && m.static), 'static methods') : {}
    );

    return result;
};

export const extractArgTypes = (tagName: string) => {
    const customElements = getCustomElementsManifest();
    if (!customElements) {
        return null;
    }

    return extractArgTypesFromElements(tagName, customElements);
};

export const extractComponentDescription = (tagName: string) => {
    const customElements = getCustomElementsManifest();
    if (!customElements) {
        return null;
    }

    const metaData = getCustomElementDeclaration(tagName, customElements);
    if (!metaData) {
        return null;
    }

    return metaData.description;
};
