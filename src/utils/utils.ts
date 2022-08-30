import { RefObject, useRef } from 'react';

export const useRefsArray = (num: number) => {
  const refs: RefObject<HTMLDivElement>[] = [];

  for (let i = 0; i < num; i++) {
    const newRef = useRef<HTMLDivElement>(null);

    refs.push(newRef);
  }

  return refs;
};
