import { ScheduleWeekType } from "./ScheduleWeekType";

export interface ScheduleInfo {
  group: {
    name: string;
    groupID: number;
  };
  prepod: {
    name: string;
  };
  aud: {
    name: string;
  };
  year: string;
  curWeekNumber: number;
  curNumNed: number;
  selectedNumNed: number;
  curSem: number;
  typesWeek: ScheduleWeekType[];
  fixedInCache: boolean;
  date: string;
  lastDate: string;
}
