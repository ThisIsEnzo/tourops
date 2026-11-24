import { useCallback, useEffect, useState } from 'react';
import type { Route } from './navigation';
import { parseRoute, routeToHash } from './navigation';
import { setHash, useHash } from '../shared/navigation/hashLocation';

/** Product route binding over the shared browser-hash external store. */
export function useNavigation(): { route: Route; navigate: (route: Route) => void } {
  const hash = useHash();
  const [route, setRoute] = useState<Route>(() => parseRoute(hash));
  useEffect(() => { setRoute(parseRoute(hash)); }, [hash]);
  const navigate = useCallback((next: Route) => {
    if (!setHash(routeToHash(next))) setRoute(next);
  }, []);
  return { route, navigate };
}
