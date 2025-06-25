# Babel Transpiler - Setup Instructions

## 1. Create project
```bash
mkdir babel-transpiler && cd babel-transpiler
```

## 2. Install dependencies
```bash
npm init -y
npm install --save-dev @babel/core @babel/types @types/node typescript ts-node
npm install @babel/core
```

## 3. File structure
Create the following structure:
```
babel-transpiler/
├── package.json          # (copy from artifact)
├── tsconfig.json         # (copy from artifact)
└── src/
    ├── types.ts          # (copy from artifact)
    ├── plugin.ts         # (copy from artifact)
    ├── transpiler.ts     # (copy from artifact)
    ├── index.ts          # (copy from artifact)
    └── test.ts           # (copy from artifact)
```

## 4. Run
```bash
npm run dev        # Run with ts-node
npm run build      # Compile to JavaScript
npm run test       # Run tests
npm run watch      # Watch mode
```

## 5. Start developing
- Visitors are in `src/plugin.ts`
- Main logic in `src/transpiler.ts`
- Tests in `src/test.ts`

Ready to implement your transformations! 🚀