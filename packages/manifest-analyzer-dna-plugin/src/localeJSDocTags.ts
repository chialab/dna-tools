import type { Plugin } from '@custom-elements-manifest/analyzer';
import { parse } from 'comment-parser';
import type { ClassDeclaration as ManifestClassDeclaration } from 'custom-elements-manifest';
import type { ClassDeclaration, JSDoc } from 'typescript';

export function localeJSDocTags(): Plugin {
    return {
        name: 'DNA-LOCALE-JSDOC-TAGS',
        analyzePhase({ ts, node, moduleDoc }) {
            if (ts.isClassDeclaration(node)) {
                const className = node?.name?.getText();
                const classDoc = moduleDoc?.declarations?.find(
                    (declaration) => declaration.name === className
                ) as ManifestClassDeclaration & {
                    locale?: {
                        value: string;
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
                            if (tag.tag === 'locale') {
                                classDoc.locale = classDoc.locale || [];
                                const fullText = `${tag.name} ${tag.description}`;
                                const [name, description] = fullText.split(/\s*-\s+/);
                                classDoc.locale.push({
                                    value: name.replace(/^["']/, '').replace(/["']$/, ''),
                                    description,
                                });
                            }
                        });
                    });
                });
            }
        },
    };
}
