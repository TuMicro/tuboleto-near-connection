/**
 * 
 * @param n number of elements
 * @returns An array filled from 0 to n - 1 
 */
export function genRange(n: number) {
  return Array.from(Array(n).keys())
}

// NOTA: no terminé esto porque existe toFixed que hace lo que quiero
// export function toStrR(n: number, decimals: number) {
//   const pow10 = Math.pow(10, decimals);
//   const toPrint = Math.round(n * pow10);
//   const decPart = toPrint % pow10;
//   const intPart = Math.floor(toPrint / pow10);
//   // return decPart.toFixed
// }

// NOTE: not tested:
export function unique(ar: string[]) {
  const s = new Set(ar);
  return Array.from(s);
}