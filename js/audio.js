// Audio Manager
class AudioManager {
    constructor() {
        this.bgMusic = document.getElementById('bg-music');
        this.sliceSound = document.getElementById('slice-sound');
        this.perfectSound = document.getElementById('perfect-sound');

        this.musicToggle = document.getElementById('music-toggle');
        this.soundToggle = document.getElementById('sound-toggle');

        this.musicEnabled = false;
        this.soundEnabled = false;
        this.audioContextInitialized = false;
        this.generatedMusicPlaying = false;

        this.setupControls();
        this.loadSettings();
        this.initializeAudioContext();
    }

    initializeAudioContext() {
        // Initialize audio context on first user interaction
        const initAudio = () => {
            if (!this.audioContextInitialized) {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    // Resume audio context (required by some browsers)
                    if (audioContext.state === 'suspended') {
                        audioContext.resume();
                    }
                    this.audioContextInitialized = true;
                    console.log('Audio context initialized');
                } catch (e) {
                    console.log('Could not initialize audio context:', e);
                }
                // Remove listener after first interaction
                document.removeEventListener('click', initAudio);
                document.removeEventListener('touchstart', initAudio);
            }
        };

        // Listen for first user interaction
        document.addEventListener('click', initAudio);
        document.addEventListener('touchstart', initAudio);
    }

    setupControls() {
        this.musicToggle.addEventListener('click', () => {
            this.toggleMusic();
        });

        this.soundToggle.addEventListener('click', () => {
            this.toggleSound();
        });
    }

    loadSettings() {
        try {
            const musicSetting = localStorage.getItem('musicEnabled');
            const soundSetting = localStorage.getItem('soundEnabled');

            if (musicSetting !== null) {
                this.musicEnabled = musicSetting === 'true';
            }
            if (soundSetting !== null) {
                this.soundEnabled = soundSetting === 'true';
            }

            this.updateButtons();
        } catch (e) {
            console.error('Failed to load audio settings:', e);
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('musicEnabled', this.musicEnabled.toString());
            localStorage.setItem('soundEnabled', this.soundEnabled.toString());
        } catch (e) {
            console.error('Failed to save audio settings:', e);
        }
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled) {
            this.playMusic();
        } else {
            this.stopMusic();
            this.generatedMusicPlaying = false;
        }
        this.updateButtons();
        this.saveSettings();
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.updateButtons();
        this.saveSettings();
    }

    updateButtons() {
        if (this.musicEnabled) {
            this.musicToggle.classList.remove('muted');
            this.musicToggle.textContent = '🎵';
        } else {
            this.musicToggle.classList.add('muted');
            this.musicToggle.textContent = '🔇';
        }

        if (this.soundEnabled) {
            this.soundToggle.classList.remove('muted');
            this.soundToggle.textContent = '🔊';
        } else {
            this.soundToggle.classList.add('muted');
            this.soundToggle.textContent = '🔇';
        }
    }

    playMusic() {
        if (!this.musicEnabled) return;

        if (this.bgMusic && this.bgMusic.readyState >= 2) {
            this.bgMusic.volume = 0.3;
            this.bgMusic.play().catch(e => {
                console.log('Background music file not available, generating music...');
                this.playGeneratedMusic();
            });
        } else {
            console.log('Background music file not found, generating music with Web Audio API...');
            this.playGeneratedMusic();
        }
    }

    playGeneratedMusic() {
        if (!this.musicEnabled || this.generatedMusicPlaying) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.generatedMusicPlaying = true;

            // Create a simple, pleasant background music loop
            const melodyNotes = [
                { freq: 523.25, time: 0, duration: 0.3 },    // C5
                { freq: 587.33, time: 0.3, duration: 0.3 },  // D5
                { freq: 659.25, time: 0.6, duration: 0.3 },  // E5
                { freq: 587.33, time: 0.9, duration: 0.3 },  // D5
                { freq: 523.25, time: 1.2, duration: 0.3 },  // C5
                { freq: 440.00, time: 1.5, duration: 0.3 },  // A4
                { freq: 493.88, time: 1.8, duration: 0.3 },  // B4
                { freq: 523.25, time: 2.1, duration: 0.5 },  // C5
            ];

            const playMelodyLoop = () => {
                if (!this.musicEnabled || !this.generatedMusicPlaying) return;

                const startTime = audioContext.currentTime;

                melodyNotes.forEach(note => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.frequency.value = note.freq;
                    oscillator.type = 'sine';

                    // Envelope
                    const noteStart = startTime + note.time;
                    const noteEnd = noteStart + note.duration;

                    gainNode.gain.setValueAtTime(0, noteStart);
                    gainNode.gain.linearRampToValueAtTime(0.1, noteStart + 0.05);
                    gainNode.gain.linearRampToValueAtTime(0.08, noteEnd - 0.05);
                    gainNode.gain.linearRampToValueAtTime(0, noteEnd);

                    oscillator.start(noteStart);
                    oscillator.stop(noteEnd);
                });

                // Schedule next loop
                setTimeout(() => {
                    if (this.musicEnabled && this.generatedMusicPlaying) {
                        playMelodyLoop();
                    }
                }, 2400); // Loop every 2.4 seconds
            };

            playMelodyLoop();

        } catch (e) {
            console.log('Could not generate background music:', e);
            this.generatedMusicPlaying = false;
        }
    }

    stopMusic() {
        if (this.bgMusic) {
            this.bgMusic.pause();
        }
        this.generatedMusicPlaying = false;
    }

    playSliceSound() {
        if (!this.soundEnabled) return;

        // Try to play MP3 file first
        if (this.sliceSound && this.sliceSound.readyState >= 2) {
            this.sliceSound.currentTime = 0;
            this.sliceSound.volume = 0.5;
            this.sliceSound.play().catch(e => {
                console.log('Slice sound file not available, using Web Audio API');
                this.playSliceBeep();
            });
        } else {
            // Fallback to generated sound
            this.playSliceBeep();
        }
    }

    playPerfectSound() {
        if (!this.soundEnabled) return;

        // Try to play MP3 file first
        if (this.perfectSound && this.perfectSound.readyState >= 2) {
            this.perfectSound.currentTime = 0;
            this.perfectSound.volume = 0.6;
            this.perfectSound.play().catch(e => {
                console.log('Perfect sound file not available, using Web Audio API');
                this.playPerfectBeep();
            });
        } else {
            // Fallback to generated sound
            this.playPerfectBeep();
        }
    }

    // Generate slice sound using Web Audio API
    playSliceBeep() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create a quick "swish" sound
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Sweep from high to low frequency for swish effect
            oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);

            oscillator.type = 'sine';

            // Quick fade out
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Web Audio API not available');
        }
    }

    // Generate perfect sound using Web Audio API
    playPerfectBeep() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create a pleasant "ding" sound
            const oscillator1 = audioContext.createOscillator();
            const oscillator2 = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator1.connect(gainNode);
            oscillator2.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Two harmonics for richer sound
            oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator2.frequency.setValueAtTime(1200, audioContext.currentTime);

            oscillator1.type = 'sine';
            oscillator2.type = 'sine';

            // Bell-like envelope
            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator1.start(audioContext.currentTime);
            oscillator2.start(audioContext.currentTime);
            oscillator1.stop(audioContext.currentTime + 0.5);
            oscillator2.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Web Audio API not available');
        }
    }

    // Fallback: Generate simple beep sounds using Web Audio API
    playBeep(frequency = 440, duration = 100) {
        if (!this.soundEnabled) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (e) {
            console.log('Web Audio API not available');
        }
    }
}
