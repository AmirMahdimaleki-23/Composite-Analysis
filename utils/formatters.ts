const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export const L = (
  val: string | number | undefined,
  language: "fa" | "en",
): string => {
  if (val === undefined || val === null) return "";
  if (typeof val !== "number") return val.toString();

  if (val === 0 && (1 / val) === -Infinity) {
    return language === "fa" ? "۰-" : "-0";
  }

  const isNegative = val < 0;
  const absVal = Math.abs(val);

  let s = absVal.toString();

  if (!s.includes('.')) {
    s = s + '.0';
  }

  if (language === "fa") {
    s = s.replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d)]);
  }

  if (isNegative) {
    if (language === "fa") {
      return "\u200E" + "-" + s;
    }
    return `-${s}`;
  }

  return s;
};

export const parseL = (val: string, language: "fa" | "en"): number => {
  if (!val) return 0;
  let s = val.toString().trim();

  s = s.replace(/[\u200B-\u200F\u202A-\u202E]/g, "");

  s = s.replace(/[\u2212\u2012\u2013\u2014\u061B]/g, "-");

  const negativeMatch = s.match(/^-/);
  const hasLeadingNegative = negativeMatch !== null;

  if (language === "fa") {
    s = s.replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS.indexOf(d).toString());
    s = s.replace(/[٠-٩]/g, (d) => ARABIC_DIGITS.indexOf(d).toString());
  }

  let sign = '';
  let numericPart = s;

  if (hasLeadingNegative) {
    sign = '-';
    numericPart = s.substring(1);
  } else {
    numericPart = s.replace(/-/g, '');
  }

  numericPart = numericPart.replace(/[^0-9.]/g, "");

  const parts = numericPart.split(".");
  if (parts.length > 2) {
    numericPart = parts[0] + "." + parts.slice(1).join("");
  }

  let finalStr = sign + numericPart;

  if (finalStr === "" || finalStr === "-" || finalStr === "." || finalStr === "-.") return 0;

  let num = parseFloat(finalStr);

  return isNaN(num) ? 0 : num;
};

export const convertStress = (value: number, fromUnit: string, toUnit: string): number => {
  const toPa: Record<string, number> = {
    Pa: 1,
    kPa: 1e3,
    MPa: 1e6,
    GPa: 1e9,
  };
  const valueInPa = value * (toPa[fromUnit] || 1);
  return valueInPa / (toPa[toUnit] || 1);
};

export const convertStrain = (value: number, fromUnit: string, toUnit: string): number => {
  const toBase: Record<string, number> = {
    strain: 1,
    microstrain: 1e-6,
    percent: 0.01,
  };
  const valueInBase = value * (toBase[fromUnit] || 1);
  return valueInBase / (toBase[toUnit] || 1);
};

export const convertLength = (value: number, fromUnit: string, toUnit: string): number => {
  const toM: Record<string, number> = {
    m: 1,
    mm: 0.001,
    cm: 0.01,
    in: 0.0254,
  };
  const valueInM = value * (toM[fromUnit] || 1);
  return valueInM / (toM[toUnit] || 1);
};

export const formatExponential = (
  num: number | undefined | null,
  digits: number = 2,
  language: "fa" | "en" = "en"
): string => {
  if (num === undefined || num === null || isNaN(num)) {
    return language === "fa" ? "۰" : "0";
  }

  let s = num.toExponential(digits);

  if (s == "0.00e+0" || s == "0.000e+0") {
    return language === "fa" ? "۰" : "0";
  }

  if (language === "fa") {
    s = s.replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d)]);
    if (s.startsWith('-')) {
      return "\u200E" + s;
    }
  }

  return s;
};

export const getStressUnits = () => ["Pa", "kPa", "MPa", "GPa"];
export const getStrainUnits = () => ["strain", "microstrain", "percent"];
export const getLengthUnits = () => ["m", "mm", "cm", "in"];