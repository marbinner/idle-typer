/**
 * Market Module
 * Handles crypto trade purchases and the market UI
 */

import * as State from '../state.js';
import {
    PRIZE_TIERS,
    RARITY_COLORS,
    RARITY_GLOW,
    getTradeCost,
    rollCryptoTrade,
    getCryptoTrade,
    getRandomPrizeForDisplay,
    getPrizeTier,
    isLoss,
    isRugPull
} from '../data/lootboxes.js';
import { SPIN_CONFIG } from '../config.js';
import { playSound } from './sound.js';
import { spawnParticles, spawnFloatingNumber } from './particles.js';
import { formatCoins } from '../utils.js';
import { triggerFrenzy } from './typing.js';

// DOM Elements
let marketListEl = null;
let lootBoxOverlay = null;
let spinWheelBtn = null;
let spinOverlay = null;

// Animation state
let isOpening = false;
let currentBox = null;
let isSpinning = false;

// Track initialization
let isInitialized = false;

// Spin wheel state
let lastSpinTime = null;

// Escape key handler (stored to prevent duplicates)
let escapeHandlerRegistered = false;

/**
 * Initialize the gambling system
 */
export function initGambling() {
    marketListEl = document.getElementById('market-list');
    spinWheelBtn = document.getElementById('spin-wheel-btn');

    // Create the loot box opening overlay if it doesn't exist
    createLootBoxOverlay();

    // Create spin wheel overlay
    createSpinWheelOverlay();

    // Set up event delegation for market items
    if (marketListEl && !isInitialized) {
        marketListEl.addEventListener('click', handleMarketClick);
        isInitialized = true;
    }

    // Set up spin wheel button
    if (spinWheelBtn) {
        spinWheelBtn.addEventListener('click', handleSpinClick);
    }

    // Load last spin time from state
    const state = State.getState();
    lastSpinTime = state.lastSpinTime || null;

    // Start cooldown timer if there's an active cooldown
    if (lastSpinTime && !isSpinAvailable()) {
        startSpinCooldownTimer();
    }

    // Render initial loot boxes
    renderLootBoxes();

    // Update spin wheel button
    updateSpinWheelButton();

    // Subscribe to state changes
    State.subscribe(() => {
        updateAffordability();
        updateSpinWheelButton();
    });

    // Expose test function
    window.testTrade = () => {
        const state = State.getState();
        const cost = getTradeCost(state.coinsPerSecond);
        openTrade(cost);
    };

    window.testSpin = () => {
        spinWheel();
    };

    console.log('Market system initialized (use window.testTrade() or window.testSpin() to test)');
}

/**
 * Create the loot box opening overlay
 */
function createLootBoxOverlay() {
    lootBoxOverlay = document.getElementById('lootbox-overlay');
    if (lootBoxOverlay) return; // Already exists

    lootBoxOverlay = document.createElement('div');
    lootBoxOverlay.id = 'lootbox-overlay';
    lootBoxOverlay.className = 'lootbox-overlay';
    lootBoxOverlay.innerHTML = `
        <div class="lootbox-modal">
            <div class="roulette-container">
                <div class="roulette-pointer"></div>
                <div class="roulette-window">
                    <div class="roulette-strip" id="roulette-strip">
                        <!-- Prize items will be generated here -->
                    </div>
                </div>
            </div>
            <div class="lootbox-result hidden" id="lootbox-result">
                <div class="result-label" id="result-label">You won:</div>
                <div class="result-amount" id="result-amount">0</div>
                <div class="result-rarity" id="result-rarity">Common</div>
            </div>
            <button class="lootbox-continue-btn hidden" id="lootbox-continue">Continue</button>
        </div>
    `;
    document.body.appendChild(lootBoxOverlay);

    // Set up continue button
    const continueBtn = lootBoxOverlay.querySelector('#lootbox-continue');
    if (continueBtn) {
        continueBtn.addEventListener('click', closeLootBoxOverlay);
    }

    // Set up shared escape handler (only once)
    setupEscapeHandler();
}

