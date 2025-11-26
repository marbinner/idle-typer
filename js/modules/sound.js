/**
 * Sound Module
 * Web Audio API based sound system
 */

import * as State from '../state.js';

// Audio context
let audioContext = null;
let masterGain = null;

// Sound buffers cache
const soundBuffers = new Map();

// Sound definitions (will generate programmatically)
const SOUNDS = {
    keystroke: { type: 'synth', frequency: 800, duration: 0.05, wave: 'square' },
    error: { type: 'synth', frequency: 200, duration: 0.1, wave: 'sawtooth' },
    complete: { type: 'synth', frequency: [400, 600, 800], duration: 0.15, wave: 'sine' },
    perfect: { type: 'synth', frequency: [500, 700, 900, 1100], duration: 0.2, wave: 'sine' },
    purchase: { type: 'synth', frequency: [300, 500], duration: 0.1, wave: 'square' },
    upgrade: { type: 'synth', frequency: [400, 600, 800, 1000], duration: 0.25, wave: 'sine' },
    premium: { type: 'synth', frequency: [500, 700, 900, 1100, 1300], duration: 0.4, wave: 'sine' },
    viral: { type: 'synth', frequency: [300, 400, 500, 600, 700, 800], duration: 0.5, wave: 'sine' },
    achievement: { type: 'synth', frequency: [600, 800, 1000], duration: 0.3, wave: 'triangle' }
};

/**
 * Initialize the sound system
 */
export async function initSound() {
    try {
        // Create audio context on first user interaction
        document.addEventListener('click', initAudioContext, { once: true });
        document.addEventListener('keydown', initAudioContext, { once: true });

        console.log('Sound system ready (waiting for user interaction)');
    } catch (error) {
        console.warn('Failed to initialize sound:', error);
    }
}

/**
 * Initialize audio context (must be called after user interaction)
 */
function initAudioContext() {
    if (audioContext) return;

    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioContext.createGain();
        masterGain.connect(audioContext.destination);

        // Set initial volume
        const state = State.getState();
        masterGain.gain.value = state.volume;

        console.log('Audio context initialized');
    } catch (error) {
        console.warn('Failed to create audio context:', error);
    }
}

/**
 * Play a sound effect
 */
export function playSound(soundId, options = {}) {
    const state = State.getState();

    // Check if sound is enabled
    if (!state.soundEnabled) return;

    // Ensure audio context exists
    if (!audioContext) {
        initAudioContext();
        if (!audioContext) return;
    }

    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const sound = SOUNDS[soundId];
    if (!sound) {
        console.warn(`Sound not found: ${soundId}`);
        return;
    }

    // Generate and play the sound
    if (sound.type === 'synth') {
        playSynthSound(sound, options);
    }
}

/**
 * Play a synthesized sound
 */
function playSynthSound(sound, options = {}) {
    const state = State.getState();
    const volume = state.volume * (options.volume || 1);

    // Create gain node for this sound
    const gainNode = audioContext.createGain();
    gainNode.connect(masterGain);
    gainNode.gain.value = volume * 0.3; // Base volume reduction

    // Handle pitch variation
    let pitchMult = 1;
    if (options.pitchVariation) {
        pitchMult = 1 + (Math.random() - 0.5) * options.pitchVariation;
    }
    if (options.pitch) {
        pitchMult *= options.pitch;
    }

    const frequencies = Array.isArray(sound.frequency) ? sound.frequency : [sound.frequency];
    const duration = sound.duration;
    const now = audioContext.currentTime;

    frequencies.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        oscillator.type = sound.wave;
        oscillator.frequency.value = freq * pitchMult;

        // Create envelope
        const envelope = audioContext.createGain();
        envelope.connect(gainNode);

        // Stagger notes for arpeggio effect
        const noteStart = now + i * 0.05;
        const noteEnd = noteStart + duration;

        // Attack
        envelope.gain.setValueAtTime(0, noteStart);
        envelope.gain.linearRampToValueAtTime(1, noteStart + 0.01);

        // Decay and release
        envelope.gain.linearRampToValueAtTime(0.3, noteStart + duration * 0.3);
        envelope.gain.linearRampToValueAtTime(0, noteEnd);

        oscillator.connect(envelope);
        oscillator.start(noteStart);
        oscillator.stop(noteEnd + 0.1);
    });
}

/**
 * Play keystroke with combo-based pitch
 */
export function playKeystrokeWithCombo(combo) {
    const basePitch = 0.8;
    const maxPitch = 1.5;
    const pitch = Math.min(basePitch + combo * 0.02, maxPitch);

    playSound('keystroke', { pitch, pitchVariation: 0.05 });
}

/**
 * Set master volume
 */
export function setVolume(volume) {
    if (masterGain) {
        masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
    State.updateState({ volume }, true);
}

/**
 * Toggle sound on/off
 */
export function toggleSound() {
    const state = State.getState();
    State.updateState({ soundEnabled: !state.soundEnabled });
    return !state.soundEnabled;
}

/**
 * Check if sound is enabled
 */
export function isSoundEnabled() {
    return State.getValue('soundEnabled');
}

/**
 * Play anticipation keystroke - pitch increases based on progress
 * @param {number} progress - 0 to 1, how far through the post
 */
export function playAnticipationKeystroke(progress) {
    const state = State.getState();
    if (!state.soundEnabled) return;

    // Base pitch increases from 0.7 to 1.3 as progress increases
    const basePitch = 0.7 + (progress * 0.6);

    // Add slight variation
    const pitchVariation = 0.05;

    playSound('keystroke', { pitch: basePitch, pitchVariation });
}

/**
 * Play completion climax sound
 */
export function playCompletionClimax() {
    const state = State.getState();
    if (!state.soundEnabled) return;

    if (!audioContext) {
        initAudioContext();
        if (!audioContext) return;
    }

    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const volume = state.volume * 0.5;
    const now = audioContext.currentTime;

    // Create gain node
    const gainNode = audioContext.createGain();
    gainNode.connect(masterGain);
    gainNode.gain.value = volume;

    // Rising arpeggio climax
    const frequencies = [400, 500, 600, 700, 800, 1000, 1200];
    const duration = 0.08;

    frequencies.forEach((freq, i) => {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = freq;

        const envelope = audioContext.createGain();
        envelope.connect(gainNode);

        const noteStart = now + i * 0.03;
        const noteEnd = noteStart + duration * (i === frequencies.length - 1 ? 2 : 1);

        envelope.gain.setValueAtTime(0, noteStart);
        envelope.gain.linearRampToValueAtTime(0.8, noteStart + 0.01);
        envelope.gain.linearRampToValueAtTime(0.3, noteStart + duration * 0.5);
        envelope.gain.linearRampToValueAtTime(0, noteEnd);

        oscillator.connect(envelope);
        oscillator.start(noteStart);
        oscillator.stop(noteEnd + 0.1);
    });

    // Final chord
    const chordStart = now + frequencies.length * 0.03;
    const chordFreqs = [800, 1000, 1200, 1600];
    chordFreqs.forEach(freq => {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = freq;

        const envelope = audioContext.createGain();
        envelope.connect(gainNode);

        envelope.gain.setValueAtTime(0, chordStart);
        envelope.gain.linearRampToValueAtTime(0.5, chordStart + 0.02);
        envelope.gain.linearRampToValueAtTime(0, chordStart + 0.4);

        oscillator.connect(envelope);
        oscillator.start(chordStart);
        oscillator.stop(chordStart + 0.5);
    });
}

