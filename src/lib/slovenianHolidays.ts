// Slovenian public holidays

// Calculate Easter Sunday using Anonymous Gregorian algorithm
function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export interface Holiday {
  date: string;
  name: string;
}

export function getSlovenianHolidays(year: number): Holiday[] {
  const easter = getEasterSunday(year);
  const easterMonday = addDays(easter, 1);
  const whitSunday = addDays(easter, 49); // Binkošti

  const holidays: Holiday[] = [
    { date: `${year}-01-01`, name: "Novo leto" },
    { date: `${year}-01-02`, name: "Novo leto" },
    { date: `${year}-02-08`, name: "Prešernov dan" },
    { date: formatDate(easterMonday), name: "Velikonočni ponedeljek" },
    { date: `${year}-04-27`, name: "Dan upora proti okupatorju" },
    { date: `${year}-05-01`, name: "Praznik dela" },
    { date: `${year}-05-02`, name: "Praznik dela" },
    { date: formatDate(whitSunday), name: "Binkošti" },
    { date: `${year}-06-25`, name: "Dan državnosti" },
    { date: `${year}-08-15`, name: "Marijino vnebovzetje" },
    { date: `${year}-10-31`, name: "Dan reformacije" },
    { date: `${year}-11-01`, name: "Dan spomina na mrtve" },
    { date: `${year}-12-25`, name: "Božič" },
    { date: `${year}-12-26`, name: "Dan samostojnosti in enotnosti" },
  ];

  return holidays;
}

export function isHoliday(dateStr: string, holidays: Holiday[]): Holiday | undefined {
  return holidays.find((h) => h.date === dateStr);
}