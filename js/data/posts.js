/**
 * Post Content Library - 10,000+ unique posts for typing
 * Combined from 12 themed batches
 */

import { POSTS_BATCH_1 } from './posts_batch_1.js';
import { POSTS_BATCH_2 } from './posts_batch_2.js';
import { POSTS_BATCH_3 } from './posts_batch_3.js';
import { POSTS_BATCH_4 } from './posts_batch_4.js';
import { POSTS_BATCH_5 } from './posts_batch_5.js';
import { POSTS_BATCH_6 } from './posts_batch_6.js';
import { POSTS_BATCH_7 } from './posts_batch_7.js';
import { POSTS_BATCH_8 } from './posts_batch_8.js';
import { POSTS_BATCH_9 } from './posts_batch_9.js';
import { POSTS_BATCH_10 } from './posts_batch_10.js';
import { POSTS_BATCH_11 } from './posts_batch_11.js';
import { POSTS_BATCH_12 } from './posts_batch_12.js';

// Combine all batches into one massive array
export const POSTS = [
    ...POSTS_BATCH_1,   // Hot takes, controversial opinions
    ...POSTS_BATCH_2,   // Tech bro culture, startup humor
    ...POSTS_BATCH_3,   // Crypto/NFT humor
    ...POSTS_BATCH_4,   // Relatable daily life, adulting
    ...POSTS_BATCH_5,   // Main character energy, timeline chaos
    ...POSTS_BATCH_6,   // Unhinged energy, absurdist humor
    ...POSTS_BATCH_7,   // Food takes, debates
    ...POSTS_BATCH_8,   // Dating/relationships
    ...POSTS_BATCH_9,   // Wholesome content
    ...POSTS_BATCH_10,  // Gaming culture
    ...POSTS_BATCH_11,  // Work/office culture
    ...POSTS_BATCH_12   // Pop culture, movies/TV
];

// Log total posts on import (dev only)
console.log(`Loaded ${POSTS.length} posts for typing`);

/**
 * Get posts by category
 */
export function getPostsByCategory(category) {
    return POSTS.filter(p => p.category === category);
}

/**
 * Get random post
 */
export function getRandomPost() {
    return POSTS[Math.floor(Math.random() * POSTS.length)];
}

/**
 * Get post by difficulty (text length)
 */
export function getPostByDifficulty(maxLength) {
    const filtered = POSTS.filter(p => p.text.length <= maxLength);
    if (filtered.length === 0) return POSTS[0];
    return filtered[Math.floor(Math.random() * filtered.length)];
}
