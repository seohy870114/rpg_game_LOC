/* ==========================================================================
   11. MAIN ENTRY POINT & EVENT LISTENERS
   ========================================================================== */
    // Global Error Logger
    window.addEventListener('error', function(e) {
      console.error('게임 실행 오류 발생:', e);
      const banner = document.getElementById('error-banner');
      if (banner) {
        banner.style.display = 'block';
        banner.innerHTML = '⚠️ 오류 발생: ' + (e.message || '스크립트 오류') + '<br><small>' + (e.filename || '') + ':' + (e.lineno || '') + '</small>';
      }
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => Game.init());
    } else {
      Game.init();
    }

