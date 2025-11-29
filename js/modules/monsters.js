/**
 * Monster Mini-Game Module
 * Spawns clickable monsters that drop coins when defeated
 * Inspired by Clicker Heroes
 */

import * as State from '../state.js';
import { spawnParticles, spawnFloatingNumber, screenShake } from './particles.js';
import { playSound, playMonsterHitSound, playMonsterDeathSound } from './sound.js';
import { formatCoins } from '../utils.js';

// Monster types with their properties
const MONSTER_TYPES = [
    { id: 'slime', emoji: '🟢', name: 'Slime', hp: 5, coins: 50, size: 60 },
    { id: 'ghost', emoji: '👻', name: 'Ghost', hp: 8, coins: 100, size: 70 },
    { id: 'bat', emoji: '🦇', name: 'Bat', hp: 6, coins: 75, size: 55 },
    { id: 'spider', emoji: '🕷️', name: 'Spider', hp: 10, coins: 150, size: 65 },
    { id: 'skull', emoji: '💀', name: 'Skull', hp: 12, coins: 200, size: 70 },
    { id: 'demon', emoji: '👹', name: 'Demon', hp: 15, coins: 300, size: 80 },
    { id: 'dragon', emoji: '🐲', name: 'Dragon', hp: 25, coins: 500, size: 90 },
    { id: 'alien', emoji: '👾', name: 'Alien', hp: 20, coins: 400, size: 75 },
    { id: 'robot', emoji: '🤖', name: 'Evil Bot', hp: 18, coins: 350, size: 70 },
    { id: 'clown', emoji: '🤡', name: 'Troll', hp: 30, coins: 750, size: 85 },
];

// State
let activeMonsters = [];
let containerEl = null;
let lastSpawnTime = 0;
let initialized = false;

// Config
const MAX_MONSTERS = 3;
const SPAWN_INTERVAL = 15000; // 15 seconds base
const SPAWN_CHANCE = 0.3; // 30% chance to spawn when interval passes
const MIN_LIFETIME_POSTS = 5; // Require 5 posts before monsters appear

/**
 * Initialize the monster system
 */
export function initMonsters() {
    containerEl = document.getElementById('monster-container');
    if (!containerEl) {
        console.warn('Monster container not found');
        return;
    }
    initialized = true;
    lastSpawnTime = Date.now();
    console.log('Monster system initialized');
}

/**
 * Tick function called from game loop
 */
export function tick(deltaTime) {
    if (!initialized || !containerEl) return;

    const state = State.getState();

    // Don't spawn until player has made some progress
    if (state.lifetimePosts < MIN_LIFETIME_POSTS) return;

    const now = Date.now();

    // Check if we should try to spawn
    if (now - lastSpawnTime >= SPAWN_INTERVAL && activeMonsters.length < MAX_MONSTERS) {
        lastSpawnTime = now;

        if (Math.random() < SPAWN_CHANCE) {
            spawnMonster();
        }
    }

    // Update active monsters (check for timeout)
    activeMonsters = activeMonsters.filter(monster => {
        if (now - monster.spawnTime > 30000) { // 30 second lifetime
            monster.element.classList.add('monster-flee');
            setTimeout(() => {
                monster.element?.remove();
            }, 500);
            return false;
        }
        return true;
    });
}

/**
 * Spawn a random monster
 */
