/** When true, UI reads mock modules instead of live API (default on unless explicitly false). */
export const USE_MOCK_DATA =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";
