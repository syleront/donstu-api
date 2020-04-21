import qs from "querystring";
import got from "got";

import StuApiHelpers from "./helpers";
import objects from "./objects";

import { ConnectionError } from "./errors";
import { API_DOMAIN, MAX_RESPONSE_SIZE } from "./constants";
import { API_DEFAULTS, CONNECTION_DEFAULTS } from "./defaults";

class StuApi {
  constructor() {
    this.helpers = new StuApiHelpers(this);
  }

  _normalizeScheduleObject(data, needFormat, { autoSelectSemester = false } = {}) {
    let schedule = [];

    data.rasp.forEach((subject) => {
      const subObj = {};

      subObj.audience = subject["аудитория"];
      subObj.groupName = subject["группа"];
      subObj.date = subject["дата"];
      subObj.dayName = subject["день_недели"];
      subObj.dayNumber = subject["деньНедели"];
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

    /* schedule = schedule.reverse().filter((value, index, self) => {
      return self.findIndex((e) => {
        const a = { ...value, code: 0, weekStart: 0, weekEnd: 0 };
        const b = { ...e, code: 0, weekStart: 0, weekEnd: 0 };
        return shallowEqualObjects(a, b);
      }) === index;
    }).reverse(); */

    if (needFormat === true) {
      const { year, curNumNed, group } = data.info;

      const semesters = {
        first: objects.couplesArray,
        second: objects.couplesArray
      };

      schedule.filter((subject) => subject.date === null).forEach((subject) => {
        const dayIndex = subject.dayNumber - 1;
        let objKey = null;

        if (subject.semesterCode === 1) {
          objKey = "first";
        } else if (subject.semesterCode === 2) {
          objKey = "second";
        }

        if (objKey !== null) {
          if (subject.weekType === 0) {
            semesters[objKey][0][dayIndex].push(subject);
            semesters[objKey][1][dayIndex].push(subject);
          } else if (subject.weekType === 1) {
            semesters[objKey][0][dayIndex].push(subject);
          } else if (subject.weekType === 2) {
            semesters[objKey][1][dayIndex].push(subject);
          }
        }
      });

      const date = new Date();
      const currentMonth = date.getMonth() + 1;
      const currentSemester = (currentMonth >= 9 || currentMonth === 1) ? "first" : "second";

      if (autoSelectSemester === true) {
        return { couples: semesters[currentSemester], currentSemester, year, group, currentWeekIndex: curNumNed - 1 };
      } else {
        return { semesters, currentSemester, year, group, currentWeekIndex: curNumNed - 1 };
      }

    } else {
      return {
        schedule,
        currentWeekIndex: data.info.curNumNed
      };
    }
  }

  async _req(method, params = null) {
    try {
      const data = params ? qs.stringify(params) : null;
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

  async getGroupSchedule(id, ...args) {
    const r = await this._req("Rasp", { idGroup: id, ...API_DEFAULTS });
    return this._normalizeScheduleObject(r.data, ...args);
  }

  async getTeacherList() {
    const r = await this._req("Raspprepodlist");
    return r.data;
  }

  async getTeacherSchedule(id, ...args) {
    const r = await this._req("Rasp", { idPrepodLine: id, ...API_DEFAULTS });
    return this._normalizeScheduleObject(r.data, ...args);
  }

  async getAudienceList() {
    const r = await this._req("Raspaudlist");
    return r.data;
  }

  async getAudienceSchedule(id, ...args) {
    const r = await this._req("Rasp", { idAudLine: id, ...API_DEFAULTS });
    return this._normalizeScheduleObject(r.data, ...args);
  }
}

export default new StuApi();
