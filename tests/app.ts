import { StuAPI } from "../dist/package";

const stu = new StuAPI();

(async function main() {
  const r = await stu.getGroupWeekSchedule(34906);
  const calculated = stu.helpers.groupByDayOfWeek(r.schedule);
  const formatted = stu.helpers.formatWeek(r.schedule);
  console.log(formatted);

  /*const [teacher] = await stu.getTeacherList();
  const { schedule } = await stu.getTeacherWeekSchedule(teacher.id);
  const grouped = stu.helpers.groupByDayOfWeek(schedule);*/
})();
