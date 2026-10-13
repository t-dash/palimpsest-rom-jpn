// Shared top bar. Include with <script src="js/nav.js"></script> right after <body>.
// Marks the current page active. Other scripts can call
// window.setBlogTarget('romania-500s') to make the Blog button deep-link.
(function () {
  const page = document.body.dataset.page || 'home';
  const links = [
    ['home', 'index.html', 'Home'],
    ['blog', 'blog.html', 'Blog'],
    ['credits', 'credits.html', 'Credits'],
    ['resources', 'resources.html', 'Resources'],
  ];

  const bar = document.createElement('header');
  bar.className = 'topbar';
  bar.innerHTML =
    '<a class="wordmark" href="index.html">Quilted Languages</a><nav>' +
    links
      .map(([id, href, label]) =>
        `<a href="${href}" data-nav="${id}"${id === page ? ' class="active"' : ''}>${label}</a>`)
      .join('') +
    '</nav>';
  document.body.prepend(bar);

  const blogLink = bar.querySelector('[data-nav="blog"]');
  window.setBlogTarget = function (anchor) {
    blogLink.href = anchor ? `blog.html#${anchor}` : 'blog.html';
  };
})();
