const IST_OFFSET_MINUTES = 330;

const toUTC = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (!date || Number.isNaN(date.getTime())) return null;
  const utcOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + utcOffsetMs);
};

const toIST = (date = new Date()) => {
  const utcDate = toUTC(date);
  if (!utcDate) return null;
  return new Date(utcDate.getTime() + IST_OFFSET_MINUTES * 60000);
};

const getUTCDateFromIST = ({ year, month, day, hour, minute }) => {
  const utcHour = hour - 5;
  const utcMinute = minute - 30;
  return new Date(Date.UTC(year, month - 1, day, utcHour, utcMinute, 0, 0));
};

const parseISTDateTimeLocal = (value) => {
  if (!value || typeof value !== 'string') return null;
  const [datePart, timePart] = value.split('T');
  if (!datePart || !timePart) return null;
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  if ([year, month, day, hour, minute].some((n) => Number.isNaN(n))) return null;
  return getUTCDateFromIST({ year, month, day, hour, minute });
};

const getNext630PMIST = (reference = new Date()) => {
  const currentIst = toIST(reference);
  const cutoffIst = new Date(currentIst);
  cutoffIst.setHours(18, 30, 0, 0);
  if (cutoffIst.getTime() <= currentIst.getTime()) {
    cutoffIst.setDate(cutoffIst.getDate() + 1);
  }
  return getUTCDateFromIST({
    year: cutoffIst.getFullYear(),
    month: cutoffIst.getMonth() + 1,
    day: cutoffIst.getDate(),
    hour: cutoffIst.getHours(),
    minute: cutoffIst.getMinutes(),
  });
};

const isAfterIST = (targetDate) => {
  if (!targetDate) return false;
  const currentIst = toIST(new Date());
  const targetIst = toIST(new Date(targetDate));
  if (!currentIst || !targetIst) return false;
  return currentIst.getTime() > targetIst.getTime();
};

const formatISTDateTime = (date) => {
  if (!date) return null;
  const ist = toIST(new Date(date));
  if (!ist) return null;
  const pad = (unit) => String(unit).padStart(2, '0');
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${pad(formattedHour)}:${pad(minutes)} ${ampm} IST`;
};

module.exports = {
  toIST,
  isAfterIST,
  parseISTDateTimeLocal,
  getNext630PMIST,
  formatISTDateTime,
};
