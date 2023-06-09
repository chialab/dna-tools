import type { Package } from 'custom-elements-manifest';
import type { SourceFile } from 'typescript';

declare module '@custom-elements-manifest/analyzer' {
    export function create(options: { modules: SourceFile[]; plugins: Plugin[] }): Package;
}
