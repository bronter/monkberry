import { sourceNode } from './sourceNode';

export default {
  /**
   * @return {null}
   */
  ExtendsStatement: ({node, figure}) => {
    // TODO: Add support for ES2015 imports.
    figure.root().setExtends(node.identifier.name);

    return null;
  }
};
