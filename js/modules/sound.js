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
    keystroke: { type: 'synth', frequency: 800, duration: 0.05, wave: 'square', volume: 0.12 },
    error: { type: 'synth', frequency: 200, duration: 0.1, wave: 'sawtooth' },
    complete: { type: 'synth', frequency: [400, 600, 800], duration: 0.15, wave: 'sine' },
    perfect: { type: 'synth', frequency: [500, 700, 900, 1100], duration: 0.2, wave: 'sine' },
    purchase: { type: 'synth', frequency: [300, 500], duration: 0.1, wave: 'square' },
    upgrade: { type: 'synth', frequency: [400, 600, 800, 1000], duration: 0.25, wave: 'sine' },
    premium: { type: 'synth', frequency: [500, 700, 900, 1100, 1300], duration: 0.4, wave: 'sine' },
    viral: { type: 'synth', frequency: [300, 400, 500, 600, 700, 800], duration: 0.5, wave: 'sine' },
    achievement: { type: 'synth', frequency: [600, 800, 1000], duration: 0.3, wave: 'triangle' },
    kaching: { type: 'custom' }, // Special kaching sound for balloon pop
    monsterHit: { type: 'custom' }, // Slashing impact sound
    monsterDeath: { type: 'custom' } // Death explosion sound
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
    // Apply sound-specific volume if defined, otherwise use base reduction
    const soundVolume = sound.volume !== undefined ? sound.volume : 0.3;
    gainNode.gain.value = volume * soundVolume;

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
        // Clean up after oscillator ends to prevent memory leaks
        oscillator.onended = () => {
            oscillator.disconnect();
            envelope.disconnect();
        };
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
 * Creates stronger feeling of anticipation as you near completion
 * @param {number} progress - 0 to 1, how far through the post
 */
export function playAnticipationKeystroke(progress) {
    const state = State.getState();
    if (!state.soundEnabled) return;

    // Use quadratic easing to make anticipation build more dramatically at the end
    const easedProgress = progress * progress;

    // Base pitch increases from 0.5 to 1.6 as progress increases (wider range)
    const basePitch = 0.5 + (easedProgress * 1.1);

    // Add slight variation (less variation at the end for cleaner climax)
    const pitchVariation = 0.08 * (1 - progress * 0.5);

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

/**
 * Play KACHING cash register sound - super rewarding for balloon pop!
 */
export function playKachingSound() {
    const state = State.getState();
    if (!state.soundEnabled) return;

    if (!audioContext) {
        initAudioContext();
        if (!audioContext) return;
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const volume = state.volume * 0.6;
    const now = audioContext.currentTime;

    // Create master gain for this sound
    const gainNode = audioContext.createGain();
    gainNode.connect(masterGain);
    gainNode.gain.value = volume;

    // Cash register "ka-" part - quick metallic hit
    const kaGain = audioContext.createGain();
    kaGain.connect(gainNode);
    kaGain.gain.setValueAtTime(0.8, now);
    kaGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    const kaOsc1 = audioContext.createOscillator();
    kaOsc1.type = 'square';
    kaOsc1.frequency.value = 1200;
    kaOsc1.connect(kaGain);
    kaOsc1.start(now);
    kaOsc1.stop(now + 0.1);
    kaOsc1.onended = () => { kaOsc1.disconnect(); };

    const kaOsc2 = audioContext.createOscillator();
    kaOsc2.type = 'triangle';
    kaOsc2.frequency.value = 2400;
    kaOsc2.connect(kaGain);
    kaOsc2.start(now);
    kaOsc2.stop(now + 0.08);
    kaOsc2.onended = () => { kaOsc2.disconnect(); kaGain.disconnect(); };

    // "-CHING!" part - bright, shimmery coin sound
    const chingStart = now + 0.08;
    const chingFreqs = [2500, 3000, 3500, 4000];

    chingFreqs.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const env = audioContext.createGain();
        env.connect(gainNode);

        const noteStart = chingStart + i * 0.01;
        env.gain.setValueAtTime(0, noteStart);
        env.gain.linearRampToValueAtTime(0.4, noteStart + 0.01);
        env.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.5);

        osc.connect(env);
        osc.start(noteStart);
        osc.stop(noteStart + 0.5);
        osc.onended = () => { osc.disconnect(); env.disconnect(); };
    });

    // Add some shimmer/sparkle effect
    for (let i = 0; i < 5; i++) {
        const sparkleOsc = audioContext.createOscillator();
        sparkleOsc.type = 'sine';
        sparkleOsc.frequency.value = 3000 + Math.random() * 2000;

        const sparkleEnv = audioContext.createGain();
        sparkleEnv.connect(gainNode);

        const sparkleStart = chingStart + 0.1 + i * 0.05;
        sparkleEnv.gain.setValueAtTime(0, sparkleStart);
        sparkleEnv.gain.linearRampToValueAtTime(0.15, sparkleStart + 0.01);
        sparkleEnv.gain.exponentialRampToValueAtTime(0.01, sparkleStart + 0.15);

        sparkleOsc.connect(sparkleEnv);
        sparkleOsc.start(sparkleStart);
        sparkleOsc.stop(sparkleStart + 0.2);
        sparkleOsc.onended = () => { sparkleOsc.disconnect(); sparkleEnv.disconnect(); };
    }

    // Coin drop/clink sounds
    const coinFreqs = [1800, 2200, 2600, 2000, 2400];
    coinFreqs.forEach((freq, i) => {
        const coinOsc = audioContext.createOscillator();
        coinOsc.type = 'triangle';
        coinOsc.frequency.value = freq;

        const coinEnv = audioContext.createGain();
        coinEnv.connect(gainNode);

        const coinStart = now + 0.15 + i * 0.06;
        coinEnv.gain.setValueAtTime(0, coinStart);
        coinEnv.gain.linearRampToValueAtTime(0.25, coinStart + 0.005);
        coinEnv.gain.exponentialRampToValueAtTime(0.01, coinStart + 0.1);

        coinOsc.connect(coinEnv);
        coinOsc.start(coinStart);
        coinOsc.stop(coinStart + 0.12);
        coinOsc.onended = () => { coinOsc.disconnect(); coinEnv.disconnect(); };
    });
}

