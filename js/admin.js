    /* ==========================================================================
       10. ADMIN CONSOLE CONTROLLER (절대 권능 어드민 시스템)
       ========================================================================== */
    const Admin = {
      unlocked: false,
      monsterSpawnEnabled: true,

      unlockConsole() {
        this.unlocked = true;
        const btn = document.getElementById('admin-menu-btn');
        if (btn) btn.style.display = 'inline-block';
      },

      openConsole() {
        Game.closeOverlays();
        this.populateMonsterSelect();
        this.updateControlsUI();
        document.getElementById('admin-overlay').classList.add('active');
        Game.overlayActive = true;
      },

      populateMonsterSelect() {
        const select = document.getElementById('admin-monster-select');
        if (!select) return;
        const currentVal = select.value;
        select.innerHTML = '';
        Object.keys(DB.monsters).forEach(key => {
          const m = DB.monsters[key];
          const opt = document.createElement('option');
          opt.value = key;
          opt.innerText = `[Lv.${m.level}] ${m.name} (${key})`;
          select.appendChild(opt);
        });
        if (currentVal && DB.monsters[currentVal]) {
          select.value = currentVal;
        }
        this.loadMonsterToForm();
      },

      loadMonsterToForm() {
        const select = document.getElementById('admin-monster-select');
        if (!select) return;
        const m = DB.monsters[select.value];
        if (!m) return;
        document.getElementById('admin-monster-hp').value = m.hp;
        document.getElementById('admin-monster-atk').value = m.atk;
        document.getElementById('admin-monster-def').value = m.def;
        document.getElementById('admin-monster-gold').value = m.gold;
      },

      setQuickHp(hpVal) {
        document.getElementById('admin-monster-hp').value = hpVal;
        this.applyMonsterStats();
      },

      applyMonsterStats() {
        const select = document.getElementById('admin-monster-select');
        if (!select) return;
        const key = select.value;
        const m = DB.monsters[key];
        if (!m) return;

        const hp = Math.max(1, parseInt(document.getElementById('admin-monster-hp').value) || 1);
        const atk = Math.max(1, parseInt(document.getElementById('admin-monster-atk').value) || 1);
        const def = Math.max(0, parseInt(document.getElementById('admin-monster-def').value) || 0);
        const gold = Math.max(0, parseInt(document.getElementById('admin-monster-gold').value) || 0);

        m.hp = hp;
        m.maxHp = hp;
        m.atk = atk;
        m.def = def;
        m.gold = gold;

        Game.showToast(`⚡ [${m.name}]의 능력치 변경 완료! (체력: ${hp.toLocaleString()}, 공격력: ${atk.toLocaleString()})`);
      },

      testBattleSelectedMonster() {
        const select = document.getElementById('admin-monster-select');
        if (!select) return;
        const key = select.value;
        const m = DB.monsters[key];
        if (!m) return;
        Game.closeOverlays();
        Battle.start(m);
      },

      toggleGodMode() {
        Player.isGod = !Player.isGod;
        Player.recalcVitals();
        Game.updateHud();
        this.updateControlsUI();
        Game.showToast(Player.isGod ? '⚡ 신 모드가 활성화되었습니다! (무한 체력 / 공격력)' : '인간 모드로 복귀했습니다.');
      },

      toggleMonsterSpawn() {
        this.monsterSpawnEnabled = !this.monsterSpawnEnabled;
        this.updateControlsUI();
        Game.showToast(this.monsterSpawnEnabled ? '👾 야생 마물 필드 스폰이 활성화되었습니다.' : '🕊️ 야생 마물 스폰이 정지되었습니다 (평화 모드).');
      },

      giveGold(amount) {
        Player.gold += amount;
        Game.updateHud();
        Game.showToast(`💰 골드 ${amount.toLocaleString()} G가 지급되었습니다!`);
      },

      giveStatPoints(amount) {
        Player.statPoints += amount;
        Game.updateHud();
        Game.showToast(`✨ 스탯 포인트 ${amount.toLocaleString()}개가 지급되었습니다!`);
      },

      giveAllUltimateGear() {
        const gears = ['weapon_chronos', 'sword_gold', 'armor_gold_chest', 'leggings_gold', 'wings_dragon'];
        gears.forEach(id => {
          if (DB.items[id]) {
            Player.addItem(id, 1);
          }
        });
        Player.weapon = { ...DB.items.weapon_chronos, id: 'weapon_chronos' };
        Player.armor = { ...DB.items.armor_gold_chest, id: 'armor_gold_chest' };
        Player.leggings = { ...DB.items.leggings_gold, id: 'leggings_gold' };
        Player.wings = { ...DB.items.wings_dragon, id: 'wings_dragon' };
        Player.recalcVitals();
        Game.updateHud();
        Game.showToast('👑 전설/히든 풀세트 (크로노스, 골드세트, 흑룡날개) 장착 및 지급 완료!');
      },

      teleport(mapKey) {
        if (!Maps[mapKey]) return;
        Game.closeOverlays();
        Game.switchMap(mapKey, 5, 5);
      },

      updateControlsUI() {
        const godBtn = document.getElementById('admin-god-toggle-btn');
        if (godBtn) {
          godBtn.innerText = Player.isGod ? '⚡ 신 모드: 켬 (무한 HP/ATK)' : '⚡ 신 모드: 끔';
          godBtn.style.borderColor = Player.isGod ? '#f1c40f' : '#7f8c8d';
        }
        const spawnBtn = document.getElementById('admin-spawn-toggle-btn');
        if (spawnBtn) {
          spawnBtn.innerText = this.monsterSpawnEnabled ? '👾 마물 스폰: 켬' : '🕊️ 마물 스폰: 끔 (평화)';
          spawnBtn.style.borderColor = this.monsterSpawnEnabled ? '#2ecc71' : '#e74c3c';
        }
      }
    };