function spawnMonster() {
    if (!containerEl) return;

    const state = State.getState();

    // Scale monster difficulty with progress
    const progressFactor = Math.min(state.lifetimeCoins / 100000, 5);
    const availableTypes = MONSTER_TYPES.slice(0, Math.min(3 + Math.floor(progressFactor), MONSTER_TYPES.length));

    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];

    // Scale HP and coins with progress
    const hpMultiplier = 1 + progressFactor * 0.5;
    const coinMultiplier = 1 + progressFactor * 2;

    const monster = {
        id: `monster-${Date.now()}`,
        type: type,
        hp: Math.ceil(type.hp * hpMultiplier),
        maxHp: Math.ceil(type.hp * hpMultiplier),
        coins: Math.ceil(type.coins * coinMultiplier),
        spawnTime: Date.now(),
        element: null
    };

    // Create monster element
    const el = document.createElement('div');
    el.className = 'monster';
    el.id = monster.id;
    el.innerHTML = `
        <div class="monster-body" style="font-size: ${type.size}px">${type.emoji}</div>
        <div class="monster-hp-bar">
            <div class="monster-hp-fill" style="width: 100%"></div>
        </div>
        <div class="monster-name">${type.name}</div>
    `;

    // Random position (avoid edges and center compose area)
    const margin = 100;
    const avoidCenterWidth = 800;
    const avoidCenterHeight = 400;

    let x, y;
    let attempts = 0;
    do {
        x = margin + Math.random() * (window.innerWidth - margin * 2);
        y = margin + 60 + Math.random() * (window.innerHeight - margin * 2 - 100);
        attempts++;
    } while (
        attempts < 20 &&
        x > (window.innerWidth - avoidCenterWidth) / 2 &&
        x < (window.innerWidth + avoidCenterWidth) / 2 &&
        y > (window.innerHeight - avoidCenterHeight) / 2 &&
        y < (window.innerHeight + avoidCenterHeight) / 2
    );

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    // Click handler
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        hitMonster(monster);
    });

    monster.element = el;
    containerEl.appendChild(el);
    activeMonsters.push(monster);

    // Spawn animation
    el.classList.add('monster-spawn');
    playSound('keystroke');
}

/**
 * Handle monster being hit
 */
function hitMonster(monster) {
    if (!monster.element) return;

    const damage = 1;
    monster.hp -= damage;

    // Play satisfying slash sound
    playMonsterHitSound();

    // Hit animation - more intense!
    monster.element.classList.add('monster-hit');
    setTimeout(() => {
        monster.element?.classList.remove('monster-hit');
    }, 150);

    // Add slam effect class for extra juice
    monster.element.classList.add('monster-slammed');
    setTimeout(() => {
        monster.element?.classList.remove('monster-slammed');
    }, 100);

    // Slight screen shake for impact feel
    screenShake(3, 100);

    // Update HP bar
    const hpFill = monster.element.querySelector('.monster-hp-fill');
    if (hpFill) {
        const percent = Math.max(0, (monster.hp / monster.maxHp) * 100);
        hpFill.style.width = `${percent}%`;

        // Color change based on HP
        if (percent < 30) {
            hpFill.style.background = 'var(--candy-red)';
        } else if (percent < 60) {
            hpFill.style.background = 'var(--candy-orange)';
        }
    }

    // Spawn hit particles - more dramatic!
    const rect = monster.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Slash effect particles
    spawnParticles('keystroke', centerX, centerY, 8);

    // Random offset for damage number
    const offsetX = (Math.random() - 0.5) * 60;
    const offsetY = -20 - Math.random() * 30;
    spawnFloatingNumber('-1', centerX + offsetX, centerY + offsetY, 'error');

    // Check if dead
    if (monster.hp <= 0) {
        killMonster(monster);
    }
}

/**
 * Kill a monster and drop coins
 */
function killMonster(monster) {
    if (!monster.element) return;

    const rect = monster.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Play epic death sound
    playMonsterDeathSound();

    // Big screen shake for death
    screenShake(8, 200);

    // Death animation
    monster.element.classList.add('monster-death');

    // Spawn lots of particles - explosion!
    spawnParticles('confetti', centerX, centerY, 50);

    // Spawn coin particles in a burst
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const angle = (Math.PI * 2 / 12) * i;
            const distance = 40 + Math.random() * 60;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance - 20;
            spawnFloatingNumber('🪙', x, y, 'xcoins');
        }, i * 25);
    }

    // Show total coin reward with delay
    setTimeout(() => {
        const formatted = formatCoins(monster.coins);
        spawnFloatingNumber(`+${formatted.full}`, centerX, centerY - 50, 'xcoins');
    }, 300);

    // Add coins to player
    State.addCoins(monster.coins, 'monster');

    // Remove from active list and DOM
    setTimeout(() => {
        monster.element?.remove();
        activeMonsters = activeMonsters.filter(m => m.id !== monster.id);
    }, 600);
}

/**
 * Force spawn a monster (for testing)
 */
export function forceSpawnMonster() {
    if (!initialized) initMonsters();
    spawnMonster();
}

// Expose for debugging
if (typeof window !== 'undefined') {
    window.testMonster = forceSpawnMonster;
}
