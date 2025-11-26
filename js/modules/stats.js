/**
 * Stats Module
 * Tracks historical data and displays stats panel with graphs
 */

import * as State from '../state.js';

// Maximum data points to keep (one per minute for 24 hours = 1440)
const MAX_HISTORY_POINTS = 500;
const SNAPSHOT_INTERVAL = 60000; // 1 minute

// Historical data
let history = {
    timestamps: [],
    coins: [],
    followers: [],
    impressions: [],
    posts: []
};

let snapshotInterval = null;

/**
 * Initialize stats tracking
 */
export function initStats() {
    // Start periodic snapshots
    snapshotInterval = setInterval(takeSnapshot, SNAPSHOT_INTERVAL);

    // Take initial snapshot
    takeSnapshot();

    // Set up stats button
    const statsBtn = document.getElementById('stats-btn');
    if (statsBtn) {
        statsBtn.addEventListener('click', showStatsPanel);
    }

    console.log('Stats system ready');
}

/**
 * Take a snapshot of current stats
 */
function takeSnapshot() {
    const state = State.getState();
    const now = Date.now();

    history.timestamps.push(now);
    history.coins.push(state.lifetimeCoins);
    history.followers.push(state.followers);
    history.impressions.push(state.lifetimeImpressions);
    history.posts.push(state.lifetimePosts);

    // Trim if too many points
    if (history.timestamps.length > MAX_HISTORY_POINTS) {
        history.timestamps.shift();
        history.coins.shift();
        history.followers.shift();
        history.impressions.shift();
        history.posts.shift();
    }
}

/**
 * Get history for saving
 */
export function getStatsHistory() {
    return history;
}

/**
 * Load history from save
 */
export function loadStatsHistory(savedHistory) {
    if (savedHistory && savedHistory.timestamps) {
        history = savedHistory;
    }
}

/**
 * Reset stats history (for game reset)
 */
export function resetStatsHistory() {
    history = {
        timestamps: [],
        coins: [],
        followers: [],
        impressions: [],
        posts: []
    };
}

/**
 * Format large numbers
 */
function formatNumber(num) {
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    return (num / 1000000000).toFixed(1) + 'B';
}

