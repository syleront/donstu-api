function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var needle = _interopDefault(require('needle'));
var qs = _interopDefault(require('querystring'));

var dayNames = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

class StuApiHelpers {
  constructor(StuApi) {
    this.StuApi = StuApi;
  }

  _searcher(input, list) {
    const matchedValue = input.toLowerCase().match(/[A-zА-я0-9]+/ig);

    let resultList = [];

    if (matchedValue) {
      const searchValue = matchedValue.join("");
      const searchValueRegexp = new RegExp(searchValue, "i");

      list.forEach((el) => {
        const curElName = el.name.trim() !== "" && el.name.toLowerCase().match(/[A-zА-я0-9]+/ig).join("");
        if (curElName && searchValueRegexp.test(curElName)) {
          resultList.push(el);
        }
      });
    }

    return resultList;
  }

  async searchGroup(input) {
    const { StuApi } = this;
    const list = await StuApi.getGroupsList();
    return this._searcher(input, list);
  }

  async searchTeacher(input) {
    const { StuApi } = this;
    const list = await StuApi.getTeacherList();
    return this._searcher(input, list);
  }

  async searchAudience(input) {
    const { StuApi } = this;
    const list = await StuApi.getAudienceList();
    return this._searcher(input, list);
  }

  formatDay(subjectList, index) {
    const dayName = dayNames[index];

    let subjectString;
    if (subjectList.length > 0) {
      subjectString = subjectList.map((subj) => `• ${subj.start}-${subj.end} -> ${subj.lessonName}, ${subj.teacher}, ${subj.audience}`).join("\n");
    } else {
      subjectString = "• Пар нет";
    }

    return `== ${dayName} ==\n${subjectString}`;
  }

  formatWeek(weekScheduleArray, weekIndex, opts = {}) {
    const { isCurrent, headerAddon } = opts;

    let scheduleHeader = weekIndex === 0 ? "🔼 Верхняя неделя" : "🔽 Нижняя неделя";

    if (isCurrent === true) {
      scheduleHeader += " (текущая)";
    }

    if (headerAddon) {
      scheduleHeader += " " + headerAddon;
    }

    const scheduleBody = weekScheduleArray.map(this.formatDay).join("\n\n");

    return `${scheduleHeader}\n\n${scheduleBody}`;
  }
}

var connectionDefaults = {
  follow: 5,
  response_timeout: 25000
};

class StuError {
  constructor(type) {
    this.code = "STU_API_ERROR";
    this.type = type;
    return this;
  }
}

class ConnectionError extends StuError {
  constructor(statusCode) {
    super("CONNECTION_ERROR");
    this.statusCode = statusCode;
    return this;
  }
}

const API_DOMAIN = "edu.donstu.ru/api";

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

var index = new StuApi();

module.exports = index;
