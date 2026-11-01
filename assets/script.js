/* ==========================================================
   页面渲染逻辑
   一般不用改这个文件。项目内容在 assets/projects.js 里。
   ========================================================== */

(function () {
  'use strict';

  var data = window.PROJECTS || [];
  var list = document.getElementById('project-list');

  /* ---------- 生成项目卡片 ---------- */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function buildProject(p, i) {
    var article = el('article', 'project');
    if (p.id) article.id = p.id;

    // 标题行
    var head = el('div', 'project-head');
    head.appendChild(el('span', 'project-index', pad(i + 1)));
    var headText = el('div');
    headText.appendChild(el('h3', null, p.title || '未命名项目'));
    if (p.subtitle) headText.appendChild(el('p', 'project-subtitle', p.subtitle));
    head.appendChild(headText);
    article.appendChild(head);

    // 元信息
    var metaPairs = [
      ['时间', p.period],
      ['角色', p.role],
      ['工具', (p.tags || []).join(' · ')]
    ].filter(function (kv) { return kv[1]; });

    if (metaPairs.length) {
      var meta = el('div', 'project-meta');
      metaPairs.forEach(function (kv) {
        var item = el('span');
        item.appendChild(el('b', null, kv[0]));
        item.appendChild(document.createTextNode(kv[1]));
        meta.appendChild(item);
      });
      article.appendChild(meta);
    }

    // 说明
    if (p.summary) {
      article.appendChild(el('p', 'project-summary', p.summary));
    }

    // 亮点
    if (p.highlights && p.highlights.length) {
      var ul = el('ul', 'highlights');
      p.highlights.forEach(function (h) {
        ul.appendChild(el('li', null, h));
      });
      article.appendChild(ul);
    }

    // 代码片段（可选：info.json 里写 "code": [{ "title": "...", "text": "..." }]）
    var codeList = Array.isArray(p.code) ? p.code : [];
    codeList.forEach(function (c) {
      var box = el('div', 'project-code');
      box.appendChild(el('div', 'code-title', c.title || '代码'));
      var pre = el('pre');
      pre.appendChild(el('code', null, c.text || ''));
      box.appendChild(pre);
      article.appendChild(box);
    });

    // 下载入口（可选：info.json 里写 "download": "projects/xx/yy.apk"）
    if (p.download) {
      var dl = el('p', 'project-download');
      var a = el('a', null, p.downloadLabel || '下载安装包');
      a.href = p.download;
      a.setAttribute('download', '');
      dl.appendChild(a);
      article.appendChild(dl);
    }

    // 图库
    var images = p.images || [];
    if (images.length) {
      var gallery = el('div', 'gallery');
      images.forEach(function (img, idx) {
        var fig = el('figure');
        var image = el('img');
        image.src = img.src;
        image.alt = img.alt || p.title || '';
        image.decoding = 'async';

        // 项目内第 1 张、第 4 张是竖图时，默认给个最大高度限制，避免过长
        image.addEventListener('click', function () {
          openLightbox(images, idx);
        });

        fig.appendChild(image);
        if (img.caption) fig.appendChild(el('figcaption', null, img.caption));
        gallery.appendChild(fig);
      });
      article.appendChild(gallery);
    } else {
      var empty = el('div', 'gallery-empty');
      empty.appendChild(el('strong', null, '图片待补充'));
      empty.appendChild(el('span', null,
        '把截图放进 projects/' + (p.id || '项目文件夹') + '/ ，双击「刷新列表.ps1」后就会出现在这里。'));
      article.appendChild(empty);
    }

    return article;
  }

  if (data.length) {
    data.forEach(function (p, i) {
      list.appendChild(buildProject(p, i));
    });
  } else {
    list.appendChild(el('div', 'gallery-empty',
      '还没有项目。把图片放进 projects/ 下的文件夹，然后运行「刷新列表.ps1」。'));
  }

  /* ---------- 图片放大 ---------- */

  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var lbCaption = document.getElementById('lb-caption');
  var current = [];
  var index = 0;

  function show(i) {
    if (!current.length) return;
    index = (i + current.length) % current.length;
    var img = current[index];
    lbImg.src = img.src;
    lbImg.alt = img.alt || '';
    lbCaption.textContent = img.caption || img.alt || '';
  }

  function openLightbox(images, i) {
    current = images;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    show(i);
  }

  function closeLightbox() {
    lb.hidden = true;
    lbImg.src = '';
    document.body.style.overflow = '';
    current = [];
  }

  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click', function () { show(index - 1); });
  document.getElementById('lb-next').addEventListener('click', function () { show(index + 1); });

  lb.addEventListener('click', function (e) {
    if (e.target === lb) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  /* ---------- 次要 ---------- */

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
