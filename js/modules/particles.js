/**
 * Particle System Module
 * Canvas-based particle effects for visual juice
 */

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
        default:
            spawnDefaultParticles(x, y, count);
    }
}

/**
 * Spawn keystroke particles - subtle, elegant particles
 */
function spawnKeystrokeParticles(x, y, count) {
    // Subtle blue palette
    const keystrokeColors = ['#1D9BF0', '#4DABF5', '#7FC4F8'];

    for (let i = 0; i < count; i++) {
        // Spread mostly upward
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.5;
        const speed = 15 + Math.random() * 25;

        const color = keystrokeColors[Math.floor(Math.random() * keystrokeColors.length)];

        particles.push(getParticle({
            x: x + (Math.random() - 0.5) * 6,
            y: y + (Math.random() - 0.5) * 4,
            vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 8,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 2,
            color: color,
            shape: 'glow',
            life: 250 + Math.random() * 150,
            fadeStart: 200,
            gravity: 10,
            friction: 0.95,
            rotation: 0,
            rotationSpeed: 0
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

    const startTime = Date.now();

    function shake() {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
            app.style.transform = '';
            return;
        }

        const decay = 1 - elapsed / duration;
        const x = (Math.random() - 0.5) * intensity * decay;
        const y = (Math.random() - 0.5) * intensity * decay;
        app.style.transform = `translate(${x}px, ${y}px)`;

        requestAnimationFrame(shake);
    }

    shake();
}
