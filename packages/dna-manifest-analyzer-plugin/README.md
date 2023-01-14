# DNA Manifest Analyzer Plugin

DNA components plugin for [@custom-elements-manifest/analyzer](https://www.npmjs.com/package/@custom-elements-manifest/analyzer).

## Usage

Install the analyzer cli and the plugin:

```
npm install -D \
    @custom-elements-manifest/analyzer \
    @chialab/dna-manifest-analyzer-plugin
```

Create a config file that includes the DNA plugin:

**custom-elements-manifest.config.js**
```tsx
import { dnaPlugins } from '@chialab/dna-manifest-analyzer-plugin';

export default {
    plugins: [
        ...dnaPlugins(),
    ],
}
```

Then, run the analyzer:

```
npx cem --config custom-elements-manifest.config.js
```

## Development

Read the "[Authoring Plugins](https://github.com/open-wc/custom-elements-manifest/blob/master/packages/analyzer/docs/plugins.md)" section in the Custom Elements Manifest Analyzer documentation.

---

## License

**DNA Manifest Analyzer Plugin** are released under the [MIT](https://github.com/chialab/dna-tools/blob/main/LICENSE) license.