/**
 * Handle clicks on market items
 */
function handleMarketClick(e) {
    const item = e.target.closest('.lootbox-item');
    if (!item) return;

    purchaseTrade();
}

/**
 * Render the crypto trade in the market tab
 */
export function renderLootBoxes() {
    if (!marketListEl) return;

    const state = State.getState();
    const trade = getCryptoTrade();
    const cost = getTradeCost(state.coinsPerSecond);
    const canAfford = state.coins >= cost;
    const affordClass = canAfford ? '' : 'cannot-afford';

    const html = `
        <div class="market-header">
            <span class="market-title">₿ Crypto Market</span>
            <span class="market-subtitle">Trade the volatility. HODL or get rekt.</span>
        </div>
        <div class="market-stats">
            <span>Trades Made: ${state.lootBoxesOpened || 0}</span>
            <span>Net P/L: ${formatCoins(state.gamblingProfit || 0).full}</span>
        </div>
        <div class="lootbox-item ${affordClass}" style="--box-color: ${trade.color}">
            <div class="lootbox-item-icon">${trade.icon}</div>
            <div class="lootbox-item-info">
                <div class="lootbox-item-name">${trade.name}</div>
                <div class="lootbox-item-desc">${trade.description}</div>
            </div>
            <div class="lootbox-item-cost">
                <span class="cost-amount">${formatCoins(cost).full}</span>
            </div>
        </div>
    `;

    marketListEl.innerHTML = html;
}

/**
 * Update affordability styling and dynamic cost
 */
function updateAffordability() {
    if (!marketListEl) return;

    const state = State.getState();
    const cost = getTradeCost(state.coinsPerSecond);
    const item = marketListEl.querySelector('.lootbox-item');

    if (item) {
        if (state.coins >= cost) {
            item.classList.remove('cannot-afford');
        } else {
            item.classList.add('cannot-afford');
        }

        // Update the cost display (it changes with passive income)
        const costEl = item.querySelector('.cost-amount');
        if (costEl) {
            costEl.textContent = formatCoins(cost).full;
        }
    }

    // Update stats
    const statsEl = marketListEl.querySelector('.market-stats');
    if (statsEl) {
        const profit = state.gamblingProfit || 0;
        const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
        statsEl.innerHTML = `
            <span>Trades Made: ${state.lootBoxesOpened || 0}</span>
            <span class="${profitClass}">Net P/L: ${formatCoins(profit).full}</span>
        `;
    }
}

/**
 * Purchase and open a crypto trade
 */
function purchaseTrade() {
    if (isOpening) return;

    const state = State.getState();
    const cost = getTradeCost(state.coinsPerSecond);

    if (state.coins < cost) {
        playSound('error');
        return;
    }

    // Deduct cost and track spending (but NOT lootBoxesOpened yet - that happens after roll)
    State.addCoins(-cost, 'crypto-trade');
    State.updateState({
        gamblingProfit: (state.gamblingProfit || 0) - cost
    });

    // Play purchase sound
    playSound('complete', { pitch: 0.8 });

    // Open the trade with animation
    openTrade(cost);
}

// Roulette configuration
const ROULETTE_ITEM_WIDTH = 120; // Width of each prize item in pixels
const ROULETTE_ITEMS_COUNT = 50; // Number of items in the strip
const ROULETTE_WINNER_POSITION = 42; // Position where the winning item will be placed
const ROULETTE_SPIN_DURATION = 5000; // Total spin duration in ms

/**
 * Generate the roulette strip with prizes
 * Ensures top prizes are visible to show what's possible (near-miss psychology)
 */
