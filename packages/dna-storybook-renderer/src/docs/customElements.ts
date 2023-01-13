import { type Package, type CustomElement, type Attribute, type ClassMember, type PropertyLike } from 'custom-elements-manifest';
import { getCustomElements, getMetaData } from '../framework-api';
import { type PropDef, type PropType } from '@storybook/docs-tools';

function mapData(data: (Attribute|ClassMember|PropertyLike)[], category: string) {
    return data.reduce((acc: { [key: string]: PropDef }, item) => {
        if (!item) {
            return acc;
        }
        if (!item.name) {
            return acc;
        }

        const type: PropType = category === 'properties' ? {
            summary: (item as PropertyLike).type?.text || 'unknown',
        } : {
            summary: 'void',
        };
        acc[`${category} - ${item.name}`] = {
            name: item.name,
            required: false,
            description: item.description,
            type,
            // table: {
            //     category,
            //     type: {
            //         summary: item.text ?? item.type,
            //     },
            //     defaultValue: {
            //         summary: item.default !== undefined ? item.default : item.defaultValue,
            //     },
            // },
        };
        return acc;
    }, {} as { [key: string]: PropDef });
}

export const extractArgTypesFromElements = (tagName: string, customElements: Package) => {
    const metaData = getMetaData(tagName, customElements);
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
            const metaData = getMetaData(decl.tagName, customElements);
            if (metaData) {
                Object.assign(
                    result,
                    metaData.attributes ? mapData(metaData.attributes, 'attributes') : {},
                    metaData.members ? mapData(metaData.members.filter((m) => m.kind === 'field' && !m.static), 'properties') : {},
                    metaData.properties ? mapData(metaData.properties, 'properties') : {},
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
        metaData.attributes ? mapData(metaData.attributes, 'attributes') : {},
        metaData.members ? mapData(metaData.members.filter((m) => m.kind === 'field' && !m.static), 'properties') : {},
        metaData.properties ? mapData(metaData.properties, 'properties') : {},
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
    const customElements = getCustomElements();
    if (!customElements) {
        return null;
    }

    return extractArgTypesFromElements(tagName, customElements);
};

export const extractComponentDescription = (tagName: string) => {
    const customElements = getCustomElements();
    if (!customElements) {
        return null;
    }

    const metaData = getMetaData(tagName, customElements);
    if (!metaData) {
        return null;
    }

    return metaData.description;
};
