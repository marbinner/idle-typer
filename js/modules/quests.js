/**
 * Quest Module
 * Provides rotating challenges with rewards
 */

import * as State from '../state.js';
import { QUEST_CONFIG } from '../config.js';
import { formatCoins } from '../utils.js';
import { spawnParticles, spawnFloatingNumber } from './particles.js';

// Quest panel element reference
let questPanelEl = null;
let questListEl = null;

// Seeded random for consistent quest generation
function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

/**
 * Get player's difficulty level based on progress
 */
function getPlayerLevel() {
    const state = State.getState();
    // Level based on lifetime posts (max level 20)
    return Math.min(20, Math.floor(state.lifetimePosts / 50) + 1);
}

/**
 * Generate a random quest target based on type and difficulty
 */
function generateQuestTarget(type, difficulty) {
    const level = getPlayerLevel();
    const scale = QUEST_CONFIG.difficultyScale;
    const diffMult = difficulty === 'easy' ? 0.6 : difficulty === 'hard' ? 1.5 : 1;

    switch (type) {
        case 'posts':
            return Math.ceil((scale.posts.base + scale.posts.perLevel * level) * diffMult);
        case 'wpm':
            return Math.ceil((scale.wpm.base + scale.wpm.perLevel * level) * diffMult);
        case 'accuracy':
            return Math.min(100, Math.ceil((scale.accuracy.base + scale.accuracy.perLevel * level) * diffMult));
        case 'coins':
            return Math.ceil((scale.coins.base + scale.coins.perLevel * level) * diffMult);
        case 'combo':
            return Math.ceil((scale.combo.base + scale.combo.perLevel * level) * diffMult);
        case 'perfect':
            return Math.ceil((2 + level * 0.5) * diffMult);
        case 'followers':
            return Math.ceil((5 + level * 2) * diffMult);
        case 'viral':
            return 1;
        case 'golden':
            return Math.ceil((3 + level) * diffMult);
        case 'crits':
            return Math.ceil((5 + level * 2) * diffMult);
        default:
            return 5;
    }
}

/**
 * Calculate quest reward
 */
function calculateReward(difficulty) {
    const state = State.getState();
    const rewards = QUEST_CONFIG.rewards[difficulty];
    const baseCps = state.coinsPerSecond || 0;

    const coins = Math.max(
        QUEST_CONFIG.minRewardCoins,
        Math.floor(baseCps * QUEST_CONFIG.baseRewardCpsSeconds * rewards.coinMult)
    );
    const followers = Math.floor(QUEST_CONFIG.baseRewardFollowers * rewards.followerMult * getPlayerLevel());

    return { coins, followers };
}

/**
 * Generate a set of quests
 */
function generateQuests() {
    const templates = [...QUEST_CONFIG.templates];
    const difficulties = ['easy', 'medium', 'hard'];
    const quests = [];

    // Shuffle templates
    for (let i = templates.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(Date.now() + i) * (i + 1));
        [templates[i], templates[j]] = [templates[j], templates[i]];
    }

    // Pick quests
    for (let i = 0; i < QUEST_CONFIG.activeQuestCount; i++) {
        const template = templates[i % templates.length];
        const difficulty = difficulties[i % difficulties.length];
        const target = generateQuestTarget(template.type, difficulty);
        const reward = calculateReward(difficulty);

        quests.push({
            id: `${template.id}_${Date.now()}_${i}`,
            templateId: template.id,
            type: template.type,
            description: template.description.replace('{target}', target),
            icon: template.icon,
            target,
            progress: 0,
            difficulty,
            reward,
            completed: false,
            claimed: false
        });
    }

    return quests;
}

/**
 * Check if quests need rotation
 */
function shouldRotateQuests() {
    const state = State.getState();
    if (!state.lastQuestRotation) return true;

    const hoursSinceRotation = (Date.now() - state.lastQuestRotation) / (1000 * 60 * 60);
    return hoursSinceRotation >= QUEST_CONFIG.rotationHours;
}

/**
 * Get time until next rotation
 */
function getTimeUntilRotation() {
    const state = State.getState();
    if (!state.lastQuestRotation) return 0;

    const nextRotation = state.lastQuestRotation + (QUEST_CONFIG.rotationHours * 60 * 60 * 1000);
    const remaining = Math.max(0, nextRotation - Date.now());

    return remaining;
}

/**
 * Format time remaining
 */
