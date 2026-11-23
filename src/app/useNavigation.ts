import { useCallback, useEffect, useState } from 'react';
import type { Route } from './navigation';
import { parseRoute, routeToHash } from './navigation';

/** Hash-backed navigation: deep-linkable, back/forward works, no router dependency. */
export function useNavigation(): { route: Route; navigate: (route: Route) => void } {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));

  useEffect(() => {
    const onHashChange = (): void => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((next: Route) => {
    const hash = routeToHash(next);
    if (window.location.hash === hash) {
      setRoute(next);
    } else {
      window.location.hash = hash;
    }
  }, []);

  return { route, navigate };
}