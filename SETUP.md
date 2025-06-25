# Babel Transpiler - Setup Instructions

## 1. Crear proyecto
```bash
mkdir babel-transpiler && cd babel-transpiler
```

## 2. Instalar dependencias
```bash
npm init -y
npm install --save-dev @babel/core @babel/types @types/node typescript ts-node
npm install @babel/core
```

## 3. Estructura de archivos
Crear la siguiente estructura:
```
babel-transpiler/
├── package.json          # (copiar del artifact)
├── tsconfig.json         # (copiar del artifact)
└── src/
    ├── types.ts          # (copiar del artifact)
    ├── plugin.ts         # (copiar del artifact)
    ├── transpiler.ts     # (copiar del artifact)
    ├── index.ts          # (copiar del artifact)
    └── test.ts           # (copiar del artifact)
```

## 4. Ejecutar
```bash
npm run dev        # Ejecutar con ts-node
npm run build      # Compilar a JavaScript
npm run test       # Ejecutar tests
npm run watch      # Watch mode
```

## 5. Empezar a desarrollar
- Los visitors están en `src/plugin.ts`
- La lógica principal en `src/transpiler.ts`
- Los tests en `src/test.ts`

¡Listo para implementar tus transformaciones! 🚀