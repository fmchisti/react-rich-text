# Publishing to npm

## 1. Log in to npm

If you haven’t already:

```bash
npm login
```

Use your npm account username, password, and email (or use a token). Check that you’re logged in:

```bash
npm whoami
```

## 2. Package name and scope

This package is named **`@richtext/react-rich-text`** (scoped under `@richtext`).

- If you **own the `@richtext` org** on npm, you can publish as-is.
- If you **don’t**, either:
  - Create the [@richtext organization](https://www.npmjs.com/org/create) on npm and publish under it, or
  - Change the name in `package.json` to your own scope, e.g. `@fmchisti/react-rich-text`:
  ```bash
  npm pkg set name=@fmchisti/react-rich-text
  ```

## 3. Build and publish

From the project root:

```bash
npm run build
npm publish
```

For a **scoped** package (`@scope/name`), the first publish is **restricted** by default (only visible to paid users). To make it public:

```bash
npm publish --access public
```

So the usual flow is:

```bash
npm run build
npm publish --access public
```

`prepublishOnly` in `package.json` runs `npm run build` before `npm publish`, so you can also just run:

```bash
npm publish --access public
```

## 4. After publishing

- Package page: `https://www.npmjs.com/package/@richtext/react-rich-text` (or your scope/name).
- Install: `npm install @richtext/react-rich-text`

To publish updates, bump the version (e.g. `npm version patch`) then run `npm publish --access public` again.
