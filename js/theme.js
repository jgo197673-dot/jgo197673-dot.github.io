/**
 * 다크/라이트 모드 토글 관리
 */
(function () {
  const THEME_KEY = 'blog-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  // 시스템 테마 감지
  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? DARK
      : LIGHT;
  }

  // 저장된 테마 또는 시스템 테마 가져오기
  function getSavedTheme() {
    return localStorage.getItem(THEME_KEY) || getSystemTheme();
  }

  // 테마 적용
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
  }

  // 테마 아이콘 업데이트
  function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
      icon.textContent = theme === DARK ? '☀️' : '🌙';
    }
  }

  // 테마 토글
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === DARK ? LIGHT : DARK;
    localStorage.setItem(THEME_KEY, newTheme);
    applyTheme(newTheme);
  }

  // 초기화
  function init() {
    // 즉시 테마 적용 (깜빡임 방지)
    applyTheme(getSavedTheme());

    // DOM 로드 후 이벤트 리스너 등록
    document.addEventListener('DOMContentLoaded', function () {
      const themeToggle = document.getElementById('theme-toggle');
      if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
      }

      // 시스템 테마 변경 감지
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', function (e) {
          if (!localStorage.getItem(THEME_KEY)) {
            applyTheme(e.matches ? DARK : LIGHT);
          }
        });
    });
  }

  init();
})();

