import needle from "needle";
import qs from "querystring";

import StuApiHelpers from "./helpers";
import connectionDefaults from "./connection-defaults";

import { ConnectionError } from "./errors";
import { API_DOMAIN } from "./constants";

class StuApi {
  constructor() {
    this.helpers = new StuApiHelpers(this);
  }

  _normalizeScheduleObject(data, needFormat) {
    const rasp = [];
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

      rasp.push(subObj);
    });

    if (needFormat === true) {
      const { year, curNumNed, group } = data.info;
      const couples = [
        [[], [], [], [], [], []],
        [[], [], [], [], [], []]
      ];

      rasp.filter((subject) => subject.date === null).forEach((subject) => {
        const dayIndex = subject.dayNumber - 1;

        if (subject.weekType === 0) {
          couples[0][dayIndex].push(subject);
          couples[1][dayIndex].push(subject);
        } else if (subject.weekType === 1) {
          couples[0][dayIndex].push(subject);
        } else if (subject.weekType === 2) {
          couples[1][dayIndex].push(subject);
        }
      });

      return { couples, year, group, currentWeekIndex: curNumNed - 1 };
    } else {
      return {
        schedule: rasp,
        currentWeekIndex: data.info.curNumNed
      };
    }
  }

  async _req(method, params = null) {
    try {
      const data = params ? qs.stringify(params) : null;
      const r = await needle("get", `https://${API_DOMAIN}/${method}${data ? "?" + data : ""}`, connectionDefaults);

      if (r.statusCode === 200) {
        return r.body;
      } else {
        throw new ConnectionError(r.statusCode);
      }
    } catch (e) {
      throw new ConnectionError(e.code);
    }
  }

  async getGroupsList() {
    const r = await this._req("Raspgrouplist");
    return r.data;
  }

  async getGroupSchedule(id, needFormat) {
    const r = await this._req("Rasp", { idGroup: id });
    return this._normalizeScheduleObject(r.data, needFormat);
  }

  async getTeacherList() {
    const r = await this._req("Raspprepodlist");
    return r.data;
  }

  async getTeacherSchedule(id, needFormat) {
    const r = await this._req("Rasp", { idPrepodLine: id });
    return this._normalizeScheduleObject(r.data, needFormat);
  }

  async getAudienceList() {
    const r = await this._req("Raspaudlist");
    return r.data;
  }

  async getAudienceSchedule(id, needFormat) {
    const r = await this._req("Rasp", { idAudLine: id });
    return this._normalizeScheduleObject(r.data, needFormat);
  }
}

export default new StuApi();
