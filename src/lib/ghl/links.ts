// Pure link helpers (no imports) so server modules that only need a URL — and the unit-test runners —
// don't have to pull in the GHL client.
export const GHL_APP = "https://app.gohighlevel.com/v2/location";
/** The contact's page in the GHL app. Location comes from GHL_LOCATION_ID; blank when unset (local tests). */
export const ghlContactUrl = (contactId: string, locationId = process.env.GHL_LOCATION_ID || "") => `${GHL_APP}/${locationId}/contacts/detail/${contactId}`;
