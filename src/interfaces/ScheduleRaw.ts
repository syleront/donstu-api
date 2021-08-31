import { ScheduleItemRaw } from "./ScheduleItemRaw";
import { ScheduleInfo } from "./ScheduleInfo";

export interface ScheduleRaw {
  rasp: ScheduleItemRaw[];
  info: ScheduleInfo;
}
