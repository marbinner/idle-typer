/**
 * Particle System Module
 * Canvas-based particle effects for visual juice
 */

import * as State from '../state.js';

// Canvas and context
let canvas;
let ctx;

// Particle arrays
let particles = [];
let floatingNumbers = [];

// Particle pool for performance
const particlePool = [];
const MAX_POOL_SIZE = 500;
const MAX_PARTICLES = 150; // Cap total particles for performance
const MAX_FLOATING_NUMBERS = 30; // Cap floating DOM elements for performance

// Screen shake animation frame ID (to cancel overlapping shakes)
let screenShakeRafId = null;

// Colors for particles
const COLORS = {
    blue: '#1D9BF0',
    gold: '#FFD700',
    coral: '#FF6B6B',
    green: '#00BA7C',
    yellow: '#FFE66D',
    purple: '#9B59B6',
    white: '#FFFFFF',
    confetti: ['#1D9BF0', '#FF6B6B', '#FFE66D', '#00BA7C', '#9B59B6', '#FF9500']
};

/**
 * Initialize the particle system
 */
export function initParticles() {
    canvas = document.getElementById('particles-canvas');
    if (!canvas) {
        console.warn('Particles canvas not found');
        return;
    }

    ctx = canvas.getContext('2d');

    // Set canvas size
    resizeCanvas();
    // Remove existing listener to prevent duplicates on re-init
    window.removeEventListener('resize', resizeCanvas);
    window.addEventListener('resize', resizeCanvas);

    console.log('Particle system initialized');
}

/**
 * Resize canvas to window size
 */
function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Update and render particles
 */
export function updateParticles(deltaTime) {
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and render particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Update position
        p.x += p.vx * (deltaTime / 16);
        p.y += p.vy * (deltaTime / 16);

        // Apply gravity
        p.vy += p.gravity * (deltaTime / 16);

        // Apply friction
        p.vx *= p.friction;
        p.vy *= p.friction;

        // Update rotation
        p.rotation += p.rotationSpeed * (deltaTime / 16);

        // Update life
        p.life -= deltaTime;

        // Remove dead particles
        if (p.life <= 0) {
            particles.splice(i, 1);
            returnParticle(p);
            continue;
        }

        // Calculate alpha based on life
        const alpha = Math.min(1, p.life / p.fadeStart);

        // Render particle
        renderParticle(p, alpha);
    }

    // Update and render floating numbers
    updateFloatingNumbers(deltaTime);
}

/**
 * Render a single particle
 */
function renderParticle(p, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);

    switch (p.shape) {
        case 'circle':
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            break;

        case 'glow':
            // Soft glowing particle with radial gradient
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(0.4, p.color);
            gradient.addColorStop(1, 'transparent');
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
            break;

        case 'spark':
            // Diamond/spark shape
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size * 0.3, 0);
            ctx.lineTo(0, p.size);
            ctx.lineTo(-p.size * 0.3, 0);
            ctx.closePath();
            ctx.fillStyle = p.color;
            ctx.fill();
            break;

        case 'square':
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            break;

        case 'confetti':
            // Squash effect based on velocity
            const squash = Math.min(Math.abs(p.vy) / 200, 0.5);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 4 * (1 - squash), p.size, p.size / 2 * (1 - squash));
            break;

        case 'star':
            drawStar(ctx, 0, 0, p.size, p.size / 2, 5, p.color);
            break;

        default:
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
    }

    ctx.restore();
}

/**
 * Draw a star shape
 */
function drawStar(ctx, cx, cy, outerRadius, innerRadius, points, color) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

/**
 * Spawn particles of a given type
 */
export function spawnParticles(type, x, y, count = 10) {
    // Cap particle count to prevent performance issues
    if (particles.length >= MAX_PARTICLES) {
        // Remove oldest particles to make room
        const toRemove = Math.min(count, particles.length - MAX_PARTICLES + count);
        for (let i = 0; i < toRemove; i++) {
            returnParticle(particles.shift());
        }
    }
    // Limit spawn count based on available space
    count = Math.min(count, MAX_PARTICLES - particles.length + 10);
    if (count <= 0) return;

    switch (type) {
        case 'keystroke':
            spawnKeystrokeParticles(x, y, count);
            break;
        case 'confetti':
            spawnConfettiParticles(x, y, count);
            break;
        case 'purchase':
            spawnPurchaseParticles(x, y, count);
            break;
        case 'viral':
            spawnViralParticles(x, y, count);
            break;
        case 'fireburst':
            spawnFireburstParticles(x, y, count);
            break;
        default:
            spawnDefaultParticles(x, y, count);
    }
}

