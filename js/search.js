/**
 * 검색 기능 관리
 */
let searchPosts = [];
let searchCallback = null;

// 검색용 게시글 데이터 설정
function setSearchPosts(posts, callback) {
  searchPosts = posts;
  searchCallback = callback;
}

// 검색 실행
function performSearch(query) {
  if (!query.trim()) {
    return searchPosts;
  }

  const lowerQuery = query.toLowerCase().trim();

  return searchPosts.filter(function (post) {
    const titleMatch = post.title.toLowerCase().includes(lowerQuery);
    const excerptMatch = post.excerpt.toLowerCase().includes(lowerQuery);
    const categoryMatch = post.category.toLowerCase().includes(lowerQuery);
    const tagsMatch = post.tags.some(function (tag) {
      return tag.toLowerCase().includes(lowerQuery);
    });
    const descriptionMatch = post.description.toLowerCase().includes(lowerQuery);

    return titleMatch || excerptMatch || categoryMatch || tagsMatch || descriptionMatch;
  });
}

// 검색 초기화
function initSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  let debounceTimer;

  searchInput.addEventListener('input', function (e) {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(function () {
      const query = e.target.value;
      const results = performSearch(query);

      if (searchCallback) {
        searchCallback(results, query);
      }
    }, 200);
  });
}

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', initSearch);