function generateRouletteStrip(cost, winningPrize) {
    const strip = [];

    // Positions where we'll show jackpot-tier prizes (near-miss effect)
    // These are spread throughout the visible area before the winner
    const jackpotPositions = {
        5: 8,   // BECAME SATOSHI (mythic)
        12: 7,  // 100X TRADE (legendary)
        20: 6,  // PERFECT ENTRY (epic)
        28: 5,  // Whale Move (epic)
        35: 4   // Big Green (rare)
    };

    // Generate prizes for the strip
    for (let i = 0; i < ROULETTE_ITEMS_COUNT; i++) {
        if (i === ROULETTE_WINNER_POSITION) {
            // Place the winning prize at the designated position
            strip.push(winningPrize);
        } else if (jackpotPositions[i] !== undefined) {
            // Place specific high-tier prizes at near-miss positions
            strip.push(getPrizeTier(jackpotPositions[i], cost));
        } else {
            // Random prize using base probabilities
            strip.push(getRandomPrizeForDisplay(cost));
        }
    }

    return strip;
}

/**
 * Render a single prize item for the roulette
 */
function renderRouletteItem(prize) {
    const color = RARITY_COLORS[prize.rarity];
    const glow = RARITY_GLOW[prize.rarity];
    const displayAmount = prize.amount === 0 ? '💀' : formatCoins(prize.amount).full;
    const icon = prize.icon || '🎁';
    const rarityClass = `rarity-${prize.rarity}`;

    return `
        <div class="roulette-item ${rarityClass}" style="--rarity-color: ${color}; --rarity-glow: ${glow}">
            <div class="roulette-item-icon">${icon}</div>
            <div class="roulette-item-amount">${displayAmount}</div>
            <div class="roulette-item-rarity">${prize.label}</div>
        </div>
    `;
}

/**
 * Open a trade with CSGO-style roulette animation
 */
function openTrade(cost) {
    if (isOpening) return;

    isOpening = true;
    currentBox = getCryptoTrade();

    // Get current trade state for the algorithm
    const state = State.getState();
    const tradeState = {
        totalTrades: state.lootBoxesOpened || 0,
        consecutiveLosses: state.consecutiveLosses || 0,
        lossStreak: state.lossStreak || 0
    };

    // Roll the prize using engagement algorithm
    const prize = rollCryptoTrade(cost, tradeState);

    // Show overlay
    lootBoxOverlay.classList.add('active');

    // Reset state
    const resultEl = document.getElementById('lootbox-result');
    const continueBtn = document.getElementById('lootbox-continue');
    if (resultEl) {
        resultEl.classList.add('hidden');
        resultEl.classList.remove('reveal');
    }
    if (continueBtn) {
        continueBtn.classList.add('hidden');
    }

    // Generate roulette strip
    const strip = generateRouletteStrip(cost, prize);
    const stripEl = document.getElementById('roulette-strip');
    if (!stripEl) {
        isOpening = false;
        return;
    }

    // Render the strip
    stripEl.innerHTML = strip.map(p => renderRouletteItem(p)).join('');

    // Reset strip position
    stripEl.style.transition = 'none';
    stripEl.style.transform = 'translateX(0)';

    // Force reflow
    stripEl.offsetHeight;

    // Calculate final position (center the winning item in the viewport)
    // The pointer is in the center, so we need to scroll to put the winner under it
    const containerWidth = stripEl.parentElement.offsetWidth;
    const winnerOffset = ROULETTE_WINNER_POSITION * ROULETTE_ITEM_WIDTH;
    const centerOffset = (containerWidth / 2) - (ROULETTE_ITEM_WIDTH / 2);
    const finalPosition = -(winnerOffset - centerOffset);

    // Add some randomness to make it feel more natural (land slightly off-center)
    const randomOffset = (Math.random() - 0.5) * (ROULETTE_ITEM_WIDTH * 0.3);

    // Play spinning sound
    playSound('keystroke', { pitch: 1.2 });

    // Start the spin after a brief delay
    setTimeout(() => {
        // Apply the spinning animation
        stripEl.style.transition = `transform ${ROULETTE_SPIN_DURATION}ms cubic-bezier(0.15, 0.85, 0.35, 1)`;
        stripEl.style.transform = `translateX(${finalPosition + randomOffset}px)`;

        // Play tick sounds during spin
        let tickCount = 0;
        const tickInterval = setInterval(() => {
            tickCount++;
            // Slow down the ticks as the spin slows
            if (tickCount < 20) {
                playSound('keystroke', { pitch: 1.0 + Math.random() * 0.3 });
            } else if (tickCount < 35 && tickCount % 2 === 0) {
                playSound('keystroke', { pitch: 0.9 + Math.random() * 0.2 });
            } else if (tickCount % 4 === 0) {
                playSound('keystroke', { pitch: 0.8 + Math.random() * 0.1 });
            }

            if (tickCount > 50) {
                clearInterval(tickInterval);
            }
        }, 100);

        // Show result after spin completes
        setTimeout(() => {
            clearInterval(tickInterval);
            showPrizeResult(prize);
        }, ROULETTE_SPIN_DURATION + 300);

    }, 100);
}