function formatTimeRemaining(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

/**
 * Initialize quest system
 */
export function initQuests() {
    const state = State.getState();

    // Check if quests need rotation
    if (shouldRotateQuests() || !state.activeQuests || state.activeQuests.length === 0) {
        const quests = generateQuests();
        State.updateState({
            activeQuests: quests,
            lastQuestRotation: Date.now(),
            questProgress: {}
        }, true);
    }

    // Create quest panel UI
    createQuestPanel();

    // Subscribe to game events for quest progress
    subscribeToEvents();

    // Start rotation timer
    setInterval(checkQuestRotation, 60000); // Check every minute

    console.log('Quest system ready');
}

/**
 * Create the quest panel UI
 */
function createQuestPanel() {
    // Find or create quest panel
    questPanelEl = document.getElementById('quest-panel');

    if (!questPanelEl) {
        // Create quest button in header
        const headerActions = document.querySelector('.compose-actions');
        if (headerActions) {
            const questBtn = document.createElement('button');
            questBtn.id = 'quest-btn';
            questBtn.className = 'compose-action';
            questBtn.innerHTML = '&#x1F3AF;';
            questBtn.title = 'Quests';
            questBtn.addEventListener('click', toggleQuestPanel);
            headerActions.appendChild(questBtn);
        }

        // Create panel
        questPanelEl = document.createElement('div');
        questPanelEl.id = 'quest-panel';
        questPanelEl.className = 'quest-panel hidden';
        questPanelEl.innerHTML = `
            <div class="quest-panel-header">
                <h3>Active Quests</h3>
                <span class="quest-timer" id="quest-timer"></span>
            </div>
            <div class="quest-list" id="quest-list"></div>
        `;

        const gameArea = document.getElementById('game-area');
        if (gameArea) {
            gameArea.appendChild(questPanelEl);
        }
    }

    questListEl = document.getElementById('quest-list');
    updateQuestUI();

    // Update timer
    updateQuestTimer();
    setInterval(updateQuestTimer, 60000);
}

/**
 * Toggle quest panel visibility
 */
function toggleQuestPanel() {
    if (questPanelEl) {
        questPanelEl.classList.toggle('hidden');
        if (!questPanelEl.classList.contains('hidden')) {
            updateQuestUI();
        }
    }
}

/**
 * Update quest timer display
 */
function updateQuestTimer() {
    const timerEl = document.getElementById('quest-timer');
    if (timerEl) {
        const remaining = getTimeUntilRotation();
        timerEl.textContent = `Resets in ${formatTimeRemaining(remaining)}`;
    }
}

/**
 * Update quest UI
 */
function updateQuestUI() {
    if (!questListEl) return;

    const state = State.getState();
    const quests = state.activeQuests || [];

    if (quests.length === 0) {
        questListEl.innerHTML = '<div class="quest-empty">No active quests</div>';
        return;
    }

    questListEl.innerHTML = quests.map(quest => {
        const progressPercent = Math.min(100, (quest.progress / quest.target) * 100);
        const isComplete = quest.progress >= quest.target;
        const difficultyClass = `quest-${quest.difficulty}`;

        return `
            <div class="quest-item ${difficultyClass} ${isComplete ? 'quest-complete' : ''}" data-quest-id="${quest.id}">
                <div class="quest-icon">${quest.icon}</div>
                <div class="quest-info">
                    <div class="quest-description">${quest.description}</div>
                    <div class="quest-progress-bar">
                        <div class="quest-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="quest-progress-text">${quest.progress}/${quest.target}</div>
                </div>
                <div class="quest-reward">
                    ${isComplete && !quest.claimed ? `
                        <button class="quest-claim-btn" data-quest-id="${quest.id}">Claim!</button>
                    ` : quest.claimed ? `
                        <span class="quest-claimed">Done!</span>
                    ` : `
                        <span class="quest-reward-preview">
                            <span>${formatCoins(quest.reward.coins).short}</span>
                            ${quest.reward.followers > 0 ? `<span>+${quest.reward.followers} &#x1F464;</span>` : ''}
                        </span>
                    `}
                </div>
            </div>
        `;
    }).join('');

    // Add claim button listeners
    questListEl.querySelectorAll('.quest-claim-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            claimQuestReward(btn.dataset.questId);
        });
    });
}

/**
 * Subscribe to game events for quest progress tracking
 */
function subscribeToEvents() {
    // Listen for post completion
    window.addEventListener('post-completed', (e) => {
        const detail = e.detail || {};
        updateQuestProgress('posts', 1);

        if (detail.isPerfect) {
            updateQuestProgress('perfect', 1);
        }

        if (detail.wpm) {
            // Check if WPM quest is satisfied
            checkWpmQuest(detail.wpm);
        }

        if (detail.accuracy) {
            checkAccuracyQuest(detail.accuracy);
        }

        if (detail.isViral) {
            updateQuestProgress('viral', 1);
        }
    });

    // Listen for coins gained
    window.addEventListener('coins-gained', (e) => {
        const amount = e.detail?.amount || 0;
        updateQuestProgress('coins', amount);
    });

    // Listen for followers gained
    window.addEventListener('followers-gained', (e) => {
        const amount = e.detail?.amount || 0;
        updateQuestProgress('followers', amount);
    });

    // Listen for combo changes
    State.subscribeToKey('combo', (newCombo) => {
        checkComboQuest(newCombo);
    });

    // Listen for golden char hits
    window.addEventListener('golden-char-hit', () => {
        updateQuestProgress('golden', 1);
    });

    // Listen for critical hits
    window.addEventListener('crit-hit', () => {
        updateQuestProgress('crits', 1);
    });
}

/**
 * Update progress for a quest type
 */
