# Publishing to npm

## 1. Two-factor authentication (required)

npm requires **2FA** or a **granular access token with “bypass 2FA”** to publish packages. If you see:

```text
403 Forbidden - Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages.
```

**Option A – Enable 2FA on your account (recommended)**  
1. Go to [npmjs.com](https://www.npmjs.com) → Account → **Enable 2FA**.  
2. Use an authenticator app (e.g. Google Authenticator).  
3. Run `npm publish --access public` again; npm will prompt for the one-time code.

**Option B – Use an automation token (e.g. for CI)**  
1. npm → Account → **Access Tokens** → **Generate New Token**.  
2. Choose **Granular Access Token**, set package permissions to **Read and write**, and enable **Bypass 2FA for publish**.  
3. Use that token: `npm login` with token as password, or set `NPM_TOKEN` in CI.

## 2. Log in to npm

If you haven’t already:

```bash
npm login
```

Use your npm account username, password, and email (or use a token). Check that you’re logged in:

```bash
npm whoami
```

## 3. Package name and scope

This package is named **`fc-react-rich-editor`** (unscoped). No npm organization is required.

## 4. Build and publish

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

## 5. After publishing

- Package page: `https://www.npmjs.com/package/fc-react-rich-editor`
- Install: `npm install fc-react-rich-editor`

To publish updates, bump the version (e.g. `npm version patch`) then run `npm publish --access public` again.