/**
 * Play satisfying SLASH/HIT sound for monster attacks
 * Inspired by Clicker Heroes impact sounds
 */
export function playMonsterHitSound() {
    const state = State.getState();
    if (!state.soundEnabled) return;

    if (!audioContext) {
        initAudioContext();
        if (!audioContext) return;
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const volume = state.volume * 0.5;
    const now = audioContext.currentTime;

    // Create master gain
    const gainNode = audioContext.createGain();
    gainNode.connect(masterGain);
    gainNode.gain.value = volume;

    // SLASH sound - quick descending noise burst
    const slashDuration = 0.08;

    // White noise for the "whoosh" of the slash
    const bufferSize = audioContext.sampleRate * slashDuration;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // High-pass filter for sharp slash sound
    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 2000;
    highpass.Q.value = 1;

    // Bandpass for that "swoosh" character
    const bandpass = audioContext.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(4000, now);
    bandpass.frequency.exponentialRampToValueAtTime(800, now + slashDuration);
    bandpass.Q.value = 2;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.8, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + slashDuration);

    noiseSource.connect(highpass);
    highpass.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(gainNode);
    noiseSource.start(now);
    noiseSource.stop(now + slashDuration);
    noiseSource.onended = () => {
        noiseSource.disconnect(); highpass.disconnect();
        bandpass.disconnect(); noiseGain.disconnect();
    };

    // IMPACT thud - low frequency punch
    const impactOsc = audioContext.createOscillator();
    impactOsc.type = 'sine';
    impactOsc.frequency.setValueAtTime(150, now);
    impactOsc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

    const impactGain = audioContext.createGain();
    impactGain.gain.setValueAtTime(0.6, now);
    impactGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    impactOsc.connect(impactGain);
    impactGain.connect(gainNode);
    impactOsc.start(now);
    impactOsc.stop(now + 0.12);
    impactOsc.onended = () => { impactOsc.disconnect(); impactGain.disconnect(); };

    // Add a sharp "crack" for satisfying hit
    const crackOsc = audioContext.createOscillator();
    crackOsc.type = 'square';
    crackOsc.frequency.setValueAtTime(800, now);
    crackOsc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

    const crackGain = audioContext.createGain();
    crackGain.gain.setValueAtTime(0.4, now);
    crackGain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

    crackOsc.connect(crackGain);
    crackGain.connect(gainNode);
    crackOsc.start(now);
    crackOsc.stop(now + 0.05);
    crackOsc.onended = () => { crackOsc.disconnect(); crackGain.disconnect(); };
}

/**
 * Play monster death explosion sound - super satisfying SQUISH!
 */
