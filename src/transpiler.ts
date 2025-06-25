import { transform } from '@babel/core';
import type { BabelFileResult } from '@babel/core';
import { createTranspilerPlugin, createConfigurablePlugin } from './plugin';
import type { TranspilerConfig } from './types';

export class BabelTranspiler {
  private config: TranspilerConfig;
  
  constructor(config: TranspilerConfig = {}) {
    this.config = {
      debug: false,
      transforms: [],
      ...config
    };
  }
  
  /**
   * Transpile JavaScript/TypeScript code
   */
  transform(code: string, isTypeScript = false): string {
    try {
      const result = transform(code, {
        plugins: [
          createTranspilerPlugin(),
          [createConfigurablePlugin(), { config: this.config }]
        ],
        parserOpts: {
          sourceType: 'module',
          allowImportExportEverywhere: true,
          plugins: [
            'typescript',
            'jsx',
            'decorators-legacy',
            'classProperties',
            'objectRestSpread'
          ]
        },
        generatorOpts: {
          retainLines: false,
          compact: false
        }
      });
      
      return result?.code || code;
      
    } catch (error) {
      console.error('❌ Transpilation error:', error);
      return code;
    }
  }
  
  /**
   * Analyze code without transforming
   */
  analyze(code: string): void {
    console.log('🔍 Analyzing code...\n');
    
    const oldDebug = this.config.debug;
    this.config.debug = true;
    
    this.transform(code);
    
    this.config.debug = oldDebug;
  }
  
  /**
   * Transform file
   */
  transformFile(filePath: string): Promise<string> {
    // TODO: Implement file reading
    return Promise.resolve('');
  }
}