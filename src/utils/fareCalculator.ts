import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

/**
 * Input type for the package charge configuration.
 * Mirrors the relevant fields from PackageDocument / the Package model.
 */
export interface PackageChargeConfig {
  duration: number; // in hours
  over_time_customer_charge: number;
  over_time_driver_charge: number;
  early_morning_charge?: number;
  late_night_charge?: number;
  fooding_charge?: number;
}

/**
 * Breakdown of all calculated charges returned by calculateBookingCharges.
 */
export interface BookingChargeBreakdown {
  /** A1: minutes past (schedule_time + duration) * over_time_customer_charge -> added to fare */
  overTimeCustomerCharge: number;
  /** A2: minutes past schedule_time at arrival * over_time_driver_charge -> deducted from driver_charge */
  overTimeDriverCharge: number;
  /** A3: early morning surcharge (schedule hour 4-7) */
  earlyMorningCharge: number;
  /** A4: late night surcharge (schedule hour >=23 or <4) */
  lateNightCharge: number;
  /** A5: fooding charge (package duration > 8h) */
  foodingCharge: number;
  /** Final customer fare = baseFare + overtimeCustomer + earlyMorning + lateNight + fooding */
  fare: number;
  /** Final driver charge = baseDriverCharge - overTimeDriverCharge */
  driverCharge: number;
}

/**
 * Parse a schedule_time string into a dayjs object combined with the schedule_date.
 *
 * schedule_time is stored in two possible formats:
 *   - "02:30 PM"   (12-hour with AM/PM)
 *   - "14:30:00"   (24-hour with seconds)
 *
 * @returns A dayjs object representing the full schedule datetime, or null if unparseable.
 */
function parseScheduleDateTime(
  scheduleDate: Date,
  scheduleTime: string,
): dayjs.Dayjs | null {
  const datePart = dayjs(scheduleDate).format("YYYY-MM-DD");

  // Try 12-hour format first: "02:30 PM"
  const twelveHour = dayjs(
    `${datePart} ${scheduleTime}`,
    "YYYY-MM-DD hh:mm A",
    true,
  );
  if (twelveHour.isValid()) {
    return twelveHour;
  }

  // Try 24-hour with seconds: "14:30:00"
  const twentyFourWithSec = dayjs(
    `${datePart} ${scheduleTime}`,
    "YYYY-MM-DD HH:mm:ss",
    true,
  );
  if (twentyFourWithSec.isValid()) {
    return twentyFourWithSec;
  }

  // Try 24-hour without seconds: "14:30"
  const twentyFourShort = dayjs(
    `${datePart} ${scheduleTime}`,
    "YYYY-MM-DD HH:mm",
    true,
  );
  if (twentyFourShort.isValid()) {
    return twentyFourShort;
  }

  return null;
}

/**
 * Calculate all booking charges for a trip completion.
 *
 * Rules:
 *   A1: over_time_customer_charge = minutes past (schedule_time + pkg.duration) * pkg.over_time_customer_charge
 *       -> added to fare
 *   A2: over_time_driver_charge = minutes past schedule_time at arrival * pkg.over_time_driver_charge
 *       -> deducted from driver_charge, NOT added to fare
 *   A3: If scheduleHour >= 4 && < 7 -> add pkg.early_morning_charge to fare
 *   A4: If scheduleHour >= 23 || < 4 -> add pkg.late_night_charge to fare
 *   A5: If pkg.duration > 8 -> add pkg.fooding_charge to fare
 *
 * Final fare         = baseFare + overTimeCustomer + earlyMorning + lateNight + fooding
 * Final driverCharge = baseDriverCharge - overTimeDriverCharge
 *
 * @param params.baseFare - The current booking fare (before surcharges)
 * @param params.baseDriverCharge - The current driver charge (before deductions)
 * @param params.packageConfig - The package charge rates
 * @param params.scheduleDate - The booking schedule_date (Date object)
 * @param params.scheduleTime - The booking schedule_time string (e.g. "02:30 PM" or "14:30:00")
 * @param params.arrivedAt - When the driver actually arrived (Date)
 * @param params.completedAt - When the trip was completed (Date)
 * @param params.existingOvertimeDriverCharge - The over_time_driver_charge already calculated
 *   at arrival time. When provided, this value is preserved instead of being recalculated,
 *   which fixes the lost-update bug where completion overwrites arrival-time deductions.
 *   Pass 0 to explicitly indicate no prior calculation existed.
 */
