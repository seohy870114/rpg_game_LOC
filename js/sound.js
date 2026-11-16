    /* ==========================================================================
       1. SYNTHESIZED WEB AUDIO ENGINE
       ========================================================================== */
    const Sound = {
      ctx: null,
      bgmEnabled: true,
      bgmTimer: null,
      currentTrack: null,

      init() {
        try {
          if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
              this.ctx = new AudioContext();
            }
          }
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
        } catch (e) {
          console.warn('Audio init warning:', e);
        }
      },

      playTone(freq, type, duration, gainLevel, slideFreq) {
        if (!this.ctx) return;
        try {
          gainLevel = gainLevel || 0.1;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          if (slideFreq) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(10, slideFreq), this.ctx.currentTime + duration);
          }
          gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
      },

      sfxHit() {
        this.init();
        this.playTone(180, 'sawtooth', 0.15, 0.25, 40);
      },
      sfxSlash() {
        this.init();
        this.playTone(480, 'triangle', 0.12, 0.22, 120);
      },
      sfxCrit() {
        this.init();
        this.playTone(600, 'sawtooth', 0.25, 0.35, 80);
      },
      sfxMagic() {
        this.init();
        this.playTone(320, 'sine', 0.35, 0.25, 880);
      },
      sfxHeal() {
        this.init();
        this.playTone(400, 'sine', 0.12, 0.2);
        setTimeout(() => this.playTone(600, 'sine', 0.18, 0.2), 90);
        setTimeout(() => this.playTone(900, 'sine', 0.3, 0.2), 200);
      },
      sfxLevelUp() {
        this.init();
        const notes = [261.6, 329.6, 392.0, 523.2, 659.2, 783.9, 1046.5];
        notes.forEach((f, i) => {
          setTimeout(() => this.playTone(f, 'triangle', 0.22, 0.22), i * 80);
        });
      },
      sfxCoin() {
        this.init();
        this.playTone(987.77, 'sine', 0.08, 0.15);
        setTimeout(() => this.playTone(1318.51, 'sine', 0.18, 0.15), 60);
      },
      sfxDialogue() {
        this.init();
        this.playTone(280 + Math.random() * 90, 'square', 0.04, 0.04);
      },

      toggleBgm() {
        this.init();
        this.bgmEnabled = !this.bgmEnabled;
        const btn = document.getElementById('audio-toggle-btn');
        if (this.bgmEnabled) {
          btn.innerText = '🎵 BGM: 켬';
          this.playBGM(this.currentTrack || 'town');
        } else {
          btn.innerText = '🔇 BGM: 끔';
          this.stopBGM();
        }
      },

      playBGM(track) {
        this.currentTrack = track;
        if (!this.bgmEnabled) return;
        this.init();
        this.stopBGM();

        let notes = [];
        let tempo = 220;

        if (track === 'town') {
          notes = [261, 0, 329, 392, 523, 0, 392, 0, 440, 0, 392, 329, 293, 0, 0, 0,
                   261, 0, 329, 392, 523, 587, 523, 0, 440, 523, 392, 0, 261, 0, 0, 0];
          tempo = 230;
        } else if (track === 'forest') {
          notes = [220, 0, 261, 293, 329, 0, 293, 261, 196, 0, 220, 0, 246, 0, 0, 0,
                   220, 261, 329, 392, 440, 0, 392, 329, 293, 329, 261, 0, 220, 0, 0, 0];
          tempo = 210;
        } else if (track === 'cave') {
          notes = [130, 0, 164, 0, 196, 0, 185, 0, 130, 0, 155, 0, 146, 0, 123, 0];
          tempo = 260;
        } else if (track === 'swamp') {
          notes = [146, 0, 174, 207, 196, 0, 174, 0, 138, 0, 164, 0, 130, 0, 0, 0];
          tempo = 250;
        } else if (track === 'snow') {
          notes = [329, 392, 493, 0, 440, 392, 329, 0, 293, 329, 392, 0, 261, 0, 0, 0];
          tempo = 220;
        } else if (track === 'volcano') {
          notes = [110, 130, 110, 146, 110, 130, 98, 110, 123, 110, 130, 146, 164, 0, 0, 0];
          tempo = 160;
        } else if (track === 'battle') {
          notes = [164, 164, 329, 164, 174, 164, 349, 164, 196, 196, 392, 196, 220, 0, 207, 0,
                   164, 164, 329, 164, 174, 164, 349, 164, 246, 220, 196, 174, 164, 0, 0, 0];
          tempo = 140;
        } else if (track === 'boss') {
          notes = [110, 110, 220, 110, 123, 110, 246, 110, 130, 110, 261, 110, 146, 130, 123, 110,
                   98, 98, 196, 98, 110, 98, 220, 98, 116, 110, 98, 87, 110, 0, 0, 0];
          tempo = 125;
        }

        let step = 0;
        this.bgmTimer = setInterval(() => {
          if (!this.bgmEnabled) return;
          const freq = notes[step % notes.length];
          if (freq > 0) {
            this.playTone(freq, 'triangle', tempo / 1000 * 0.85, 0.045);
          }
          step++;
        }, tempo);
      },

      stopBGM() {
        if (this.bgmTimer) {
          clearInterval(this.bgmTimer);
          this.bgmTimer = null;
        }
      }
    };
