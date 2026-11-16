    /* ==========================================================================
       9. MAIN GAME CONTROLLER & UI MODALS
       ========================================================================== */
    const Game = {
      dialogueActive: false,
      dialogueQueue: [],
      dialogueCallback: null,
      overlayActive: false,
      inTitleScreen: true,
      currentAdvancementTarget: null,
      SAVE_KEY: 'CHRONICLE_RPG_REMASTER_SAVE_V2',

      init() {
        Render.init();
        Input.init();
        Player.recalcVitals();
        this.updateHud();
        if (Admin.unlocked) Admin.unlockConsole();

        const loop = () => {
          if (!Battle.active) {
            Render.drawWorld();
          } else {
            Render.ctx.fillStyle = '#0b0e1b';
            Render.ctx.fillRect(0, 0, Render.canvas.width, Render.canvas.height);
            Render.drawBattlePlayer();
            Render.drawBattleMonster(Battle.enemy.sprite);
          }
          Render.updateAndDrawFX();
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      },

      showToast(msg) {
        const toast = document.getElementById('toast-msg');
        toast.innerText = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
      },

      startNewGame() {
        this.inTitleScreen = false;
        document.getElementById('title-screen').style.display = 'none';

        Sound.init();
        Sound.playBGM('town');

        setTimeout(() => {
          this.showDialogue('마을 장로 에드워드', [
            '오오, 용사 아르스여! 기다리고 있었네.',
            '이제 모든 대륙의 결계가 해제되어 원하는 곳 어디든 자유롭게 탐험할 수 있네!',
            '마을에는 [검사]와 [마법사] 전직관이 머물고 있으며, 숲, 동굴, 늪지, 설산, 화산에 다른 전직관들이 은둔해 있네.',
            '10레벨 1차전직, 20레벨 2차전직, 50레벨 3차전직, 100레벨 최종전직에 도전하여 최강의 영웅이 되어주게나!'
          ]);
        }, 300);
      },

      loadFromTitle() {
        const loaded = this.loadGame();
        if (loaded) {
          this.inTitleScreen = false;
          document.getElementById('title-screen').style.display = 'none';
          Sound.init();
          Sound.playBGM(Maps[Maps.current].bgm);
          this.showToast('💾 저장된 모험을 성공적으로 불러왔습니다!');
        } else {
          alert('저장된 세이브 데이터가 없습니다. 새 모험을 시작해주세요!');
        }
      },

      manualSave() {
        this.saveGame();
        this.showToast('💾 게임 데이터가 브라우저에 안전하게 저장되었습니다!');
      },

      autoSave() {
        this.saveGame();
      },

      saveGame() {
        try {
          const saveData = {
            name: Player.name,
            job: Player.job,
            jobTier: Player.jobTier,
            level: Player.level,
            hp: Player.hp,
            maxHp: Player.maxHp,
            mp: Player.mp,
            maxMp: Player.maxMp,
            exp: Player.exp,
            nextExp: Player.nextExp,
            gold: Player.gold,
            statPoints: Player.statPoints,
            str: Player.str,
            int: Player.int,
            vit: Player.vit,
            dex: Player.dex,
            weapon: Player.weapon,
            armor: Player.armor,
            leggings: Player.leggings,
            wings: Player.wings,
            isGod: Player.isGod,
            adminUnlocked: Admin.unlocked,
            monsterSpawnEnabled: Admin.monsterSpawnEnabled,
            inventory: Player.inventory,
            skills: Player.skills,
            questStage: Quest.stage,
            questKills: Quest.kills,
            currentMap: Maps.current,
            x: Player.x,
            y: Player.y
          };
          localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
        } catch (e) {
          console.warn('Save failed:', e);
        }
      },

      loadGame() {
        try {
          const raw = localStorage.getItem(this.SAVE_KEY);
          if (!raw) return false;
          const data = JSON.parse(raw);

          Player.name = data.name || '아르스';
          Player.job = data.job || 'adventurer';
          Player.jobTier = data.jobTier || 0;
          Player.level = data.level || 1;
          Player.hp = data.hp;
          Player.maxHp = data.maxHp;
          Player.mp = data.mp;
          Player.maxMp = data.maxMp;
          Player.exp = data.exp || 0;
          Player.nextExp = data.nextExp || 25;
          Player.gold = data.gold || 0;
          Player.statPoints = data.statPoints || 0;
          Player.str = data.str || 10;
          Player.int = data.int || 10;
          Player.vit = data.vit || 10;
          Player.dex = data.dex || 10;
          const sanitizeEquip = (rawEquip, defaultKey) => {
            if (!rawEquip) return defaultKey ? { ...DB.items[defaultKey], id: defaultKey } : null;
            if (typeof rawEquip === 'string') {
              const base = DB.items[rawEquip] || (defaultKey ? DB.items[defaultKey] : null);
              return base ? { ...base, id: rawEquip } : null;
            }
            if (typeof rawEquip === 'object') {
              let id = rawEquip.id;
              if (!id) {
                id = Object.keys(DB.items).find(k => DB.items[k].name === rawEquip.name) || defaultKey;
              }
              const base = (id && DB.items[id]) ? DB.items[id] : (defaultKey ? DB.items[defaultKey] : {});
              return id ? { ...base, ...rawEquip, id } : null;
            }
            return defaultKey ? { ...DB.items[defaultKey], id: defaultKey } : null;
          };

          Player.weapon = sanitizeEquip(data.weapon, 'sword_wood');
          Player.armor = sanitizeEquip(data.armor, 'armor_cloth');
          Player.leggings = sanitizeEquip(data.leggings, 'leggings_cloth');
          Player.wings = sanitizeEquip(data.wings, null);
          Player.isGod = !!data.isGod;
          Player.inventory = data.inventory || [];
          Player.skills = data.skills || ['slash', 'first_aid'];

          if (data.adminUnlocked) {
            Admin.unlockConsole();
          }
          if (data.monsterSpawnEnabled !== undefined) {
            Admin.monsterSpawnEnabled = data.monsterSpawnEnabled;
          }

          Quest.stage = data.questStage || 0;
          Quest.kills = data.questKills || 0;

          Maps.current = data.currentMap || 'town';
          Player.x = data.x || 3;
          Player.y = data.y || 7;

          Player.recalcVitals();
          this.updateHud();
          return true;
        } catch (e) {
          console.error('Load error:', e);
          return false;
        }
      },

      tryMovePlayer(dx, dy) {
        const map = Maps[Maps.current];
        const nx = Player.x + dx;
        const ny = Player.y + dy;

        if (nx < 0 || nx >= map.width || ny < 0 || ny >= map.height) return;

        const tile = map.grid[ny][nx];
        const blockingTiles = [2, 3, 4, 5, 8];
        if (blockingTiles.includes(tile)) return;

        const hitNpc = map.npcs.find(npc => npc.x === nx && npc.y === ny);
        if (hitNpc) {
          this.interactWithNPC(hitNpc);
          return;
        }

        Player.x = nx;
        Player.y = ny;

        // Free portal traversal across all 7 maps!
        const portal = map.portals.find(p => p.x === nx && p.y === ny);
        if (portal) {
          this.switchMap(portal.targetMap, portal.targetX, portal.targetY);
          return;
        }

        if (tile === 9) {
          Sound.sfxHeal();
          Player.hp = Player.maxHp;
          Player.mp = Player.maxMp;
          this.updateHud();
          this.showDialogue('성스러운 제단', ['성스러운 축복으로 모든 상처와 마나가 완전히 치유되었습니다! ✨']);
          return;
        }

        // Random Encounter (마물 스폰이 꺼져있거나 신 모드 평화일 시 출현 안 함)
        if (Admin.monsterSpawnEnabled && map.encounterRate && Math.random() < map.encounterRate) {
          const randEnemyKey = map.enemies[Math.floor(Math.random() * map.enemies.length)];
          Battle.start(DB.monsters[randEnemyKey]);
        }
      },

      switchMap(mapKey, startX, startY) {
        Maps.current = mapKey;
        Player.x = startX;
        Player.y = startY;
        Sound.playBGM(Maps[mapKey].bgm);
        this.showToast(`🗺️ ${Maps[mapKey].name}에 도착했습니다.`);
      },

      interactWithTile(x, y) {
        const map = Maps[Maps.current];
        const npc = map.npcs.find(n => n.x === x && n.y === y);
        if (npc) {
          this.interactWithNPC(npc);
          return;
        }
        if (map.grid[y] && map.grid[y][x] === 9) {
          Sound.sfxHeal();
          Player.hp = Player.maxHp;
          Player.mp = Player.maxMp;
          this.updateHud();
          this.showDialogue('성스러운 제단', ['성스러운 빛으로 HP와 MP가 완전히 회복되었습니다!']);
        }
      },

      interactWithNPC(npc) {
        Sound.sfxDialogue();

        if (npc.targetJob) {
          this.openJobMasterDialog(npc.targetJob);
          return;
        }

        if (npc.id === 'elder') {
          if (Quest.stage === 0) {
            Quest.stage = 1;
            Player.gold += 100;
            this.updateHud();
            this.showDialogue(npc.name, [
              '용사여! 남쪽 숲의 마물 3마리를 처치해 줄 채비를 서두르게.',
              '모험 지원금 100 골드를 주겠네! 상점에서 포션을 챙겨 가게나.'
            ]);
          } else {
            this.showDialogue(npc.name, [
              `현재 임무: ${Quest.getCurrentGoal()}`,
              '모든 맵은 퀘스트 상관없이 언제든 자유롭게 탐험할 수 있다네!'
            ]);
          }
        } else if (npc.id === 'merchant') {
          this.openShop();
        } else if (npc.id === 'innkeeper') {
          Sound.sfxHeal();
          Player.hp = Player.maxHp;
          Player.mp = Player.maxMp;
          this.updateHud();
          this.showDialogue(npc.name, ['어서오세요, 용사님! HP와 MP가 완전히 회복되었습니다!']);
        } else if (npc.isBossTrigger) {
          const boss = DB.monsters[npc.bossKey];
          this.showDialogue(npc.name, [
            `크하하하... 나 [${boss.name}]의 영역에 발을 들이다니 제법이군!`,
            '네놈의 영혼을 가루로 만들어주마!!'
          ], () => {
            Battle.start(boss);
          });
        }
      },

      /* Individual Job Master Dialog & 4-Tier Advancement */
      openJobMasterDialog(jobKey) {
        this.closeOverlays();
        const jobDef = DB.jobs[jobKey];
        if (!jobDef) return;

        const titleEl = document.getElementById('job-dialog-title');
        const descEl = document.getElementById('job-dialog-desc');
        const reqEl = document.getElementById('job-dialog-req');
        const btn = document.getElementById('job-advance-btn');

        titleEl.innerText = `🎖️ [${jobKey}] 전직관`;

        // Check current job tier
        let currentTier = (Player.job === jobKey) ? Player.jobTier : 0;
        let nextTier = currentTier + 1;

        if (Player.job !== 'adventurer' && Player.job !== jobKey) {
          descEl.innerText = `자네는 이미 [${Player.jobDisplayName}]의 길을 걷고 있네. 이 직업으로 바꾸려면 [설정] 메뉴에서 전직 초기화를 먼저 진행하게나.`;
          reqEl.innerHTML = `<span style="color:#e74c3c;">현재 다른 직업군 장착 중</span>`;
          btn.disabled = true;
          this.currentAdvancementTarget = null;
        } else if (nextTier > 4) {
          descEl.innerText = `축하하네! 자네는 이미 [${jobKey}]의 최고 경지인 최종전직 [${Player.jobDisplayName}]을(를) 달성했네!`;
          reqEl.innerHTML = `<span style="color:#2ecc71;">최종전직 달성 완료 🏆</span>`;
          btn.disabled = true;
          this.currentAdvancementTarget = null;
        } else {
          const tierData = jobDef.tiers[nextTier - 1];
          const tierNames = ['1차 전직', '2차 전직', '3차 전직', '최종전직'];
          const trialBosses = [null, 'trial_boss_tier2', 'trial_boss_tier3', 'trial_boss_tier4'];

          descEl.innerHTML = `
            <strong>${tierNames[nextTier - 1]} 안내: [${tierData.name}]</strong><br>
            ${tierData.desc}<br>
            * 새로운 고유 스킬들이 해금됩니다!
          `;

          const hasLevel = Player.level >= tierData.reqLv;
          const hasGold = Player.gold >= tierData.cost;
          const canAdvance = hasLevel && hasGold;

          reqEl.innerHTML = `
            <div>필요 레벨: <strong style="color:${hasLevel ? '#2ecc71' : '#e74c3c'};">${tierData.reqLv}Lv</strong> (현재 Lv.${Player.level})</div>
            <div>필요 골드: <strong style="color:${hasGold ? '#f1c40f' : '#e74c3c'};">${tierData.cost.toLocaleString()} G</strong> (보유 ${Player.gold.toLocaleString()} G)</div>
            ${nextTier >= 2 ? `<div style="color:#e67e22; margin-top:4px;">⚠️ 전직 시 가혹한 [전직 시험관 보스전]을 치러야 합니다!</div>` : ''}
          `;

          btn.disabled = !canAdvance;
          btn.innerText = canAdvance ? (nextTier >= 2 ? '시험 치르고 전직하기' : '전직하기') : '조건 부족';

          this.currentAdvancementTarget = {
            jobKey,
            targetTier: nextTier,
            cost: tierData.cost,
            trialBossKey: trialBosses[nextTier - 1]
          };
        }

        document.getElementById('job-dialog-overlay').classList.add('active');
        this.overlayActive = true;
      },

      executeJobAdvance() {
        if (!this.currentAdvancementTarget) return;
        const { jobKey, targetTier, cost, trialBossKey } = this.currentAdvancementTarget;

        if (Player.gold < cost) {
          alert('골드가 부족합니다!');
          return;
        }

        Player.gold -= cost;
        this.updateHud();
        this.closeOverlays();

        if (trialBossKey) {
          // Trigger Trial Battle!
          const trialBoss = DB.monsters[trialBossKey];
          this.showDialogue('전직관', [
            '좋다! 자네가 그 칭호를 얻을 자격이 있는지 내 시험관의 환영을 이겨 증명해보아라!'
          ], () => {
            Battle.start(trialBoss, true, { jobKey, targetTier });
          });
        } else {
          // 1st tier advancement (Instant)
          Player.setJobTier(jobKey, 1);
          Sound.sfxLevelUp();
          this.showDialogue('전직관', [
            `훌륭하네! 이제 자네는 정식 [${Player.jobDisplayName}]일세!`,
            '가방과 스킬을 점검하고 20레벨 2차 전직을 목표로 정진하게나!'
          ]);
        }
      },

      /* Settings Modal & Resets */
      openSettings() {
        this.closeOverlays();
        document.getElementById('settings-overlay').classList.add('active');
        this.overlayActive = true;
      },

      resetStatsFromSettings() {
        const spentStr = Player.str - 10;
        const spentInt = Player.int - 10;
        const spentVit = Player.vit - 10;
        const spentDex = Player.dex - 10;
        const totalRefund = spentStr + spentInt + spentVit + spentDex;

        Player.str = 10;
        Player.int = 10;
        Player.vit = 10;
        Player.dex = 10;
        Player.statPoints += totalRefund;

        Player.recalcVitals();
        this.updateHud();
        Sound.sfxLevelUp();
        this.showToast(`✨ 스탯 포인트 ${totalRefund}개가 성공적으로 반환되었습니다!`);
      },

      resetJobFromSettings() {
        if (Player.job === 'adventurer') {
          alert('이미 모험가 상태입니다.');
          return;
        }
        if (confirm('정말로 전직을 초기화하시겠습니까? (직업이 모험가로 되돌아갑니다)')) {
          Player.job = 'adventurer';
          Player.jobTier = 0;
          Player.skills = ['slash', 'first_aid'];
          Player.recalcVitals();
          this.updateHud();
          Sound.sfxLevelUp();
          this.showToast('🎖️ 전직이 초기화되어 모험가로 되돌아왔습니다.');
        }
      },

      resetCharacterFromSettings() {
        if (confirm('경고: 캐릭터의 모든 레벨, 장비, 골드가 1레벨 초기 상태로 되돌아갑니다. 진행하시겠습니까?')) {
          localStorage.removeItem(this.SAVE_KEY);
          Player.name = '아르스';
          Player.job = 'adventurer';
          Player.jobTier = 0;
          Player.level = 1;
          Player.exp = 0;
          Player.nextExp = 25;
          Player.gold = 150;
          Player.statPoints = 0;
          Player.str = 10; Player.int = 10; Player.vit = 10; Player.dex = 10;
          Player.weapon = { ...DB.items.sword_wood, id: 'sword_wood' };
          Player.armor = { ...DB.items.armor_cloth, id: 'armor_cloth' };
          Player.leggings = { ...DB.items.leggings_cloth, id: 'leggings_cloth' };
          Player.wings = null;
          Player.isGod = false;
          Admin.unlocked = false;
          Admin.monsterSpawnEnabled = true;
          const adminBtn = document.getElementById('admin-menu-btn');
          if (adminBtn) adminBtn.style.display = 'none';

          Player.inventory = [
            { id: 'potion_hp_s', count: 5 },
            { id: 'potion_mp_s', count: 3 }
          ];
          Player.skills = ['slash', 'first_aid'];
          Quest.stage = 0;
          Quest.kills = 0;
          Maps.current = 'town';
          Player.x = 3;
          Player.y = 7;

          Player.recalcVitals();
          this.closeOverlays();
          this.updateHud();
          Sound.playBGM('town');
          this.showToast('⚠️ 캐릭터가 완전히 초기화되었습니다.');
        }
      },

      showDialogue(speaker, lines, callback) {
        if (!Array.isArray(lines)) lines = [lines];
        this.dialogueQueue = lines.map(text => ({ speaker, text }));
        this.dialogueCallback = callback || null;
        this.dialogueActive = true;
        this.advanceDialogue();
      },

      advanceDialogue() {
        if (this.dialogueQueue.length === 0) {
          document.getElementById('dialogue-box').style.display = 'none';
          this.dialogueActive = false;
          if (this.dialogueCallback) {
            const cb = this.dialogueCallback;
            this.dialogueCallback = null;
            cb();
          }
          return;
        }

        const next = this.dialogueQueue.shift();
        Sound.sfxDialogue();
        document.getElementById('dialogue-speaker').innerText = next.speaker;
        document.getElementById('dialogue-text').innerText = next.text;
        document.getElementById('dialogue-box').style.display = 'block';
      },

      updateHud() {
        document.getElementById('pill-job').innerText = Player.jobDisplayName;
        document.getElementById('pill-level').innerText = Player.level;
        document.getElementById('pill-hp').innerText = Player.hp;
        document.getElementById('pill-maxhp').innerText = Player.maxHp;
        document.getElementById('pill-mp').innerText = Player.mp;
        document.getElementById('pill-maxmp').innerText = Player.maxMp;
        document.getElementById('pill-gold').innerText = Player.gold;

        const pct = Math.floor((Player.exp / Player.nextExp) * 100);
        document.getElementById('pill-exp-pct').innerText = `${pct}%`;

        const spTag = document.getElementById('pill-sp-tag');
        if (Player.statPoints > 0) {
          spTag.style.display = 'inline';
          document.getElementById('pill-sp').innerText = Player.statPoints;
        } else {
          spTag.style.display = 'none';
        }
      },

      closeOverlays() {
        document.querySelectorAll('.overlay').forEach(el => {
          if (el.id !== 'battle-result-overlay') el.classList.remove('active');
        });
        this.overlayActive = false;
      },

      openInventory() {
        this.closeOverlays();
        const list = document.getElementById('inventory-list');
        list.innerHTML = '';

        document.getElementById('inv-gold-display').innerText = Player.gold.toLocaleString();

        if (Player.weapon) {
          let stats = `공격 +${Player.weapon.atk.toLocaleString()}`;
          if (Player.weapon.matk) stats += `, 마력 +${Player.weapon.matk.toLocaleString()}`;
          if (Player.weapon.crit) stats += `, 치명타 +${Player.weapon.crit}%`;
          document.getElementById('inv-equip-weapon').innerText = `${Player.weapon.name} (${stats})`;
        } else {
          document.getElementById('inv-equip-weapon').innerText = '없음';
        }

        if (Player.armor) {
          let stats = `방어 +${Player.armor.def.toLocaleString()}`;
          if (Player.armor.hp) stats += `, HP +${Player.armor.hp.toLocaleString()}`;
          if (Player.armor.mp) stats += `, MP +${Player.armor.mp.toLocaleString()}`;
          document.getElementById('inv-equip-armor').innerText = `${Player.armor.name} (${stats})`;
        } else {
          document.getElementById('inv-equip-armor').innerText = '없음';
        }

        const legEl = document.getElementById('inv-equip-leggings');
        if (legEl) {
          if (Player.leggings) {
            let stats = `방어 +${Player.leggings.def.toLocaleString()}`;
            if (Player.leggings.hp) stats += `, HP +${Player.leggings.hp.toLocaleString()}`;
            if (Player.leggings.crit) stats += `, 치명타 +${Player.leggings.crit}%`;
            legEl.innerText = `${Player.leggings.name} (${stats})`;
          } else {
            legEl.innerText = '없음';
          }
        }

        const wingEl = document.getElementById('inv-equip-wings');
        if (wingEl) {
          if (Player.wings) {
            let stats = `방어 +${Player.wings.def.toLocaleString()}, HP +${(Player.wings.hp || 0).toLocaleString()}`;
            if (Player.wings.atk) stats += `, 공격 +${Player.wings.atk.toLocaleString()}`;
            wingEl.innerText = `${Player.wings.name} (${stats})`;
          } else {
            wingEl.innerText = '없음';
          }
        }

        Player.inventory.forEach(invItem => {
          const item = DB.items[invItem.id];
          if (!item) return;

          const isEquipped = (Player.weapon && Player.weapon.id === invItem.id) ||
                             (Player.armor && Player.armor.id === invItem.id) ||
                             (Player.leggings && Player.leggings.id === invItem.id) ||
                             (Player.wings && Player.wings.id === invItem.id);

          const div = document.createElement('div');
          div.className = 'item-card';
          if (isEquipped) {
            div.style.borderColor = '#f1c40f';
            div.style.background = 'rgba(241, 196, 15, 0.08)';
          }

          let btnHtml = '';
          if (isEquipped) {
            btnHtml = `<button class="game-btn btn-green" style="background:#27ae60; cursor:default;" disabled>장착 중</button>`;
          } else if (item.type.startsWith('equip_')) {
            btnHtml = `<button class="game-btn btn-gold" onclick="Game.useInventoryItem('${invItem.id}')">장착하기</button>`;
          } else {
            btnHtml = `<button class="game-btn btn-blue" onclick="Game.useInventoryItem('${invItem.id}')">사용하기</button>`;
          }

          div.innerHTML = `
            <div>
              <div class="item-name">${item.name} <span class="badge">x${invItem.count}</span> ${isEquipped ? '<span style="color:#f1c40f;font-weight:bold;font-size:12px;margin-left:6px;">[장착 중]</span>' : ''}</div>
              <div class="item-desc">${item.desc}</div>
            </div>
            <div class="item-card-bottom">
              <span class="item-price">가치: ${item.price.toLocaleString()}G</span>
              ${btnHtml}
            </div>
          `;
          list.appendChild(div);
        });

        document.getElementById('inventory-overlay').classList.add('active');
        this.overlayActive = true;
      },

      useInventoryItem(itemId) {
        const item = DB.items[itemId];
        if (!item) return;

        if (item.type === 'heal_hp') {
          Sound.sfxHeal();
          Player.hp = Math.min(Player.maxHp, Player.hp + item.val);
          Player.removeItem(itemId, 1);
          this.showToast(`HP가 ${item.val} 회복되었습니다.`);
        } else if (item.type === 'heal_hp_full') {
          Sound.sfxHeal();
          Player.hp = Player.maxHp;
          Player.mp = Player.maxMp;
          Player.removeItem(itemId, 1);
          this.showToast(`HP와 MP가 100% 완전 회복되었습니다!`);
        } else if (item.type === 'heal_mp') {
          Sound.sfxHeal();
          Player.mp = Math.min(Player.maxMp, Player.mp + item.val);
          Player.removeItem(itemId, 1);
          this.showToast(`MP가 ${item.val} 회복되었습니다.`);
        } else if (item.type.startsWith('stat_')) {
          Sound.sfxLevelUp();
          if (item.type === 'stat_str') Player.str += item.val;
          if (item.type === 'stat_int') Player.int += item.val;
          if (item.type === 'stat_vit') Player.vit += item.val;
          if (item.type === 'stat_dex') Player.dex += item.val;
          Player.removeItem(itemId, 1);
          Player.recalcVitals();
        } else if (item.type === 'equip_weapon') {
          Sound.sfxSlash();
          Player.weapon = { ...item, id: itemId };
          Player.recalcVitals();
          this.showToast(`⚔️ [${item.name}]을(를) 장착했습니다.`);
        } else if (item.type === 'equip_armor') {
          Sound.sfxSlash();
          Player.armor = { ...item, id: itemId };
          Player.recalcVitals();
          this.showToast(`🛡️ [${item.name}]을(를) 착용했습니다.`);
        } else if (item.type === 'equip_leggings') {
          Sound.sfxSlash();
          Player.leggings = { ...item, id: itemId };
          Player.recalcVitals();
          this.showToast(`👖 [${item.name}]을(를) 착용했습니다.`);
        } else if (item.type === 'equip_wings') {
          Sound.sfxSlash();
          Player.wings = { ...item, id: itemId };
          Player.recalcVitals();
          this.showToast(`🪽 [${item.name}]을(를) 장착했습니다!`);
        }

        this.updateHud();
        this.openInventory();
      },

      openShop() {
        this.closeOverlays();
        const list = document.getElementById('shop-list');
        list.innerHTML = '';
        document.getElementById('shop-gold-display').innerText = Player.gold.toLocaleString();

        const shopItems = [
          // 회복 포션 및 스탯 영약
          'potion_hp_s', 'potion_hp_m', 'potion_hp_l', 'potion_hp_xl',
          'potion_mp_s', 'potion_mp_m',
          'elixir_str', 'elixir_int', 'elixir_vit', 'elixir_dex',

          // 검 / 근접 무기군
          'sword_iron', 'sword_flame', 'sword_dragon_slayer', 'weapon_god_blade',

          // 마법사 특화 완드 & 스태프
          'wand_apprentice', 'wand_starlight', 'wand_arcane', 'staff_archmage', 'staff_galaxy',

          // 힐러 특화 성검 & 십자가
          'sword_holy_light', 'relic_cross', 'sword_saint', 'blade_genesis',

          // 도적/전사/탱커/흑마법사 특화 무기
          'dagger_shadow', 'dagger_assassin', 'axe_berserk', 'axe_titan', 'shield_bastion', 'scythe_death',

          // ★ 히든 황금 3종 세트 (삐까뻔쩍한 금색)
          'sword_gold', 'armor_gold_chest', 'leggings_gold',

          // ★ 최종검 크로노스 (흑룡 결계 타격 필수검)
          'weapon_chronos',

          // 방어구 (흉갑)
          'armor_leather', 'armor_iron', 'robe_elemental', 'armor_frost', 'armor_dragon_scale', 'armor_godly',

          // 방어구 (각반/레깅스)
          'leggings_cloth', 'leggings_iron', 'leggings_frost'
        ];

        shopItems.forEach(itemId => {
          const item = DB.items[itemId];
          if (!item) return;
          const div = document.createElement('div');
          div.className = 'item-card';
          div.innerHTML = `
            <div>
              <div class="item-name">${item.name}</div>
              <div class="item-desc">${item.desc}</div>
            </div>
            <div class="item-card-bottom">
              <span class="item-price">💰 ${item.price.toLocaleString()} G</span>
              <button class="game-btn btn-gold" ${Player.gold < item.price ? 'disabled' : ''} onclick="Game.buyShopItem('${itemId}')">구매</button>
            </div>
          `;
          list.appendChild(div);
        });

        document.getElementById('shop-overlay').classList.add('active');
        this.overlayActive = true;
      },

      buyShopItem(itemId) {
        const item = DB.items[itemId];
        if (Player.gold >= item.price) {
          Sound.sfxCoin();
          Player.gold -= item.price;
          Player.addItem(itemId, 1);
          this.showToast(`[${item.name}]을(를) 구매했습니다!`);
          this.updateHud();
          this.openShop();
        }
      },

      openStatus() {
        this.closeOverlays();
        const content = document.getElementById('status-content');
        const canAlloc = Player.statPoints > 0;

        content.innerHTML = `
          <div style="background:#161d30; padding:12px; border-radius:8px; border:1px solid #2b395e;">
            <h3 style="color:#f1c40f; margin-bottom:8px;">기본 정보 및 스탯 분배</h3>
            <p>이름: <strong>${Player.name}</strong></p>
            <p>직업: <strong style="color:#3498db;">${Player.jobDisplayName}</strong> (${Player.jobTier}차 전직)</p>
            <p>레벨: <strong>Lv.${Player.level}</strong> / ${Player.maxLevel}</p>
            <p>경험치: <strong>${Player.exp.toLocaleString()} / ${Player.nextExp.toLocaleString()} EXP</strong></p>
            <p>소지금: <strong style="color:#f1c40f;">${Player.gold.toLocaleString()} G</strong></p>
            <hr style="border:0; border-top:1px solid #334155; margin:8px 0;">
            <div style="margin-bottom:8px; color:#e74c3c; font-weight:bold;">
              남은 스탯 포인트: <span id="stat-points-val">${Player.statPoints.toLocaleString()}</span>
            </div>

            <div class="stat-row">
              <span>💪 근력 (STR): <strong>${Player.str}</strong></span>
              <div style="display:flex; gap:4px;">
                <button class="stat-btn" ${!canAlloc ? 'disabled' : ''} onclick="Game.allocateStat('str', 1)">+1</button>
                <button class="stat-btn stat-btn-multi" ${!canAlloc ? 'disabled' : ''} onclick="Game.allocateStat('str', 10)">+10</button>
                <button class="stat-btn stat-btn-multi" ${!canAlloc ? 'disabled' : ''} onclick="Game.allocateStat('str', 100)">+100</button>
              </div>
            </div>
            <div class="stat-row">
              <span>🔮 마력 (INT): <strong>${Player.int}</strong></span>
              <div style="display:flex; gap:4px;">
                <button class="stat-btn" ${!canAlloc ? 'disabled' : ''} onclick="Game.allocateStat('int', 1)">+1</button>
                <button class="stat-btn stat-btn-multi" ${!canAlloc ? 'disabled' : ''} onclick="Game.allocateStat('int', 10)">+10</button>
                <button class="stat-btn stat-btn-multi" ${!canAlloc ? 'disabled' : ''} onclick="Game.allocateStat('int', 100)">+100</button>
              </div>
            </div>
            <div class="stat-row">
              <span>🛡️ 체력 (VIT): <strong>${Player.vit}</strong></span>
              <div style="display:flex; gap:4px;">
                <button class="stat-btn" ${!canAlloc ? 'disabled' : ''} onclick="Game.allocateStat('vit', 1)">+1</button>
                <button class="stat-btn stat-btn-multi" ${!canAlloc ? 'disabled' : ''} onclick="Game.allocateStat('vit', 10)">+10</button>
                <button class="stat-btn stat-btn-multi" ${!canAlloc ? 'disabled' : ''} onclick="Game.allocateStat('vit', 100)">+100</button>
              </div>
            </div>
            <div class="stat-row">
              <span>⚡ 민첩 (DEX): <strong>${Player.dex}</strong></span>
              <div style="display:flex; gap:4px;">
                <button class="stat-btn" ${!canAlloc ? 'disabled' : ''} onclick="Game.allocateStat('dex', 1)">+1</button>
                <button class="stat-btn stat-btn-multi" ${!canAlloc ? 'disabled' : ''} onclick="Game.allocateStat('dex', 10)">+10</button>
                <button class="stat-btn stat-btn-multi" ${!canAlloc ? 'disabled' : ''} onclick="Game.allocateStat('dex', 100)">+100</button>
              </div>
            </div>
          </div>

          <div style="background:#161d30; padding:12px; border-radius:8px; border:1px solid #2b395e;">
            <h3 style="color:#3498db; margin-bottom:8px;">전투 세부 스펙</h3>
            <p>최대 HP: <strong>${Player.isGod ? '무한 (∞)' : Player.maxHp.toLocaleString()}</strong></p>
            <p>최대 MP: <strong>${Player.isGod ? '무한 (∞)' : Player.maxMp.toLocaleString()}</strong></p>
            <p>근접 공격력: <strong style="color:#e74c3c;">${Player.isGod ? '무한 (∞)' : Player.totalAtk.toLocaleString()}</strong></p>
            <p>마법 공격력: <strong style="color:#9b59b6;">${Player.isGod ? '무한 (∞)' : Player.totalMatk.toLocaleString()}</strong></p>
            <p>방어력: <strong style="color:#2ecc71;">${Player.isGod ? '무적 (∞)' : Player.totalDef.toLocaleString()}</strong></p>
            <p>치명타 확률: <strong style="color:#f1c40f;">${Player.critRate}%</strong></p>
            <p>회피율: <strong style="color:#3498db;">${Player.evadeRate}%</strong></p>
            <hr style="border:0; border-top:1px solid #334155; margin:8px 0;">
            <p style="font-size:0.75rem; color:#94a3b8; line-height:1.4;">
              * STR: 검사, 전사, 기사, 도적 근접 공격력 증가<br>
              * INT: 마법사, 흑마법사, 힐러 마법 공격력 및 MP 증가<br>
              * VIT: 최대 HP 및 방어력 증가<br>
              * DEX: 치명타율 및 회피율 증가<br>
              * 스탯 포인트가 버튼 값보다 적어도(예: 7포인트 시 +10) 남은 포인트를 전부 즉시 분배합니다.
            </p>
          </div>
        `;

        document.getElementById('status-overlay').classList.add('active');
        this.overlayActive = true;
      },

      allocateStat(type, amount = 1) {
        if (Player.statPoints <= 0) return;
        const add = Math.min(amount, Player.statPoints);
        Player.statPoints -= add;
        if (type === 'str') Player.str += add;
        if (type === 'int') Player.int += add;
        if (type === 'vit') Player.vit += add;
        if (type === 'dex') Player.dex += add;

        Player.recalcVitals();
        this.updateHud();
        this.openStatus();
      },

      openQuestLog() {
        this.closeOverlays();
        const content = document.getElementById('quest-content');
        content.innerHTML = `
          <div style="background:#161d30; padding:14px; border-radius:8px; border:1px solid #3c4973; margin-bottom:12px;">
            <h3 style="color:#f1c40f; margin-bottom:6px;">📌 진행 중인 주요 임무</h3>
            <div style="font-size:1.05rem; font-weight:bold; color:#ecf0f1;">${Quest.stages[Quest.stage].title}</div>
            <div style="color:#3498db; margin-top:4px;">목표: ${Quest.getCurrentGoal()}</div>
          </div>
          <h4 style="color:#bdc3c7; margin-bottom:8px;">전체 모험 여정 (맵은 자유 이동 가능):</h4>
          <ol style="padding-left: 20px; color: #a4b0be; line-height:1.7;">
            ${Quest.stages.map((s, idx) => `
              <li style="margin-bottom:4px; color:${idx === Quest.stage ? '#f1c40f; font-weight:bold;' : idx < Quest.stage ? '#2ecc71;' : '#64748b;'}">
                ${s.title} - ${s.goal} ${idx < Quest.stage ? '✅ (완료)' : idx === Quest.stage ? '⏳ (진행 중)' : ''}
              </li>
            `).join('')}
          </ol>
        `;
        document.getElementById('quest-overlay').classList.add('active');
        this.overlayActive = true;
      }
    };

