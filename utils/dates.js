import {DateTime} from "luxon";
import {timezones} from "./constants.js";

export const startOfDay = (date) => {
    return DateTime.fromJSDate(new Date(date)).setZone(timezones.UTC).startOf('day').toJSDate();
}

export const endOfDay = (date) => {
    return DateTime.fromJSDate(new Date(date)).setZone(timezones.UTC).endOf('day', {}).toJSDate();
}