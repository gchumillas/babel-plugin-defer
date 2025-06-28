# React App

Una aplicación React moderna construida con Vite y TypeScript.

## Características

- ⚛️ React 19
- 🔷 TypeScript con tipado estricto
- ⚡ Vite para desarrollo y construcción rápida
- 🎨 ESLint configurado con reglas para React
- 🔥 Hot Module Replacement (HMR)

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Esto iniciará el servidor de desarrollo en `http://localhost:5173`

## Construcción

```bash
npm run build
```

## Linting

```bash
npm run lint
```

## Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
├── types/         # Definiciones de tipos TypeScript
├── utils/         # Funciones utilitarias
├── App.tsx        # Componente principal
└── main.tsx       # Punto de entrada
```

## Plugins de Vite

Este proyecto utiliza:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) que usa [Babel](https://babeljs.io/) para Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) que usa [SWC](https://swc.rs/) para Fast Refresh (alternativa)

## Configuración Avanzada de ESLint

Para aplicaciones en producción, se recomienda actualizar la configuración para habilitar reglas de lint con conocimiento de tipos:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Otras configuraciones...

      // Remover tseslint.configs.recommended y reemplazar con esto
      ...tseslint.configs.recommendedTypeChecked,
      // Alternativamente, usar esto para reglas más estrictas
      ...tseslint.configs.strictTypeChecked,
      // Opcionalmente, agregar esto para reglas de estilo
      ...tseslint.configs.stylisticTypeChecked,

      // Otras configuraciones...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // otras opciones...
    },
  },
])
```

También puedes instalar [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) y [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) para reglas específicas de React.
