import qs from "querystring";

import got from "got";
import moment from "moment";

import StuApiHelpers from "./helpers";

import { ConnectionError } from "./errors";
import { API_DOMAIN, MAX_RESPONSE_SIZE } from "./constants";
import { API_DEFAULTS, CONNECTION_DEFAULTS } from "./defaults";

class StuApi {
  constructor() {
    this.helpers = new StuApiHelpers(this);
  }

  _normalizeScheduleObject(data) {
    let schedule = [];

    data.rasp.forEach((subject) => {
      const subObj = {};

      subObj.audience = subject["аудитория"];
      subObj.groupName = subject["группа"];
      subObj.date = subject["дата"];
      subObj.dayName = subject["день_недели"];
      subObj.dayNumber = subject["деньНедели"];
      subObj.email = subject["почта"];
      subObj.lessonName = subject["дисциплина"];
      subObj.code = subject["код"];
      subObj.start = subject["начало"] && subject["начало"].split("-").join(":");
      subObj.end = subject["конец"] && subject["конец"].split("-").join(":");
      subObj.subGroupNumber = subject["номерПодгруппы"];
      subObj.teacher = subject["преподаватель"];
      subObj.weekType = subject["типНедели"];
      subObj.semesterCode = subject["код_Семестра"];
      subObj.weekStart = subject["неделяНачала"];
      subObj.weekEnd = subject["неделяОкончания"];

      schedule.push(subObj);
    });

    return { schedule, info: data.info };
  }

  _getWeekStartDate(date) {
    return (date ? moment(date, "DD-MM-YYYY") : moment())
      .locale("ru")
      .startOf("isoWeek")
      .format("DD-MM-YYYY");
  }

  _getNextWeekStartDate(date) {
    return (date ? moment(date, "DD-MM-YYYY") : moment())
      .locale("ru")
      .add(1, "week")
      .startOf("isoWeek")
      .format("DD-MM-YYYY");
  }

  async _req(method, params = null) {
    try {
      const data = params ? qs.stringify({ ...params, ...API_DEFAULTS }) : API_DEFAULTS;
      const url = `https://${API_DOMAIN}/${method}${data ? "?" + data : ""}`;

      const request = got(url, CONNECTION_DEFAULTS);

      request.on("downloadProgress", (progress) => {
        if (progress.transferred > MAX_RESPONSE_SIZE) {
          request.cancel();
        }
      });

      const r = await request;

      if (r.statusCode === 200) {
        return r.body;
      } else {
        throw new ConnectionError(r.statusCode);
      }
    } catch (e) {
      if (e.name === "CancelError") {
        throw new ConnectionError("MAX_SIZE_REACHED");
      } else if (e.response) {
        throw new ConnectionError(e.response.statusCode);
      } else {
        throw new ConnectionError(e.code);
      }
    }
  }


  async getGroupsList() {
    const r = await this._req("Raspgrouplist");
    return r.data;
  }

  async getGroupSchedule(id, start_date) {
    const r = await this._req("Rasp", { idGroup: id, sdate: start_date });
    return this._normalizeScheduleObject(r.data);
  }

  async getGroupWeekSchedule(id, date = null) {
    return this.getGroupSchedule(id, this._getWeekStartDate(date));
  }

  async getGroupNextWeekSchedule(id, date = null) {
    return this.getGroupSchedule(id, this._getNextWeekStartDate(date));
  }


  async getTeacherList() {
    const r = await this._req("Raspprepodlist");
    return r.data;
  }

  async getTeacherSchedule(id, start_date) {
    const r = await this._req("Rasp", { idPrepodLine: id, sdate: start_date });
    return this._normalizeScheduleObject(r.data);
  }

  async getTeacherWeekSchedule(id, date = null) {
    return this.getTeacherSchedule(id, this._getWeekStartDate(date));
  }

  async getTeacherNextWeekSchedule(id, date = null) {
    return this.getTeacherSchedule(id, this._getNextWeekStartDate(date));
  }


  async getAudienceList() {
    const r = await this._req("Raspaudlist");
    return r.data;
  }

  async getAudienceSchedule(id, start_date) {
    const r = await this._req("Rasp", { idAudLine: id, sdate: start_date });
    return this._normalizeScheduleObject(r.date);
  }

  async getAudienceWeekSchedule(id, date = null) {
    return this.getAudienceSchedule(id, this._getWeekStartDate(date));
  }

  async getAudienceNextWeekSchedule(id, date = null) {
    return this.getAudienceSchedule(id, this._getNextWeekStartDate(date));
  }


  async getGroupScheduleDates(id) {
    const r = await this._req("GetRaspDates", { idGroup: id });
    return r.date;
  }
}

export default new StuApi();
