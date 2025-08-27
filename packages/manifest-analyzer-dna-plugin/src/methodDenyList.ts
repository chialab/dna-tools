import type { Plugin } from '@custom-elements-manifest/analyzer';
import type { ClassDeclaration } from 'custom-elements-manifest/schema';

/**
 * A plugin that filters out private and protected class methods.
 * @returns An analyzer plugin.
 */
export function methodDenyList(): Plugin {
    const METHOD_DENY_LIST = [
        'initialize',
        'assign',
        'forceUpdate',
        'connectedCallback',
        'disconnectedCallback',
        'attributeChangedCallback',
        'stateChangedCallback',
        'propertyChangedCallback',
        'updatedCallback',
        'childListChangedCallback',
        'requestUpdate',
        'shouldUpdate',
        'observe',
        'unobserve',
        'render',
        'collectUpdatesStart',
        'collectUpdatesEnd',
        'dispatchEvent',
        'dispatchAsyncEvent',
        'delegateEventListener',
        'undelegateEventListener',
    ];

    return {
        name: 'DNA-METHOD-DENYLIST',
        moduleLinkPhase({ moduleDoc }) {
            if (!moduleDoc.declarations) {
                return;
            }

            const classes = moduleDoc.declarations.filter(
                (declaration) => declaration.kind === 'class'
            ) as ClassDeclaration[];
            classes.forEach((_class) => {
                if (!_class?.members) {
                    return;
                }
                _class.members = _class.members
                    .filter(
                        (member) =>
                            member.static ||
                            !METHOD_DENY_LIST.includes(member.name)
                    )
                    .filter(
                        (member) =>
                            member.privacy !== 'private' &&
                            member.privacy !== 'protected'
                    );
            });
        },
    };
}
