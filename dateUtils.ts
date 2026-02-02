export const getMonthStartDate = (year: number, month: number): string => {
  return new Date(year, month, 1).toISOString();
};

export const getMonthEndDate = (year: number, month: number): string => {
  return new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();
};

export const getYearStartDate = (year: number): string => {
  return new Date(year, 0, 1).toISOString();
};

export const getYearEndDate = (year: number): string => {
  return new Date(year, 11, 31, 23, 59, 59, 999).toISOString();
};

export const getEndOfDay = (dateString: string): string => {
  return new Date(dateString + 'T23:59:59.999').toISOString();
};
