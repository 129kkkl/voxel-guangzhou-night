export const METERS_PER_DEGREE_LAT = 111_194.9;
export const ORIGIN = { lat: 23.11289, lon: 113.31910 }; // Guangzhou Tower vicinity
export function geoToLocal(lat, lon) {
  const scale = Math.cos(ORIGIN.lat * Math.PI / 180);
  return { x: (lon - ORIGIN.lon) * METERS_PER_DEGREE_LAT * scale,
    z: -(lat - ORIGIN.lat) * METERS_PER_DEGREE_LAT };
}
export function localToGeo(x, z) {
  return { lat: ORIGIN.lat - z / METERS_PER_DEGREE_LAT,
    lon: ORIGIN.lon + x / (METERS_PER_DEGREE_LAT * Math.cos(ORIGIN.lat * Math.PI / 180)) };
}
export function mulberry32(seed) {
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export const snap4 = v => Math.max(4, Math.round(v / 4) * 4);
export function rgba(hex, alpha = 1) { return `rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${alpha})`; }
