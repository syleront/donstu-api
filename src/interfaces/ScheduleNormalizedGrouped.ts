import { ScheduleItemNormalized } from "./ScheduleItemNormalized";

export interface ScheduleNormalizedGrouped {
  date: string;
  dayName: string;
  items: ScheduleItemNormalized[];
}