/**
 * Format duration
 */
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${minutes % 60}m`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
}

/**
 * Show the stats panel
 */
export function showStatsPanel() {
    const state = State.getState();
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    if (!overlay || !content) return;

    // Calculate stats
    const playTime = state.totalPlayTime || 0;
    const coinsPerMinute = playTime > 60000 ? (state.lifetimeCoins / (playTime / 60000)).toFixed(1) : 0;
    const accuracy = state.totalCharsTyped > 0
        ? Math.max(0, Math.round(((state.totalCharsTyped - state.errors) / state.totalCharsTyped) * 100))
        : 100;

    content.innerHTML = `
        <div class="stats-panel">
            <div class="stats-header">
                <h2>Player Statistics</h2>
                <button class="close-btn" id="close-stats">&times;</button>
            </div>

            <div class="stats-summary">
                <div class="stat-card">
                    <div class="stat-card-value">${formatNumber(state.lifetimeCoins)}</div>
                    <div class="stat-card-label">Lifetime Coins</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-value">${formatNumber(state.followers)}</div>
                    <div class="stat-card-label">Followers</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-value">${formatNumber(state.lifetimeImpressions)}</div>
                    <div class="stat-card-label">Impressions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-value">${state.lifetimePosts}</div>
                    <div class="stat-card-label">Posts</div>
                </div>
            </div>

            <div class="stats-details">
                <div class="stats-column">
                    <h3>Typing Stats</h3>
                    <div class="stat-row"><span>Best WPM</span><span>${state.bestWPM}</span></div>
                    <div class="stat-row"><span>Average WPM</span><span>${state.avgWPM}</span></div>
                    <div class="stat-row"><span>Overall Accuracy</span><span>${accuracy}%</span></div>
                    <div class="stat-row"><span>Perfect Posts</span><span>${state.perfectPosts}</span></div>
                    <div class="stat-row"><span>Best Combo</span><span>${state.bestCombo}</span></div>
                    <div class="stat-row"><span>Characters Typed</span><span>${formatNumber(state.totalCharsTyped)}</span></div>
                </div>
                <div class="stats-column">
                    <h3>Progress</h3>
                    <div class="stat-row"><span>Play Time</span><span>${formatDuration(playTime)}</span></div>
                    <div class="stat-row"><span>Coins/min</span><span>${coinsPerMinute}</span></div>
                    <div class="stat-row"><span>Coins/sec (passive)</span><span>${state.coinsPerSecond.toFixed(1)}</span></div>
                    <div class="stat-row"><span>Viral Posts</span><span>${state.viralPosts}</span></div>
                    <div class="stat-row"><span>Main Character</span><span>${state.mainCharacterPosts || 0}</span></div>
                    <div class="stat-row"><span>Global Multiplier</span><span>${state.globalMultiplier.toFixed(2)}x</span></div>
                </div>
            </div>

            <div class="stats-graphs">
                <h3>Progress Over Time</h3>
                <div class="graph-tabs">
                    <button class="graph-tab active" data-graph="coins">Coins</button>
                    <button class="graph-tab" data-graph="followers">Followers</button>
                    <button class="graph-tab" data-graph="impressions">Impressions</button>
                    <button class="graph-tab" data-graph="posts">Posts</button>
                </div>
                <div class="graph-container">
                    <canvas id="stats-graph" width="600" height="200"></canvas>
                </div>
            </div>
        </div>
    `;

    overlay.classList.remove('hidden');

    // Helper to close and cleanup
    const closeModal = () => {
        overlay.classList.add('hidden');
        // Remove listeners to prevent memory leak
        overlay.removeEventListener('click', handleOverlayClick);
    };

    // Handler for overlay click (close on background click)
    const handleOverlayClick = (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    };

    // Set up close button
    document.getElementById('close-stats').addEventListener('click', closeModal);

    // Set up graph tabs
    const tabs = content.querySelectorAll('.graph-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderGraph(tab.dataset.graph);
        });
    });

    // Close on overlay click
    overlay.addEventListener('click', handleOverlayClick);

    // Render initial graph
    renderGraph('coins');
}

/**
 * Render a line graph
 */
function renderGraph(dataType) {
    const canvas = document.getElementById('stats-graph');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Fully clear the canvas first
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, width, height);

    // Get data
    const data = history[dataType];
    if (!data || data.length < 2) {
        ctx.fillStyle = '#888';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Not enough data yet. Keep playing!', width / 2, height / 2);
        return;
    }

    // Calculate min/max
    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = maxVal - minVal || 1;

    // Padding
    const padX = 50;
    const padY = 20;
    const graphWidth = width - padX * 2;
    const graphHeight = height - padY * 2;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padY + (graphHeight * i / 4);
        ctx.beginPath();
        ctx.moveTo(padX, y);
        ctx.lineTo(width - padX, y);
        ctx.stroke();
    }

    // Draw Y-axis labels
    ctx.fillStyle = '#888';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const val = maxVal - (range * i / 4);
        const y = padY + (graphHeight * i / 4);
        ctx.fillText(formatNumber(Math.round(val)), padX - 5, y + 4);
    }

    // Define colors for each data type
    const colors = {
        coins: '#ffd700',
        followers: '#1d9bf0',
        impressions: '#00ba7c',
        posts: '#ff6b6b'
    };

    const color = colors[dataType] || '#fff';

    // Build the points array
    const points = data.map((val, i) => ({
        x: padX + (i / (data.length - 1)) * graphWidth,
        y: padY + graphHeight - ((val - minVal) / range) * graphHeight
    }));

    // Draw area fill first (behind the line)
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(padX + graphWidth, padY + graphHeight);
    ctx.lineTo(padX, padY + graphHeight);
    ctx.closePath();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 1;

    // Draw line on top
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Draw current value label
    const lastVal = data[data.length - 1];
    ctx.fillStyle = color;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Current: ${formatNumber(lastVal)}`, width / 2, height - 5);
}

/**
 * Hide stats panel
 */
export function hideStatsPanel() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}
