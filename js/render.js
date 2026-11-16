    /* ==========================================================================
       6. GRAPHICS & CANVAS RENDER ENGINE
       ========================================================================== */
    const Render = {
      canvas: null,
      ctx: null,
      tileSize: 50,
      animFrame: 0,
      floatingTexts: [],
      particles: [],

      init() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        setInterval(() => this.animFrame++, 200);
      },

      fillEllipse(cx, cy, rx, ry) {
        const ctx = this.ctx;
        ctx.beginPath();
        if (ctx.ellipse) {
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        } else {
          ctx.arc(cx, cy, (rx + ry) / 2, 0, Math.PI * 2);
        }
        ctx.fill();
      },

      addFloatingText(text, x, y, color, isCrit) {
        this.floatingTexts.push({
          text,
          x,
          y,
          color: color || '#fff',
          isCrit: !!isCrit,
          alpha: 1.0,
          vy: isCrit ? -2.2 : -1.4,
          life: 45
        });
      },

      addParticle(x, y, color, vx, vy, size) {
        this.particles.push({
          x,
          y,
          color,
          vx: vx || (Math.random() - 0.5) * 4,
          vy: vy || (Math.random() - 0.5) * 4,
          size: size || 4,
          alpha: 1.0,
          life: 30
        });
      },

      triggerShake() {
        const container = document.getElementById('game-container');
        container.classList.remove('screen-shake');
        void container.offsetWidth;
        container.classList.add('screen-shake');
      },

      triggerFlash() {
        const flash = document.getElementById('flash-overlay');
        flash.style.opacity = '0.6';
        setTimeout(() => { flash.style.opacity = '0'; }, 80);
      },

      drawWorld() {
        if (!this.ctx) return;
        const map = Maps[Maps.current];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render Ground & Map Tiles
        for (let y = 0; y < map.height; y++) {
          for (let x = 0; x < map.width; x++) {
            const tile = map.grid[y][x];
            this.drawTile(tile, x * this.tileSize, y * this.tileSize);
          }
        }

        // Portals Glow Indicator
        map.portals.forEach(p => {
          this.ctx.fillStyle = `rgba(241, 196, 15, ${0.25 + Math.sin(this.animFrame * 0.4) * 0.15})`;
          this.ctx.fillRect(p.x * this.tileSize, p.y * this.tileSize, this.tileSize, this.tileSize);
          this.ctx.strokeStyle = '#f1c40f';
          this.ctx.strokeRect(p.x * this.tileSize + 2, p.y * this.tileSize + 2, this.tileSize - 4, this.tileSize - 4);
        });

        // NPCs
        map.npcs.forEach(npc => {
          this.drawCharacter(npc.sprite, npc.x * this.tileSize, npc.y * this.tileSize, 'down', npc.name);
        });

        // Player
        this.drawCharacter('hero', Player.x * this.tileSize, Player.y * this.tileSize, Player.facing, `${Player.name} (${Player.jobDisplayName})`);
      },

      drawTile(type, px, py) {
        const ctx = this.ctx;
        const ts = this.tileSize;

        switch (type) {
          case 0: // Lush Grass
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(px + 6, py + 10, 4, 3);
            ctx.fillRect(px + 28, py + 24, 4, 3);
            ctx.fillRect(px + 16, py + 38, 3, 3);
            // Flower dots
            if ((px + py) % 7 === 0) {
              ctx.fillStyle = '#f1c40f';
              ctx.fillRect(px + 36, py + 12, 3, 3);
            }
            break;
          case 1: // Cobblestone Road
            ctx.fillStyle = '#636e72';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
            ctx.fillStyle = '#95a5a6';
            ctx.fillRect(px + 4, py + 4, 18, 18);
            ctx.fillRect(px + 26, py + 4, 18, 18);
            ctx.fillRect(px + 4, py + 26, 18, 18);
            ctx.fillRect(px + 26, py + 26, 18, 18);
            ctx.strokeStyle = '#2d3436';
            ctx.strokeRect(px + 2, py + 2, ts - 4, ts - 4);
            break;
          case 2: // Animated Water
            ctx.fillStyle = '#1e3799';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#0984e3';
            ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
            const wave = (this.animFrame % 4) * 3;
            ctx.fillStyle = '#74b9ff';
            ctx.fillRect(px + 4 + wave, py + 14, 22, 3);
            ctx.fillRect(px + 20 - wave, py + 32, 20, 3);
            break;
          case 3: // Detailed Tree
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(px, py, ts, ts);
            // Trunk
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(px + 20, py + 24, 10, 26);
            // Foliage shadow & body
            ctx.fillStyle = '#145a32';
            ctx.beginPath();
            ctx.arc(px + 25, py + 22, 19, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1e8449';
            ctx.beginPath();
            ctx.arc(px + 25, py + 18, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#27ae60';
            ctx.beginPath();
            ctx.arc(px + 22, py + 14, 10, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 4: // House Wall
            ctx.fillStyle = '#f5f6fa';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#dcdde1';
            ctx.fillRect(px + 2, py + 36, ts - 4, 12);
            ctx.strokeStyle = '#718093';
            ctx.strokeRect(px + 2, py + 2, ts - 4, ts - 4);
            break;
          case 5: // House Roof
            ctx.fillStyle = '#b71540';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#e55039';
            ctx.fillRect(px + 3, py + 3, ts - 6, 12);
            ctx.fillRect(px + 3, py + 18, ts - 6, 12);
            break;
          case 6: // Door
            ctx.fillStyle = '#f5f6fa';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#4a235a';
            ctx.fillRect(px + 12, py + 10, 26, 40);
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(px + 30, py + 28, 4, 4);
            break;
          case 7: // Dungeon Stone Floor
            ctx.fillStyle = '#1e272e';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
            ctx.fillStyle = '#34495e';
            ctx.fillRect(px + 5, py + 5, ts - 10, 6);
            ctx.fillRect(px + 12, py + 22, ts - 18, 4);
            ctx.strokeStyle = '#0f141d';
            ctx.strokeRect(px + 2, py + 2, ts - 4, ts - 4);
            break;
          case 8: // Dungeon Wall
            ctx.fillStyle = '#0c1017';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#232b38';
            ctx.fillRect(px + 2, py + 2, ts - 4, 14);
            ctx.fillRect(px + 2, py + 18, ts - 4, 14);
            ctx.fillRect(px + 2, py + 34, ts - 4, 14);
            ctx.fillStyle = '#3d485c';
            ctx.fillRect(px + 4, py + 4, 8, 3);
            ctx.fillRect(px + 20, py + 20, 10, 3);
            break;
          case 9: // Healing Shrine
            ctx.fillStyle = '#1e272e';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#8e44ad';
            ctx.beginPath();
            ctx.arc(px + 25, py + 25, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(px + 25, py + 25, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText('✨', px + 17, py + 31);
            break;
          case 10: // Swamp Floor
            ctx.fillStyle = '#13231b';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#214631';
            ctx.fillRect(px + 3, py + 3, ts - 6, ts - 6);
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(px + 8, py + 14, 8, 4);
            ctx.fillRect(px + 24, py + 30, 6, 4);
            break;
          case 11: // Snow Ice Floor
            ctx.fillStyle = '#dff9fb';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#c7ecee';
            ctx.fillRect(px + 3, py + 3, ts - 6, ts - 6);
            ctx.fillStyle = '#7ed6df';
            ctx.fillRect(px + 12, py + 16, 16, 3);
            ctx.fillRect(px + 22, py + 32, 12, 3);
            break;
          case 12: // Lava Floor
            ctx.fillStyle = '#2b0903';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#c0392b';
            ctx.fillRect(px + 2, py + 2, ts - 4, ts - 4);
            ctx.fillStyle = '#e67e22';
            const lavaP = (this.animFrame % 3) * 2;
            ctx.fillRect(px + 6 + lavaP, py + 12, 16, 8);
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(px + 10 + lavaP, py + 14, 8, 4);
            break;
          case 13: // Olympus Golden Marble Floor
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(px, py, ts, ts);
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 2, py + 2, ts - 4, ts - 4);
            ctx.lineWidth = 1;
            ctx.fillStyle = '#ffeaa7';
            ctx.fillRect(px + 6, py + 6, ts - 12, ts - 12);
            // Center golden diamond
            ctx.fillStyle = '#f39c12';
            ctx.beginPath();
            ctx.moveTo(px + 25, py + 16);
            ctx.lineTo(px + 34, py + 25);
            ctx.lineTo(px + 25, py + 34);
            ctx.lineTo(px + 16, py + 25);
            ctx.fill();
            break;
          case 14: // Olympus Divine Pillar
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#f39c12';
            ctx.fillRect(px + 10, py + 4, 30, 42);
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(px + 14, py + 8, 22, 34);
            ctx.fillStyle = '#fff';
            ctx.fillRect(px + 8, py + 2, 34, 8);
            ctx.fillRect(px + 8, py + 40, 34, 8);
            break;
          case 15: // Olympus Celestial Sky & Clouds
            ctx.fillStyle = '#0c1b33';
            ctx.fillRect(px, py, ts, ts);
            ctx.fillStyle = '#1e3799';
            ctx.beginPath();
            ctx.arc(px + 25, py + 25, 20, 0, Math.PI * 2);
            ctx.fill();
            // Cloud puffs
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.beginPath();
            ctx.arc(px + 18, py + 28, 12, 0, Math.PI * 2);
            ctx.arc(px + 32, py + 28, 14, 0, Math.PI * 2);
            ctx.arc(px + 25, py + 20, 10, 0, Math.PI * 2);
            ctx.fill();
            // Starlight
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(px + 8, py + 8, 2, 2);
            ctx.fillRect(px + 40, py + 12, 2, 2);
            break;
        }
      },

      drawCharacter(sprite, px, py, facing, name) {
        const ctx = this.ctx;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        this.fillEllipse(px + 25, py + 45, 17, 6);

        if (sprite === 'hero') {
          const armorId = (Player.armor && (Player.armor.id || (typeof Player.armor === 'string' && Player.armor))) || 'armor_cloth';
          const leggingsId = (Player.leggings && (Player.leggings.id || (typeof Player.leggings === 'string' && Player.leggings))) || 'leggings_cloth';
          const weaponId = (Player.weapon && (Player.weapon.id || (typeof Player.weapon === 'string' && Player.weapon))) || 'sword_wood';
          const wingsId = (Player.wings && (Player.wings.id || (typeof Player.wings === 'string' && Player.wings))) || null;

          // 1. WINGS (흑룡의 날개 - 거대하고 위엄있는 암흑룡 날개)
          if (wingsId === 'wings_dragon') {
            const wingFlap = Math.sin(this.animFrame * 0.7) * 4;
            ctx.save();
            ctx.fillStyle = '#220033';
            ctx.strokeStyle = '#9b59b6';
            ctx.lineWidth = 1.5;

            // Left Dragon Wing
            ctx.beginPath();
            ctx.moveTo(px + 18, py + 22);
            ctx.lineTo(px - 14, py + 4 + wingFlap);
            ctx.lineTo(px - 6, py + 18 + wingFlap);
            ctx.lineTo(px - 16, py + 28 + wingFlap);
            ctx.lineTo(px + 16, py + 32);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Right Dragon Wing
            ctx.beginPath();
            ctx.moveTo(px + 32, py + 22);
            ctx.lineTo(px + 64, py + 4 + wingFlap);
            ctx.lineTo(px + 56, py + 18 + wingFlap);
            ctx.lineTo(px + 66, py + 28 + wingFlap);
            ctx.lineTo(px + 34, py + 32);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Violet flame spark from wings
            if (this.animFrame % 2 === 0) {
              ctx.fillStyle = '#a29bfe';
              ctx.fillRect(px - 10, py + 8 + wingFlap, 3, 3);
              ctx.fillRect(px + 60, py + 8 + wingFlap, 3, 3);
            }
            ctx.restore();
          }

          // 2. LEGGINGS (골드 / 서리 / 강철 / 수련자)
          if (leggingsId === 'leggings_gold') {
            ctx.fillStyle = '#f39c12';
            ctx.fillRect(px + 17, py + 36, 6, 9);
            ctx.fillRect(px + 27, py + 36, 6, 9);
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(px + 18, py + 37, 4, 8);
            ctx.fillRect(px + 28, py + 37, 4, 8);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 19, py + 38, 2, 3);
          } else if (leggingsId === 'leggings_frost') {
            ctx.fillStyle = '#0984e3';
            ctx.fillRect(px + 17, py + 36, 6, 9);
            ctx.fillRect(px + 27, py + 36, 6, 9);
            ctx.fillStyle = '#74b9ff';
            ctx.fillRect(px + 18, py + 37, 4, 8);
            ctx.fillRect(px + 28, py + 37, 4, 8);
            ctx.fillStyle = '#dff9fb';
            ctx.fillRect(px + 19, py + 38, 2, 3);
          } else if (leggingsId === 'leggings_iron') {
            ctx.fillStyle = '#636e72';
            ctx.fillRect(px + 17, py + 36, 6, 9);
            ctx.fillRect(px + 27, py + 36, 6, 9);
            ctx.fillStyle = '#b2bec3';
            ctx.fillRect(px + 18, py + 37, 4, 8);
            ctx.fillRect(px + 28, py + 37, 4, 8);
          } else {
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(px + 17, py + 36, 6, 9);
            ctx.fillRect(px + 27, py + 36, 6, 9);
            ctx.fillStyle = '#1e272e';
            ctx.fillRect(px + 17, py + 42, 6, 3);
            ctx.fillRect(px + 27, py + 42, 6, 3);
          }

          // 3. TORSO / CHEST ARMOR (골드 / 신갑 / 흑룡비늘 / 서리 / 마법로브 / 강철 / 가죽 / 기본)
          if (armorId === 'armor_gold_chest') {
            ctx.fillStyle = '#d35400';
            ctx.fillRect(px + 13, py + 18, 24, 19);
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(px + 14, py + 19, 22, 17);
            ctx.fillStyle = '#f39c12';
            ctx.fillRect(px + 18, py + 22, 14, 11);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 15, py + 20, 3, 14);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(px + 23, py + 25, 4, 4);
          } else if (armorId === 'armor_godly') {
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(px + 13, py + 18, 24, 19);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 14, py + 19, 22, 17);
            ctx.fillStyle = '#00d2d3';
            ctx.fillRect(px + 23, py + 24, 4, 4);
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(px + 12, py + 19, 3, 6);
            ctx.fillRect(px + 35, py + 19, 3, 6);
          } else if (armorId === 'armor_dragon_scale') {
            ctx.fillStyle = '#1e272e';
            ctx.fillRect(px + 13, py + 18, 24, 19);
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(px + 14, py + 19, 22, 17);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(px + 16, py + 23, 6, 2);
            ctx.fillRect(px + 28, py + 27, 6, 2);
            ctx.fillRect(px + 23, py + 25, 4, 4);
          } else if (armorId === 'armor_frost') {
            ctx.fillStyle = '#0984e3';
            ctx.fillRect(px + 13, py + 18, 24, 19);
            ctx.fillStyle = '#74b9ff';
            ctx.fillRect(px + 14, py + 19, 22, 17);
            ctx.fillStyle = '#dff9fb';
            ctx.fillRect(px + 16, py + 21, 18, 4);
            ctx.fillRect(px + 23, py + 26, 4, 6);
          } else if (armorId === 'robe_elemental') {
            ctx.fillStyle = '#341f97';
            ctx.fillRect(px + 13, py + 18, 24, 19);
            ctx.fillStyle = '#8e44ad';
            ctx.fillRect(px + 14, py + 19, 22, 17);
            ctx.fillStyle = '#00d2d3';
            ctx.fillRect(px + 18, py + 22, 14, 10);
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(px + 24, py + 26, 2, 4);
          } else if (armorId === 'armor_iron') {
            ctx.fillStyle = '#3d485c';
            ctx.fillRect(px + 13, py + 18, 24, 19);
            ctx.fillStyle = '#bdc3c7';
            ctx.fillRect(px + 14, py + 19, 22, 17);
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(px + 18, py + 23, 14, 8);
          } else if (armorId === 'armor_leather') {
            ctx.fillStyle = '#4e342e';
            ctx.fillRect(px + 13, py + 18, 24, 19);
            ctx.fillStyle = '#795548';
            ctx.fillRect(px + 14, py + 19, 22, 17);
            ctx.fillStyle = '#d35400';
            ctx.fillRect(px + 21, py + 25, 8, 3);
          } else {
            const jobColor = {
              adventurer: '#2980b9',
              검사: '#3498db',
              '탱커 기사': '#7f8c8d',
              전사: '#c0392b',
              도적: '#2c3e50',
              마법사: '#9b59b6',
              흑마법사: '#4a235a',
              힐러: '#f1c40f'
            }[Player.job] || '#2980b9';

            ctx.fillStyle = jobColor;
            ctx.fillRect(px + 14, py + 19, 22, 18);
            ctx.fillStyle = '#1e272e';
            ctx.fillRect(px + 14, py + 34, 22, 3);
          }

          // 4. HEAD / HAIR / FACE
          ctx.fillStyle = '#f39c12'; // Hair
          ctx.fillRect(px + 16, py + 6, 18, 14);
          ctx.fillStyle = '#ffeaa7'; // Skin
          ctx.fillRect(px + 18, py + 10, 14, 9);
          ctx.fillStyle = '#2d3436'; // Eyes
          ctx.fillRect(px + 20, py + 13, 2, 3);
          ctx.fillRect(px + 26, py + 13, 2, 3);

          // 5. HELM / CROWN / GOD HALO
          if (Player.isGod) {
            const haloP = Math.sin(this.animFrame * 0.9) * 2;
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.ellipse(px + 25, py + 2 + haloP, 14, 4, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#fff';
            ctx.fillRect(px + 24, py + haloP, 3, 3);
          } else if (armorId === 'armor_gold_chest') {
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(px + 17, py + 6, 16, 3);
          } else if (armorId === 'armor_godly') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 17, py + 6, 16, 3);
          }

          // 6. WEAPON VISUAL
          if (weaponId === 'weapon_chronos') {
            const pulse = (this.animFrame % 2) * 2;
            ctx.fillStyle = '#f39c12';
            ctx.fillRect(px + 34, py + 22, 8, 4);
            ctx.fillStyle = '#00d2d3';
            ctx.fillRect(px + 37, py + 4 - pulse, 5, 20);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 38, py + 6 - pulse, 3, 16);
            ctx.strokeStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(px + 38, py + 14 - pulse, 6, 0, Math.PI * 2);
            ctx.stroke();
          } else if (weaponId === 'sword_gold') {
            ctx.fillStyle = '#d35400';
            ctx.fillRect(px + 34, py + 22, 8, 4);
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(px + 36, py + 8, 4, 16);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 37, py + 10, 2, 10);
            if (this.animFrame % 2 === 0) {
              ctx.fillStyle = '#ffeaa7';
              ctx.fillRect(px + 38, py + 4, 2, 2);
            }
          } else if (weaponId === 'weapon_god_blade') {
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(px + 33, py + 20, 10, 4);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 36, py + 6, 4, 22);
            ctx.fillStyle = '#00d2d3';
            ctx.fillRect(px + 37, py + 8, 2, 18);
          } else if (weaponId === 'sword_dragon_slayer') {
            ctx.fillStyle = '#1e272e';
            ctx.fillRect(px + 33, py + 22, 10, 4);
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(px + 35, py + 6, 6, 22);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(px + 37, py + 8, 2, 18);
          } else if (weaponId === 'sword_flame') {
            ctx.fillStyle = '#d35400';
            ctx.fillRect(px + 34, py + 22, 8, 4);
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(px + 36, py + 8, 4, 18);
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(px + 37, py + 10, 2, 12);
          } else if (typeof weaponId === 'string' && (weaponId.startsWith('wand_') || weaponId.startsWith('staff_'))) {
            ctx.fillStyle = weaponId.includes('galaxy') ? '#1e272e' : '#795548';
            ctx.fillRect(px + 37, py + 12, 3, 24);
            const gemColor = weaponId.includes('galaxy') ? '#00d2d3' : weaponId.includes('archmage') ? '#e74c3c' : weaponId.includes('starlight') ? '#f1c40f' : '#9b59b6';
            ctx.fillStyle = gemColor;
            ctx.beginPath();
            ctx.arc(px + 38, py + 10, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 37, py + 9, 2, 2);
          } else if (weaponId === 'sword_holy_light' || weaponId.includes('cross') || weaponId.includes('saint') || weaponId.includes('genesis')) {
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(px + 33, py + 18, 10, 4);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 36, py + 8, 4, 22);
            ctx.fillStyle = '#ffeaa7';
            ctx.fillRect(px + 37, py + 10, 2, 14);
          } else if (weaponId.includes('dagger')) {
            ctx.fillStyle = weaponId.includes('assassin') ? '#8e44ad' : '#27ae60';
            ctx.fillRect(px + 36, py + 22, 3, 14);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 37, py + 24, 1, 8);
          } else if (weaponId.includes('axe')) {
            ctx.fillStyle = '#795548';
            ctx.fillRect(px + 36, py + 10, 3, 26);
            ctx.fillStyle = weaponId.includes('titan') ? '#e74c3c' : '#95a5a6';
            ctx.fillRect(px + 30, py + 8, 12, 8);
          } else if (weaponId === 'shield_bastion') {
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(px + 33, py + 14, 9, 20);
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(px + 35, py + 18, 5, 12);
          } else if (weaponId === 'scythe_death') {
            ctx.fillStyle = '#1e272e';
            ctx.fillRect(px + 37, py + 8, 3, 28);
            ctx.fillStyle = '#9b59b6';
            ctx.fillRect(px + 30, py + 6, 10, 4);
            ctx.fillRect(px + 28, py + 10, 4, 6);
          } else if (weaponId === 'sword_wood') {
            ctx.fillStyle = '#8d6e63';
            ctx.fillRect(px + 36, py + 14, 4, 22);
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(px + 34, py + 24, 8, 3);
          } else {
            ctx.fillStyle = '#ecf0f1';
            ctx.fillRect(px + 36, py + 12, 4, 24);
            ctx.fillStyle = '#7f8c8d';
            ctx.fillRect(px + 34, py + 24, 8, 3);
          }
        } else if (sprite === 'zeus') {
          // ★ 신계의 지배자: 번개의 신 제우스 (필드 스프라이트) ★
          const zPulse = Math.sin(this.animFrame * 0.8) * 3;
          // Cloud pedestal
          ctx.fillStyle = '#dcdde1';
          this.fillEllipse(px + 25, py + 42, 20, 8);
          ctx.fillStyle = '#ffffff';
          this.fillEllipse(px + 25, py + 39, 18, 6);
          // White & gold divine robe
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(px + 14, py + 18, 22, 22);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + 16, py + 19, 18, 20);
          // Muscular god skin
          ctx.fillStyle = '#ffeaa7';
          ctx.fillRect(px + 18, py + 8, 14, 12);
          // White flowing beard & hair
          ctx.fillStyle = '#f5f6fa';
          ctx.fillRect(px + 15, py + 6, 20, 6);
          ctx.fillRect(px + 18, py + 16, 14, 8);
          // Golden laurel crown
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(px + 16, py + 5, 18, 3);
          // Master Lightning Bolt in hand
          ctx.fillStyle = '#00d2d3';
          ctx.beginPath();
          ctx.moveTo(px + 38, py + 2 + zPulse);
          ctx.lineTo(px + 35, py + 18);
          ctx.lineTo(px + 40, py + 22);
          ctx.lineTo(px + 36, py + 38 + zPulse);
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.fillRect(px + 37, py + 14, 3, 6);
        } else if (sprite === 'elder') {
          ctx.fillStyle = '#8e44ad';
          ctx.fillRect(px + 14, py + 18, 22, 24);
          ctx.fillStyle = '#ecf0f1';
          ctx.fillRect(px + 16, py + 8, 18, 12);
        } else if (sprite === 'master') {
          ctx.fillStyle = '#d35400';
          ctx.fillRect(px + 14, py + 16, 22, 26);
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(px + 16, py + 6, 18, 12);
          ctx.fillStyle = '#2ecc71';
          ctx.fillRect(px + 35, py + 8, 4, 32);
        } else if (sprite === 'merchant') {
          ctx.fillStyle = '#e67e22';
          ctx.fillRect(px + 14, py + 20, 22, 22);
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(px + 12, py + 8, 26, 10);
        } else if (sprite === 'inn') {
          ctx.fillStyle = '#27ae60';
          ctx.fillRect(px + 14, py + 18, 22, 24);
          ctx.fillStyle = '#f5b041';
          ctx.fillRect(px + 16, py + 8, 18, 12);
        } else if (sprite === 'king_slime') {
          ctx.fillStyle = '#2ecc71';
          this.fillEllipse(px + 25, py + 26, 24, 18);
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(px + 18, py + 8, 14, 8);
        } else if (sprite === 'troll') {
          ctx.fillStyle = '#7f8c8d';
          this.fillEllipse(px + 25, py + 24, 22, 20);
          ctx.fillStyle = '#c0392b';
          ctx.fillRect(px + 20, py + 14, 10, 8);
        } else if (sprite === 'lich') {
          ctx.fillStyle = '#4a235a';
          this.fillEllipse(px + 25, py + 22, 20, 22);
          ctx.fillStyle = '#9b59b6';
          ctx.fillRect(px + 18, py + 10, 14, 8);
        } else if (sprite === 'wyrm') {
          ctx.fillStyle = '#7ed6df';
          this.fillEllipse(px + 25, py + 24, 26, 20);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + 16, py + 8, 18, 6);
        } else if (sprite === 'balrog') {
          ctx.fillStyle = '#c0392b';
          this.fillEllipse(px + 25, py + 24, 26, 22);
          ctx.fillStyle = '#f39c12';
          ctx.fillRect(px + 16, py + 6, 18, 10);
        } else if (sprite === 'dragon') {
          const pulse = (this.animFrame % 2) * 3;
          ctx.fillStyle = '#4a148c';
          ctx.beginPath();
          ctx.moveTo(px - 10 - pulse, py + 10);
          ctx.lineTo(px + 60 + pulse, py + 10);
          ctx.lineTo(px + 25, py + 45);
          ctx.fill();
          ctx.fillStyle = '#17202a';
          ctx.beginPath();
          ctx.arc(px + 25, py + 24, 20, 0, Math.PI * 2);
          ctx.fill();
        }

        // Name tag
        if (name) {
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          const textW = ctx.measureText(name).width + 8;
          ctx.fillRect(px + 25 - textW / 2, py - 6, textW, 14);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(name, px + 25, py + 5);
        }
      },

      drawBattleMonster(sprite) {
        const ctx = this.ctx;
        const cx = 580;
        const cy = 240;

        ctx.save();
        if (sprite === 'zeus') {
          // ★ [진 최종보스: 번개의 신 제우스 (200Lv) 고퀄리티 렌더링] ★
          const zf = (this.animFrame % 4);
          // Thunder Cloud Base
          ctx.fillStyle = '#2d3436';
          this.fillEllipse(cx, cy + 95, 110, 35);
          ctx.fillStyle = '#636e72';
          this.fillEllipse(cx, cy + 85, 95, 28);
          ctx.fillStyle = '#dfe6e9';
          this.fillEllipse(cx - 35, cy + 80, 45, 20);
          this.fillEllipse(cx + 35, cy + 80, 45, 20);

          // Divine Aura & Lighting Flash
          ctx.fillStyle = `rgba(0, 210, 211, ${0.15 + (zf * 0.08)})`;
          this.fillEllipse(cx, cy, 140, 130);

          // Zeus Body (Muscular God)
          ctx.fillStyle = '#ffeaa7';
          this.fillEllipse(cx, cy + 15, 65, 55); // Chest
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(cx - 40, cy + 25, 80, 45); // Golden Belt / Armor
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx - 35, cy + 30, 70, 40); // Divine white toga robe

          // Shoulders & Arms
          ctx.fillStyle = '#f39c12';
          ctx.fillRect(cx - 50, cy - 10, 20, 25); // Left pauldron
          ctx.fillRect(cx + 30, cy - 10, 20, 25); // Right pauldron
          ctx.fillStyle = '#ffeaa7';
          ctx.fillRect(cx - 58, cy + 10, 18, 40); // Left arm
          ctx.fillRect(cx + 40, cy + 5, 20, 42);  // Right arm raised

          // Zeus Head & Flowing White Mane
          ctx.fillStyle = '#f5f6fa';
          this.fillEllipse(cx, cy - 45, 48, 42); // Hair mane
          ctx.fillStyle = '#ffeaa7';
          this.fillEllipse(cx, cy - 40, 24, 22); // Face
          // White majestic beard
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(cx - 20, cy - 35);
          ctx.lineTo(cx + 20, cy - 35);
          ctx.lineTo(cx, cy - 5);
          ctx.closePath();
          ctx.fill();

          // Golden Laurel Crown
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(cx - 26, cy - 65, 52, 10);
          ctx.fillStyle = '#fff';
          ctx.fillRect(cx - 6, cy - 66, 12, 12);

          // Glowing Cyan God Eyes
          ctx.fillStyle = '#00d2d3';
          ctx.fillRect(cx - 14, cy - 42, 6, 6);
          ctx.fillRect(cx + 8, cy - 42, 6, 6);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx - 12, cy - 41, 3, 3);
          ctx.fillRect(cx + 10, cy - 41, 3, 3);

          // Master Bolt (Crackling Lightning Spear in Right Hand)
          ctx.strokeStyle = '#00d2d3';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(cx + 85, cy - 90);
          ctx.lineTo(cx + 60, cy - 20);
          ctx.lineTo(cx + 78, cy + 10);
          ctx.lineTo(cx + 50, cy + 90);
          ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.lineWidth = 1;

          // Electric Spark Arcs
          for (let i = 0; i < 4; i++) {
            const rx = cx + (Math.sin(this.animFrame + i) * 80);
            const ry = cy + (Math.cos(this.animFrame + i) * 70);
            ctx.fillStyle = '#00d2d3';
            ctx.fillRect(rx, ry, 4, 4);
          }
        } else if (sprite === 'slime') {
          ctx.fillStyle = '#2ecc71';
          this.fillEllipse(cx, cy, 60, 45);
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(cx - 18, cy - 8, 10, 0, Math.PI * 2); ctx.arc(cx + 18, cy - 8, 10, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#000';
          ctx.beginPath(); ctx.arc(cx - 16, cy - 8, 5, 0, Math.PI * 2); ctx.arc(cx + 20, cy - 8, 5, 0, Math.PI * 2); ctx.fill();
        } else if (sprite === 'king_slime') {
          ctx.fillStyle = '#27ae60';
          this.fillEllipse(cx, cy, 95, 75);
          ctx.fillStyle = '#f1c40f';
          ctx.beginPath();
          ctx.moveTo(cx - 40, cy - 50); ctx.lineTo(cx - 30, cy - 90); ctx.lineTo(cx, cy - 65);
          ctx.lineTo(cx + 30, cy - 90); ctx.lineTo(cx + 40, cy - 50); ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(cx - 25, cy - 10, 15, 0, Math.PI * 2); ctx.arc(cx + 25, cy - 10, 15, 0, Math.PI * 2); ctx.fill();
        } else if (sprite === 'goblin') {
          ctx.fillStyle = '#27ae60';
          this.fillEllipse(cx, cy, 55, 60);
          ctx.fillStyle = '#1e8449';
          ctx.beginPath(); ctx.moveTo(cx - 50, cy - 20); ctx.lineTo(cx - 80, cy - 50); ctx.lineTo(cx - 30, cy - 30); ctx.fill();
          ctx.beginPath(); ctx.moveTo(cx + 50, cy - 20); ctx.lineTo(cx + 80, cy - 50); ctx.lineTo(cx + 30, cy - 30); ctx.fill();
        } else if (sprite === 'wolf') {
          ctx.fillStyle = '#7f8c8d';
          this.fillEllipse(cx, cy, 75, 45);
          ctx.fillStyle = '#e74c3c';
          ctx.fillRect(cx - 30, cy - 10, 12, 6);
          ctx.fillRect(cx + 5, cy - 10, 12, 6);
        } else if (sprite === 'troll') {
          ctx.fillStyle = '#576574';
          this.fillEllipse(cx, cy, 90, 85);
          ctx.fillStyle = '#c0392b';
          ctx.fillRect(cx - 40, cy - 20, 80, 20);
          ctx.fillStyle = '#f39c12';
          ctx.fillRect(cx + 60, cy - 60, 25, 120);
        } else if (sprite === 'lich') {
          ctx.fillStyle = '#2c3e50';
          this.fillEllipse(cx, cy, 70, 95);
          ctx.fillStyle = '#9b59b6';
          ctx.beginPath(); ctx.arc(cx - 45, cy + 10, 25, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#e74c3c';
          ctx.fillRect(cx - 20, cy - 25, 12, 8); ctx.fillRect(cx + 8, cy - 25, 12, 8);
        } else if (sprite === 'wyrm') {
          ctx.fillStyle = '#48dbfb';
          this.fillEllipse(cx, cy, 110, 70);
          ctx.fillStyle = '#c8d6e5';
          ctx.beginPath(); ctx.moveTo(cx - 100, cy - 60); ctx.lineTo(cx, cy - 10); ctx.lineTo(cx + 100, cy - 60); ctx.fill();
        } else if (sprite === 'balrog') {
          ctx.fillStyle = '#c0392b';
          this.fillEllipse(cx, cy, 100, 95);
          ctx.fillStyle = '#f39c12';
          ctx.beginPath(); ctx.moveTo(cx - 70, cy - 70); ctx.lineTo(cx - 30, cy - 30); ctx.lineTo(cx + 70, cy - 70); ctx.fill();
        } else if (sprite === 'dragon') {
          ctx.fillStyle = '#17202a';
          ctx.beginPath(); ctx.moveTo(cx - 170, cy - 100); ctx.lineTo(cx + 170, cy - 100); ctx.lineTo(cx, cy + 100); ctx.fill();
          ctx.fillStyle = '#4a148c';
          this.fillEllipse(cx, cy, 95, 85);
          ctx.fillStyle = '#ff5722';
          ctx.beginPath(); ctx.arc(cx - 30, cy - 15, 12, 0, Math.PI * 2); ctx.arc(cx + 30, cy - 15, 12, 0, Math.PI * 2); ctx.fill();
          ctx.fillRect(cx - 25, cy + 25, 50, 15);
        } else {
          ctx.fillStyle = '#7f8c8d';
          this.fillEllipse(cx, cy, 65, 65);
        }
        ctx.restore();
      },

      drawBattlePlayer() {
        const ctx = this.ctx;
        const cx = 180;
        const cy = 290;

        const armorId = (Player.armor && (Player.armor.id || (typeof Player.armor === 'string' && Player.armor))) || 'armor_cloth';
        const leggingsId = (Player.leggings && (Player.leggings.id || (typeof Player.leggings === 'string' && Player.leggings))) || 'leggings_cloth';
        const weaponId = (Player.weapon && (Player.weapon.id || (typeof Player.weapon === 'string' && Player.weapon))) || 'sword_wood';
        const wingsId = (Player.wings && (Player.wings.id || (typeof Player.wings === 'string' && Player.wings))) || null;

        ctx.save();

        // 1. WINGS (전투 대형 날개)
        if (wingsId === 'wings_dragon') {
          const flap = Math.sin(Date.now() / 250) * 8;
          ctx.fillStyle = '#1a0026';
          ctx.strokeStyle = '#8e44ad';
          ctx.lineWidth = 3;

          // Left Giant Wing
          ctx.beginPath();
          ctx.moveTo(cx - 20, cy - 20);
          ctx.lineTo(cx - 140, cy - 90 + flap);
          ctx.lineTo(cx - 100, cy - 20 + flap);
          ctx.lineTo(cx - 130, cy + 30 + flap);
          ctx.lineTo(cx - 30, cy + 20);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Right Giant Wing
          ctx.beginPath();
          ctx.moveTo(cx + 20, cy - 20);
          ctx.lineTo(cx + 120, cy - 90 + flap);
          ctx.lineTo(cx + 80, cy - 20 + flap);
          ctx.lineTo(cx + 110, cy + 30 + flap);
          ctx.lineTo(cx + 30, cy + 20);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Violet wing fire embers
          ctx.fillStyle = '#d2b4de';
          ctx.fillRect(cx - 120, cy - 70 + flap, 6, 6);
          ctx.fillRect(cx + 100, cy - 70 + flap, 6, 6);
        }

        // 2. LEGGINGS (골드 / 서리 / 강철 / 기본)
        if (leggingsId === 'leggings_gold') {
          ctx.fillStyle = '#f39c12';
          ctx.fillRect(cx - 24, cy + 25, 18, 38);
          ctx.fillRect(cx + 6, cy + 25, 18, 38);
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(cx - 20, cy + 28, 12, 32);
          ctx.fillRect(cx + 10, cy + 28, 12, 32);
          ctx.fillStyle = '#fff';
          ctx.fillRect(cx - 18, cy + 32, 4, 18);
          ctx.fillRect(cx + 12, cy + 32, 4, 18);
        } else if (leggingsId === 'leggings_frost') {
          ctx.fillStyle = '#0984e3';
          ctx.fillRect(cx - 24, cy + 25, 18, 38);
          ctx.fillRect(cx + 6, cy + 25, 18, 38);
          ctx.fillStyle = '#74b9ff';
          ctx.fillRect(cx - 20, cy + 28, 12, 32);
          ctx.fillRect(cx + 10, cy + 28, 12, 32);
          ctx.fillStyle = '#dff9fb';
          ctx.fillRect(cx - 18, cy + 32, 4, 18);
          ctx.fillRect(cx + 12, cy + 32, 4, 18);
        } else if (leggingsId === 'leggings_iron') {
          ctx.fillStyle = '#636e72';
          ctx.fillRect(cx - 24, cy + 25, 18, 38);
          ctx.fillRect(cx + 6, cy + 25, 18, 38);
          ctx.fillStyle = '#b2bec3';
          ctx.fillRect(cx - 20, cy + 28, 12, 32);
          ctx.fillRect(cx + 10, cy + 28, 12, 32);
        } else {
          ctx.fillStyle = '#2c3e50';
          ctx.fillRect(cx - 24, cy + 25, 18, 38);
          ctx.fillRect(cx + 6, cy + 25, 18, 38);
          ctx.fillStyle = '#1e272e';
          ctx.fillRect(cx - 26, cy + 50, 22, 14);
          ctx.fillRect(cx + 4, cy + 50, 22, 14);
        }

        // 3. TORSO / ARMOR (골드 / 신갑 / 흑룡비늘 / 서리 / 마법로브 / 강철 / 가죽 / 기본)
        if (armorId === 'armor_gold_chest') {
          ctx.fillStyle = '#d35400';
          ctx.fillRect(cx - 34, cy - 42, 68, 70);
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(cx - 30, cy - 38, 60, 62);
          ctx.fillStyle = '#f39c12';
          ctx.fillRect(cx - 20, cy - 25, 40, 40);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx - 26, cy - 34, 8, 50);
          ctx.fillStyle = '#e74c3c';
          this.fillEllipse(cx, cy - 10, 10, 10);
        } else if (armorId === 'armor_godly') {
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(cx - 34, cy - 42, 68, 70);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx - 30, cy - 38, 60, 62);
          ctx.fillStyle = '#00d2d3';
          this.fillEllipse(cx, cy - 10, 10, 10);
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(cx - 38, cy - 38, 10, 22);
          ctx.fillRect(cx + 28, cy - 38, 10, 22);
        } else if (armorId === 'armor_dragon_scale') {
          ctx.fillStyle = '#1e272e';
          ctx.fillRect(cx - 34, cy - 42, 68, 70);
          ctx.fillStyle = '#2c3e50';
          ctx.fillRect(cx - 30, cy - 38, 60, 62);
          ctx.fillStyle = '#e74c3c';
          ctx.fillRect(cx - 20, cy - 20, 40, 5);
          ctx.fillRect(cx - 15, cy, 30, 5);
          this.fillEllipse(cx, cy - 10, 8, 8);
        } else if (armorId === 'armor_frost') {
          ctx.fillStyle = '#0984e3';
          ctx.fillRect(cx - 34, cy - 42, 68, 70);
          ctx.fillStyle = '#74b9ff';
          ctx.fillRect(cx - 30, cy - 38, 60, 62);
          ctx.fillStyle = '#dff9fb';
          ctx.fillRect(cx - 22, cy - 25, 44, 14);
        } else if (armorId === 'robe_elemental') {
          ctx.fillStyle = '#341f97';
          ctx.fillRect(cx - 34, cy - 42, 68, 70);
          ctx.fillStyle = '#8e44ad';
          ctx.fillRect(cx - 30, cy - 38, 60, 62);
          ctx.fillStyle = '#00d2d3';
          this.fillEllipse(cx, cy - 10, 14, 14);
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(cx - 5, cy + 5, 10, 15);
        } else if (armorId === 'armor_iron') {
          ctx.fillStyle = '#3d485c';
          ctx.fillRect(cx - 34, cy - 42, 68, 70);
          ctx.fillStyle = '#bdc3c7';
          ctx.fillRect(cx - 30, cy - 38, 60, 62);
          ctx.fillStyle = '#7f8c8d';
          ctx.fillRect(cx - 20, cy - 20, 40, 30);
        } else if (armorId === 'armor_leather') {
          ctx.fillStyle = '#4e342e';
          ctx.fillRect(cx - 34, cy - 42, 68, 70);
          ctx.fillStyle = '#795548';
          ctx.fillRect(cx - 30, cy - 38, 60, 62);
          ctx.fillStyle = '#d35400';
          ctx.fillRect(cx - 15, cy - 10, 30, 8);
        } else {
          const jobColor = {
            adventurer: '#2980b9',
            검사: '#3498db',
            '탱커 기사': '#7f8c8d',
            전사: '#c0392b',
            도적: '#2c3e50',
            마법사: '#9b59b6',
            흑마법사: '#4a235a',
            힐러: '#f1c40f'
          }[Player.job] || '#2980b9';

          ctx.fillStyle = jobColor;
          ctx.fillRect(cx - 32, cy - 40, 64, 65);
          ctx.fillStyle = '#1e272e';
          ctx.fillRect(cx - 32, cy + 15, 64, 10);
        }

        // 4. HEAD / HAIR / FACE
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(cx - 26, cy - 78, 52, 40);
        ctx.fillStyle = '#ffeaa7';
        ctx.fillRect(cx - 20, cy - 68, 40, 30);
        ctx.fillStyle = '#2d3436';
        ctx.fillRect(cx - 12, cy - 56, 6, 8);
        ctx.fillRect(cx + 6, cy - 56, 6, 8);

        // 5. HELM / CROWN / GOD HALO
        if (Player.isGod) {
          ctx.strokeStyle = '#f1c40f';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(cx, cy - 90, 35, 12, 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.lineWidth = 1;
        } else if (armorId === 'armor_gold_chest') {
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(cx - 24, cy - 80, 48, 8);
        } else if (armorId === 'armor_godly') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx - 24, cy - 80, 48, 8);
        }

        // 6. WEAPON (전투 화면 대형 렌더링)
        if (weaponId === 'weapon_chronos') {
          ctx.fillStyle = '#f39c12';
          ctx.fillRect(cx + 25, cy - 20, 28, 12);
          ctx.fillStyle = '#00d2d3';
          ctx.fillRect(cx + 34, cy - 110, 16, 95);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx + 39, cy - 100, 6, 80);
          ctx.strokeStyle = '#f1c40f';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx + 42, cy - 50, 20, 0, Math.PI * 2);
          ctx.stroke();
          ctx.lineWidth = 1;
        } else if (weaponId === 'sword_gold') {
          ctx.fillStyle = '#d35400';
          ctx.fillRect(cx + 26, cy - 20, 24, 10);
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(cx + 33, cy - 105, 14, 90);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx + 36, cy - 95, 6, 75);
          ctx.fillStyle = '#ffeaa7';
          ctx.fillRect(cx + 38, cy - 115, 4, 10);
        } else if (weaponId === 'weapon_god_blade') {
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(cx + 24, cy - 22, 26, 10);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx + 32, cy - 105, 12, 88);
          ctx.fillStyle = '#00d2d3';
          ctx.fillRect(cx + 36, cy - 95, 4, 75);
        } else if (weaponId === 'sword_dragon_slayer') {
          ctx.fillStyle = '#1e272e';
          ctx.fillRect(cx + 22, cy - 18, 30, 12);
          ctx.fillStyle = '#2c3e50';
          ctx.fillRect(cx + 30, cy - 115, 18, 100);
          ctx.fillStyle = '#e74c3c';
          ctx.fillRect(cx + 36, cy - 105, 6, 85);
        } else if (weaponId === 'sword_flame') {
          ctx.fillStyle = '#d35400';
          ctx.fillRect(cx + 26, cy - 20, 22, 10);
          ctx.fillStyle = '#e74c3c';
          ctx.fillRect(cx + 33, cy - 95, 12, 80);
          ctx.fillStyle = '#f39c12';
          ctx.fillRect(cx + 36, cy - 85, 6, 65);
        } else if (typeof weaponId === 'string' && (weaponId.startsWith('wand_') || weaponId.startsWith('staff_'))) {
          ctx.fillStyle = weaponId.includes('galaxy') ? '#1e272e' : '#795548';
          ctx.fillRect(cx + 35, cy - 80, 8, 95);
          const orbColor = weaponId.includes('galaxy') ? '#00d2d3' : weaponId.includes('archmage') ? '#e74c3c' : weaponId.includes('starlight') ? '#f1c40f' : '#9b59b6';
          ctx.fillStyle = orbColor;
          this.fillEllipse(cx + 39, cy - 90, 18, 18);
          ctx.fillStyle = '#ffffff';
          this.fillEllipse(cx + 37, cy - 92, 6, 6);
        } else if (weaponId === 'sword_holy_light' || weaponId.includes('cross') || weaponId.includes('saint') || weaponId.includes('genesis')) {
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(cx + 22, cy - 25, 30, 10);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx + 32, cy - 100, 10, 80);
          ctx.fillStyle = '#ffeaa7';
          ctx.fillRect(cx + 35, cy - 90, 4, 65);
        } else if (weaponId.includes('dagger')) {
          ctx.fillStyle = weaponId.includes('assassin') ? '#8e44ad' : '#27ae60';
          ctx.fillRect(cx + 34, cy - 40, 8, 45);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx + 36, cy - 35, 4, 30);
        } else if (weaponId.includes('axe')) {
          ctx.fillStyle = '#795548';
          ctx.fillRect(cx + 35, cy - 90, 8, 105);
          ctx.fillStyle = weaponId.includes('titan') ? '#e74c3c' : '#95a5a6';
          ctx.fillRect(cx + 18, cy - 85, 42, 30);
        } else if (weaponId === 'shield_bastion') {
          ctx.fillStyle = '#2c3e50';
          ctx.fillRect(cx + 24, cy - 60, 28, 70);
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(cx + 32, cy - 45, 12, 40);
        } else if (weaponId === 'scythe_death') {
          ctx.fillStyle = '#1e272e';
          ctx.fillRect(cx + 36, cy - 110, 8, 125);
          ctx.fillStyle = '#9b59b6';
          ctx.beginPath();
          ctx.moveTo(cx + 36, cy - 110);
          ctx.lineTo(cx - 25, cy - 80);
          ctx.lineTo(cx + 36, cy - 70);
          ctx.closePath();
          ctx.fill();
        } else if (weaponId === 'sword_wood') {
          ctx.fillStyle = '#8d6e63';
          ctx.fillRect(cx + 33, cy - 75, 10, 65);
          ctx.fillStyle = '#5d4037';
          ctx.fillRect(cx + 25, cy - 30, 26, 8);
        } else {
          ctx.fillStyle = '#ecf0f1';
          ctx.fillRect(cx + 32, cy - 85, 10, 75);
          ctx.fillStyle = '#f1c40f';
          ctx.fillRect(cx + 24, cy - 35, 26, 8);
        }

        ctx.restore();
      },

      updateAndDrawFX() {
        const ctx = this.ctx;

        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
          const ft = this.floatingTexts[i];
          ft.y += ft.vy;
          ft.life--;
          ft.alpha = Math.max(0, ft.life / 45);

          ctx.save();
          ctx.globalAlpha = ft.alpha;
          ctx.font = ft.isCrit ? 'bold 22px Pretendard, sans-serif' : 'bold 16px Pretendard, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = ft.color;
          ctx.shadowColor = '#000';
          ctx.shadowBlur = 6;
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.restore();

          if (ft.life <= 0) this.floatingTexts.splice(i, 1);
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life--;
          p.alpha = Math.max(0, p.life / 30);

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          if (p.life <= 0) this.particles.splice(i, 1);
        }
      }
    };
