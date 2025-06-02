import { createContext } from 'react';

type TimelineContextType = {
  startTime?: Date | null;
  intervalMinutes: number;
  intervalCount: number;
};

export const TimelineContext = createContext<TimelineContextType>({
  startTime: null,
  intervalMinutes: 0,
  intervalCount: 0,
});
