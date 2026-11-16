    /* ==========================================================================
       3. PLAYER STATE, 4-TIER ADVANCEMENT, AND STAT RECALC
       ========================================================================== */
    const Player = {
      name: '아르스',
      job: 'adventurer',
      jobTier: 0, // 0: 모험가, 1: 1차, 2: 2차, 3: 3차, 4: 최종전직
      level: 1,
      maxLevel: 100,
      hp: 120,
      maxHp: 120,
      mp: 60,
      maxMp: 60,

      // Core Allocated Stats
      statPoints: 0,
      str: 10,
      int: 10,
      vit: 10,
      dex: 10,

      gold: 150,
      exp: 0,
      nextExp: 25, // Easy starting leveling

      weapon: { id: 'sword_wood', name: '나무 검', atk: 8, matk: 0, crit: 0 },
      armor: { id: 'armor_cloth', name: '수련자의 옷', def: 4, hp: 0, mp: 0 },
      leggings: { id: 'leggings_cloth', name: '수련자의 바지', def: 3, hp: 15 },
      wings: null,
      isGod: false,

      inventory: [
        { id: 'potion_hp_s', count: 5 },
        { id: 'potion_mp_s', count: 3 }
      ],

      skills: ['slash', 'first_aid'],

      // Coordinate State
      x: 3,
      y: 7,
      facing: 'down',

      get jobData() {
        return DB.jobs[this.job] || DB.jobs.adventurer;
      },

      get jobDisplayName() {
        if (this.isGod) return '절대신 (God)';
        if (this.job === 'adventurer') return '모험가';
        const jobInfo = DB.jobs[this.job];
        if (jobInfo && jobInfo.tiers && this.jobTier >= 1) {
          return jobInfo.tiers[this.jobTier - 1].name;
        }
        return this.job;
      },

      get totalAtk() {
        if (this.isGod) return 999999999;
        let base = Math.floor(this.str * 2.5);
        if (['검사', '전사', '탱커 기사', '도적'].includes(this.job)) {
          base = Math.floor(this.str * (3.0 + this.jobTier * 0.3));
        }
        if (this.job === '전사') base = Math.floor(base * 1.25);
        if (this.weapon && this.weapon.atk) base += this.weapon.atk;
        if (this.armor && this.armor.atk) base += this.armor.atk;
        if (this.leggings && this.leggings.atk) base += this.leggings.atk;
        if (this.wings && this.wings.atk) base += this.wings.atk;
        return base;
      },

      get totalMatk() {
        if (this.isGod) return 999999999;
        let base = Math.floor(this.int * 2.8);
        if (['마법사', '흑마법사', '힐러'].includes(this.job)) {
          base = Math.floor(this.int * (3.2 + this.jobTier * 0.35));
        }
        if (this.job === '마법사') base = Math.floor(base * 1.2);
        if (this.weapon && this.weapon.matk) base += this.weapon.matk;
        if (this.armor && this.armor.matk) base += this.armor.matk;
        if (this.leggings && this.leggings.matk) base += this.leggings.matk;
        if (this.wings && this.wings.matk) base += this.wings.matk;
        return base;
      },

      get totalDef() {
        if (this.isGod) return 999999999;
        let base = Math.floor(this.vit * 1.3);
        if (this.job === '탱커 기사') base += 20 + (this.jobTier * 15);
        if (this.armor && this.armor.def) base += this.armor.def;
        if (this.leggings && this.leggings.def) base += this.leggings.def;
        if (this.wings && this.wings.def) base += this.wings.def;
        return base;
      },

      get critRate() {
        if (this.isGod) return 100;
        let rate = 5 + (this.dex * 0.25);
        if (this.job === '도적') rate += 15 + (this.jobTier * 5);
        if (this.job === '검사') rate += 8 + (this.jobTier * 3);
        if (this.weapon && this.weapon.crit) rate += this.weapon.crit;
        if (this.leggings && this.leggings.crit) rate += this.leggings.crit;
        if (this.wings && this.wings.crit) rate += this.wings.crit;
        return Math.min(95, Math.floor(rate));
      },

      get evadeRate() {
        if (this.isGod) return 95;
        let rate = 3 + (this.dex * 0.2);
        if (this.job === '도적') rate += 12 + (this.jobTier * 4);
        return Math.min(50, Math.floor(rate));
      },

      recalcVitals() {
        if (this.isGod) {
          this.maxHp = 999999999;
          this.hp = 999999999;
          this.maxMp = 999999999;
          this.mp = 999999999;
          return;
        }
        let hpBonus = (this.armor && this.armor.hp ? this.armor.hp : 0) +
                      (this.leggings && this.leggings.hp ? this.leggings.hp : 0) +
                      (this.wings && this.wings.hp ? this.wings.hp : 0);
        let mpBonus = (this.armor && this.armor.mp ? this.armor.mp : 0) +
                      (this.leggings && this.leggings.mp ? this.leggings.mp : 0) +
                      (this.wings && this.wings.mp ? this.wings.mp : 0);
        if (this.job === '탱커 기사') hpBonus += 150 * this.jobTier;
        if (this.job === '힐러') mpBonus += 80 * this.jobTier;
        if (this.job === '마법사') mpBonus += 100 * this.jobTier;

        const calculatedMaxHp = 100 + (this.level * 24) + (this.vit * 18) + hpBonus;
        const calculatedMaxMp = 50 + (this.level * 12) + (this.int * 10) + mpBonus;

        const hpDiff = calculatedMaxHp - this.maxHp;
        const mpDiff = calculatedMaxMp - this.maxMp;

        this.maxHp = calculatedMaxHp;
        this.maxMp = calculatedMaxMp;

        if (hpDiff > 0) this.hp = Math.min(this.maxHp, this.hp + hpDiff);
        if (mpDiff > 0) this.mp = Math.min(this.maxMp, this.mp + mpDiff);
        this.hp = Math.min(this.maxHp, this.hp);
        this.mp = Math.min(this.maxMp, this.mp);
      },

      addExp(amount) {
        if (this.level >= this.maxLevel) return false;
        this.exp += amount;
        let leveledUp = false;

        // Easy and smooth level curve
        while (this.exp >= this.nextExp && this.level < this.maxLevel) {
          this.exp -= this.nextExp;
          this.level++;
          this.statPoints += 4;

          this.nextExp = Math.floor(20 * Math.pow(this.level, 1.25) + 10);

          this.str += 1;
          this.int += 1;
          this.vit += 1;
          this.dex += 1;

          this.recalcVitals();
          this.hp = this.maxHp;
          this.mp = this.maxMp;

          leveledUp = true;
          Battle.addLog(`✨ <strong style="color:#2ecc71;">레벨 업!</strong> Lv.${this.level} 달성! (스탯 포인트 +4 지급, HP/MP 완전 회복)`);
        }

        if (leveledUp) {
          Sound.sfxLevelUp();
          Game.showToast(`🎉 레벨 업! Lv.${this.level} (스탯 포인트 +4)`);
        }
        Game.updateHud();
        return leveledUp;
      },

      setJobTier(jobKey, tier) {
        this.job = jobKey;
        this.jobTier = tier;

        // 3번 퀘스트: 전직 하나만 하면 바로 완료!
        if (Quest.stage === 2) {
          Quest.stage = 3;
          Game.showDialogue('퀘스트 완료', ['전직에 성공했습니다! [3. 전직 완료하기] 퀘스트를 완료했습니다. 속삭이는 숲의 거대 킹 슬라임을 토벌하세요!']);
        }

        const jobDef = DB.jobs[jobKey];
        if (!jobDef || !jobDef.tiers) return;

        // Aggregate all skills up to this tier
        const newSkills = ['slash', 'first_aid'];
        for (let i = 0; i < tier; i++) {
          jobDef.tiers[i].skills.forEach(s => {
            if (!newSkills.includes(s)) newSkills.push(s);
          });
        }
        this.skills = newSkills;

        // Stat bonus per tier
        if (['검사', '전사', '탱커 기사', '도적'].includes(jobKey)) {
          this.str += 5 * tier;
          this.dex += 4 * tier;
          this.vit += 4 * tier;
        } else {
          this.int += 7 * tier;
          this.vit += 4 * tier;
        }

        this.recalcVitals();
        this.hp = this.maxHp;
        this.mp = this.maxMp;
        Game.updateHud();
      },

      addItem(itemId, count) {
        count = count || 1;
        const existing = this.inventory.find(i => i.id === itemId);
        if (existing) {
          existing.count += count;
        } else {
          this.inventory.push({ id: itemId, count });
        }
        Game.updateHud();
      },

      removeItem(itemId, count) {
        count = count || 1;
        const index = this.inventory.findIndex(i => i.id === itemId);
        if (index !== -1) {
          this.inventory[index].count -= count;
          if (this.inventory[index].count <= 0) {
            this.inventory.splice(index, 1);
          }
        }
        Game.updateHud();
      }
    };