/**
 * Show the prize result with celebration effects
 */
function showPrizeResult(prize) {
    const resultEl = document.getElementById('lootbox-result');
    const amountEl = document.getElementById('result-amount');
    const rarityEl = document.getElementById('result-rarity');
    const continueBtn = document.getElementById('lootbox-continue');

    // Guard against missing elements
    if (!resultEl || !amountEl || !rarityEl) {
        isOpening = false;
        return;
    }

    // Clear previous win classes
    resultEl.classList.remove('win-rare', 'win-epic', 'win-legendary', 'win-mythic');
    if (lootBoxOverlay) {
        lootBoxOverlay.classList.remove('shake', 'shake-hard', 'flash');
    }

    // Set result content
    if (prize.amount === 0) {
        amountEl.textContent = 'REKT!';
        amountEl.style.color = RARITY_COLORS.common;
    } else {
        amountEl.textContent = formatCoins(prize.amount).full;
        amountEl.style.color = RARITY_COLORS[prize.rarity];
    }

    rarityEl.textContent = prize.label;
    rarityEl.style.color = RARITY_COLORS[prize.rarity];

    // Apply glow effect based on rarity
    resultEl.style.textShadow = RARITY_GLOW[prize.rarity];

    // Show result with animation
    resultEl.classList.remove('hidden');
    resultEl.classList.add('reveal');

    // Add win class for special animations
    if (prize.rarity === 'rare') {
        resultEl.classList.add('win-rare');
    } else if (prize.rarity === 'epic') {
        resultEl.classList.add('win-epic');
    } else if (prize.rarity === 'legendary') {
        resultEl.classList.add('win-legendary');
    } else if (prize.rarity === 'mythic') {
        resultEl.classList.add('win-mythic');
    }

    // Play sounds and effects based on rarity
    const rect = resultEl.getBoundingClientRect();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    if (prize.amount === 0) {
        // Rug pull - sad trombone
        playSound('error', { pitch: 0.5 });
        setTimeout(() => playSound('error', { pitch: 0.4 }), 200);
    } else if (prize.rarity === 'mythic') {
        // MYTHIC WIN - Maximum celebration!
        lootBoxOverlay.classList.add('flash');
        setTimeout(() => lootBoxOverlay.classList.add('shake-hard'), 100);

        // Play multiple sounds
        playSound('viral', { pitch: 1.0 });
        setTimeout(() => playSound('viral', { pitch: 1.2 }), 150);
        setTimeout(() => playSound('achievement', { pitch: 1.3 }), 300);

        // Massive particle explosion
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                spawnParticles('viral', centerX + (Math.random() - 0.5) * 200, centerY + (Math.random() - 0.5) * 100, 30);
            }, i * 80);
        }

        // Extra floating numbers
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                spawnFloatingNumber(
                    '🚀',
                    centerX + (Math.random() - 0.5) * 400,
                    centerY + (Math.random() - 0.5) * 200,
                    'rainbow'
                );
            }, i * 150);
        }
    } else if (prize.rarity === 'legendary') {
        // LEGENDARY WIN - Big celebration
        lootBoxOverlay.classList.add('flash');
        setTimeout(() => lootBoxOverlay.classList.add('shake'), 100);

        playSound('viral', { pitch: 1.2 });
        setTimeout(() => playSound('achievement', { pitch: 1.1 }), 200);

        // Big particle explosion
        for (let i = 0; i < 7; i++) {
            setTimeout(() => {
                spawnParticles('viral', centerX + (Math.random() - 0.5) * 150, centerY, 25);
            }, i * 100);
        }
    } else if (prize.rarity === 'epic') {
        // Epic win
        lootBoxOverlay.classList.add('shake');
        playSound('achievement', { pitch: 1.0 });
        setTimeout(() => playSound('complete', { pitch: 1.2 }), 150);

        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                spawnParticles('complete', centerX + (Math.random() - 0.5) * 100, centerY, 20);
            }, i * 100);
        }
    } else if (prize.rarity === 'rare') {
        // Rare win
        playSound('complete', { pitch: 1.1 });
        spawnParticles('keystroke', centerX, centerY, 15);
    } else if (prize.rarity === 'uncommon') {
        // Small win
        playSound('complete', { pitch: 1.0 });
        spawnParticles('keystroke', centerX, centerY, 8);
    } else {
        // Common (loss or break even)
        playSound('keystroke', { pitch: 0.8 });
    }

    // Update streak tracking and add winnings
    const state = State.getState();
    const wasLoss = isLoss(prize);       // multiplier < 1
    const wasRugPull = isRugPull(prize); // multiplier = 0

    if (prize.amount > 0) {
        State.addCoins(prize.amount, 'crypto-trade-win');
    }

    // Update state with streak info and increment trade count
    State.updateState({
        lootBoxesOpened: (state.lootBoxesOpened || 0) + 1,
        gamblingProfit: (state.gamblingProfit || 0) + prize.amount,
        biggestWin: Math.max(state.biggestWin || 0, prize.amount),
        consecutiveLosses: wasLoss ? (state.consecutiveLosses || 0) + 1 : 0,
        lossStreak: wasRugPull ? (state.lossStreak || 0) + 1 : 0
    });

    // Spawn main floating number for wins
    if (prize.amount > 0) {
        const floatColor = prize.rarity === 'legendary' || prize.rarity === 'mythic' ? 'rainbow' : 'gold';
        spawnFloatingNumber(
            `+${formatCoins(prize.amount).full}`,
            centerX,
            centerY - 80,
            floatColor
        );
    }

    // Show continue button (delayed more for big wins)
    const delay = prize.rarity === 'mythic' ? 1500 : prize.rarity === 'legendary' ? 1000 : 500;
    setTimeout(() => {
        continueBtn.classList.remove('hidden');
        isOpening = false;
    }, delay);
}

