import type { Plugin } from '@custom-elements-manifest/analyzer';
import { getPackageCustomElement, isCustomElementDeclaration } from './utils';

export function inheritance(): Plugin {
    return {
        name: 'DNA-INHERITANCE',
        packageLinkPhase({ customElementsManifest }) {
            if (!customElementsManifest) {
                return;
            }

            customElementsManifest.modules.forEach((mod) => {
                mod.declarations?.forEach((declaration) => {
                    if (!isCustomElementDeclaration(declaration)) {
                        return;
                    }
                    if (
                        declaration.superclass?.name &&
                        declaration.superclass?.package
                    ) {
                        const externalManifests = getPackageCustomElement(
                            mod.path,
                            declaration.superclass.package
                        );
                        if (!externalManifests) {
                            return;
                        }
                        for (const mod of externalManifests.modules) {
                            if (!mod.declarations) {
                                continue;
                            }
                            for (const decl of mod.declarations) {
                                if (!isCustomElementDeclaration(decl)) {
                                    continue;
                                }
                                if (decl.name === declaration.superclass.name) {
                                    if (decl.slots) {
                                        const slots = declaration.slots ?? [];
                                        slots.unshift(
                                            ...decl.slots.filter(
                                                (slot) =>
                                                    !slots.some(
                                                        (s) =>
                                                            s.name === slot.name
                                                    )
                                            )
                                        );
                                        declaration.slots = slots;
                                    }
                                    if (decl.members) {
                                        const members =
                                            declaration.members ?? [];
                                        members.unshift(
                                            ...decl.members.filter(
                                                (member) =>
                                                    !members.some(
                                                        (m) =>
                                                            m.name ===
                                                            member.name
                                                    )
                                            )
                                        );
                                        declaration.members = members;
                                    }
                                    if (decl.events) {
                                        const events = declaration.events ?? [];
                                        events.unshift(
                                            ...decl.events.filter(
                                                (event) =>
                                                    !events.some(
                                                        (e) =>
                                                            e.name ===
                                                            event.name
                                                    )
                                            )
                                        );
                                        declaration.events = events;
                                    }
                                    if (decl.locale) {
                                        const locale = declaration.locale ?? [];
                                        locale.unshift(
                                            ...decl.locale.filter(
                                                (loc) =>
                                                    !locale.some(
                                                        (l) =>
                                                            l.name === loc.name
                                                    )
                                            )
                                        );
                                        declaration.locale = locale;
                                    }
                                    if (decl.icons) {
                                        const icons = declaration.icons ?? [];
                                        icons.unshift(
                                            ...decl.icons.filter(
                                                (icon) =>
                                                    !icons.some(
                                                        (i) =>
                                                            i.name === icon.name
                                                    )
                                            )
                                        );
                                        declaration.icons = icons;
                                    }
                                }
                            }
                        }
                    }
                });
            });
        },
    };
}
