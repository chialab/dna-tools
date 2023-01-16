# Web Dev Server Plugin HMR

Hot module replacement for DNA components and [Web Dev Server](https://modern-web.dev/docs/dev-server/overview/).

## Usage

Install the module:

```
npm install @chialab/wds-plugin-hmr-dna -D
```

and load the plugin in your dev server config:

**web-dev-server-config.js**
```ts
import { hmrPlugin } from '@chialab/wds-plugin-hmr-dna';

export default {
    plugins: [
        hmrPlugin(),
    ],
};
```

---

## License

**Web Dev Server Plugin HMR** are released under the [MIT](https://github.com/chialab/dna-tools/blob/main/LICENSE) license.