/**
 * Close the loot box overlay
 */
function closeLootBoxOverlay() {
    if (isOpening) return;

    // Remove all celebration classes
    if (lootBoxOverlay) {
        lootBoxOverlay.classList.remove('active', 'shake', 'shake-hard', 'flash');
    }
    const resultEl = document.getElementById('lootbox-result');
    if (resultEl) {
        resultEl.classList.remove('win-rare', 'win-epic', 'win-legendary', 'win-mythic');
    }

    currentBox = null;

    // Update the market list to reflect new balance
    renderLootBoxes();
}

/**
 * Check if gambling is currently active (opening a box)
 */
export function isGamblingActive() {
    return isOpening || isSpinning;
}

// =============================================================================
// DAILY SPIN WHEEL
// =============================================================================

/**
 * Create the spin wheel overlay
 */
function createSpinWheelOverlay() {
    spinOverlay = document.getElementById('spin-overlay');
    if (spinOverlay) return;

    // Generate icons positioned around the wheel
    const numPrizes = SPIN_CONFIG.prizes.length;
    const segmentAngle = 360 / numPrizes;
    const radius = 120; // Distance from center to place icons

    const iconsHtml = SPIN_CONFIG.prizes.map((prize, i) => {
        // Calculate position for each icon
        // Start from top (270 deg in standard coords, or -90 deg)
        // Add half segment to center in segment
        const angleDeg = -90 + (i * segmentAngle) + (segmentAngle / 2);
        const angleRad = (angleDeg * Math.PI) / 180;
        const x = Math.cos(angleRad) * radius;
        const y = Math.sin(angleRad) * radius;

        return `<div class="wheel-icon" style="transform: translate(${x}px, ${y}px)">${prize.icon}</div>`;
    }).join('');

    spinOverlay = document.createElement('div');
    spinOverlay.id = 'spin-overlay';
    spinOverlay.innerHTML = `
        <div class="spin-wheel-modal">
            <div class="spin-wheel-container">
                <div class="spin-pointer">▼</div>
                <div class="spin-wheel" id="spin-wheel">
                    <div class="wheel-icons">
                        ${iconsHtml}
                    </div>
                </div>
                <div class="spin-center">🎰</div>
            </div>
            <div class="spin-result-display hidden" id="spin-result">
                <div class="spin-result-icon" id="spin-result-icon">🎁</div>
                <div class="spin-result-label" id="spin-result-label">You won:</div>
                <div class="spin-result-value" id="spin-result-value"></div>
            </div>
            <button class="spin-close-btn hidden" id="spin-close-btn">Continue</button>
        </div>
    `;
    document.body.appendChild(spinOverlay);

    // Set up close button
    const closeBtn = spinOverlay.querySelector('#spin-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSpinOverlay);
    }

    // Set up shared escape handler (only once)
    setupEscapeHandler();
}

