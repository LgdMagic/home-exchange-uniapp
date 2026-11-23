/**
 * 与服务端 id-card.util.ts 相同的 18 位身份证格式校验，用于提交前的即时提示。
 * 真正是否接受仍由 POST /customer/real-name-verification 决定。
 */

const WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const CHECK_CODE_MAP = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
const ID_CARD_PATTERN = /^\d{17}[\dXx]$/;

export function isValidIdCardNumber(idCardNumber: string): boolean {
  if (!ID_CARD_PATTERN.test(idCardNumber)) return false;

  const digits = idCardNumber
    .slice(0, 17)
    .split("")
    .map((char) => Number(char));
  const sum = digits.reduce((acc, digit, index) => acc + digit * WEIGHTS[index], 0);
  const expected = CHECK_CODE_MAP[sum % 11];
  if (idCardNumber[17].toUpperCase() !== expected) return false;

  const year = Number(idCardNumber.slice(6, 10));
  const month = Number(idCardNumber.slice(10, 12));
  const day = Number(idCardNumber.slice(12, 14));
  const date = new Date(Date.UTC(year, month - 1, day));
  const rolled =
    date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day;
  if (rolled || Number.isNaN(date.getTime())) return false;
  return date.getTime() <= Date.now();
}
