/** Reads and parses a JSON value from localStorage, or returns the fallback. */
export const loadJSON = <T>(key: string, fallback: T): T => {
    const raw = localStorage.getItem(key);
    if (raw === null) {
        return fallback;
    }

    try {
        return (JSON.parse(raw) as T) ?? fallback;
    } catch {
        return fallback;
    }
};