/**
 * Shared escape key handler for all overlays
 */
function setupEscapeHandler() {
    if (escapeHandlerRegistered) return;
    escapeHandlerRegistered = true;

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;

        // Check lootbox overlay
        if (lootBoxOverlay && lootBoxOverlay.classList.contains('active') && !isOpening) {
            closeLootBoxOverlay();
            return;
        }

        // Check spin overlay
        if (spinOverlay && spinOverlay.classList.contains('active') && !isSpinning) {
            closeSpinOverlay();
            return;
        }
    });
}

/**
 * Check if spin is available (hourly cooldown)
 */
function isSpinAvailable() {
    if (!lastSpinTime) return true;

    const now = Date.now();
    const cooldown = SPIN_CONFIG.spinCooldownMs;

    return (now - lastSpinTime) >= cooldown;
}

/**
 * Get time remaining until next spin (in ms)
 */
function getSpinCooldownRemaining() {
    if (!lastSpinTime) return 0;

    const now = Date.now();
    const cooldown = SPIN_CONFIG.spinCooldownMs;
    const remaining = (lastSpinTime + cooldown) - now;

    return Math.max(0, remaining);
}

/**
 * Format cooldown time for display
 */
function formatCooldown(ms) {
    if (ms <= 0) return 'Ready!';

    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    return `${minutes}m ${seconds}s`;
}

/**
 * Update spin wheel button state
 */
