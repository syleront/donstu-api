import { ScheduleItemNormalized } from "./ScheduleItemNormalized";
import { ScheduleInfo } from "./ScheduleInfo";

export interface ScheduleNormalized {
  schedule: ScheduleItemNormalized[];
  info: ScheduleInfo;
}
