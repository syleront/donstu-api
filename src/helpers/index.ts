import moment from "moment";

import { StuAPI } from "../index";
import { DAY_NAMES } from "../constants";

import {
  AudienceItem,
  GroupItem,
  ScheduleItemNormalized,
  ScheduleNormalizedGrouped, TeacherItem
} from "../interfaces";

export class StuAPIHelpers {
  protected _stuApi: StuAPI;

  constructor(StuApi: StuAPI) {
    this._stuApi = StuApi;
  }

  private _searcher(input: string, list: { name: string }[]): { name: string }[] {
    const matchedValue = input.toLowerCase().match(/[A-zА-я0-9]+/ig);

    let resultList: { name: string }[] = [];

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

  public async searchGroup(input: string, list: GroupItem[] = null): Promise<GroupItem[]> {
    if (list === null) {
      list = await this._stuApi.getGroupsList();
    }

    return <GroupItem[]>this._searcher(input, list);
  }

  public async searchTeacher(input: string, list: TeacherItem[] = null): Promise<TeacherItem[]> {
    if (list === null) {
      list = await this._stuApi.getTeacherList();
    }

    return <TeacherItem[]>this._searcher(input, list);
  }

  public async searchAudience(input: string, list: AudienceItem[] = null): Promise<AudienceItem[]> {
    if (list === null) {
      list = await this._stuApi.getAudienceList();
    }

    return <AudienceItem[]>this._searcher(input, list);
  }

  public groupByDayOfWeek(scheduleArray: ScheduleItemNormalized[]): ScheduleNormalizedGrouped[] {
    const first = scheduleArray.find((e) => e.date);
    const first_date: string = first && first.date || (new Date()).toJSON();

    const schedule: ScheduleNormalizedGrouped[] = [];
    let last_day: number = -1;

    for (let i = 0; i < 6; i++) {
      schedule[i] = {
        items: [],
        dayName: DAY_NAMES[i],
        date: moment(first_date)
          .locale("ru")
          .startOf("isoWeek")
          .add(i, "day")
          .format("YYYY-MM-DDTHH:MM:SS")
      };
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

  public formatDay(dayObject: ScheduleNormalizedGrouped, index: number): string {
    let subjectString;

    if (dayObject.items.length > 0) {
      subjectString = dayObject.items.map((subj) => {
        return `• ${subj.start}-${subj.end} -> ${subj.lessonName}, ${subj.teacher}, ${subj.audience}`;
      }).join("\n");
    } else {
      subjectString = "• Пар нет";
    }

    return `== ${moment(dayObject.date).format("DD-MM-YYYY")} | ${DAY_NAMES[index]} ==\n${subjectString}`;
  }

  public formatWeek(scheduleArray: ScheduleItemNormalized[]): string {
    const formatted = this.groupByDayOfWeek(scheduleArray);
    return formatted.map(this.formatDay.bind(this)).join("\n\n");
  }
}
