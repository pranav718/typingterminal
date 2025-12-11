export function normalizeText(text: string): string {
    let normalized = text;

    normalized = normalized
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/\u2026/g, '...');

    normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    normalized = normalized.replace(/\s+/g, ' ');

    normalized = normalized.trim();

    return normalized;
}
