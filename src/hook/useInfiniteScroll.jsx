import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll(callback: () => void) {
  const observerRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting) {
        callback();
      }
    },
    [callback]
  );

  useEffect(() => {
    const element = observerRef.current;
    const option = {
      root: null,
      rootMargin: '20px',
      threshold: 0,
    };

    const observer = new IntersectionObserver(handleObserver, option);

    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver]);

  return observerRef;
}