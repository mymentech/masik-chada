import { useQuery } from '@apollo/client';
import { DASHBOARD_SUMMARY_QUERY } from '../graphql/queries';

export function useDashboardSummary() {
  const query = useQuery(DASHBOARD_SUMMARY_QUERY, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first'
  });

  return {
    summary: query.data?.dashboard,
    loading: query.loading,
    error: query.error,
    refetch: query.refetch
  };
}
