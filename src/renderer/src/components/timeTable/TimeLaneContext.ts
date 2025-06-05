import { createContext, RefObject } from 'react';

type TimeLaneContextType = {
  startTime?: Date | null;
  cellMinutes: number;
  cellCount: number;
  parentRef: RefObject<HTMLDivElement> | null;
};

export const TimeLaneContext = createContext<TimeLaneContextType>({
  startTime: null,
  cellMinutes: 0,
  cellCount: 0,
  parentRef: null,
});