/**
 * Spawn keystroke particles - blazing mode at 80+ heat
 */
function spawnKeystrokeParticles(x, y, count) {
    const state = State.getState();
    const heat = state.heat || 0;
    const isBlazing = heat >= 80;

    // Fiery colors when blazing, blue otherwise - always subtle
    const colors = isBlazing
        ? ['#FF4500', '#FF6B35', '#FFD700']
        : ['#1D9BF0', '#4DABF5', '#7FC4F8'];

    for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.4;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particles.push(getParticle({
            x: x + (Math.random() - 0.5) * 6,
            y: y + (Math.random() - 0.5) * 4,
            vx: Math.cos(angle) * (15 + Math.random() * 20) + (Math.random() - 0.5) * 8,
            vy: Math.sin(angle) * (15 + Math.random() * 20),
            size: 2 + Math.random() * 1.5,
            color: color,
            shape: 'glow',
            life: 250 + Math.random() * 100,
            fadeStart: 200,
            gravity: 15,
            friction: 0.95,
            rotation: 0,
            rotationSpeed: 0
        }));
    }
}

/**
 * Spawn fireburst particles - explosion effect for blazing completion
 */
function spawnFireburstParticles(x, y, count) {
    const colors = ['#FF4500', '#FF6B35', '#FFD700', '#FF0000', '#FFA500'];

    for (let i = 0; i < count; i++) {
        // Full 360 degree burst
        const angle = Math.random() * Math.PI * 2;
        const speed = 60 + Math.random() * 80;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particles.push(getParticle({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 4,
            color: color,
            shape: Math.random() > 0.5 ? 'glow' : 'spark',
            life: 400 + Math.random() * 300,
            fadeStart: 300,
            gravity: 80,
            friction: 0.97,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2
        }));
    }
}

/**
 * Spawn confetti particles
 */
function spawnConfettiParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
        const speed = 150 + Math.random() * 100;

        particles.push(getParticle({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 6 + Math.random() * 4,
            color: COLORS.confetti[Math.floor(Math.random() * COLORS.confetti.length)],
            shape: 'confetti',
            life: 1500 + Math.random() * 500,
            fadeStart: 500,
            gravity: 200,
            friction: 0.99,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.3
        }));
    }
}

/**
 * Spawn purchase particles
 */
function spawnPurchaseParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 50;

        particles.push(getParticle({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 4 + Math.random() * 3,
            color: COLORS.green,
            shape: 'circle',
            life: 600,
            fadeStart: 300,
            gravity: 0,
            friction: 0.95,
            rotation: 0,
            rotationSpeed: 0
        }));
    }
}

/**
 * Spawn viral particles (big celebration)
 */
function spawnViralParticles(x, y, count) {
    // Multiple bursts
    for (let burst = 0; burst < 3; burst++) {
        setTimeout(() => {
            for (let i = 0; i < count / 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 100 + Math.random() * 150;

                particles.push(getParticle({
                    x: x + (Math.random() - 0.5) * 100,
                    y: y + (Math.random() - 0.5) * 100,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: 8 + Math.random() * 6,
                    color: COLORS.confetti[Math.floor(Math.random() * COLORS.confetti.length)],
                    shape: Math.random() > 0.5 ? 'star' : 'confetti',
                    life: 2000 + Math.random() * 1000,
                    fadeStart: 800,
                    gravity: 150,
                    friction: 0.98,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.5
                }));
            }
        }, burst * 100);
    }
}

/**
 * Spawn default particles
 */
function spawnDefaultParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 30 + Math.random() * 30;

        particles.push(getParticle({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 2,
            color: COLORS.white,
            shape: 'circle',
            life: 500,
            fadeStart: 300,
            gravity: 50,
            friction: 0.98,
            rotation: 0,
            rotationSpeed: 0
        }));
    }
}

/**
 * Spawn a floating number
 */
