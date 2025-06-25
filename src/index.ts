import { BabelTranspiler } from './transpiler';
import { createTranspilerPlugin, createConfigurablePlugin } from './plugin';

// Exportar todo lo necesario
export {
  BabelTranspiler,
  createTranspilerPlugin,
  createConfigurablePlugin
};

export * from './types';

// Función de utilidad principal
export function transformCode(
  code: string,
  config: { debug?: boolean; transforms?: string[] } = {}
): string {
  const transpiler = new BabelTranspiler(config);
  return transpiler.transform(code);
}