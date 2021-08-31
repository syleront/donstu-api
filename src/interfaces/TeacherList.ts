import { DefaultResponse } from "./DefaultResponse";
import { TeacherItem } from "./TeacherItem";

export interface TeacherList extends DefaultResponse {
  data: TeacherItem[]
}
