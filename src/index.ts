import * as qs from "querystring";

import moment from "moment";
import got, { OptionsOfJSONResponseBody } from "got";

import { ApiSettings, CONNECTION_DEFAULTS, } from "./constants";

import {
  ScheduleRaw,
  ScheduleNormalized,
  ScheduleItemNormalized,
  DefaultResponse, GroupItem,
  TeacherItem, AudienceItem, ScheduleDates
} from "./interfaces";

import { StuAPIHelpers } from "./helpers";
import { ConnectionError } from "./errors";


export class StuAPI {
  public readonly helpers: StuAPIHelpers;

  constructor() {
    this.helpers = new StuAPIHelpers(this);
  }

  private static _normalizeScheduleObject(res: ScheduleRaw): ScheduleNormalized {
    const schedule: ScheduleItemNormalized[] = [];

    for (const subject of res.rasp) {
      const subObj: ScheduleItemNormalized = {
        audience: subject["аудитория"],
        groupName: subject["группа"],
        date: subject["дата"],
        dayName: subject["день_недели"],
        dayNumber: subject["деньНедели"],
        email: subject["почта"],
        lessonName: subject["дисциплина"],
        code: subject["код"],
        start: subject["начало"]?.split("-").join(":"),
        end: subject["конец"]?.split("-").join(":"),
        subGroupNumber: subject["номерПодгруппы"],
        teacher: subject["преподаватель"],
        weekType: subject["типНедели"],
        semesterCode: subject["код_Семестра"],
        weekStart: subject["неделяНачала"],
        weekEnd: subject["неделяОкончания"]
      };

      schedule.push(subObj);
    }

    return { schedule, info: res.info };
  }

  private static _getWeekStartDate(date: string | Date): string {
    return (date ? moment(date, "DD-MM-YYYY") : moment())
      .locale("ru")
      .startOf("isoWeek")
      .format("DD-MM-YYYY");
  }

  private static _getNextWeekStartDate(date: string | Date): string {
    return (date ? moment(date, "DD-MM-YYYY") : moment())
      .locale("ru")
      .add(1, "week")
      .startOf("isoWeek")
      .format("DD-MM-YYYY");
  }

  private async _req(method, params = null): Promise<object> {
    try {
      const data = params ? qs.stringify({ ...params, ...ApiSettings.REQUEST_DEFAULTS }) : ApiSettings.REQUEST_DEFAULTS;
      const url = `https://${ApiSettings.DOMAIN}${ApiSettings.PATH}/${method}${data ? "?" + data : ""}`;

      const opts: OptionsOfJSONResponseBody = { url, ...CONNECTION_DEFAULTS }
      const request = got(opts);

      request.on("downloadProgress", (progress) => {
        if (progress.transferred > ApiSettings.MAX_RESPONSE_SIZE) {
          request.cancel();
        }
      });

      const r = await request;

      if (r.statusCode === 200) {
        if (typeof r.body === "object") {
          return (<DefaultResponse>r.body).data;
        } else {
          throw new ConnectionError(r.statusCode);
        }
      } else {
        throw new ConnectionError(r.statusCode);
      }
    } catch (e) {
      if (e instanceof ConnectionError) {
        throw e;
      } else if (e.name === "CancelError") {
        throw new ConnectionError("MAX_SIZE_REACHED");
      } else if (e.response) {
        throw new ConnectionError(e.response.statusCode);
      } else {
        throw new ConnectionError(e.code);
      }
    }
  }

  public async getGroupsList(): Promise<GroupItem[]> {
    return <GroupItem[]>await this._req("raspGrouplist");
  }

  public async getGroupSchedule(id: number, start_date: string): Promise<ScheduleNormalized> {
    const r = <ScheduleRaw>await this._req("Rasp", { idGroup: id, sdate: start_date });
    return StuAPI._normalizeScheduleObject(r);
  }

  public async getGroupWeekSchedule(id: number, date: string = null): Promise<ScheduleNormalized> {
    return this.getGroupSchedule(id, StuAPI._getWeekStartDate(date));
  }

  public async getGroupNextWeekSchedule(id: number, date = null): Promise<ScheduleNormalized> {
    return this.getGroupSchedule(id, StuAPI._getNextWeekStartDate(date));
  }

  public async getTeacherList(): Promise<TeacherItem[]> {
    return <TeacherItem[]>await this._req("raspTeacherlist");
  }

  public async getTeacherSchedule(id: number, start_date: string): Promise<ScheduleNormalized> {
    const r = <ScheduleRaw>await this._req("Rasp", { idTeacher: id, sdate: start_date });
    return StuAPI._normalizeScheduleObject(r);
  }

  public async getTeacherWeekSchedule(id: number, date: string | Date = null): Promise<ScheduleNormalized> {
    return this.getTeacherSchedule(id, StuAPI._getWeekStartDate(date));
  }

  public async getTeacherNextWeekSchedule(id: number, date: string | Date = null): Promise<ScheduleNormalized> {
    return this.getTeacherSchedule(id, StuAPI._getNextWeekStartDate(date));
  }

  public async getAudienceList(): Promise<AudienceItem[]> {
    return <AudienceItem[]>await this._req("raspAudlist");
  }

  public async getAudienceSchedule(id: number, start_date): Promise<ScheduleNormalized> {
    const r = <ScheduleRaw>await this._req("Rasp", { idAudLine: id, sdate: start_date });
    return StuAPI._normalizeScheduleObject(r);
  }

  public async getAudienceWeekSchedule(id: number, date: string | Date = null): Promise<ScheduleNormalized> {
    return this.getAudienceSchedule(id, StuAPI._getWeekStartDate(date));
  }

  public async getAudienceNextWeekSchedule(id: number, date: string | Date = null): Promise<ScheduleNormalized> {
    return this.getAudienceSchedule(id, StuAPI._getNextWeekStartDate(date));
  }

  public async getGroupScheduleDates(id: number): Promise<ScheduleDates> {
    return <ScheduleDates>await this._req("GetRaspDates", { idGroup: id });
  }

  public async getTeacherScheduleDates(id: number): Promise<ScheduleDates> {
    return <ScheduleDates>await this._req("GetRaspDates", { idTeacher: id });
  }

  public async getAudienceScheduleDates(id: number): Promise<ScheduleDates> {
    return <ScheduleDates>await this._req("GetRaspDates", { idAudLine: id });
  }
}
