/**
 * Achievements Module
 * Handles tracking, unlocking, and displaying achievements
 */

import * as State from '../state.js';
import { ACHIEVEMENTS, CATEGORIES } from '../data/achievements.js';
import { spawnParticles, screenFlash } from './particles.js';
import { playSound } from './sound.js';

// Track which achievements have been shown as notifications
let shownNotifications = new Set();

// Track active notifications for stacking
let activeNotifications = 0;

// Track modal overlay handler for cleanup (prevent listener accumulation)
let currentAchievementOverlayHandler = null;

/**
 * Initialize achievements system
 */
export function initAchievements() {
    // Load shown notifications from state
    const state = State.getState();
    if (state.unlockedAchievements) {
        shownNotifications = new Set(state.unlockedAchievements);
    }

    // Subscribe to state changes to check for new achievements
    State.subscribe(checkAchievements);

    // Initial check
    checkAchievements();

    console.log('Achievements system initialized');
}

/**
 * Check all achievements and unlock any that are met
 */
export function checkAchievements() {
    const state = State.getState();
    const unlockedAchievements = state.unlockedAchievements || [];
    const newlyUnlocked = [];

    for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
        // Skip already unlocked
        if (unlockedAchievements.includes(id)) continue;

        // Check if achievement condition is met
        if (achievement.check(state)) {
            newlyUnlocked.push(id);
        }
    }

    // Unlock new achievements
    if (newlyUnlocked.length > 0) {
        const updatedUnlocked = [...unlockedAchievements, ...newlyUnlocked];
        State.updateState({ unlockedAchievements: updatedUnlocked });

        // Show notifications for each new achievement with staggered timing
        newlyUnlocked.forEach((id, index) => {
            if (!shownNotifications.has(id)) {
                setTimeout(() => {
                    showAchievementUnlock(id);
                }, index * 500); // 500ms delay between each
                shownNotifications.add(id);
            }
        });
    }
}

/**
 * Show achievement unlock notification
 */
function showAchievementUnlock(achievementId) {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return;

    // Play sound
    playSound('achievement');

    // Screen flash (only for first notification)
    if (activeNotifications === 0) {
        screenFlash('gold');
        // Spawn particles at center of screen
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        spawnParticles('confetti', centerX, centerY, 30);
    }

    // Calculate offset for stacking (120px per notification)
    const offset = activeNotifications * 120;
    activeNotifications++;

    // Create achievement notification
    const notification = document.createElement('div');
    notification.className = 'achievement-notification animate-slide-in-bottom';
    notification.style.bottom = (100 + offset) + 'px';
    notification.innerHTML = '<div class="achievement-notification-icon">' + achievement.icon + '</div>' +
        '<div class="achievement-notification-content">' +
            '<div class="achievement-notification-title">Achievement Unlocked!</div>' +
            '<div class="achievement-notification-name">' + achievement.name + '</div>' +
            '<div class="achievement-notification-desc">' + achievement.description + '</div>' +
        '</div>';

    document.body.appendChild(notification);

    // Remove after animation
    setTimeout(() => {
        notification.classList.add('animate-fade-out');
        setTimeout(() => {
            notification.remove();
            activeNotifications--;
        }, 300);
    }, 4000);
}

/**
 * Get all achievements with unlock status
 */
export function getAllAchievementsWithStatus() {
    const state = State.getState();
    const unlocked = state.unlockedAchievements || [];

    return Object.values(ACHIEVEMENTS).map(achievement => ({
        ...achievement,
        isUnlocked: unlocked.includes(achievement.id)
    }));
}

/**
 * Get achievements grouped by category
 */
export function getAchievementsByCategory() {
    const achievements = getAllAchievementsWithStatus();
    const grouped = {};

    for (const [categoryId, category] of Object.entries(CATEGORIES)) {
        grouped[categoryId] = {
            ...category,
            achievements: achievements.filter(a => a.category === categoryId)
        };
    }

    return grouped;
}

/**
 * Get achievement stats
 */
export function getAchievementStats() {
    const achievements = getAllAchievementsWithStatus();
    const total = achievements.length;
    const unlocked = achievements.filter(a => a.isUnlocked).length;

    return { total, unlocked, percentage: Math.round((unlocked / total) * 100) };
}

/**
 * Show achievements modal
 */
export function showAchievementsModal() {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    if (!overlay || !content) return;

    const grouped = getAchievementsByCategory();
    const stats = getAchievementStats();

    let categoriesHtml = '';
    for (const [categoryId, category] of Object.entries(grouped)) {
        const unlockedCount = category.achievements.filter(a => a.isUnlocked).length;
        const totalCount = category.achievements.length;

        let achievementsHtml = '';
        for (const a of category.achievements) {
            const icon = a.isUnlocked ? a.icon : '\u2753';
            const name = a.isUnlocked ? a.name : '???';
            const desc = a.isUnlocked ? a.description : 'Keep playing to unlock';
            const checkmark = a.isUnlocked ? '<div class="achievement-check">\u2713</div>' : '';
            const statusClass = a.isUnlocked ? 'unlocked' : 'locked';

            achievementsHtml += '<div class="achievement-item ' + statusClass + '">' +
                '<div class="achievement-icon">' + icon + '</div>' +
                '<div class="achievement-info">' +
                    '<div class="achievement-name">' + name + '</div>' +
                    '<div class="achievement-desc">' + desc + '</div>' +
                '</div>' +
                checkmark +
            '</div>';
        }

        categoriesHtml += '<div class="achievement-category">' +
            '<div class="achievement-category-header">' +
                '<span class="category-icon">' + category.icon + '</span>' +
                '<span class="category-name">' + category.name + '</span>' +
                '<span class="category-count">' + unlockedCount + '/' + totalCount + '</span>' +
            '</div>' +
            '<div class="achievement-list">' +
                achievementsHtml +
            '</div>' +
        '</div>';
    }

    content.innerHTML = '<h2 class="modal-title">Achievements</h2>' +
        '<div class="achievements-stats">' +
            '<div class="achievements-progress">' +
                '<div class="achievements-progress-bar" style="width: ' + stats.percentage + '%"></div>' +
            '</div>' +
            '<div class="achievements-count">' + stats.unlocked + '/' + stats.total + ' (' + stats.percentage + '%)</div>' +
        '</div>' +
        '<div class="modal-body achievements-modal-body">' +
            categoriesHtml +
        '</div>' +
        '<div class="modal-actions">' +
            '<button id="close-modal" class="btn btn-primary">Close</button>' +
        '</div>';

    overlay.classList.remove('hidden');

    // Remove any existing overlay handler to prevent accumulation
    if (currentAchievementOverlayHandler) {
        overlay.removeEventListener('click', currentAchievementOverlayHandler);
    }

    // Helper to close and cleanup
    const closeModal = () => {
        overlay.classList.add('hidden');
        if (currentAchievementOverlayHandler) {
            overlay.removeEventListener('click', currentAchievementOverlayHandler);
            currentAchievementOverlayHandler = null;
        }
    };

    // Handler for overlay click (close on background click)
    currentAchievementOverlayHandler = (e) => {
        if (e.target === overlay) {
            closeModal();
        }
    };

    // Close button
    const closeBtn = document.getElementById('close-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Close on overlay click (using tracked handler)
    overlay.addEventListener('click', currentAchievementOverlayHandler);
}
