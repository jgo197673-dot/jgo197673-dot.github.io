/**
 * 메인 애플리케이션 - 게시글 목록 관리
 */
(function () {
  let allPosts = [];
  let activeTag = null;

  // 게시글 목록 로드
  async function loadPosts() {
    try {
      const response = await fetch('posts.json');
      if (!response.ok) {
        throw new Error('posts.json을 불러올 수 없습니다.');
      }
      allPosts = await response.json();

      // 검색 모듈에 데이터 전달
      if (typeof setSearchPosts === 'function') {
        setSearchPosts(allPosts, handleSearchResults);
      }

      renderTags();
      renderPosts(allPosts);
    } catch (error) {
      console.error('게시글 로드 실패:', error);
      showError('게시글을 불러오는 데 실패했습니다.');
    }
  }

  // 태그 렌더링
  function renderTags() {
    const container = document.getElementById('tags-container');
    if (!container) return;

    // 모든 태그 수집 (중복 제거)
    const tagSet = new Set();
    allPosts.forEach(function (post) {
      post.tags.forEach(function (tag) {
        tagSet.add(tag);
      });
    });

    const tags = Array.from(tagSet).sort();

    if (tags.length === 0) {
      container.style.display = 'none';
      return;
    }

    // "전체" 태그 추가
    let html = '<button class="tag active" data-tag="">전체</button>';

    tags.forEach(function (tag) {
      html += '<button class="tag" data-tag="' + escapeHtml(tag) + '">' + escapeHtml(tag) + '</button>';
    });

    container.innerHTML = html;

    // 태그 클릭 이벤트
    container.querySelectorAll('.tag').forEach(function (tagEl) {
      tagEl.addEventListener('click', function () {
        const tag = this.getAttribute('data-tag');
        setActiveTag(tag);
      });
    });
  }

  // 활성 태그 설정
  function setActiveTag(tag) {
    activeTag = tag || null;

    // 태그 버튼 스타일 업데이트
    document.querySelectorAll('.tag').forEach(function (tagEl) {
      const tagValue = tagEl.getAttribute('data-tag');
      if (tagValue === (tag || '')) {
        tagEl.classList.add('active');
      } else {
        tagEl.classList.remove('active');
      }
    });

    // 필터링된 게시글 렌더링
    filterAndRenderPosts();
  }

  // 게시글 필터링 및 렌더링
  function filterAndRenderPosts() {
    let filtered = allPosts;

    if (activeTag) {
      filtered = allPosts.filter(function (post) {
        return post.tags.includes(activeTag);
      });
    }

    // 검색어가 있으면 검색 결과와 교차
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.value.trim()) {
      const searchResults = performSearch(searchInput.value);
      filtered = filtered.filter(function (post) {
        return searchResults.some(function (r) {
          return r.file === post.file;
        });
      });
    }

    renderPosts(filtered);
  }

  // 검색 결과 핸들러
  function handleSearchResults(results, query) {
    let filtered = results;

    if (activeTag) {
      filtered = results.filter(function (post) {
        return post.tags.includes(activeTag);
      });
    }

    renderPosts(filtered);
  }

  // 게시글 카드 렌더링
  function renderPosts(posts) {
    const container = document.getElementById('posts-container');
    const noResults = document.getElementById('no-results');

    if (!container) return;

    if (posts.length === 0) {
      container.innerHTML = '';
      if (noResults) noResults.style.display = 'block';
      return;
    }

    if (noResults) noResults.style.display = 'none';

    const html = posts
      .map(function (post) {
        const tagsHtml = post.tags
          .map(function (tag) {
            return '<span class="post-card-tag">' + escapeHtml(tag) + '</span>';
          })
          .join('');

        return (
          '<a href="post.html?file=' +
          encodeURIComponent(post.file) +
          '" class="post-card">' +
          '<h2 class="post-card-title">' +
          escapeHtml(post.title) +
          '</h2>' +
          '<div class="post-card-meta">' +
          '<span class="post-card-date">' +
          escapeHtml(post.date) +
          '</span>' +
          (post.category
            ? '<span class="post-card-category">' +
              escapeHtml(post.category) +
              '</span>'
            : '') +
          '</div>' +
          '<p class="post-card-excerpt">' +
          escapeHtml(post.excerpt) +
          '</p>' +
          '<div class="post-card-tags">' +
          tagsHtml +
          '</div>' +
          '</a>'
        );
      })
      .join('');

    container.innerHTML = html;
  }

  // 에러 메시지 표시
  function showError(message) {
    const container = document.getElementById('posts-container');
    if (container) {
      container.innerHTML =
        '<div class="no-results">' + escapeHtml(message) + '</div>';
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
  document.addEventListener('DOMContentLoaded', loadPosts);
})();

