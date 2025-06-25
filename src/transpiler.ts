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
   * Transpilar código JavaScript/TypeScript
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
   * Analizar código sin transformar
   */
  analyze(code: string): void {
    console.log('🔍 Analyzing code...\n');
    
    const oldDebug = this.config.debug;
    this.config.debug = true;
    
    this.transform(code);
    
    this.config.debug = oldDebug;
  }
  
  /**
   * Transformar archivo
   */
  transformFile(filePath: string): Promise<string> {
    // TODO: Implementar lectura de archivos
    return Promise.resolve('');
  }
}