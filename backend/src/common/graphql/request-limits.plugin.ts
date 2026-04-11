import type {
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequestContextDidResolveOperation,
} from '@apollo/server';
import { GraphQLError } from 'graphql';

interface GraphqlRequestLimitsConfig {
  maxQueryLength: number;
  maxVariablesBytes: number;
}

export function createRequestLimitsPlugin(
  config: GraphqlRequestLimitsConfig,
): ApolloServerPlugin<BaseContext> {
  return {
    async requestDidStart() {
      return {
        async didResolveOperation(
          requestContext: GraphQLRequestContextDidResolveOperation<BaseContext>,
        ) {
          const query = requestContext.request.query || '';
          if (query.length > config.maxQueryLength) {
            throw new GraphQLError(
              `GraphQL query length ${query.length} exceeds configured max ${config.maxQueryLength}.`,
            );
          }

          const variablesPayload = JSON.stringify(requestContext.request.variables || {});
          const variablesBytes = Buffer.byteLength(variablesPayload, 'utf8');
          if (variablesBytes > config.maxVariablesBytes) {
            throw new GraphQLError(
              `GraphQL variables payload ${variablesBytes} bytes exceeds configured max ${config.maxVariablesBytes}.`,
            );
          }
        },
      };
    },
  };
}
