    /* ==========================================================================
       7. BATTLE ENGINE (With Trial Battles)
       ========================================================================== */
    const Battle = {
      active: false,
      enemy: null,
      turn: 'player',
      defending: false,
      shieldBuffTurns: 0,
      isAdvancementTrial: false,
      advancementPayload: null,

      start(monsterData, isTrial, trialPayload) {
        this.active = true;
        this.enemy = JSON.parse(JSON.stringify(monsterData));
        this.turn = 'player';
        this.defending = false;
        this.shieldBuffTurns = 0;
        this.isAdvancementTrial = !!isTrial;
        this.advancementPayload = trialPayload || null;

        Sound.playBGM(this.enemy.boss || this.isAdvancementTrial ? 'boss' : 'battle');

        document.getElementById('battle-ui').classList.add('active');
        document.getElementById('top-bar').style.display = 'none';

        this.updateUI();
        document.getElementById('battle-log').innerHTML = '';
        this.addLog(`⚔️ [${this.enemy.name}]와의 목숨을 건 혈투가 시작되었습니다!`);
        this.showSubMenu(null);
      },

      updateUI() {
        document.getElementById('battle-player-name').innerText = Player.name;
        document.getElementById('battle-player-job').innerText = `(${Player.jobDisplayName})`;
        document.getElementById('battle-player-level').innerText = 'Lv.' + Player.level;
        document.getElementById('battle-player-hp-text').innerText = `${Player.hp}/${Player.maxHp}`;
        document.getElementById('battle-player-hp-bar').style.width = `${Math.max(0, (Player.hp / Player.maxHp) * 100)}%`;
        document.getElementById('battle-player-mp-text').innerText = `${Player.mp}/${Player.maxMp}`;
        document.getElementById('battle-player-mp-bar').style.width = `${Math.max(0, (Player.mp / Player.maxMp) * 100)}%`;

        document.getElementById('battle-enemy-name').innerText = this.enemy.name;
        document.getElementById('battle-enemy-level').innerText = 'Lv.' + this.enemy.level;
        document.getElementById('battle-enemy-hp-text').innerText = `${this.enemy.hp}/${this.enemy.maxHp}`;
        document.getElementById('battle-enemy-hp-bar').style.width = `${Math.max(0, (this.enemy.hp / this.enemy.maxHp) * 100)}%`;
      },

      addLog(msg) {
        const log = document.getElementById('battle-log');
        const p = document.createElement('div');
        p.style.marginBottom = '3px';
        p.innerHTML = msg;
        log.prepend(p);
      },

      showSubMenu(type) {
        const skillsMenu = document.getElementById('battle-skills-menu');
        const itemsMenu = document.getElementById('battle-items-menu');

        skillsMenu.style.display = 'none';
        itemsMenu.style.display = 'none';

        if (type === 'skills') {
          skillsMenu.innerHTML = '';
          Player.skills.forEach(skillId => {
            const skill = DB.skills[skillId];
            if (!skill) return;
            const btn = document.createElement('button');
            btn.className = 'game-btn';
            btn.innerHTML = `${skill.name} <small style="color:#3498db;">(${skill.mp} MP)</small>`;
            btn.disabled = Player.mp < skill.mp;
            btn.onclick = () => this.actionSkill(skillId);
            skillsMenu.appendChild(btn);
          });
          const cancelBtn = document.createElement('button');
          cancelBtn.className = 'game-btn';
          cancelBtn.innerText = '취소';
          cancelBtn.onclick = () => this.showSubMenu(null);
          skillsMenu.appendChild(cancelBtn);
          skillsMenu.style.display = 'grid';
        } else if (type === 'items') {
          itemsMenu.innerHTML = '';
          const usableItems = Player.inventory.filter(i => DB.items[i.id] && DB.items[i.id].type && DB.items[i.id].type.startsWith('heal'));
          if (usableItems.length === 0) {
            itemsMenu.innerHTML = '<span style="grid-column: span 2; font-size:0.75rem; color:#888;">사용 가능한 회복약이 없습니다.</span>';
          } else {
            usableItems.forEach(invItem => {
              const item = DB.items[invItem.id];
              const btn = document.createElement('button');
              btn.className = 'game-btn';
              btn.innerHTML = `${item.name} x${invItem.count}`;
              btn.onclick = () => this.actionItem(invItem.id);
              itemsMenu.appendChild(btn);
            });
          }
          const cancelBtn = document.createElement('button');
          cancelBtn.className = 'game-btn';
          cancelBtn.innerText = '취소';
          cancelBtn.onclick = () => this.showSubMenu(null);
          itemsMenu.appendChild(cancelBtn);
          itemsMenu.style.display = 'grid';
        }
      },

      setButtonsDisabled(disabled) {
        document.querySelectorAll('#battle-main-actions button').forEach(b => b.disabled = disabled);
      },

      actionAttack() {
        if (this.turn !== 'player') return;
        this.setButtonsDisabled(true);
        this.showSubMenu(null);

        // ★ [최종검 크로노스 또는 골드 검으로 흑룡 공격 가능!] ★
        if (this.enemy.sprite === 'dragon' || this.enemy.bossKey === 'boss_dragon') {
          const canBreakBarrier = Player.weapon && (Player.weapon.id === 'weapon_chronos' || Player.weapon.id === 'sword_gold');
          if (!canBreakBarrier) {
            Sound.playTone(150, 'sawtooth', 0.25, 0.35);
            Render.triggerShake();
            Render.addFloatingText('절대 결계! 면역 (0 DMG)', 580, 220, '#e74c3c', true);
            this.addLog('🛡️ <strong style="color:#e74c3c;">[고대 흑룡의 절대 결계]</strong> 최강의 [골드 검] 또는 [최종검 크로노스]가 아닌 무기는 흑룡에게 통하지 않습니다! (피해 0)');
            setTimeout(() => this.enemyTurn(), 800);
            return;
          }
        }

        const isCrit = Player.isGod || (Math.random() * 100 < Player.critRate);
        const critMultiplier = Player.job === '도적' ? 2.3 : 1.6;

        let baseDmg = Math.max(3, Player.totalAtk - this.enemy.def);
        let damage = Math.floor((baseDmg + Math.random() * 8) * (isCrit ? critMultiplier : 1.0));
        if (Admin.oneHitKill) damage = this.enemy.hp;

        if (isCrit) {
          Sound.sfxCrit();
          Render.triggerShake();
          Render.triggerFlash();
          Render.addFloatingText(`CRITICAL! -${damage}`, 580, 220, '#f1c40f', true);
          this.addLog(`💥 <strong style="color:#f1c40f;">치명타 폭발!</strong> [${Player.name}]이(가) [${this.enemy.name}]에게 ${damage}의 막대한 피해!`);
        } else {
          Sound.sfxSlash();
          Render.addFloatingText(`-${damage}`, 580, 230, '#fff', false);
          this.addLog(`⚔️ [${Player.name}]의 공격! [${this.enemy.name}]에게 ${damage}의 피해.`);
        }

        for (let i = 0; i < 8; i++) {
          Render.addParticle(580, 240, '#f39c12');
        }

        this.enemy.hp = Math.max(0, this.enemy.hp - damage);
        this.updateUI();

        if (this.enemy.hp <= 0) {
          this.handleVictory();
        } else {
          setTimeout(() => this.enemyTurn(), 800);
        }
      },

      actionSkill(skillId) {
        if (this.turn !== 'player') return;
        const skill = DB.skills[skillId];
        if (!skill || (!Player.isGod && Player.mp < skill.mp)) return;

        this.setButtonsDisabled(true);
        this.showSubMenu(null);
        if (!Player.isGod) Player.mp -= skill.mp;

        if (skill.heal || skill.healScale || skill.healFull) {
          Sound.sfxHeal();
          let amount = skill.heal || Math.floor(Player.totalMatk * skill.healScale);
          if (skill.healFull || Player.isGod) amount = Player.maxHp;
          Player.hp = Math.min(Player.maxHp, Player.hp + amount);
          Render.addFloatingText(`+${amount} HP`, 180, 270, '#2ecc71', true);
          this.addLog(`✨ [${skill.name}] 시전! 체력이 <strong style="color:#2ecc71;">${amount}</strong> 회복되었습니다.`);
        } else if (skill.isShieldBuff) {
          Sound.sfxSlash();
          this.shieldBuffTurns = 3;
          Render.addFloatingText(`철벽 방어 태세!`, 180, 270, '#3498db', false);
          this.addLog(`🛡️ [${skill.name}] 시전! 3턴간 받는 피해가 극적으로 감소합니다.`);
        } else {
          // ★ [흑룡에 대한 공격 스킬도 골드검/크로노스 무기 필수] ★
          if (this.enemy.sprite === 'dragon' || this.enemy.bossKey === 'boss_dragon') {
            const canBreakBarrier = Player.weapon && (Player.weapon.id === 'weapon_chronos' || Player.weapon.id === 'sword_gold');
            if (!canBreakBarrier) {
              Sound.playTone(150, 'sawtooth', 0.25, 0.35);
              Render.triggerShake();
              Render.addFloatingText('절대 결계! 면역 (0 DMG)', 580, 220, '#e74c3c', true);
              this.addLog('🛡️ <strong style="color:#e74c3c;">[고대 흑룡의 절대 결계]</strong> 최강의 [골드 검] 또는 [최종검 크로노스]가 아닌 무기로는 스킬 공격도 통하지 않습니다! (피해 0)');
              this.updateUI();
              setTimeout(() => this.enemyTurn(), 850);
              return;
            }
          }

          const isMagic = skill.magic;
          const power = skill.power || 1.5;
          let atkValue = isMagic ? Player.totalMatk : Player.totalAtk;
          if (skill.isDefScaled) atkValue += Math.floor(Player.totalDef * 1.6);

          const isCrit = skill.autoCrit || Player.isGod || (Math.random() * 100 < Player.critRate);
          let rawDamage = Math.max(5, (atkValue * power) - this.enemy.def + (Math.random() * 12));
          let damage = Math.floor(rawDamage * (isCrit ? 1.65 : 1.0));
          if (Admin.oneHitKill) damage = this.enemy.hp;

          if (isMagic) Sound.sfxMagic();
          else Sound.sfxSlash();

          Render.triggerShake();
          Render.addFloatingText(`${isCrit ? 'CRIT! ' : ''}-${damage}`, 580, 210, isMagic ? '#9b59b6' : '#e74c3c', isCrit);

          for (let i = 0; i < 14; i++) {
            Render.addParticle(580, 240, isMagic ? '#a29bfe' : '#ff7675');
          }

          this.enemy.hp = Math.max(0, this.enemy.hp - damage);
          this.addLog(`🔮 [${skill.name}] 발동! [${this.enemy.name}]에게 <strong style="color:#e74c3c;">${damage}</strong>의 피해!`);

          if (skill.drainRatio) {
            let drained = Math.floor(damage * skill.drainRatio);
            Player.hp = Math.min(Player.maxHp, Player.hp + drained);
            Render.addFloatingText(`흡혈 +${drained}`, 180, 270, '#9b59b6', false);
            this.addLog(`🩸 적의 생명력을 흡수하여 HP를 <strong style="color:#9b59b6;">${drained}</strong> 회복했습니다!`);
          }

          if (skill.healAfter) {
            Player.hp = Math.min(Player.maxHp, Player.hp + skill.healAfter);
            Render.addFloatingText(`+${skill.healAfter} HP`, 180, 270, '#2ecc71', false);
          }
        }

        this.updateUI();

        if (this.enemy.hp <= 0) {
          this.handleVictory();
        } else {
          setTimeout(() => this.enemyTurn(), 850);
        }
      },

      actionItem(itemId) {
        if (this.turn !== 'player') return;
        this.setButtonsDisabled(true);
        this.showSubMenu(null);

        const item = DB.items[itemId];
        if (item.type === 'heal_hp') {
          Sound.sfxHeal();
          Player.hp = Math.min(Player.maxHp, Player.hp + item.val);
          Render.addFloatingText(`+${item.val} HP`, 180, 270, '#2ecc71', false);
          this.addLog(`🧪 [${item.name}] 사용! HP가 ${item.val} 회복되었습니다.`);
        } else if (item.type === 'heal_hp_full') {
          Sound.sfxHeal();
          Player.hp = Player.maxHp;
          Player.mp = Player.maxMp;
          Render.addFloatingText(`완전 회복!`, 180, 270, '#2ecc71', true);
          this.addLog(`✨ [${item.name}] 사용! HP와 MP가 완전히 회복되었습니다!`);
        } else if (item.type === 'heal_mp') {
          Sound.sfxHeal();
          Player.mp = Math.min(Player.maxMp, Player.mp + item.val);
          Render.addFloatingText(`+${item.val} MP`, 180, 270, '#3498db', false);
          this.addLog(`🧪 [${item.name}] 사용! MP가 ${item.val} 회복되었습니다.`);
        }

        Player.removeItem(itemId, 1);
        this.updateUI();

        setTimeout(() => this.enemyTurn(), 800);
      },

      actionDefend() {
        if (this.turn !== 'player') return;
        this.setButtonsDisabled(true);
        this.showSubMenu(null);

        this.defending = true;
        Player.mp = Math.min(Player.maxMp, Player.mp + 20);
        Render.addFloatingText(`방어 자세 (+20 MP)`, 180, 270, '#3498db', false);
        this.updateUI();
        this.addLog(`🛡️ [${Player.name}]이(가) 방어 태세를 취했습니다! (피해 50% 감소, MP 20 회복)`);

        setTimeout(() => this.enemyTurn(), 800);
      },

      enemyTurn() {
        this.turn = 'enemy';

        if (Math.random() * 100 < Player.evadeRate) {
          Render.addFloatingText(`MISS! 회피 성공!`, 180, 270, '#3498db', true);
          this.addLog(`💨 [${this.enemy.name}]의 공격을 날렵하게 회피했습니다!`);
          this.finishEnemyTurn();
          return;
        }

        if (this.enemy.sprite === 'zeus' || this.enemy.bossKey === 'boss_zeus') {
          Sound.playTone(80, 'sawtooth', 0.45, 0.4, 30);
          Sound.playTone(380, 'square', 0.25, 0.25, 60);
          Render.triggerFlash();
          Render.triggerShake();
        } else {
          Sound.sfxHit();
        }

        let rawDmg = Math.max(3, this.enemy.atk - Player.totalDef + Math.floor(Math.random() * 6));

        if (this.shieldBuffTurns > 0) {
          rawDmg = Math.floor(rawDmg * 0.5);
          this.shieldBuffTurns--;
        }

        if (this.defending) {
          rawDmg = Math.max(1, Math.floor(rawDmg * 0.5));
          this.defending = false;
        }

        Player.hp = Math.max(0, Player.hp - rawDmg);
        Render.triggerShake();
        Render.addFloatingText(`-${rawDmg}`, 180, 270, '#e74c3c', false);
        this.updateUI();

        const enemyAtkTitle = (this.enemy.sprite === 'zeus' || this.enemy.bossKey === 'boss_zeus') 
          ? '⚡ [번개의 신 제우스]의 신벌·뇌신 강타!' 
          : `👾 [${this.enemy.name}]의 맹공격!`;
        this.addLog(`${enemyAtkTitle} [${Player.name}]이(가) <strong style="color:#e74c3c;">${rawDmg.toLocaleString()}</strong>의 피해를 입었습니다.`);

        if (Player.hp <= 0) {
          this.handleDefeat();
        } else {
          this.finishEnemyTurn();
        }
      },

      finishEnemyTurn() {
        this.turn = 'player';
        this.setButtonsDisabled(false);
      },

      handleVictory() {
        Sound.sfxCoin();
        Player.gold += this.enemy.gold;
        const leveledUp = Player.addExp(this.enemy.exp);

        Quest.checkKill(this.enemy.bossKey || null);

        const resultOverlay = document.getElementById('battle-result-overlay');
        const resultTitle = document.getElementById('battle-result-title');
        const resultDesc = document.getElementById('battle-result-desc');

        if (this.isAdvancementTrial && this.advancementPayload) {
          const { jobKey, targetTier } = this.advancementPayload;
          Player.setJobTier(jobKey, targetTier);
          resultTitle.innerText = '👑 전직 시험 통과!';
          resultDesc.innerHTML = `
            가혹한 전직 시험을 당당히 극복했습니다!<br>
            축하합니다! <strong>[${Player.jobDisplayName}]</strong>(으)로 전직을 완료했습니다!<br>
            새로운 강력한 오의 스킬들이 해금되었습니다!
          `;
          this.isAdvancementTrial = false;
          this.advancementPayload = null;
        } else {
          resultTitle.innerText = '🎉 전투 승리!';
          resultDesc.innerHTML = `
            [${this.enemy.name}]을(를) 물리쳤습니다!<br>
            획득 경험치: <strong>+${this.enemy.exp} EXP</strong><br>
            획득 골드: <strong>+${this.enemy.gold} G</strong>
            ${leveledUp ? '<br><span style="color:#2ecc71; font-weight:bold;">✨ 레벨이 상승하여 스탯 포인트가 지급되었습니다!</span>' : ''}
          `;

          if (this.enemy.boss && (this.enemy.sprite === 'dragon' || this.enemy.bossKey === 'boss_dragon')) {
            Quest.stage = 9;
            Player.addItem('wings_dragon', 1);
            Player.wings = { ...DB.items.wings_dragon, id: 'wings_dragon' };
            Player.recalcVitals();
            resultTitle.innerText = '👑 흑룡 토벌 성공! 마을의 평화 & 흑룡의 날개 획득!';
            resultDesc.innerHTML = `
              어둠의 패왕 고대 흑룡을 물리쳤습니다! 아르카디아 왕국과 마을에 영원한 평화가 찾아왔습니다! 🏆<br>
              <strong style="color:#f1c40f;">★ 최강의 전설 방어구 [흑룡의 날개]를 획득하여 장착했습니다! ★</strong><br>
              흑룡의 거대한 날개가 당신의 등에 펼쳐지며 신의 영역에 대적할 무적의 힘을 얻었습니다.<br><br>
              <span style="color:#3498db; font-weight:bold;">⚡ 어둠의 성채 심연 북쪽 제단에 하늘 위 [신들의 성역: 올림포스 정상]으로 향하는 포탈이 열렸습니다!</span><br>
              진짜 최종보스 <strong>[번개의 신 제우스 (200Lv)]</strong>를 쓰러뜨리고 진정한 신이 되십시오!
            `;
          } else if (this.enemy.boss && (this.enemy.sprite === 'zeus' || this.enemy.bossKey === 'boss_zeus')) {
            Quest.stage = 10;
            Player.isGod = true;
            Player.level = 999;
            Player.gold += 10000000;
            Player.recalcVitals();
            Admin.unlockConsole();
            resultTitle.innerText = '⚡ [절대신 각성] 신이 되었습니다! 👑';
            resultDesc.innerHTML = `
              경축!! 번개의 신 제우스를 격파하고 온 세상의 절대신(God)으로 각성했습니다!! 🏆<br>
              <strong style="color:#f1c40f;">당신의 레벨(999), 체력(무한), 공격력(무한)이 모두 신의 영역에 도달했습니다!</strong><br>
              세상에 완전한 평화가 도래하여 필드에서 마물(몬스터)이 더 이상 나타나지 않습니다.<br><br>
              <span style="color:#ff4757; font-weight:bold;">⚡ 상단 바에 [⚡ 어드민 콘솔]이 영구 해금되었습니다!</span><br>
              몬스터 체력을 1천만으로 바꾸는 등 세상의 모든 법칙을 당신 마음대로 조작할 수 있습니다!
            `;
          }
        }

        resultOverlay.classList.add('active');
        Game.autoSave();
      },

      handleDefeat() {
        const resultOverlay = document.getElementById('battle-result-overlay');
        const resultTitle = document.getElementById('battle-result-title');
        const resultDesc = document.getElementById('battle-result-desc');

        resultTitle.innerText = '💀 패배...';
        resultTitle.style.color = '#e74c3c';
        resultDesc.innerHTML = `
          눈앞이 캄캄해졌습니다...<br>
          마을 여관에서 안나의 간호를 받아 다시 깨어납니다.<br>
          (소지금의 10%를 잃었습니다)
        `;

        Player.gold = Math.floor(Player.gold * 0.9);
        Player.hp = Player.maxHp;
        Player.mp = Player.maxMp;
        Player.x = 11;
        Player.y = 4;
        Maps.current = 'town';

        this.isAdvancementTrial = false;
        this.advancementPayload = null;

        resultOverlay.classList.add('active');
      },

      endBattle() {
        document.getElementById('battle-result-overlay').classList.remove('active');
        document.getElementById('battle-ui').classList.remove('active');
        document.getElementById('top-bar').style.display = 'flex';
        this.active = false;
        this.setButtonsDisabled(false);

        Sound.playBGM(Maps[Maps.current].bgm);
        Game.updateHud();
      }
    };
