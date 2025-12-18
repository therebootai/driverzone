type TimeInput = number | string;
type TimeUnit = "H" | "D";
type ConversionDirection = "toHours" | "toDays" | "auto";

interface TimeResult {
  value: number;
  unit: "hours" | "days";
  original: TimeInput;
}

/**
 * Convert between hours and days
 * @param input - Can be: number (treated as hours), string like "2H" or "3D", or string with number only (treated as hours)
 * @param direction - Optional: 'toHours', 'toDays', or 'auto' (default: 'auto')
 * @returns TimeResult object with converted value and unit
 */
function convertTime(
  input: TimeInput,
  direction: ConversionDirection = "auto"
): TimeResult {
  // Handle number input
  if (typeof input === "number") {
    return handleNumberInput(input, direction);
  }

  // Handle string input
  return handleStringInput(input, direction);
}

function handleNumberInput(
  input: number,
  direction: ConversionDirection
): TimeResult {
  switch (direction) {
    case "toHours":
      // Number is already in hours, return as is
      return {
        value: input,
        unit: "hours",
        original: input,
      };

    case "toDays":
      // Convert number (hours) to days
      return {
        value: input / 24,
        unit: "days",
        original: input,
      };

    case "auto":
    default:
      // For auto direction with number, we assume input is in hours
      // You could add logic here to decide whether to convert to days
      // based on the magnitude of the number if needed
      return {
        value: input,
        unit: "hours",
        original: input,
      };
  }
}

/**
 * Handle string input
 */
function handleStringInput(
  input: string,
  direction: ConversionDirection
): TimeResult {
  // Remove whitespace and convert to uppercase
  const cleanInput = input.trim().toUpperCase();

  // Try to extract number and unit from string
  const match = cleanInput.match(/^([\d.]+)\s*([HD])?$/);

  if (!match) {
    throw new Error(
      `Invalid input format: ${input}. Expected format like "2H", "3D", or "24"`
    );
  }

  const value = parseFloat(match[1]);
  const unit =
    (match[2] as TimeUnit | undefined) || (direction === "toDays" ? "H" : "H");

  // If string has explicit unit (H or D)
  if (match[2]) {
    return convertWithExplicitUnit(value, unit as TimeUnit, direction);
  }

  // String without unit - treat as hours
  return handleNumberInput(value, direction);
}

/**
 * Convert when input has explicit unit (H or D)
 */
function convertWithExplicitUnit(
  value: number,
  unit: TimeUnit,
  direction: ConversionDirection
): TimeResult {
  // If direction is specified, convert accordingly
  if (direction === "toHours") {
    const hours = unit === "H" ? value : value * 24;
    return {
      value: hours,
      unit: "hours",
      original: `${value}${unit}`,
    };
  }

  if (direction === "toDays") {
    const days = unit === "D" ? value : value / 24;
    return {
      value: days,
      unit: "days",
      original: `${value}${unit}`,
    };
  }

  // Auto direction - convert to opposite unit
  if (unit === "H") {
    // Convert hours to days
    return {
      value: value / 24,
      unit: "days",
      original: `${value}H`,
    };
  } else {
    // Convert days to hours
    return {
      value: value * 24,
      unit: "hours",
      original: `${value}D`,
    };
  }
}

// Alternative simpler version if you prefer a single function with simpler logic:
function convertTimeSimple(input: TimeInput): number {
  if (typeof input === "number") {
    return input; // Number input is treated as hours
  }

  const cleanInput = input.trim().toUpperCase();
  const match = cleanInput.match(/^([\d.]+)\s*([HD])?$/);

  if (!match) {
    throw new Error(
      `Invalid input format: ${input}. Expected format like "2H", "3D", or "24"`
    );
  }

  const value = parseFloat(match[1]);
  const unit = match[2] as TimeUnit | undefined;

  if (!unit) {
    return value; // No unit means it's hours
  }

  return unit === "H" ? value : value * 24;
}

export { convertTime, convertTimeSimple };
