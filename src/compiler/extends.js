import { sourceNode } from './sourceNode';

export default {
  /**
   * @return {null}
   */
  ExtendsStatement: ({node, figure}) => {
    const root = figure.root();
    const nodeId = node.identifier;

    if (nodeId.type === "Identifier") {
      root.setExtends(nodeId.name);
    } else {
      const id = `${figure.name}_extends${figure.uniqid("extends_name")}`;
      root.addImport(
        sourceNode(node.loc, `var ${id} = __requireDefault(require(${nodeId.value}));`)
      );

      root.setExtends(id);
    }

    return null;
  }
};
