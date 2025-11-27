/**
 * Utility functions used across the app
 */

// Standard metric suffixes for large numbers
const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
                  'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc',
                  'Vg', 'UVg', 'DVg', 'TVg', 'QaVg', 'QiVg', 'SxVg', 'SpVg', 'OcVg', 'NoVg',
                  'Tg', 'UTg', 'DTg'];

/**
 * Format a number with units (K, M, B, T, etc.)
 * Supports numbers up to 10^100, then uses scientific notation
 *
 * @param {number} num - The number to format
 * @param {number} decimals - Decimal places to show (default 2)
 * @returns {string} Formatted number string
 */
export function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(num)) return '0';

    const sign = num < 0 ? '-' : '';
    num = Math.abs(num);

    // For very large numbers (>= 10^100), use scientific notation
    if (num >= 1e100) {
        const exp = Math.floor(Math.log10(num));
        const mantissa = num / Math.pow(10, exp);
        return sign + mantissa.toFixed(2) + 'e' + exp;
    }

    // Find the appropriate suffix tier (each tier is 10^3)
    let tier = 0;
    let scaled = num;

    while (scaled >= 1000 && tier < SUFFIXES.length - 1) {
        scaled /= 1000;
        tier++;
    }

    // Format the number
    if (tier === 0) {
        // Under 1000 - show as integer or with decimals if needed
        if (Number.isInteger(num)) {
            return sign + num.toString();
        }
        if (num < 10) {
            return sign + num.toFixed(decimals).replace(/\.?0+$/, '');
        }
        return sign + Math.floor(num).toString();
    }

    // Format with suffix
    const formatted = scaled.toFixed(decimals).replace(/\.?0+$/, '');
    return sign + formatted + SUFFIXES[tier];
}

/**
 * Format coins with dynamic unit (μ₿ → ₿ → K₿ → M₿ etc.)
 * 1 ₿ = 1,000,000 μ₿
 *
 * @param {number} microBitcoin - Amount in μ₿
 * @param {number} decimals - Decimal places to show
 * @returns {object} { value: string, unit: string, full: string }
 */
export function formatCoins(microBitcoin, decimals = 2) {
    if (microBitcoin === null || microBitcoin === undefined || isNaN(microBitcoin)) {
        return { value: '0', unit: 'μ₿', full: '0 μ₿' };
    }

    const sign = microBitcoin < 0 ? '-' : '';
    let num = Math.abs(microBitcoin);

    // For very large numbers (>= 10^100), use scientific notation
    if (num >= 1e100) {
        const exp = Math.floor(Math.log10(num));
        const mantissa = num / Math.pow(10, exp);
        const value = sign + mantissa.toFixed(2) + 'e' + exp;
        return { value, unit: 'μ₿', full: value + ' μ₿' };
    }

    // Determine base unit: μ₿ (under 1M) or ₿ (1M+)
    const MICRO_TO_BITCOIN = 1e6;

    if (num < MICRO_TO_BITCOIN) {
        // Still in μ₿ range
        if (num < 1000) {
            const value = sign + (Number.isInteger(num) ? num.toString() : num.toFixed(decimals).replace(/\.?0+$/, ''));
            return { value, unit: 'μ₿', full: value + ' μ₿' };
        }
        // Thousands of μ₿
        const scaled = num / 1000;
        const value = sign + scaled.toFixed(decimals).replace(/\.?0+$/, '') + 'K';
        return { value, unit: 'μ₿', full: value + ' μ₿' };
    }

    // Convert to ₿
    num = num / MICRO_TO_BITCOIN;

    // Find the appropriate suffix tier for ₿
    let tier = 0;
    let scaled = num;

    // Extended suffixes for ₿ (starts at ₿, then K₿, M₿, B₿, etc.)
    const BTC_SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
                         'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc',
                         'Vg', 'UVg', 'DVg', 'TVg', 'QaVg', 'QiVg', 'SxVg', 'SpVg', 'OcVg', 'NoVg'];

    while (scaled >= 1000 && tier < BTC_SUFFIXES.length - 1) {
        scaled /= 1000;
        tier++;
    }

    const formatted = scaled.toFixed(decimals).replace(/\.?0+$/, '');
    const suffix = BTC_SUFFIXES[tier];
    const value = sign + formatted + suffix;
    const unit = '₿';

    return { value, unit, full: value + ' ' + unit };
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
 * @param {number} cps - Coins per second (in μ₿)
 * @returns {string} Formatted CPS string with proper unit
 */
export function formatCPS(cps) {
    if (cps < 0.1) return '0 μ₿/s';
    return formatCoins(cps).full + '/s';
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
