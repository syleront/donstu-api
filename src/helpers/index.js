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

export default StuApiHelpers;
