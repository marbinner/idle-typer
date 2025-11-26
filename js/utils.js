/**
 * Utility functions used across the app
 */

/**
 * Format a number with units (K, M, B, T, etc.)
 * Numbers reset at each power of 1000, keeping display clean
 * Examples: 999 -> "999", 1000 -> "1.00K", 1234567 -> "1.23M"
 *
 * @param {number} num - The number to format
 * @param {number} decimals - Decimal places to show (default 2)
 * @returns {string} Formatted number string
 */
export function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return '0';

    const sign = num < 0 ? '-' : '';
    num = Math.abs(num);

    // Units for each power of 1000
    const units = [
        { value: 1e15, suffix: 'Q' },   // Quadrillion
        { value: 1e12, suffix: 'T' },   // Trillion
        { value: 1e9, suffix: 'B' },    // Billion
        { value: 1e6, suffix: 'M' },    // Million
        { value: 1e3, suffix: 'K' },    // Thousand
    ];

    // Find the appropriate unit
    for (const unit of units) {
        if (num >= unit.value) {
            const formatted = (num / unit.value).toFixed(decimals);
            // Remove trailing zeros after decimal point
            const cleaned = formatted.replace(/\.?0+$/, '');
            return sign + cleaned + unit.suffix;
        }
    }

    // For numbers less than 1000, show as integer if whole, else with decimals
    if (Number.isInteger(num)) {
        return sign + num.toString();
    }

    // For decimal numbers < 1000
    if (num < 10) {
        return sign + num.toFixed(decimals).replace(/\.?0+$/, '');
    }

    return sign + Math.floor(num).toString();
}

/**
 * Format a number compactly (fewer decimals, for smaller displays)
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export function formatCompact(num) {
    return formatNumber(num, 1);
}

/**
 * Format coins per second with "/s" suffix
 * @param {number} cps - Coins per second
 * @returns {string} Formatted CPS string
 */
export function formatCPS(cps) {
    if (cps < 0.1) return '0/s';
    return formatNumber(cps, 1) + '/s';
}

/**
 * Format a large number with full precision (no abbreviation)
 * Adds commas for readability
 * @param {number} num - The number to format
 * @returns {string} Formatted number with commas
 */
export function formatFull(num) {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/**
 * Format time duration in human-readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatDuration(seconds) {
    if (seconds < 60) return Math.floor(seconds) + 's';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ' + Math.floor(seconds % 60) + 's';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hours + 'h ' + mins + 'm';
}
