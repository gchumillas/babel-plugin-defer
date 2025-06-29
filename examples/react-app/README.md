# React App

A modern React application built with Vite and TypeScript.

## Features

- ⚛️ React 19
- 🔷 Strictly typed TypeScript
- ⚡ Vite for fast development and build
- 🎨 ESLint configured with React rules
- 🔥 Hot Module Replacement (HMR)

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

This will start the development server at `http://localhost:5173`

## Build

```bash
npm run build
```

## Linting

```bash
npm run lint`
```

## Project Structure

```
src/
├── components/     # Reusable components
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
├── App.tsx        # Main component
└── main.tsx       # Entry point
```

## Vite Plugins

This project uses:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) which uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) which uses [SWC](https://swc.rs/) for Fast Refresh (alternative)

## Advanced ESLint Configuration

For production applications, it is recommended to update the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configurations...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configurations...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific rules.
