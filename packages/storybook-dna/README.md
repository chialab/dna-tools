# DNA Storybook

The library used to render Storybook stories with DNA.

This module is used internally by the `@chialab/storybook-dna-vite` package. If you are setting up a Storybook for DNA components, you should refer to [this documentation](../storybook-dna-vite/).

## API

The module exposes a set of APIs to enhance Storybook documentation.

### `getCustomElementsManifest()`

This method can be used to retrieve a registered [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest).

```tsx
import { getCustomElementsManifest } from '@chialab/storybook-dna';

const manifest = getCustomElementsManifest();
manifest.modules.forEach(() => {
    // 
});
```

### `setCustomElementsManifest(manifest)`

Register a global Custom Elements Manifest.

```tsx
import { setCustomElementsManifest } from '@chialab/storybook-dna';

setCustomElementsManifest({
    schemaVersion: '1.0.0',
    modules: [
        ...
    ],
});
```

### `mergeCustomElementsManifests(manifest1, manifest2)`

Multiple generated manifests can be merged in a single global manifest.

```tsx
import { getCustomElementsManifest, setCustomElementsManifest, mergeCustomElementsManifests } from '@chialab/storybook-dna';

const globalManifest = getCustomElementsManifest();
const manifest = {
    schemaVersion: '1.0.0',
    modules: [
        ...
    ],
};

setCustomElementsManifest(
    mergeCustomElementsManifests(globalManifest, manifest)
);
```

---

## License

**DNA Storybook Renderer** are released under the [MIT](https://github.com/chialab/dna-tools/blob/main/LICENSE) license.
