import { useState, useEffect, useRef, useCallback, Dispatch, SetStateAction } from 'react';

export function useMountedState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
  const isMounted = useRef(true);
  const [state, setState] = useState(initialState);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const setSafeState = useCallback((value: SetStateAction<S>) => {
    if (isMounted.current) {
      setState(value);
    }
  }, []);

  return [state, setSafeState];
}
