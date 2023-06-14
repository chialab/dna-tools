import plugin from '@chialab/ts-dna-plugin';
import process from 'node:process';
import ts from 'typescript';
import { describe, expect, test } from 'vitest';

describe('Ttypescript plugin DNA', () => {
    test('register JSX element', async () => {
        const content = `import { customElement, Component, property } from '@chialab/dna';

@customElement('my-element')
export class MyElement extends Component {
    @property() name: string;
}
`;
        const compilerHost = {
            getSourceFile: (fileName) => {
                if (fileName === 'my-element.ts') {
                    return ts.createSourceFile(fileName, content, 'es2020');
                }
                return undefined;
            },
            fileExists: () => true,
            readFile: (fileName) => ts.sys.readFile(fileName),
            writeFile: () => {},
            getDefaultLibFileName: () => 'lib.d.ts',
            useCaseSensitiveFileNames: () => true,
            getCanonicalFileName: (fileName) => fileName,
            getCurrentDirectory: () => process.cwd(),
            getNewLine: () => ts.sys.newLine,
        };

        const program = ts.createProgram(
            ['my-element.ts'],
            {
                declaration: true,
                emitDeclarationOnly: true,
                experimentalDecorators: true,
                incremental: false,
                moduleResolution: ts.ModuleResolutionKind.NodeJs,
            },
            compilerHost
        );

        const outputs = {};
        program.emit(
            undefined,
            (fileName, fileContents) => {
                outputs[fileName] = fileContents;
            },
            undefined,
            undefined,
            {
                afterDeclarations: [plugin],
            }
        );

        expect(outputs['my-element.d.ts']).toEqual(`import { Component } from '@chialab/dna';
export declare class MyElement extends Component {
    name: string;
    __is__: "my-element";
    __properties__: {
        "name": string;
    };
}
declare module "@chialab/dna" {
    namespace JSX {
        interface CustomElements {
            "my-element": MyElement;
        }
    }
}
`);
    });

    test('register JSX builtin element', async () => {
        const content = `import { customElement, extend, window, property } from '@chialab/dna';

@customElement('my-button', {
    extends: 'button',
})
export class MyButton extends extend(window.HTMLButtonElement) {
    @property() name: string;
}
`;
        const compilerHost = {
            getSourceFile: (fileName) => {
                if (fileName === 'my-button.ts') {
                    return ts.createSourceFile(fileName, content, 'es2020');
                }
                return undefined;
            },
            fileExists: () => true,
            readFile: (fileName) => ts.sys.readFile(fileName),
            writeFile: () => {},
            getDefaultLibFileName: () => 'lib.d.ts',
            useCaseSensitiveFileNames: () => true,
            getCanonicalFileName: (fileName) => fileName,
            getCurrentDirectory: () => process.cwd(),
            getNewLine: () => ts.sys.newLine,
        };

        const program = ts.createProgram(
            ['my-button.ts'],
            {
                declaration: true,
                emitDeclarationOnly: true,
                experimentalDecorators: true,
                incremental: false,
                moduleResolution: ts.ModuleResolutionKind.NodeJs,
            },
            compilerHost
        );

        const outputs = {};
        program.emit(
            undefined,
            (fileName, fileContents) => {
                outputs[fileName] = fileContents;
            },
            undefined,
            undefined,
            {
                afterDeclarations: [plugin],
            }
        );

        expect(outputs['my-button.d.ts']).toEqual(`declare const MyButton_base: any;
export declare class MyButton extends MyButton_base {
    name: string;
    __is__: "my-button";
    __extends__: "button";
    __properties__: {
        "name": string;
    };
}
export {};
declare module "@chialab/dna" {
    namespace JSX {
        interface CustomElements {
            "my-button": MyButton;
        }
    }
}
`);
    });
});