function updateSpinWheelButton() {
    if (!spinWheelBtn) return;

    const canSpin = isSpinAvailable();
    const cooldownRemaining = getSpinCooldownRemaining();

    const btnText = spinWheelBtn.querySelector('.btn-text');
    const costInfo = document.getElementById('spin-cost-info');

    if (canSpin) {
        spinWheelBtn.classList.add('free-spin');
        spinWheelBtn.disabled = false;
        if (btnText) btnText.textContent = 'SPIN!';
        if (costInfo) costInfo.textContent = 'Free spin ready!';
    } else {
        spinWheelBtn.classList.remove('free-spin');
        spinWheelBtn.disabled = true;
        if (btnText) btnText.textContent = formatCooldown(cooldownRemaining);
        if (costInfo) costInfo.textContent = 'Next spin in ' + formatCooldown(cooldownRemaining);
    }
}

// Update spin button cooldown display periodically
let spinCooldownInterval = null;

function startSpinCooldownTimer() {
    if (spinCooldownInterval) return;

    spinCooldownInterval = setInterval(() => {
        if (isSpinAvailable()) {
            clearInterval(spinCooldownInterval);
            spinCooldownInterval = null;
        }
        updateSpinWheelButton();
    }, 1000);
}

/**
 * Handle spin button click
 */
function handleSpinClick() {
    if (isSpinning) return;

    if (!isSpinAvailable()) {
        playSound('error');
        return;
    }

    // Mark spin time
    lastSpinTime = Date.now();
    State.updateState({ lastSpinTime: lastSpinTime });

    // Start cooldown timer
    startSpinCooldownTimer();

    // Start spinning
    spinWheel();
}

/**
 * Spin the wheel!
 */
function spinWheel() {
    if (isSpinning) return;
    isSpinning = true;

    // Show overlay
    spinOverlay.classList.add('active');

    // Hide result from previous spin
    const spinResultEl = document.getElementById('spin-result');
    const spinCloseBtn = document.getElementById('spin-close-btn');
    if (spinResultEl) spinResultEl.classList.add('hidden');
    if (spinCloseBtn) spinCloseBtn.classList.add('hidden');

    // Roll the prize first using weighted random
    const prize = rollSpinPrize();
    const prizeIndex = SPIN_CONFIG.prizes.indexOf(prize);
    const numPrizes = SPIN_CONFIG.prizes.length;
    const segmentAngle = 360 / numPrizes;

    // Icons are positioned at angle: -90° + (i + 0.5) * segmentAngle
    // Prize 0 is at -72° (upper right), Prize 1 at -36°, etc.
    // The pointer is at the top (-90° / 270°)
    //
    // When we rotate the wheel by R° clockwise, prize i moves to:
    //   -90 + (i + 0.5) * segmentAngle + R
    //
    // To land prize i at the top (-90° + 360k), we need:
    //   R = 360k - (i + 0.5) * segmentAngle
    const segmentOffset = (prizeIndex + 0.5) * segmentAngle;

    // Add multiple full spins for effect
    const spins = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
    const finalAngle = 360 * (spins + 1) - segmentOffset;

    const wheel = document.getElementById('spin-wheel');
    if (wheel) {
        // Reset
        wheel.style.transition = 'none';
        wheel.style.transform = 'rotate(0deg)';
        wheel.offsetHeight; // Force reflow

        // Play start sound
        playSound('complete', { pitch: 1.2 });

        // Start spinning
        setTimeout(() => {
            wheel.style.transition = 'transform 5s cubic-bezier(0.2, 0.8, 0.3, 1)';
            wheel.style.transform = `rotate(${finalAngle}deg)`;

            // Play tick sounds
            let tickCount = 0;
            const tickInterval = setInterval(() => {
                tickCount++;
                if (tickCount < 30) {
                    playSound('keystroke', { pitch: 1.0 + Math.random() * 0.3 });
                } else if (tickCount < 45) {
                    playSound('keystroke', { pitch: 0.9 + Math.random() * 0.2 });
                }
                if (tickCount > 50) clearInterval(tickInterval);
            }, 100);

            // Show result after spin
            setTimeout(() => {
                clearInterval(tickInterval);
                showSpinResult(prize);
            }, 5300);
        }, 100);
    }
}