export function calculateBookingCharges(params: {
  baseFare: number;
  baseDriverCharge: number;
  packageConfig: PackageChargeConfig;
  scheduleDate: Date;
  scheduleTime: string;
  arrivedAt: Date;
  completedAt: Date;
  existingOvertimeDriverCharge?: number;
}): BookingChargeBreakdown {
  const {
    baseFare,
    baseDriverCharge,
    packageConfig: pkg,
    scheduleDate,
    scheduleTime,
    arrivedAt,
    completedAt,
    existingOvertimeDriverCharge,
  } = params;

  const scheduleDateTime = parseScheduleDateTime(scheduleDate, scheduleTime);

  // If we cannot parse the schedule, return unmodified charges as a safe fallback
  if (!scheduleDateTime) {
    return {
      overTimeCustomerCharge: 0,
      overTimeDriverCharge: 0,
      earlyMorningCharge: 0,
      lateNightCharge: 0,
      foodingCharge: 0,
      fare: baseFare,
      driverCharge: baseDriverCharge,
    };
  }

  const scheduleHour = scheduleDateTime.hour();

  // A1: Overtime customer charge
  // Minutes past (schedule_time + package duration) at completion time
  const baseEndTime = scheduleDateTime.add(pkg.duration || 0, "hour");
  let overTimeCustomerCharge = 0;
  if (dayjs(completedAt).isAfter(baseEndTime)) {
    const otMinutes = dayjs(completedAt).diff(baseEndTime, "minute");
    overTimeCustomerCharge = otMinutes * (pkg.over_time_customer_charge || 0);
  }

  // A2: Overtime driver charge
  // Minutes past schedule_time at arrival. Deducted from driver_charge only.
  // If existingOvertimeDriverCharge was provided (from arrival-time calculation),
  // preserve it to avoid the lost-update bug.
  let overTimeDriverCharge: number;
  if (existingOvertimeDriverCharge !== undefined) {
    overTimeDriverCharge = existingOvertimeDriverCharge;
  } else {
    overTimeDriverCharge = 0;
    if (dayjs(arrivedAt).isAfter(scheduleDateTime)) {
      const otMinutes = dayjs(arrivedAt).diff(scheduleDateTime, "minute");
      overTimeDriverCharge = otMinutes * (pkg.over_time_driver_charge || 0);
    }
  }

  // A3: Early morning charge (4:00 AM to 6:59 AM)
  let earlyMorningCharge = 0;
  if (scheduleHour >= 4 && scheduleHour < 7) {
    earlyMorningCharge = pkg.early_morning_charge || 0;
  }

  // A4: Late night charge (23:00 to 03:59)
  let lateNightCharge = 0;
  if (scheduleHour >= 23 || scheduleHour < 4) {
    lateNightCharge = pkg.late_night_charge || 0;
  }

  // A5: Fooding charge (duration > 8 hours)
  let foodingCharge = 0;
  if (pkg.duration > 8) {
    foodingCharge = pkg.fooding_charge || 0;
  }

  // Final fare = baseFare + customer-side surcharges
  const fare =
    baseFare + overTimeCustomerCharge + earlyMorningCharge + lateNightCharge + foodingCharge;

  // Driver charge = base driver charge - overtime driver deduction
  const driverCharge = baseDriverCharge - overTimeDriverCharge;

  return {
    overTimeCustomerCharge,
    overTimeDriverCharge,
    earlyMorningCharge,
    lateNightCharge,
    foodingCharge,
    fare,
    driverCharge,
  };
}
