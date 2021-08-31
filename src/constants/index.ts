import { OptionsOfJSONResponseBody } from "got";

export namespace ApiSettings {
  export const DOMAIN = "edu.donstu.ru";
  export const PATH = "/api";
  export const MAX_RESPONSE_SIZE: number = 2 * 1024 * 1024;

  export const REQUEST_DEFAULTS = {
    isNewVer: true
  };
}

export const DAY_NAMES: string[] = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

export const CONNECTION_DEFAULTS: OptionsOfJSONResponseBody = {
  timeout: 60000,
  responseType: "json"
};