/**
 * Roll for spin prize using weighted random
 */
function rollSpinPrize() {
    const totalWeight = SPIN_CONFIG.prizes.reduce((sum, p) => sum + p.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const prize of SPIN_CONFIG.prizes) {
        roll -= prize.weight;
        if (roll <= 0) return prize;
    }

    return SPIN_CONFIG.prizes[0];
}

/**
 * Show spin result
 */
function showSpinResult(prize) {
    const resultEl = document.getElementById('spin-result');
    const iconEl = document.getElementById('spin-result-icon');
    const labelEl = document.getElementById('spin-result-label');
    const valueEl = document.getElementById('spin-result-value');
    const closeBtn = document.getElementById('spin-close-btn');

    if (iconEl) iconEl.textContent = prize.icon;
    if (labelEl) labelEl.textContent = prize.label;

    const state = State.getState();
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Apply prize based on type with CPS scaling
    if (prize.type === 'coins') {
        // Scale with CPS: max(minCoins, CPS * cpsSeconds)
        const amount = Math.floor(Math.max(prize.minCoins, state.coinsPerSecond * prize.cpsSeconds));
        State.addCoins(amount, 'spin-wheel-win');
        if (valueEl) {
            valueEl.textContent = `+${formatCoins(amount).full}`;
            valueEl.style.color = '#ffd700';
        }

        // Bigger prizes get bigger effects
        const isJackpot = prize.cpsSeconds >= 300;
        const isBig = prize.cpsSeconds >= 120;

        if (isJackpot) {
            playSound('viral');
            spawnParticles('viral', centerX, centerY, 60);
        } else if (isBig) {
            playSound('achievement');
            spawnParticles('confetti', centerX, centerY, 50);
        } else {
            playSound('achievement');
            spawnParticles('confetti', centerX, centerY, 30);
        }
        spawnFloatingNumber(`+${formatCoins(amount).full}`, centerX, centerY + 100, 'gold');
    } else if (prize.type === 'followers') {
        // Scale with current followers: baseAmount + sqrt(followers) * followerScale
        const scaledAmount = Math.floor(prize.baseAmount + Math.sqrt(state.followers) * prize.followerScale);
        State.addFollowers(scaledAmount, 'spin-wheel');
        if (valueEl) {
            valueEl.textContent = `+${scaledAmount} Followers!`;
            valueEl.style.color = '#1d9bf0';
        }

        playSound('complete');
        spawnParticles('confetti', centerX, centerY, 25);
        spawnFloatingNumber(`+${scaledAmount} Followers`, centerX, centerY + 100, 'followers');
    } else if (prize.type === 'buff') {
        if (prize.buff === 'nextPost2x') {
            State.updateState({ nextPostMultiplier: 2 });
            if (valueEl) {
                valueEl.textContent = '2x on next post!';
                valueEl.style.color = '#a855f7';
            }
            playSound('achievement');
        } else if (prize.buff === 'nextPost5x') {
            State.updateState({ nextPostMultiplier: 5 });
            if (valueEl) {
                valueEl.textContent = '5x on next post!';
                valueEl.style.color = '#ff6b6b';
            }
            playSound('viral');
            spawnParticles('viral', centerX, centerY, 50);
        } else if (prize.buff === 'instantFrenzy') {
            triggerFrenzy();
            if (valueEl) {
                valueEl.textContent = 'FRENZY ACTIVATED!';
                valueEl.style.color = '#ff6600';
            }
            playSound('viral');
        }
    }

    // Show result
    if (resultEl) resultEl.classList.remove('hidden');
    setTimeout(() => {
        if (closeBtn) closeBtn.classList.remove('hidden');
        isSpinning = false;
    }, 800);
}

/**
 * Close spin overlay
 */
function closeSpinOverlay() {
    if (isSpinning) return;
    spinOverlay.classList.remove('active');
    updateSpinWheelButton();
}
