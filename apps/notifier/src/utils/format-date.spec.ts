import { formatDateTime } from "./format-date";

describe("formatDateTime", () => {
    it("formats a valid ISO date in the given timezone", () => {
        const result = formatDateTime("2023-06-15T12:00:00Z", "Europe/Kyiv");
        expect(result).toBe("15.06.2023, 15:00:00");
    });
    it("falls back to Europe/Kyiv for an invalid timezone", () => {
        const validResult = formatDateTime("2023-06-15T12:00:00Z", "Europe/Kyiv");
        const invalidResult = formatDateTime("2023-06-15T12:00:00Z", "Invalid/Timezone");
        expect(invalidResult).toBe(validResult);
    });
});

