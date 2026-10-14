import { ASTNode, CustomASTNode } from './nodes';

/**
 * Function used by AST traversal algorithms (such as variable extraction)
 * to locate child AST nodes within a custom AST node type.
 *
 * @param node - The custom AST node to inspect
 * @returns An array of child AST nodes contained inside this node
 */
export type ASTChildrenExtractor = (node: Record<string, unknown>) => (ASTNode | CustomASTNode)[];

export interface ASTExtensions {
  readonly extractors: ReadonlyMap<string, ASTChildrenExtractor>;
}

export class ASTExtensionsBuilder {
  private readonly _extractors: Map<string, ASTChildrenExtractor> = new Map();

  addChildrenExtractor(nodeType: string, extractor: ASTChildrenExtractor): void {
    this._extractors.set(nodeType, extractor);
  }

  build(): ASTExtensions {
    return {
      extractors: new Map(this._extractors),
    };
  }
}
