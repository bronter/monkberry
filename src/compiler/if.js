import { sourceNode } from './sourceNode';
import { Figure } from '../figure';
import { collectVariables } from './variable';
import { isSingleChild, notNull } from '../utils';

function _IfStatement({parent, node, figure, compile}) {
  node.reference = null;

  const type = node.type.split("Statement")[0].toLowerCase();

  let templateName = `${figure.name}_${type}` + figure.uniqid('template_name');
  let childName = 'child' + figure.uniqid('child_name');
  let placeholder;

  if (isSingleChild(parent, node)) {
    placeholder = parent.reference;
  } else {
    node.reference = placeholder = 'for' + figure.uniqid('placeholder');
    figure.declare(sourceNode(`var ${placeholder} = document.createComment('${type}');`));
  }


  figure.declare(`var ${childName} = {};`);

  var variablesOfExpression = collectVariables(figure.getScope(), node.cond);

  figure.thisRef = true;
  figure.hasNested = true;

  const tests = {
    "if": compile(node.cond),
    "elseif": `!result && ${compile(node.cond)}`,
    "else": "!result",
  };

  const spot = figure.spot(variablesOfExpression).add(
    sourceNode(node.loc, [
      `      `,
      node.otherwise ? `result = ` : ``,
      `Monkberry.cond(_this, ${placeholder}, ${childName}, ${templateName}, `, tests[type], `)`
    ])
  );

  if (type === "else") {
    spot.declareVariable("result");
  }

  let compileBody = (loc, body, _templateName, childName) => {
    let subfigure = new Figure(_templateName, figure);
    subfigure.children = body.map(node => compile(node, subfigure)).filter(notNull);
    figure.addFigure(subfigure);

    figure.addOnUpdate(
      sourceNode(loc, [
        `    if (${childName}.ref) {\n`,
        `      ${childName}.ref.update(__data__);\n`,
        `    }`
      ])
    );
  };

  compileBody(node.loc, node.then, templateName, childName);

  if (node.otherwise) {
    compile(node.otherwise, figure);
  }

  return node.reference;
}

export default {
  IfStatement: _IfStatement,
  ElseIfStatement: _IfStatement,
  ElseStatement: _IfStatement,
};
