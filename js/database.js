    /* ==========================================================================
       2. DATABASE: 7 JOBS (USER EXACT NAMES) & 4 TIERS & EXPANDED SKILLS
       ========================================================================== */
    const DB = {
      // Base Jobs (Exactly as named: 힐러, 마법사, 검사, 흑마법사, 도적, 탱커 기사, 전사)
      jobs: {
        adventurer: {
          name: '모험가',
          role: 'hybrid',
          desc: '초보 모험가입니다. 10레벨에 도달하면 각 대륙에 위치한 전직관을 통해 전직할 수 있습니다.'
        },
        검사: {
          name: '검사',
          role: 'melee',
          location: '마을 (용사의 시작 마을)',
          tiers: [
            { tier: 1, name: '검사', reqLv: 10, cost: 0, skills: ['slash', 'sword_double'], desc: '날카로운 검술과 연속 베기의 근접 전문가' },
            { tier: 2, name: '검사 [소드마스터]', reqLv: 20, cost: 5000, skills: ['sword_wave', 'sword_quick'], desc: '검기를 방출하고 적의 빈틈을 찌르는 2차 전직' },
            { tier: 3, name: '검사 [검성]', reqLv: 50, cost: 35000, skills: ['sword_storm', 'sword_ultimate'], desc: '검의 극의에 도달하여 전장을 가르는 3차 전직' },
            { tier: 4, name: '검사 [검황]', reqLv: 100, cost: 150000, skills: ['sword_god'], desc: '신검의 영역에 오른 최강의 최종전직' }
          ]
        },
        마법사: {
          name: '마법사',
          role: 'magic',
          location: '마을 (용사의 시작 마을)',
          tiers: [
            { tier: 1, name: '마법사', reqLv: 10, cost: 0, skills: ['fireball', 'first_aid'], desc: '원소의 불꽃으로 적을 태우는 마력 전문가' },
            { tier: 2, name: '마법사 [아크메이지]', reqLv: 20, cost: 5000, skills: ['chain_lightning', 'frost_nova'], desc: '번개와 얼음 마법을 자유자재로 구사하는 2차 전직' },
            { tier: 3, name: '마법사 [엘리멘탈마스터]', reqLv: 50, cost: 35000, skills: ['meteor_strike', 'absolute_zero'], desc: '하늘에서 운석을 떨어뜨리는 3차 전직' },
            { tier: 4, name: '마법사 [그랜드메이거스]', reqLv: 100, cost: 150000, skills: ['supernova'], desc: '시공간을 뒤흔드는 초월적 마력의 최종전직' }
          ]
        },
        도적: {
          name: '도적',
          role: 'melee',
          location: '속삭이는 숲',
          tiers: [
            { tier: 1, name: '도적', reqLv: 10, cost: 0, skills: ['poison_stab', 'slash'], desc: '치명타와 회피, 맹독 공격의 암살 전문가' },
            { tier: 2, name: '도적 [어쌔신]', reqLv: 20, cost: 5000, skills: ['shadow_assault', 'stealth_strike'], desc: '그림자 속에서 확정 치명타를 가하는 2차 전직' },
            { tier: 3, name: '도적 [섀도우로드]', reqLv: 50, cost: 35000, skills: ['thousand_daggers', 'deadly_fog'], desc: '천 개의 단검으로 적을 절명시키는 3차 전직' },
            { tier: 4, name: '도적 [나이트메어]', reqLv: 100, cost: 150000, skills: ['zero_kill'], desc: '죽음의 사신과도 같은 환영 암살의 최종전직' }
          ]
        },
        전사: {
          name: '전사',
          role: 'melee',
          location: '버려진 바위 동굴',
          tiers: [
            { tier: 1, name: '전사', reqLv: 10, cost: 0, skills: ['berserk_strike', 'slash'], desc: '거대한 완력으로 뼈를 부수는 물리 파괴 전문가' },
            { tier: 2, name: '전사 [버서커]', reqLv: 20, cost: 5000, skills: ['earth_crush', 'battle_cry'], desc: '대지를 가르고 전장을 뒤흔드는 2차 전직' },
            { tier: 3, name: '전사 [워로드]', reqLv: 50, cost: 35000, skills: ['gigantic_break', 'whirlwind_axe'], desc: '적진을 홀로 궤멸시키는 불굴의 3차 전직' },
            { tier: 4, name: '전사 [기간틱 워리어]', reqLv: 100, cost: 150000, skills: ['titan_annihilation'], desc: '신화의 거인조차 일격에 분쇄하는 최종전직' }
          ]
        },
        흑마법사: {
          name: '흑마법사',
          role: 'magic',
          location: '망령의 안개 늪지',
          tiers: [
            { tier: 1, name: '흑마법사', reqLv: 10, cost: 0, skills: ['dark_bolt', 'life_drain'], desc: '암흑의 저주와 적의 생명력을 흡혈하는 마력 전문가' },
            { tier: 2, name: '흑마법사 [워록]', reqLv: 20, cost: 5000, skills: ['soul_shackle', 'curse_decay'], desc: '영혼을 구속하고 치명적인 디버프를 안기는 2차 전직' },
            { tier: 3, name: '흑마법사 [네크로마스터]', reqLv: 50, cost: 35000, skills: ['abyss_blackhole', 'summon_fiend'], desc: '심연의 블랙홀로 모든 것을 삼키는 3차 전직' },
            { tier: 4, name: '흑마법사 [심연의 지배자]', reqLv: 100, cost: 150000, skills: ['death_harvest'], desc: '적의 영혼을 통째로 추수하는 심연의 최종전직' }
          ]
        },
        '탱커 기사': {
          name: '탱커 기사',
          role: 'melee',
          location: '얼어붙은 만년설원',
          tiers: [
            { tier: 1, name: '탱커 기사', reqLv: 10, cost: 0, skills: ['shield_bash', 'iron_will'], desc: '철벽의 방패와 막강한 방어력을 지닌 수호 전문가' },
            { tier: 2, name: '탱커 기사 [가디언]', reqLv: 20, cost: 5000, skills: ['holy_retribution', 'taunt_counter'], desc: '방어력에 비례한 신성 일격을 가하는 2차 전직' },
            { tier: 3, name: '탱커 기사 [팔라딘]', reqLv: 50, cost: 35000, skills: ['aegis_fortress', 'shield_burst'], desc: '아군과 자신을 완벽히 보호하는 3차 전직' },
            { tier: 4, name: '탱커 기사 [이지스 로드]', reqLv: 100, cost: 150000, skills: ['immortal_sanctuary'], desc: '어떤 공격도 뚫지 못하는 불멸의 신성 최종전직' }
          ]
        },
        힐러: {
          name: '힐러',
          role: 'magic',
          location: '불타는 화산 심연',
          tiers: [
            { tier: 1, name: '힐러', reqLv: 10, cost: 0, skills: ['holy_smite', 'holy_heal'], desc: '성스러운 빛으로 치유와 징벌을 내리는 마력 전문가' },
            { tier: 2, name: '힐러 [프리스트]', reqLv: 20, cost: 5000, skills: ['divine_blessing', 'shine_blast'], desc: '공격/방어 버프와 지속 재생을 부여하는 2차 전직' },
            { tier: 3, name: '힐러 [하이프리스트]', reqLv: 50, cost: 35000, skills: ['divine_judgment', 'sanctuary_heal'], desc: '천벌과 성역의 완전 치유를 행사하는 3차 전직' },
            { tier: 4, name: '힐러 [세인트]', reqLv: 100, cost: 150000, skills: ['genesis_miracle'], desc: '신의 기적과 절대 회복을 구현하는 성스러운 최종전직' }
          ]
        }
      },

      // Skill System
      skills: {
        // Basic
        slash: { name: '강타', mp: 0, power: 1.3, desc: '무기를 힘껏 휘둘러 130% 물리 피해' },
        first_aid: { name: '응급 처치', mp: 10, heal: 60, desc: 'HP를 60 즉시 회복' },

        // 검사 Skills
        sword_double: { name: '질풍 2연참', mp: 12, power: 1.8, desc: '두 번 연속 베어 180% 근접 피해' },
        sword_wave: { name: '진공 검기', mp: 22, power: 2.6, desc: '날카로운 검기를 방출해 260% 물리 피해' },
        sword_quick: { name: '발도술·일섬', mp: 30, power: 3.3, autoCrit: true, desc: '번개 같은 발도로 100% 치명타 330% 피해' },
        sword_storm: { name: '폭풍 난무', mp: 45, power: 4.2, desc: '검의 폭풍을 일으켜 420% 연속 베기 피해' },
        sword_ultimate: { name: '진·검황난무', mp: 65, power: 5.4, desc: '검술의 극의로 540% 초극대 근접 피해' },
        sword_god: { name: '절대신검·무한검제', mp: 95, power: 7.5, autoCrit: true, desc: '신검의 영역! 확정 치명타 750% 초월 피해' },

        // 마법사 Skills
        fireball: { name: '화염구 폭발', mp: 15, power: 2.2, magic: true, desc: '작열하는 화염구로 220% 마법 피해' },
        chain_lightning: { name: '연쇄 뇌전', mp: 28, power: 3.1, magic: true, desc: '고압 전류로 310% 벼락 마법 피해' },
        frost_nova: { name: '프로스트 노바', mp: 36, power: 3.8, magic: true, desc: '빙결 냉기 폭풍으로 380% 마법 피해' },
        meteor_strike: { name: '메테오 스트라이크', mp: 55, power: 5.2, magic: true, desc: '거대 운석을 소환해 520% 마법 피해' },
        absolute_zero: { name: '앱솔루트 제로', mp: 75, power: 6.4, magic: true, desc: '절대영도의 한기로 640% 마법 폭발' },
        supernova: { name: '아포칼립스 슈퍼노바', mp: 110, power: 8.5, magic: true, desc: '전 우주의 마력을 터뜨리는 850% 궁극 마법' },

        // 도적 Skills
        poison_stab: { name: '맹독 찌르기', mp: 12, power: 1.7, desc: '독칼로 170% 물리 피해' },
        shadow_assault: { name: '그림자 암습', mp: 24, power: 2.8, autoCrit: true, desc: '배후를 노려 확정 치명타 280% 피해' },
        stealth_strike: { name: '급소 베기', mp: 34, power: 3.6, autoCrit: true, desc: '심장을 노려 360% 확정 치명타 피해' },
        thousand_daggers: { name: '천인난무', mp: 50, power: 4.8, autoCrit: true, desc: '무수한 비도로 480% 초극대 치명 피해' },
        deadly_fog: { name: '사신의 독안개', mp: 68, power: 5.8, desc: '사신의 안개로 580% 치명적 연속 피해' },
        zero_kill: { name: '환영 암살극: 제로 킬', mp: 90, power: 8.0, autoCrit: true, desc: '적의 숨통을 단숨에 끊는 800% 확정 암살' },

        // 전사 Skills
        berserk_strike: { name: '분노의 일격', mp: 14, power: 2.2, desc: '괴력의 일격으로 220% 물리 피해' },
        earth_crush: { name: '대지 분쇄', mp: 28, power: 3.2, desc: '지면을 갈라 320% 광역 물리 피해' },
        battle_cry: { name: '광전사의 포효', mp: 35, power: 3.9, desc: '투기를 실은 일격으로 390% 피해' },
        gigantic_break: { name: '기간틱 슬래시', mp: 52, power: 5.2, desc: '520%의 무자비한 분쇄 타격' },
        whirlwind_axe: { name: '피의 소용돌이', mp: 70, power: 6.5, desc: '도끼를 회전시켜 650% 극대 피해' },
        titan_annihilation: { name: '파멸의 거신 분쇄', mp: 95, power: 8.8, desc: 'HP 15% 소모, 적을 일격에 가루로 만드는 880% 초극대 피해' },

        // 흑마법사 Skills
        dark_bolt: { name: '암흑 화살', mp: 14, power: 2.0, magic: true, desc: '심연의 어둠으로 200% 마법 피해' },
        life_drain: { name: '생명력 흡수', mp: 26, power: 2.7, magic: true, drainRatio: 0.65, desc: '270% 피해를 입히고 가한 피해의 65% HP 회복' },
        soul_shackle: { name: '영혼의 족쇄', mp: 38, power: 3.7, magic: true, desc: '영혼을 얽어매어 370% 암흑 피해' },
        curse_decay: { name: '부패의 저주', mp: 50, power: 4.8, magic: true, drainRatio: 0.4, desc: '480% 피해 및 대량 흡혈' },
        abyss_blackhole: { name: '심연의 블랙홀', mp: 72, power: 6.2, magic: true, drainRatio: 0.5, desc: '차원의 틈새를 열어 620% 피해 및 50% 흡혈' },
        death_harvest: { name: '영혼 절멸: 데스 하베스트', mp: 105, power: 8.2, magic: true, drainRatio: 0.8, desc: '820% 암흑 대폭발 및 가한 피해의 80% HP 회복' },

        // 탱커 기사 Skills
        shield_bash: { name: '방패 강타', mp: 10, power: 1.5, isDefScaled: true, desc: '방패로 가격 (방어력 계수 반영 타격)' },
        iron_will: { name: '철벽의 요새', mp: 18, isShieldBuff: true, desc: '3턴간 받는 피해 65% 감소' },
        holy_retribution: { name: '정의의 심판', mp: 30, power: 3.0, isDefScaled: true, desc: '방어력과 공격력을 합산한 300% 신성 타격' },
        taunt_counter: { name: '도발과 반격', mp: 42, power: 4.0, isDefScaled: true, desc: '적의 공격을 받아쳐 400% 반격 피해' },
        aegis_fortress: { name: '이지스의 성벽', mp: 60, power: 5.0, isShieldBuff: true, isDefScaled: true, desc: '피해 감소 버프 및 500% 방패 돌진' },
        immortal_sanctuary: { name: '불멸의 절대 수호성', mp: 85, power: 7.2, isDefScaled: true, isShieldBuff: true, desc: '받는 피해 대폭 감소 및 720% 방어력 비례 초극대 심판' },

        // 힐러 Skills
        holy_smite: { name: '성스러운 징벌', mp: 14, power: 2.1, magic: true, desc: '성스러운 광채로 210% 신성 마법 피해' },
        holy_heal: { name: '대천사의 은혜', mp: 22, healScale: 1.8, desc: '마력에 비례해 체력을 대폭 치유' },
        divine_blessing: { name: '신성한 축복', mp: 35, power: 3.2, magic: true, healAfter: 150, desc: '320% 피해를 주고 HP 150 즉시 회복' },
        shine_blast: { name: '샤인 블래스트', mp: 48, power: 4.5, magic: true, desc: '빛의 폭발로 450% 신성 마법 피해' },
        divine_judgment: { name: '신의 심판 (천벌)', mp: 68, power: 6.0, magic: true, healAfter: 350, desc: '600% 신성 소멸 및 HP 350 회복' },
        genesis_miracle: { name: '창조주의 강림', mp: 95, power: 8.0, magic: true, healFull: true, desc: '800% 신성 극대 피해 및 자신의 HP 100% 완전 회복' }
      },

      items: {
        potion_hp_s: { name: '체력 물약 (소)', type: 'heal_hp', val: 100, price: 20, desc: 'HP를 100 즉시 회복' },
        potion_hp_m: { name: '체력 물약 (중)', type: 'heal_hp', val: 350, price: 60, desc: 'HP를 350 즉시 회복' },
        potion_hp_l: { name: '체력 물약 (대)', type: 'heal_hp', val: 1200, price: 180, desc: 'HP를 1200 즉시 회복' },
        potion_hp_xl: { name: '신의 엘릭서', type: 'heal_hp_full', val: 99999, price: 500, desc: 'HP와 MP를 100% 완전 회복' },
        potion_mp_s: { name: '마나 물약 (소)', type: 'heal_mp', val: 80, price: 25, desc: 'MP를 80 즉시 회복' },
        potion_mp_m: { name: '마나 물약 (대)', type: 'heal_mp', val: 300, price: 90, desc: 'MP를 300 즉시 회복' },

        elixir_str: { name: '근력의 영약', type: 'stat_str', val: 4, price: 400, desc: '영구히 근력(STR) +4' },
        elixir_int: { name: '마력의 영약', type: 'stat_int', val: 4, price: 400, desc: '영구히 마력(INT) +4' },
        elixir_vit: { name: '체력의 영약', type: 'stat_vit', val: 4, price: 400, desc: '영구히 체력(VIT) +4' },
        elixir_dex: { name: '민첩의 영약', type: 'stat_dex', val: 4, price: 400, desc: '영구히 민첩(DEX) +4' },

        // 기본 무기군
        sword_wood: { name: '나무 검', type: 'equip_weapon', atk: 8, price: 30, desc: '수련용 목검. 공격력 +8' },
        sword_iron: { name: '기사의 강철검', type: 'equip_weapon', atk: 35, price: 250, desc: '단련된 강철검. 공격력 +35' },
        sword_flame: { name: '작열의 화염검', type: 'equip_weapon', atk: 130, price: 1200, desc: '불꽃을 뿜는 화염 마검. 공격력 +130' },
        sword_dragon_slayer: { name: '용살자 드래곤 슬레이어', type: 'equip_weapon', atk: 290, price: 4800, desc: '용의 비늘을 가르는 전설의 대검. 공격력 +290' },
        weapon_god_blade: { name: '신화의 성검 엑스칼리버', type: 'equip_weapon', atk: 520, matk: 420, price: 16000, desc: '빛의 기운이 서린 신화의 성검. 공격력 +520, 마력 +420' },

        // [마법사 특화 무기: 완드 & 스태프 계열]
        wand_apprentice: { name: '견습 마법 완드', type: 'equip_weapon', atk: 25, matk: 45, price: 280, desc: '견습 마법사용 기초 완드. 공격력 +25, 마력 +45' },
        wand_starlight: { name: '별빛 크리스탈 완드', type: 'equip_weapon', atk: 40, matk: 110, crit: 6, price: 750, desc: '밤하늘의 별빛 정수가 깃든 완드. 마력 +110, 치명타 +6%' },
        wand_arcane: { name: '비전 마도사의 완드', type: 'equip_weapon', atk: 70, matk: 260, crit: 10, price: 2800, desc: '고대 비전 룬이 각인된 완드. 마력 +260, 치명타 +10%' },
        staff_archmage: { name: '대마도사의 지팡이', type: 'equip_weapon', atk: 90, matk: 480, price: 6200, desc: '원소의 흐름을 지배하는 대마도사의 지팡이. 마력 +480' },
        staff_galaxy: { name: '은하 성운의 지팡이', type: 'equip_weapon', atk: 160, matk: 950, crit: 18, price: 19000, desc: '성운의 마력을 뿜어내는 궁극의 지팡이. 마력 +950, 치명타 +18%' },

        // [힐러 특화 무기: 성검 & 신성 십자가 계열]
        sword_holy_light: { name: '성스러운 빛의 검', type: 'equip_weapon', atk: 55, matk: 80, hp: 120, price: 600, desc: '치유와 징벌을 함께 담은 신성검. 공격력 +55, 마력 +80, HP +120' },
        relic_cross: { name: '대천사의 십자가 성검', type: 'equip_weapon', atk: 115, matk: 290, hp: 350, price: 2900, desc: '대천사의 은총이 깃든 십자가 성검. 공격력 +115, 마력 +290, HP +350' },
        sword_saint: { name: '세인트 심판의 성검', type: 'equip_weapon', atk: 190, matk: 540, crit: 12, hp: 700, price: 7800, desc: '성자의 영혼이 깃든 고위 성검. 공격력 +190, 마력 +540, 치명타 +12%, HP +700' },
        blade_genesis: { name: '창세의 심판 성검', type: 'equip_weapon', atk: 340, matk: 950, hp: 1600, crit: 15, price: 24000, desc: '창조주의 빛을 품은 절대 성검. 공격력 +340, 마력 +950, HP +1600' },

        // 기타 직업군 무기
        dagger_shadow: { name: '암살자의 단검', type: 'equip_weapon', atk: 45, crit: 14, price: 450, desc: '도적용 단검. 공격력 +45, 치명타 +14%' },
        dagger_assassin: { name: '사신의 그림자 단도', type: 'equip_weapon', atk: 160, crit: 30, price: 3400, desc: '그림자 암살 단도. 공격력 +160, 치명타 +30%' },
        axe_berserk: { name: '버서커의 도끼', type: 'equip_weapon', atk: 95, price: 900, desc: '전사용 파괴 도끼. 공격력 +95' },
        axe_titan: { name: '타이탄의 파멸도끼', type: 'equip_weapon', atk: 360, price: 4500, desc: '거신의 괴력을 담은 거대 도끼. 공격력 +360' },
        shield_bastion: { name: '성기사의 이지스 방패검', type: 'equip_weapon', atk: 170, def: 140, hp: 600, price: 5200, desc: '철벽의 방패검. 공격력 +170, 방어력 +140, HP +600' },
        scythe_death: { name: '사령술사의 영혼 낫', type: 'equip_weapon', atk: 190, matk: 370, price: 5500, desc: '영혼을 베어내는 흑마법사의 낫. 공격력 +190, 마력 +370' },

        // ★ [히든 황금 장비 3종 세트 (최고 가격 & 최강 방어, 물리, 마법 공격)] ★
        sword_gold: { name: '골드 검 (황금의 일격검)', type: 'equip_weapon', atk: 25000, matk: 22000, crit: 35, price: 180000, desc: '★[최강의 황금 신기] 눈부신 순금으로 벼려낸 최강의 황금검! 상점 최고 가격과 압도적인 물리/마법 공격력을 지녔으며, 흑룡의 절대 결계를 분쇄할 수 있는 찬란한 황금의 기운이 깃들어 있습니다!★' },
        armor_gold_chest: { name: '골드 흉갑 (황금 수호 흉갑)', type: 'equip_armor', def: 15000, hp: 120000, mp: 30000, price: 160000, desc: '★[최강의 황금 신기] 눈부신 순금 판금 흉갑. 상점 최고 가격과 최강의 방어력, 체력을 제공하여 흑룡의 무자비한 맹공을 완벽히 견뎌낼 수 있게 합니다!★' },
        leggings_gold: { name: '골드 레깅스 (황금 기동 각반)', type: 'equip_leggings', def: 11000, hp: 80000, mp: 20000, crit: 25, price: 140000, desc: '★[최강의 황금 신기] 상점 최고 가격과 최강의 방어력/체력을 제공하는 황금 각반. 장착 시 눈부시게 번쩍이는 황금 각반 외형이 나타납니다!★' },

        // ★ [최종검 크로노스: 흑룡 타격 필수 무기] ★
        weapon_chronos: { name: '최종검 크로노스', type: 'equip_weapon', atk: 28000, matk: 24000, crit: 50, price: 200000, desc: '★[신화급 최종검] 시간과 차원의 틈새를 가르는 궁극의 검. 골드 검과 함께 고대 흑룡의 절대 결계를 뚫고 치명타를 가할 수 있습니다!★' },

        // ★ [흑룡 처치 보상: 흑룡의 날개] ★
        wings_dragon: { name: '흑룡의 날개', type: 'equip_wings', def: 28000, hp: 350000, mp: 150000, atk: 25000, matk: 25000, crit: 35, price: 300000, desc: '★[초월급 전설 방어구] 어둠의 패왕 고대 흑룡을 물리쳐 획득한 날개. 등 뒤에 거대한 흑룡의 날개가 펼쳐지며 신들의 성역 제우스에 대적할 무적의 힘을 선사합니다!★' },

        // 흉갑(갑옷) 계열
        armor_cloth: { name: '수련자의 옷', type: 'equip_armor', def: 4, price: 20, desc: '방어력 +4' },
        armor_leather: { name: '강화 가죽 갑옷', type: 'equip_armor', def: 20, price: 180, desc: '방어력 +20' },
        armor_iron: { name: '성기사의 강철 판금갑', type: 'equip_armor', def: 55, hp: 120, price: 600, desc: '방어력 +55, HP +120' },
        robe_elemental: { name: '원소의 마법 로브', type: 'equip_armor', def: 42, mp: 150, price: 700, desc: '방어력 +42, MP +150' },
        armor_frost: { name: '만년설의 서리 갑옷', type: 'equip_armor', def: 110, hp: 350, price: 2200, desc: '방어력 +110, HP +350' },
        armor_dragon_scale: { name: '흑룡의 비늘 갑주', type: 'equip_armor', def: 220, hp: 800, price: 6500, desc: '방어력 +220, HP +800' },
        armor_godly: { name: '천상의 불멸 신갑', type: 'equip_armor', def: 420, hp: 1800, price: 18000, desc: '방어력 +420, HP +1800' },

        // 각반(레깅스) 계열
        leggings_cloth: { name: '수련자의 바지', type: 'equip_leggings', def: 3, hp: 15, price: 20, desc: '가벼운 수련용 천 바지. 방어력 +3, HP +15' },
        leggings_iron: { name: '기사의 강철 각반', type: 'equip_leggings', def: 40, hp: 100, price: 450, desc: '단련된 강철 각반. 방어력 +40, HP +100' },
        leggings_frost: { name: '서리의 각반', type: 'equip_leggings', def: 95, hp: 280, price: 2000, desc: '얼음 서리의 기운이 깃든 각반. 방어력 +95, HP +280' }
      },

      monsters: {
        // [일반 적 2배, 보스 3배, 흑룡맵 일반몹 5배, 흑룡 6배, 제우스 극강 밸런스 적용 완료]
        // Zone 1: Forest (1~10Lv) [일반 2배, 보스 3배]
        slime: { name: '숲 슬라임', level: 1, hp: 180, maxHp: 180, atk: 40, def: 4, exp: 70, gold: 60, sprite: 'slime' },
        goblin: { name: '숲 고블린', level: 4, hp: 340, maxHp: 340, atk: 72, def: 8, exp: 150, gold: 110, sprite: 'goblin' },
        wolf: { name: '사나운 늑대', level: 8, hp: 560, maxHp: 560, atk: 112, def: 14, exp: 260, gold: 180, sprite: 'wolf' },
        boss_king_slime: { name: '👑 거대 숲 킹슬라임', level: 12, hp: 2700, maxHp: 2700, atk: 270, def: 25, exp: 1800, gold: 2400, sprite: 'king_slime', boss: true },

        // Zone 2: Cave (10~25Lv) [일반 2배, 보스 3배]
        bat: { name: '동굴 흡혈박쥐', level: 14, hp: 880, maxHp: 880, atk: 208, def: 28, exp: 560, gold: 360, sprite: 'bat' },
        spider: { name: '맹독 거미', level: 18, hp: 1400, maxHp: 1400, atk: 288, def: 44, exp: 900, gold: 560, sprite: 'spider' },
        golem: { name: '바위 골렘', level: 23, hp: 2080, maxHp: 2080, atk: 392, def: 76, exp: 1400, gold: 840, sprite: 'golem' },
        boss_troll: { name: '👑 동굴 트롤 족장', level: 27, hp: 8100, maxHp: 8100, atk: 810, def: 80, exp: 6600, gold: 7500, sprite: 'troll', boss: true },

        // Zone 3: Swamp (25~45Lv) [일반 2배, 보스 3배]
        ghoul: { name: '늪지 구울', level: 30, hp: 3000, maxHp: 3000, atk: 600, def: 100, exp: 2400, gold: 1200, sprite: 'ghoul' },
        wraith: { name: '망령 사령', level: 37, hp: 4400, maxHp: 4400, atk: 780, def: 130, exp: 3800, gold: 1900, sprite: 'wraith' },
        hydra: { name: '독늪 히드라', level: 43, hp: 6600, maxHp: 6600, atk: 1000, def: 170, exp: 6000, gold: 3200, sprite: 'hydra' },
        boss_lich: { name: '👑 심연의 네크로맨서 리치', level: 47, hp: 25200, maxHp: 25200, atk: 1980, def: 180, exp: 24000, gold: 18000, sprite: 'lich', boss: true },

        // Zone 4: Snow (45~70Lv) [일반 2배, 보스 3배]
        frost_wolf: { name: '서리 은빛늑대', level: 50, hp: 9600, maxHp: 9600, atk: 1440, def: 240, exp: 11000, gold: 4800, sprite: 'wolf' },
        yeti: { name: '설산 예티 거인', level: 59, hp: 14400, maxHp: 14400, atk: 1840, def: 320, exp: 17000, gold: 7600, sprite: 'yeti' },
        ice_spirit: { name: '빙설의 서리정령', level: 67, hp: 19200, maxHp: 19200, atk: 2320, def: 390, exp: 26000, gold: 11000, sprite: 'spirit' },
        boss_frost_wyrm: { name: '👑 설원의 빙룡 프로스트 웜', level: 72, hp: 72000, maxHp: 72000, atk: 4320, def: 360, exp: 96000, gold: 54000, sprite: 'wyrm', boss: true },

        // Zone 5: Volcano (70~90Lv) [일반 2배, 보스 3배]
        hell_hound: { name: '지옥불 케르베로스', level: 75, hp: 28800, maxHp: 28800, atk: 3280, def: 540, exp: 44000, gold: 18000, sprite: 'wolf' },
        lava_titan: { name: '용암 마그마 타이탄', level: 83, hp: 39200, maxHp: 39200, atk: 4000, def: 680, exp: 64000, gold: 28000, sprite: 'golem' },
        ifrit: { name: '화염의 마신 이프리트', level: 89, hp: 54000, maxHp: 54000, atk: 4800, def: 800, exp: 90000, gold: 40000, sprite: 'ifrit' },
        boss_balrog: { name: '👑 지옥의 군주 염제 발록', level: 92, hp: 168000, maxHp: 168000, atk: 8880, def: 750, exp: 270000, gold: 135000, sprite: 'balrog', boss: true },

        // Zone 6 & 7: Dungeon Citadel & Dragon Nest (90~100Lv) [일반 몬스터 5배, 흑룡 6배]
        dark_knight: { name: '어둠의 성채 흑기사', level: 93, hp: 180000, maxHp: 180000, atk: 15800, def: 1200, exp: 325000, gold: 125000, sprite: 'guard' },
        death_priest: { name: '파멸의 데스 프리스트', level: 97, hp: 220000, maxHp: 220000, atk: 18200, def: 1400, exp: 425000, gold: 175000, sprite: 'lich' },
        boss_dragon: { name: '👑 어둠의 패왕 고대 흑룡 (최종 보스)', level: 100, hp: 840000, maxHp: 840000, atk: 28800, def: 2400, exp: 1800000, gold: 600000, sprite: 'dragon', boss: true },

        // Advancement Trial Bosses [3배 상향]
        trial_boss_tier2: { name: '⚔️ [2차 전직 시험관] 환영의 수호자', level: 22, hp: 13200, maxHp: 13200, atk: 930, def: 90, exp: 9000, gold: 4500, sprite: 'guard', isTrial: true },
        trial_boss_tier3: { name: '🔮 [3차 전직 시험관] 각성의 그림자', level: 52, hp: 51000, maxHp: 51000, atk: 3120, def: 280, exp: 54000, gold: 24000, sprite: 'lich', isTrial: true },
        trial_boss_tier4: { name: '👑 [최종 전직 시험관] 전설의 마스터 영혼', level: 100, hp: 228000, maxHp: 228000, atk: 10800, def: 950, exp: 300000, gold: 150000, sprite: 'dragon', isTrial: true },

        // ★ [진짜 최종보스: 번개의 신 제우스 (Lv.200) - 신화적 극강 위력!] ★
        boss_zeus: { name: '👑 [진 최종보스] 번개의 신 제우스', level: 200, hp: 2800000, maxHp: 2800000, atk: 65000, def: 8500, exp: 10000000, gold: 5000000, sprite: 'zeus', boss: true }
      }
    };

    // DB.items 모든 아이템에 id 자동 할당 (누락 방지)
    Object.keys(DB.items).forEach(key => {
      DB.items[key].id = key;
    });

