    /* ==========================================================================
       4. QUEST SYSTEM (Free Map Traversal Enabled)
       ========================================================================== */
    const Quest = {
      stage: 0,
      kills: 0,
      stages: [
        { title: '1. 장로의 첫 부름', goal: '마을 광장에 있는 장로 에드워드와 대화하기' },
        { title: '2. 숲의 마물 소탕', goal: '속삭이는 숲에서 몬스터 3마리 처치' },
        { title: '3. 전직 완료하기', goal: '원하는 직업의 전직관을 찾아가 1차 전직하기 (전직 1개만 하면 완료)' },
        { title: '4. 킹 슬라임 토벌', goal: '속삭이는 숲에서 [거대 킹 슬라임] 처치' },
        { title: '5. 바위 동굴의 참극', goal: '바위 동굴의 [동굴 트롤 족장] 토벌하기' },
        { title: '6. 망령 늪지의 정화', goal: '안개 늪지에서 [심연의 리치] 처치' },
        { title: '7. 설원의 만년설 빙룡', goal: '만년 설원의 [빙룡 프로스트 웜] 처치' },
        { title: '8. 화산의 염제 발록', goal: '불타는 화산의 [염제 발록] 처치' },
        { title: '9. 마왕 흑룡 토벌 (크로노스 필요!)', goal: '어둠의 성채 심연의 [고대 흑룡] 처치 (최종검 크로노스 장착 필수!)' },
        { title: '10. 진 최종보스 제우스 토벌', goal: '흑룡의 날개를 획득하고 올림포스 정상의 [번개의 신 제우스 (Lv.200)] 격파' },
        { title: '11. 절대신의 강림 🏆', goal: '제우스를 꺾고 신(God)이 되었습니다! 세상의 평화와 어드민 권능 획득' }
      ],

      getCurrentGoal() {
        if (this.stage === 1) return `속삭이는 숲에서 몬스터 처치 (현재: ${this.kills}/3)`;
        return this.stages[this.stage].goal;
      },

      checkKill(enemyKey) {
        if (this.stage === 1) {
          this.kills++;
          if (this.kills >= 3) {
            this.stage = 2;
            Game.showDialogue('퀘스트 알림', ['숲의 마물들을 소탕했습니다! 전직관을 찾아가 1차 전직을 완료하세요.']);
          }
        } else if (this.stage === 3 && enemyKey === 'boss_king_slime') {
          this.stage = 4;
          Game.showDialogue('퀘스트 완료', ['킹 슬라임을 쓰러뜨렸습니다! 동굴 트롤 족장을 토벌하러 가세요.']);
        } else if (this.stage === 4 && enemyKey === 'boss_troll') {
          this.stage = 5;
          Game.showDialogue('퀘스트 완료', ['동굴 트롤 족장을 격파했습니다! 안개 늪지의 리치를 정화하세요.']);
        } else if (this.stage === 5 && enemyKey === 'boss_lich') {
          this.stage = 6;
          Game.showDialogue('퀘스트 완료', ['심연의 리치를 쓰러뜨렸습니다! 설원의 빙룡을 토벌하세요.']);
        } else if (this.stage === 6 && enemyKey === 'boss_frost_wyrm') {
          this.stage = 7;
          Game.showDialogue('퀘스트 완료', ['빙룡을 격파했습니다! 화산의 염제 발록을 향해 진격하세요.']);
        } else if (this.stage === 7 && enemyKey === 'boss_balrog') {
          this.stage = 8;
          Game.showDialogue('퀘스트 완료', ['염제 발록을 처치했습니다! 어둠의 성채 심연의 고대 흑룡과의 결전이 기다립니다! (주의: 상점에서 [최종검 크로노스]를 준비해야 합니다!)']);
        } else if (this.stage === 8 && enemyKey === 'boss_dragon') {
          this.stage = 9;
        } else if (this.stage === 9 && enemyKey === 'boss_zeus') {
          this.stage = 10;
        }
      }
    };

// Board alias for Quest system
const Board = Quest;
