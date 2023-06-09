import type { SourceFile } from 'typescript';
import type { Package } from 'custom-elements-manifest';

declare module '@custom-elements-manifest/analyzer' {
    export function create(options: {
        modules: SourceFile[];
        plugins: Plugin[];
    }): Package;
}
