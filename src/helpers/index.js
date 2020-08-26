import moment from "moment";

import dayNames from "./dayNames";

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

  calculateWeek(scheduleArray) {
    let first = scheduleArray.find((e) => e.date);
    let first_date = first && first.date || new Date();

    let last_day = -1;
    let schedule = [{}, {}, {}, {}, {}, {}];

    for (let i = 0; i < schedule.length; i++) {
      schedule[i].items = [];
      schedule[i].date = moment(first_date).locale("ru").startOf("isoWeek").add(i, "day").format("YYYY-MM-DDTHH:MM:SS");
    }

    for (const subject of scheduleArray) {
      if (last_day !== subject.dayNumber) {
        if (last_day > subject.dayNumber) {
          break;
        } else {
          last_day = subject.dayNumber;
        }
      }

      schedule[subject.dayNumber - 1].items.push(subject);
    }

    return schedule;
  }

  formatDay(dayObject, index) {
    let subjectString;

    if (dayObject.items.length > 0) {
      subjectString = dayObject.items.map((subj) => {
        return `• ${subj.start}-${subj.end} -> ${subj.lessonName}, ${subj.teacher}, ${subj.audience}`;
      }).join("\n");
    } else {
      subjectString = "• Пар нет";
    }

    return `== ${moment(dayObject.date).format("DD-MM-YYYY")} | ${dayNames[index]} ==\n${subjectString}`;
  }

  formatWeek(scheduleArray) {
    const formatted = this.calculateWeek(scheduleArray);
    return formatted.map(this.formatDay.bind(this)).join("\n\n");
  }
}

export default StuApiHelpers;
