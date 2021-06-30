// compatability layer of types for unist
declare module '../types' {
  export interface Node {
    // add in the index signature that is present in unist.Node
    [k: string]: unknown;
  }
}

export * from '../types';
