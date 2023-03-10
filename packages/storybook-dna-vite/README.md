# Storybook DNA Vite

Storybook for DNA and Vite.

This preset allows Vite to be used as a Storbyook builder for the development of DNA components.

## Usage

This module is not an official Storybook plugin and it is not part of the list of automatically installable presets. However, you can use the Storybook cli to initialize the project and then replace the project dependencies.

```
npx sb@next init --type html
```

Then, replace `html` preset dependencies with this package:

```diff
-"@storybook/html": "^7.0.0-beta.53",
-"@storybook/html-webpack5": "^7.0.0-beta.53",
+"@chialab/storybook-dna": "^7.0.0-beta.53",
+"@chialab/storybook-dna-vite": "^7.0.0-beta.53",
```

And make sure to update your dependencies.

---

## License

**Storybook DNA Vite** are released under the [MIT](https://github.com/chialab/dna-tools/blob/main/LICENSE) license.
