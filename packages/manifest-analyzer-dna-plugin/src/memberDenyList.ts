import type { Plugin } from '@custom-elements-manifest/analyzer';
import type { ClassDeclaration } from 'custom-elements-manifest/schema';

/**
 * A plugin that filters out private and protected class members.
 * @returns An analyzer plugin.
 */
export function memberDenyList(): Plugin {
    const STATIC_MEMBER_DENY_LIST = ['properties', 'listeners'];

    return {
        name: 'DNA-MEMBER-DENYLIST',
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
                            !member.static ||
                            !STATIC_MEMBER_DENY_LIST.includes(member.name)
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
