/**
 * 게시글 로더 - 마크다운 파싱 및 Giscus 댓글 로드
 */
(function () {
  // URL에서 파일명 가져오기
  function getPostFile() {
    const params = new URLSearchParams(window.location.search);
    return params.get('file');
  }

  // 마크다운 파일 로드
  async function loadPost() {
    const file = getPostFile();

    if (!file) {
      showError('게시글을 찾을 수 없습니다.');
      return;
    }

    try {
      const response = await fetch('pages/' + file);
      if (!response.ok) {
        throw new Error('게시글을 불러올 수 없습니다.');
      }

      let content = await response.text();

      // UTF-8 BOM 제거 (Windows 호환)
      if (content.charCodeAt(0) === 0xfeff) {
        content = content.slice(1);
      }

      const parsed = parseFrontMatter(content);
      renderPost(parsed);
      loadGiscus();
    } catch (error) {
      console.error('게시글 로드 실패:', error);
      showError('게시글을 불러오는 데 실패했습니다.');
    }
  }

  // Front Matter 파싱
  function parseFrontMatter(content) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

    if (!match) {
      return {
        metadata: {},
        content: content,
      };
    }

    const frontMatter = match[1];
    const postContent = match[2];
    const metadata = {};

    // Front Matter 라인 파싱
    const lines = frontMatter.split(/\r?\n/);
    lines.forEach(function (line) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // 따옴표 제거
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // 배열 파싱 (tags)
        if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = value
              .slice(1, -1)
              .split(',')
              .map(function (tag) {
                return tag.trim().replace(/^['"]|['"]$/g, '');
              });
          }
        }

        metadata[key] = value;
      }
    });

    return {
      metadata: metadata,
      content: postContent,
    };
  }

  // 게시글 렌더링
  function renderPost(parsed) {
    const metadata = parsed.metadata;
    const content = parsed.content;

    // 제목 설정
    const titleEl = document.getElementById('post-title');
    if (titleEl) {
      titleEl.textContent = metadata.title || '제목 없음';
      document.title = metadata.title + ' - My Blog';
    }

    // 날짜 설정
    const dateEl = document.getElementById('post-date');
    if (dateEl && metadata.date) {
      dateEl.textContent = metadata.date;
    }

    // 카테고리 설정
    const categoryEl = document.getElementById('post-category');
    if (categoryEl && metadata.category) {
      categoryEl.textContent = metadata.category;
    }

    // 태그 설정
    const tagsEl = document.getElementById('post-tags');
    if (tagsEl && Array.isArray(metadata.tags)) {
      tagsEl.innerHTML = metadata.tags
        .map(function (tag) {
          return '<span class="post-tag">' + escapeHtml(tag) + '</span>';
        })
        .join('');
    }

    // 본문 마크다운 변환
    const contentEl = document.getElementById('post-content');
    if (contentEl && typeof marked !== 'undefined') {
      // marked 설정
      marked.setOptions({
        highlight: function (code, lang) {
          if (typeof Prism !== 'undefined' && Prism.languages[lang]) {
            return Prism.highlight(code, Prism.languages[lang], lang);
          }
          return code;
        },
        breaks: true,
        gfm: true,
      });

      contentEl.innerHTML = marked.parse(content);

      // Prism 하이라이팅 적용
      if (typeof Prism !== 'undefined') {
        Prism.highlightAllUnder(contentEl);
      }
    }
  }

  // Giscus 댓글 로드
  function loadGiscus() {
    const container = document.getElementById('giscus-container');
    if (!container) return;

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'jgo197673-dot/jgo197673-dot.github.io');
    script.setAttribute('data-repo-id', 'YOUR_REPO_ID'); // Giscus 설정 후 업데이트 필요
    script.setAttribute('data-category', 'General');
    script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID'); // Giscus 설정 후 업데이트 필요
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '1');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', 'preferred_color_scheme');
    script.setAttribute('data-lang', 'ko');
    script.setAttribute('data-loading', 'lazy');
    script.crossOrigin = 'anonymous';
    script.async = true;

    container.appendChild(script);
  }

  // 에러 메시지 표시
  function showError(message) {
    const titleEl = document.getElementById('post-title');
    const contentEl = document.getElementById('post-content');

    if (titleEl) titleEl.textContent = '오류';
    if (contentEl) {
      contentEl.innerHTML =
        '<div class="loading">' + escapeHtml(message) + '</div>';
    }
  }

  // HTML 이스케이프
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 초기화
  document.addEventListener('DOMContentLoaded', loadPost);
})();