export function playMonsterDeathSound() {
    const state = State.getState();
    if (!state.soundEnabled) return;

    if (!audioContext) {
        initAudioContext();
        if (!audioContext) return;
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const volume = state.volume * 0.7;
    const now = audioContext.currentTime;

    const gainNode = audioContext.createGain();
    gainNode.connect(masterGain);
    gainNode.gain.value = volume;

    // SQUISH sound - wet, satisfying pop
    const squishOsc = audioContext.createOscillator();
    squishOsc.type = 'sine';
    squishOsc.frequency.setValueAtTime(400, now);
    squishOsc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

    const squishGain = audioContext.createGain();
    squishGain.gain.setValueAtTime(1, now);
    squishGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    squishOsc.connect(squishGain);
    squishGain.connect(gainNode);
    squishOsc.start(now);
    squishOsc.stop(now + 0.2);
    squishOsc.onended = () => { squishOsc.disconnect(); squishGain.disconnect(); };

    // Pop/burst sound - higher pitch
    const popOsc = audioContext.createOscillator();
    popOsc.type = 'triangle';
    popOsc.frequency.setValueAtTime(600, now);
    popOsc.frequency.exponentialRampToValueAtTime(100, now + 0.08);

    const popGain = audioContext.createGain();
    popGain.gain.setValueAtTime(0.8, now);
    popGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    popOsc.connect(popGain);
    popGain.connect(gainNode);
    popOsc.start(now);
    popOsc.stop(now + 0.12);
    popOsc.onended = () => { popOsc.disconnect(); popGain.disconnect(); };

    // Splatter noise - wet explosion
    const bufferSize = audioContext.sampleRate * 0.25;
    const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        // More aggressive decay for splatter effect
        const decay = Math.pow(1 - i / bufferSize, 1.5);
        output[i] = (Math.random() * 2 - 1) * decay;
    }

    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // Low-pass for wet, blobby sound
    const wetFilter = audioContext.createBiquadFilter();
    wetFilter.type = 'lowpass';
    wetFilter.frequency.setValueAtTime(3000, now);
    wetFilter.frequency.exponentialRampToValueAtTime(500, now + 0.2);
    wetFilter.Q.value = 2;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    noiseSource.connect(wetFilter);
    wetFilter.connect(noiseGain);
    noiseGain.connect(gainNode);
    noiseSource.start(now);
    noiseSource.stop(now + 0.25);
    noiseSource.onended = () => {
        noiseSource.disconnect(); wetFilter.disconnect(); noiseGain.disconnect();
    };

    // EXPLOSION boom underneath
    const boomOsc = audioContext.createOscillator();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(120, now + 0.02);
    boomOsc.frequency.exponentialRampToValueAtTime(25, now + 0.25);

    const boomGain = audioContext.createGain();
    boomGain.gain.setValueAtTime(0.7, now + 0.02);
    boomGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    boomOsc.connect(boomGain);
    boomGain.connect(gainNode);
    boomOsc.start(now + 0.02);
    boomOsc.stop(now + 0.3);
    boomOsc.onended = () => { boomOsc.disconnect(); boomGain.disconnect(); };

    // Victory fanfare - ascending chime
    const chimeFreqs = [600, 800, 1000, 1200, 1500];
    chimeFreqs.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const env = audioContext.createGain();
        env.connect(gainNode);

        const noteStart = now + 0.08 + i * 0.025;
        env.gain.setValueAtTime(0, noteStart);
        env.gain.linearRampToValueAtTime(0.35, noteStart + 0.01);
        env.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.25);

        osc.connect(env);
        osc.start(noteStart);
        osc.stop(noteStart + 0.3);
        osc.onended = () => { osc.disconnect(); env.disconnect(); };
    });

    // Coin explosion sounds - lots of coins!
    for (let i = 0; i < 8; i++) {
        const coinOsc = audioContext.createOscillator();
        coinOsc.type = 'triangle';
        coinOsc.frequency.value = 1800 + Math.random() * 1500;

        const coinGain = audioContext.createGain();
        coinGain.connect(gainNode);

        const coinStart = now + 0.1 + i * 0.04;
        coinGain.gain.setValueAtTime(0, coinStart);
        coinGain.gain.linearRampToValueAtTime(0.25, coinStart + 0.008);
        coinGain.gain.exponentialRampToValueAtTime(0.01, coinStart + 0.1);

        coinOsc.connect(coinGain);
        coinOsc.start(coinStart);
        coinOsc.stop(coinStart + 0.12);
        coinOsc.onended = () => { coinOsc.disconnect(); coinGain.disconnect(); };
    }

    // Extra sparkle/shimmer
    for (let i = 0; i < 4; i++) {
        const sparkleOsc = audioContext.createOscillator();
        sparkleOsc.type = 'sine';
        sparkleOsc.frequency.value = 3000 + Math.random() * 2000;

        const sparkleEnv = audioContext.createGain();
        sparkleEnv.connect(gainNode);

        const sparkleStart = now + 0.2 + i * 0.04;
        sparkleEnv.gain.setValueAtTime(0, sparkleStart);
        sparkleEnv.gain.linearRampToValueAtTime(0.15, sparkleStart + 0.01);
        sparkleEnv.gain.exponentialRampToValueAtTime(0.01, sparkleStart + 0.12);

        sparkleOsc.connect(sparkleEnv);
        sparkleOsc.start(sparkleStart);
        sparkleOsc.stop(sparkleStart + 0.15);
        sparkleOsc.onended = () => { sparkleOsc.disconnect(); sparkleEnv.disconnect(); };
    }
}

