import moment from "moment";

export type CurrentMonthMetaData = {
    month: number,
    year: number,
    numberOfDays: number
}

export function getCurrentMonthMetadata() : CurrentMonthMetaData {
    const now = moment();
    const month = now.month() + 1;
    const year = now.year();
    const numberOfDays = new Date(year, month, 0).getDate();
    return { month, year, numberOfDays};
}