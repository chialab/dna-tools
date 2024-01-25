import type { Plugin } from '@custom-elements-manifest/analyzer';
import { parse } from 'comment-parser';
import type { ClassDeclaration as ManifestClassDeclaration } from 'custom-elements-manifest';
import type { ClassDeclaration, JSDoc } from 'typescript';

export function iconJSDocTags(): Plugin {
    return {
        name: 'DNA-ICON-JSDOC-TAGS',
        analyzePhase({ ts, node, moduleDoc }) {
            if (ts.isClassDeclaration(node)) {
                const className = node?.name?.getText();
                const classDoc = moduleDoc?.declarations?.find(
                    (declaration) => declaration.name === className
                ) as ManifestClassDeclaration & {
                    icons?: {
                        name: string;
                        description: string;
                    }[];
                };
                if (!classDoc) {
                    return;
                }

                (node as unknown as ClassDeclaration & { jsDoc?: JSDoc[] }).jsDoc?.forEach((jsDoc) => {
                    const parsed = parse(jsDoc.getFullText());
                    parsed.forEach((parsedDoc) => {
                        parsedDoc.tags.forEach((tag) => {
                            if (tag.tag === 'icon') {
                                classDoc.icons = classDoc.icons || [];
                                classDoc.icons.push({
                                    name: tag.name,
                                    description: tag.description.replace(/^\s*-\s+/, ''),
                                });
                            }
                        });
                    });
                });
            }
        },
    };
}