export function spawnFloatingNumber(text, x, y, type = 'default') {
    const container = document.getElementById('floating-numbers');
    if (!container) return;

    // Cap floating numbers to prevent DOM overload during heavy spawning
    const existing = container.children.length;
    if (existing >= MAX_FLOATING_NUMBERS) {
        // Remove oldest floating numbers to make room
        const toRemove = existing - MAX_FLOATING_NUMBERS + 1;
        for (let i = 0; i < toRemove; i++) {
            container.firstChild?.remove();
        }
    }

    const el = document.createElement('div');
    el.className = `floating-number ${type} animate-float-up`;
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    container.appendChild(el);

    // Remove after animation
    setTimeout(() => {
        el.remove();
    }, 1000);
}

/**
 * Update floating numbers (handled by CSS animations)
 */
function updateFloatingNumbers(deltaTime) {
    // Floating numbers are handled by CSS animations
    // This function can be extended for more complex behavior
}

/**
 * Spawn screen-wide celebration effect
 * @param {string} type - 'purchase', 'milestone', 'viral', 'rankup'
 */
export function spawnScreenCelebration(type = 'purchase') {
    const colors = {
        purchase: ['#00FF87', '#00D4FF', '#9B59FF'],
        milestone: ['#FFE500', '#FF6B00', '#FF1493'],
        viral: ['#FF1493', '#FF00FF', '#00FFFF'],
        rankup: ['#FFE500', '#FF1493', '#9B59FF', '#00D4FF']
    };

    const selectedColors = colors[type] || colors.purchase;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Spawn particles from center outward
    const count = type === 'rankup' ? 60 : 30;
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
        const speed = 200 + Math.random() * 300;
        const color = selectedColors[Math.floor(Math.random() * selectedColors.length)];

        particles.push(getParticle({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.5,
            maxLife: 1.5,
            size: 6 + Math.random() * 8,
            color: color,
            alpha: 1,
            type: 'confetti',
            gravity: 100,
            friction: 0.97,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 10
        }));
    }

    // Add screen flash
    const flash = document.createElement('div');
    flash.className = `screen-flash ${type === 'viral' ? 'pink' : type === 'rankup' ? 'purple' : 'green'}`;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);

    // Spawn edge sparkles
    spawnEdgeSparkles(selectedColors);
}

/**
 * Spawn sparkles along screen edges
 */
function spawnEdgeSparkles(colors) {
    const edges = [
        { x: 0, y: Math.random() * window.innerHeight },
        { x: window.innerWidth, y: Math.random() * window.innerHeight },
        { x: Math.random() * window.innerWidth, y: 0 },
        { x: Math.random() * window.innerWidth, y: window.innerHeight }
    ];

    edges.forEach(edge => {
        for (let i = 0; i < 5; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push(getParticle({
                x: edge.x + (Math.random() - 0.5) * 100,
                y: edge.y + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 1,
                maxLife: 1,
                size: 4 + Math.random() * 4,
                color: color,
                alpha: 1,
                type: 'confetti',
                gravity: 50,
                friction: 0.98,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 8
            }));
        }
    });
}

/**
 * Get a particle from the pool or create new
 */
function getParticle(props) {
    const p = particlePool.pop() || {};
    return Object.assign(p, props);
}

/**
 * Return a particle to the pool
 */
function returnParticle(p) {
    if (particlePool.length < MAX_POOL_SIZE) {
        particlePool.push(p);
    }
}

/**
 * Clear all particles
 */
export function clearParticles() {
    particles = [];
}

/**
 * Create screen flash effect
 */
export function screenFlash(color = 'gold') {
    const flash = document.createElement('div');
    flash.className = `screen-flash ${color}`;
    document.body.appendChild(flash);

    setTimeout(() => {
        flash.remove();
    }, 300);
}

/**
 * Screen shake effect
 */
export function screenShake(intensity = 5, duration = 300) {
    const app = document.getElementById('app');
    if (!app) return;

    // Cancel any existing screen shake
    if (screenShakeRafId) {
        cancelAnimationFrame(screenShakeRafId);
        app.style.transform = '';
    }

    const startTime = Date.now();

    function shake() {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
            app.style.transform = '';
            screenShakeRafId = null;
            return;
        }

        const decay = 1 - elapsed / duration;
        const x = (Math.random() - 0.5) * intensity * decay;
        const y = (Math.random() - 0.5) * intensity * decay;
        app.style.transform = `translate(${x}px, ${y}px)`;

        screenShakeRafId = requestAnimationFrame(shake);
    }

    shake();
}
