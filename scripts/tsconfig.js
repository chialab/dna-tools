import { readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Configuration, Project } from '@yarnpkg/core';
import { applyEdits, modify } from 'jsonc-parser';
import prettier from 'prettier';

const ROOT = resolve(fileURLToPath(import.meta.url), '../../');
const config = Configuration.create(ROOT, ROOT);

Project.find(config, ROOT).then(async ({ project }) => {
    const packages = project.topLevelWorkspace.getRecursiveWorkspaceChildren();
    const tsconfig = resolve(ROOT, 'tsconfig.json');
    const formatConfig = await prettier.resolveConfig(tsconfig);
    const content = await readFile(tsconfig, 'utf-8');
    const references = packages.map((pkg) => ({
        path: `./${relative(ROOT, pkg.cwd)}`,
    }));
    const edits = modify(content, ['references'], references, {
        formattingOptions: {
            insertSpaces: true,
            tabSize: 2,
            eol: '\n',
        },
    });

    await writeFile(tsconfig, await prettier.format(applyEdits(content, edits), { ...formatConfig, parser: 'jsonc' }));

    await Promise.all(
        packages.map(async (pkg) => {
            const {
                cwd,
                manifest: { dependencies, peerDependencies, devDependencies },
            } = pkg;
            const tsconfig = resolve(cwd, 'tsconfig.json');
            const content = await readFile(tsconfig, 'utf-8');

            try {
                const references = Array.from(dependencies.values())
                    .concat(Array.from(peerDependencies.values()))
                    .concat(Array.from(devDependencies.values()))
                    .map((dep) =>
                        packages.find(
                            ({ manifest }) => manifest.name.scope === dep.scope && manifest.name.name === dep.name
                        )
                    )
                    .filter((pkg) => !!pkg)
                    .map((pkg) => ({
                        path: relative(cwd, pkg.cwd),
                    }));

                const edits = modify(content, ['references'], references, {
                    formattingOptions: {
                        insertSpaces: true,
                        tabSize: 2,
                        eol: '\n',
                    },
                });

                await writeFile(
                    tsconfig,
                    await prettier.format(applyEdits(content, edits), { ...formatConfig, parser: 'jsonc' })
                );
            } catch (err) {
                // eslint-disable-next-line
                console.error(err, pkg.location, content);
            }
        })
    );
});