function updateQuestProgress(type, amount) {
    const state = State.getState();
    const quests = [...(state.activeQuests || [])];
    let updated = false;

    quests.forEach((quest, i) => {
        if (quest.type === type && !quest.claimed) {
            quests[i] = {
                ...quest,
                progress: Math.min(quest.target, quest.progress + amount)
            };
            updated = true;
        }
    });

    if (updated) {
        State.updateState({ activeQuests: quests }, true);
        updateQuestUI();
        checkQuestCompletions();
    }
}

/**
 * Check WPM quest (needs to hit target WPM in single post)
 */
function checkWpmQuest(wpm) {
    const state = State.getState();
    const quests = [...(state.activeQuests || [])];
    let updated = false;

    quests.forEach((quest, i) => {
        if (quest.type === 'wpm' && !quest.claimed && wpm >= quest.target) {
            quests[i] = { ...quest, progress: quest.target };
            updated = true;
        }
    });

    if (updated) {
        State.updateState({ activeQuests: quests }, true);
        updateQuestUI();
        checkQuestCompletions();
    }
}

/**
 * Check accuracy quest
 */
function checkAccuracyQuest(accuracy) {
    const state = State.getState();
    const quests = [...(state.activeQuests || [])];
    let updated = false;

    quests.forEach((quest, i) => {
        if (quest.type === 'accuracy' && !quest.claimed && accuracy >= quest.target) {
            quests[i] = { ...quest, progress: quest.target };
            updated = true;
        }
    });

    if (updated) {
        State.updateState({ activeQuests: quests }, true);
        updateQuestUI();
        checkQuestCompletions();
    }
}

/**
 * Check combo quest
 */
function checkComboQuest(combo) {
    const state = State.getState();
    const quests = [...(state.activeQuests || [])];
    let updated = false;

    quests.forEach((quest, i) => {
        if (quest.type === 'combo' && !quest.claimed && combo >= quest.target) {
            quests[i] = { ...quest, progress: quest.target };
            updated = true;
        }
    });

    if (updated) {
        State.updateState({ activeQuests: quests }, true);
        updateQuestUI();
        checkQuestCompletions();
    }
}

/**
 * Check for newly completed quests
 */
function checkQuestCompletions() {
    const state = State.getState();
    const quests = state.activeQuests || [];

    quests.forEach(quest => {
        if (quest.progress >= quest.target && !quest.completed) {
            quest.completed = true;
            showQuestCompleteNotification(quest);
        }
    });
}

/**
 * Show quest complete notification
 */
function showQuestCompleteNotification(quest) {
    const eventText = document.getElementById('event-text');
    if (eventText) {
        eventText.textContent = `Quest Complete: ${quest.description}!`;
        eventText.className = 'highlight';
        setTimeout(() => {
            eventText.textContent = '';
            eventText.className = '';
        }, 3000);
    }

    // Pulse the quest button
    const questBtn = document.getElementById('quest-btn');
    if (questBtn) {
        questBtn.classList.add('quest-ready');
    }
}

/**
 * Claim quest reward
 */
function claimQuestReward(questId) {
    const state = State.getState();
    const quests = [...(state.activeQuests || [])];
    const questIndex = quests.findIndex(q => q.id === questId);

    if (questIndex === -1) return;

    const quest = quests[questIndex];
    if (quest.claimed || quest.progress < quest.target) return;

    // Mark as claimed
    quests[questIndex] = { ...quest, claimed: true };

    // Award rewards
    State.addCoins(quest.reward.coins, 'quest');
    if (quest.reward.followers > 0) {
        State.addFollowers(quest.reward.followers, 'quest');
    }

    // Update state
    State.updateState({
        activeQuests: quests,
        questsCompleted: (state.questsCompleted || 0) + 1
    }, true);

    // Visual feedback
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    spawnParticles(centerX, centerY, 20, '#4ade80');
    spawnFloatingNumber(`+${formatCoins(quest.reward.coins).full}`, centerX, centerY - 30, 'quest');

    // Update UI
    updateQuestUI();

    // Remove pulse from button if all claimed
    checkAllQuestsClaimed();

    console.log(`Quest claimed: ${quest.description}`);
}

/**
 * Check if all quests are claimed
 */
function checkAllQuestsClaimed() {
    const state = State.getState();
    const quests = state.activeQuests || [];
    const allClaimed = quests.every(q => q.claimed || q.progress < q.target);

    const questBtn = document.getElementById('quest-btn');
    if (questBtn && allClaimed) {
        questBtn.classList.remove('quest-ready');
    }
}

/**
 * Check if quests need rotation
 */
function checkQuestRotation() {
    if (shouldRotateQuests()) {
        const quests = generateQuests();
        State.updateState({
            activeQuests: quests,
            lastQuestRotation: Date.now(),
            questProgress: {}
        }, true);

        updateQuestUI();
        updateQuestTimer();

        // Notify player
        const eventText = document.getElementById('event-text');
        if (eventText) {
            eventText.textContent = 'New quests available!';
            setTimeout(() => { eventText.textContent = ''; }, 3000);
        }
    }
}

/**
 * Get active quests (for external modules)
 */
export function getActiveQuests() {
    return State.getState().activeQuests || [];
}
