import { onGetExploreGroup } from '@/actions/groups';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import ExplorePageContent from './_components/explore-content';

const ExplorePage = async () => {
  const query = new QueryClient();

  await query.prefetchQuery({
    queryKey: ['groups'],
    queryFn: () => onGetExploreGroup('fitness', 0),
  });

  await query.prefetchQuery({
    queryKey: ['groups'],
    queryFn: () => onGetExploreGroup('music', 0),
  });

  await query.prefetchQuery({
    queryKey: ['groups'],
    queryFn: () => onGetExploreGroup('lifestyle', 0),
  });

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <ExplorePageContent layout='SLIDER' />
    </HydrationBoundary>
  );
};

export default ExplorePage;
