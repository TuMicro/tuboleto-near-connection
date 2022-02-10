export function plus_days(date_input: Date, increment: number) {
  let date = date_input;
  let date_increace = date.setDate(new Date(date).getDate() + increment);
  date.setDate(new Date(date).getDate() - increment);
  const result = new Date(date_increace);
  return result;
}

export const DEFAULT_MIN_LESSON_DURATION = 45; // in minutes, also the unit for horas académicas

export function format_minutes_to_lesson_hours(minutes: number, 
  elite_booking_min_duration: number = DEFAULT_MIN_LESSON_DURATION) {
  const hours = Math.floor(minutes / elite_booking_min_duration);
  const rem = minutes % elite_booking_min_duration;
  const minuteText = rem === 1 ? "minuto" : "minutos";
  return hours + " " + (hours !== 1 ? "horas académicas" : "hora académica") +
   (rem > 0 ? " y "  + rem + " " + minuteText : "");
}

export function format_minutes_to_hours(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  const minuteText = rem === 1 ? "minuto" : "minutos";
  return hours + " " + (hours !== 1 ? "horas" : "hora") +
   (rem > 0 ? " y "  + rem + " " + minuteText : "");
}

export function convert_date_standard_to_Peruvian(date: string) {
  const dateParts = date.split("-");
  return [dateParts[2], dateParts[1], dateParts[0]].join('/');
}

export function convert_minutes_to_time(minutes: number) {
  var hour = Math.floor(Number(minutes) / 60);
  var minute = Number(minutes) % 60;
  return leftPad(hour, 2) + ":" + leftPad(minute, 2);
}

export function leftPad(number : number, targetLength: number) {
  var output = number + '';
  while (output.length < targetLength) {
      output = '0' + output;
  }
  return output;
}

export function hex0xStringToBase64(hex0xStr: string | null | undefined) {
  return Buffer.from((hex0xStr ?? "").substr(2), 'hex').toString('base64');
}