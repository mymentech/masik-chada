import {
  GraphQLError,
  Kind,
  type FragmentDefinitionNode,
  type OperationDefinitionNode,
  type SelectionSetNode,
  type ValidationContext,
  type ValidationRule,
} from 'graphql';

function selectionSetDepth(
  selectionSet: SelectionSetNode,
  fragments: Map<string, FragmentDefinitionNode>,
  currentDepth: number,
  visitedFragments: Set<string>,
): number {
  let maxDepth = currentDepth;

  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      const fieldDepth = currentDepth + 1;
      maxDepth = Math.max(maxDepth, fieldDepth);

      if (selection.selectionSet) {
        maxDepth = Math.max(
          maxDepth,
          selectionSetDepth(selection.selectionSet, fragments, fieldDepth, visitedFragments),
        );
      }
      continue;
    }

    if (selection.kind === Kind.INLINE_FRAGMENT) {
      maxDepth = Math.max(
        maxDepth,
        selectionSetDepth(selection.selectionSet, fragments, currentDepth, visitedFragments),
      );
      continue;
    }

    if (selection.kind === Kind.FRAGMENT_SPREAD) {
      const fragmentName = selection.name.value;
      if (visitedFragments.has(fragmentName)) {
        continue;
      }

      const fragment = fragments.get(fragmentName);
      if (!fragment) {
        continue;
      }

      const visitedInBranch = new Set(visitedFragments);
      visitedInBranch.add(fragmentName);
      maxDepth = Math.max(
        maxDepth,
        selectionSetDepth(fragment.selectionSet, fragments, currentDepth, visitedInBranch),
      );
    }
  }

  return maxDepth;
}

function operationDepth(
  node: OperationDefinitionNode,
  context: ValidationContext,
  maxAllowedDepth: number,
): void {
  const fragments = new Map<string, FragmentDefinitionNode>();
  for (const definition of context.getDocument().definitions) {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      fragments.set(definition.name.value, definition);
    }
  }

  const depth = selectionSetDepth(node.selectionSet, fragments, 0, new Set<string>());
  if (depth > maxAllowedDepth) {
    context.reportError(
      new GraphQLError(
        `GraphQL operation depth ${depth} exceeds configured max depth ${maxAllowedDepth}.`,
        { nodes: [node] },
      ),
    );
  }
}

export function createDepthLimitRule(maxAllowedDepth: number): ValidationRule {
  return (context: ValidationContext) => ({
    OperationDefinition(node) {
      operationDepth(node, context, maxAllowedDepth);
    },
  });
}
