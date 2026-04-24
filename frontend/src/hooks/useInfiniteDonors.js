import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import { DONORS_PAGE_QUERY } from '../graphql/queries';

export const DONORS_PAGE_SIZE = 40;

export function useInfiniteDonors({ search, address }) {
  const variables = {
    search: search || undefined,
    address: address || undefined,
    offset: 0,
    limit: DONORS_PAGE_SIZE,
  };

  const { data, loading, error, fetchMore, refetch } = useQuery(DONORS_PAGE_QUERY, {
    variables,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const page = data?.donorsPage;
  const items = page?.items || [];
  const hasMore = Boolean(page?.hasMore);
  const total = page?.total || 0;

  const [loadingMore, setLoadingMore] = useState(false);
  const inFlightRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || inFlightRef.current) return;
    inFlightRef.current = true;
    setLoadingMore(true);
    try {
      await fetchMore({
        variables: { offset: items.length, limit: DONORS_PAGE_SIZE },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult?.donorsPage) return prev;
          const prevItems = prev?.donorsPage?.items || [];
          return {
            donorsPage: {
              ...fetchMoreResult.donorsPage,
              items: [...prevItems, ...fetchMoreResult.donorsPage.items],
            },
          };
        },
      });
    } finally {
      inFlightRef.current = false;
      setLoadingMore(false);
    }
  }, [fetchMore, hasMore, items.length, loading]);

  const sentinelRef = useRef(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    total,
    sentinelRef,
    refetch,
    variables,
  };
}
