    /* ==========================================================================
       8. INPUT CONTROLLER
       ========================================================================== */
    const Input = {
      keys: {},

      init() {
        window.addEventListener('keydown', e => {
          this.keys[e.key] = true;

          if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
          }

          if (e.key === ' ' || e.key === 'Enter') {
            this.handleInteraction();
          }

          if (e.key === 'Escape') {
            Game.closeOverlays();
          }
        });

        window.addEventListener('keyup', e => {
          this.keys[e.key] = false;
        });

        let lastMove = 0;
        setInterval(() => {
          if (Battle.active || Game.dialogueActive || Game.overlayActive || Game.inTitleScreen) return;

          const now = Date.now();
          if (now - lastMove < 140) return;

          let dx = 0;
          let dy = 0;

          if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) { dy = -1; Player.facing = 'up'; }
          else if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) { dy = 1; Player.facing = 'down'; }
          else if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) { dx = -1; Player.facing = 'left'; }
          else if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) { dx = 1; Player.facing = 'right'; }

          if (dx !== 0 || dy !== 0) {
            Game.tryMovePlayer(dx, dy);
            lastMove = now;
          }
        }, 25);
      },

      virtualKey(key, isDown) {
        this.keys[key] = isDown;
      },

      virtualInteract() {
        this.handleInteraction();
      },

      handleInteraction() {
        if (Game.inTitleScreen) {
          Game.startNewGame();
          return;
        }

        if (Game.dialogueActive) {
          Game.advanceDialogue();
          return;
        }

        if (Battle.active || Game.overlayActive) return;

        let fx = Player.x;
        let fy = Player.y;
        if (Player.facing === 'up') fy--;
        if (Player.facing === 'down') fy++;
        if (Player.facing === 'left') fx--;
        if (Player.facing === 'right') fx++;

        Game.interactWithTile(fx, fy);
      }
    };
