import { DefaultResponse } from "./DefaultResponse";
import { GroupItem } from "./GroupItem";

export interface GroupList extends DefaultResponse {
  data: GroupItem[];
}
