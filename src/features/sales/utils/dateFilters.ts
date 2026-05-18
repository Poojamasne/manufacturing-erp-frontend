export type TimeTab = "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "All Time" | "Custom";

export type DateRange = {
  from: string;
  to: string;
};

// Helper function to parse DD-MM-YYYY format
const parseDate = (dateStr: string): Date | null => {
  // Check if date is in DD-MM-YYYY format
  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      // DD-MM-YYYY format
      const [day, month, year] = parts;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }
  
  // Try standard parsing as fallback
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) ? date : null;
};

const startOfDay = (value: Date) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (value: Date) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

export const formatDateForInput = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Optional: Format date from DD-MM-YYYY to YYYY-MM-DD for input
export const formatDateForInputFromDMY = (dateStr: string) => {
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

export const getTimeTabLabel = (tab: TimeTab, now = new Date()) => {
  if (tab === "All Time") {
    return "All records";
  }

  if (tab === "Weekly") {
    const end = formatDateForInput(now).split("-").reverse().join("-");
    return `Last 7 days till ${end}`;
  }

  if (tab === "Monthly") {
    return now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  }

  if (tab === "Quarterly") {
    return `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
  }

  return String(now.getFullYear());
};

export const isDateInRange = (dateStr: string, range: TimeTab, now = new Date()) => {
  // Handle "All Time" case first
  if (range === "All Time") {
    return true;
  }
  
  // Parse the date string
  const date = parseDate(dateStr);
  if (!date) {
    console.warn(`Invalid date string: ${dateStr}`);
    return false;
  }

  const today = endOfDay(now);
  const recordDate = startOfDay(date);

  switch (range) {
    case "Weekly": {
      const weekStart = startOfDay(new Date(now));
      weekStart.setDate(weekStart.getDate() - 6);
      return recordDate >= weekStart && recordDate <= today;
    }
    case "Monthly":
      return recordDate.getMonth() === today.getMonth() && recordDate.getFullYear() === today.getFullYear();
    case "Quarterly":
      return (
        Math.floor(recordDate.getMonth() / 3) === Math.floor(today.getMonth() / 3) &&
        recordDate.getFullYear() === today.getFullYear()
      );
    case "Yearly":
      return recordDate.getFullYear() === today.getFullYear();
    default:
      return true;
  }
};

export const isDateWithinCustomRange = (dateStr: string, customRange: DateRange) => {
  const date = parseDate(dateStr);
  if (!date) {
    console.warn(`Invalid date string: ${dateStr}`);
    return false;
  }

  const recordDate = startOfDay(date);
  const fromDate = customRange.from ? startOfDay(new Date(customRange.from)) : null;
  const toDate = customRange.to ? endOfDay(new Date(customRange.to)) : null;

  if (fromDate && recordDate < fromDate) {
    return false;
  }

  if (toDate && recordDate > toDate) {
    return false;
  }

  return true;
};