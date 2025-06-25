import { BabelTranspiler } from './transpiler';
import { createTranspilerPlugin, createConfigurablePlugin } from './plugin';

// Export everything needed
export {
  BabelTranspiler,
  createTranspilerPlugin,
  createConfigurablePlugin
};

export * from './types';

// Main utility function
export function transformCode(
  code: string,
  config: { debug?: boolean; transforms?: string[] } = {}
): string {
  const transpiler = new BabelTranspiler(config);
  return transpiler.transform(code);
}