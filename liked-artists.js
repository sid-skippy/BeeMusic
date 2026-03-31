/**
 * BEE MUSIC — Universal Liked Artists Panel
 * Include this script on every page. It injects the floating panel + button.
 */
(function () {
  // ── Storage helpers ──
  function getLiked() {
    try { return JSON.parse(localStorage.getItem('bee_liked') || '[]'); } catch { return []; }
  }
  function setLiked(arr) {
    try { localStorage.setItem('bee_liked', JSON.stringify(arr)); } catch {}
  }

  // Expose global likeArtist so every page can call window.likeArtist(name, emoji)
  window.likeArtist = function (name, emoji) {
    var liked = getLiked();
    if (liked.find(function (a) { return a.name === name; })) {
      showToast(name + ' is already in your favourites!', '❤');
      return;
    }
    liked.push({ name: name, emoji: emoji || '🎵', ts: Date.now() });
    setLiked(liked);
    renderPanel();
    updateBadge();
    showToast('Added ' + name + ' to favourites!', '❤️');
  };

  window.unlikeArtist = function (name) {
    var liked = getLiked().filter(function (a) { return a.name !== name; });
    setLiked(liked);
    renderPanel();
    updateBadge();
  };

  // ── Inject CSS ──
  var style = document.createElement('style');
  style.textContent = `
    /* ── FAB Button ── */
    #bee-liked-fab {
      position: fixed;
      bottom: 28px;
      left: 28px;
      z-index: 10000;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--gold, #f4a300);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      box-shadow: 0 4px 24px rgba(244,163,0,0.4);
      transition: transform 0.2s, box-shadow 0.2s;
      outline: none;
    }
    #bee-liked-fab:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 32px rgba(244,163,0,0.55);
    }
    #bee-liked-fab-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #e53935;
      color: #fff;
      font-family: 'DM Sans', sans-serif;
      font-size: 10px;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #0d0d0d;
      display: none;
    }

    /* ── Panel ── */
    #bee-liked-panel {
      position: fixed;
      bottom: 92px;
      left: 28px;
      right: auto;
      z-index: 10000;
      width: 320px;
      background: #161616;
      border: 1px solid rgba(244,163,0,0.35);
      border-radius: 14px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(244,163,0,0.07);
      overflow: hidden;
      display: none;
      flex-direction: column;
      animation: panelIn 0.22s cubic-bezier(0.34,1.56,0.64,1);
      transform-origin: bottom left;
    }
    @keyframes panelIn {
      from { opacity: 0; transform: scale(0.88) translateY(12px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    #bee-liked-panel.open { display: flex; }

    .blp-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px 14px;
      border-bottom: 1px solid #2a2a2a;
      background: linear-gradient(135deg, rgba(244,163,0,0.08) 0%, transparent 100%);
    }
    .blp-title {
      font-family: 'ClashDisplay-Variable','Clash Display',sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #f0f0f0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .blp-title-icon {
      width: 26px;
      height: 26px;
      background: rgba(244,163,0,0.15);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
    }
    .blp-count {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      color: #f4a300;
      background: rgba(244,163,0,0.12);
      padding: 2px 8px;
      border-radius: 20px;
      font-weight: 600;
    }
    .blp-close {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      font-size: 18px;
      padding: 0;
      line-height: 1;
      transition: color 0.15s;
    }
    .blp-close:hover { color: #f0f0f0; background: none; }

    .blp-body {
      overflow-y: auto;
      max-height: 320px;
      padding: 8px 0;
      scrollbar-width: thin;
      scrollbar-color: #2a2a2a transparent;
    }

    .blp-empty {
      padding: 32px 20px;
      text-align: center;
    }
    .blp-empty-icon { font-size: 32px; margin-bottom: 10px; }
    .blp-empty p {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: #666;
      margin: 0;
      line-height: 1.6;
    }

    .blp-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 20px;
      transition: background 0.15s;
      cursor: default;
    }
    .blp-item:hover { background: rgba(255,255,255,0.03); }
    .blp-item-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2a1f00, #f4a300);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }
    .blp-item-name {
      font-family: 'ClashDisplay-Variable','Clash Display',sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #f0f0f0;
      flex: 1;
    }
    .blp-item-remove {
      background: none;
      border: none;
      color: #444;
      cursor: pointer;
      font-size: 14px;
      padding: 4px;
      border-radius: 4px;
      transition: color 0.15s, background 0.15s;
      line-height: 1;
    }
    .blp-item-remove:hover { color: #e53935; background: rgba(229,57,53,0.1); }

    .blp-footer {
      padding: 12px 20px;
      border-top: 1px solid #2a2a2a;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .blp-clear {
      background: none;
      border: none;
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      color: #555;
      cursor: pointer;
      padding: 0;
      transition: color 0.15s;
    }
    .blp-clear:hover { color: #e53935; background: none; }
    .blp-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      color: #444;
      letter-spacing: 0.5px;
    }

    /* ── Mini toast (used by this script only if no bee-toast-root) ── */
    #bee-mini-toast {
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%) translateY(10px);
      background: #1e1e1e;
      border: 1px solid rgba(244,163,0,0.3);
      border-radius: 8px;
      padding: 10px 20px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: #f0f0f0;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s, transform 0.2s;
      z-index: 10001;
      white-space: nowrap;
    }
    #bee-mini-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  `;
  document.head.appendChild(style);

  // ── Build DOM ──
  document.addEventListener('DOMContentLoaded', function () {
    // FAB
    var fab = document.createElement('button');
    fab.id = 'bee-liked-fab';
    fab.title = 'My Favourite Artists';
    fab.innerHTML = '❤ <span id="bee-liked-fab-badge"></span>';
    document.body.appendChild(fab);

    // Panel
    var panel = document.createElement('div');
    panel.id = 'bee-liked-panel';
    document.body.appendChild(panel);

    // Mini toast
    var miniToast = document.createElement('div');
    miniToast.id = 'bee-mini-toast';
    document.body.appendChild(miniToast);

    fab.addEventListener('click', function () {
      panel.classList.toggle('open');
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (!panel.contains(e.target) && e.target !== fab && !fab.contains(e.target)) {
        panel.classList.remove('open');
      }
    });

    renderPanel();
    updateBadge();
  });

  function renderPanel() {
    var panel = document.getElementById('bee-liked-panel');
    if (!panel) return;
    var liked = getLiked();

    var itemsHTML = liked.length === 0
      ? '<div class="blp-empty"><div class="blp-empty-icon">🎵</div><p>No favourites yet.<br>Hit ❤ on any artist to save them here.</p></div>'
      : liked.map(function (a) {
          return '<div class="blp-item">'
            + '<div class="blp-item-avatar">' + (a.emoji || '🎵') + '</div>'
            + '<div class="blp-item-name">' + a.name + '</div>'
            + '<button class="blp-item-remove" onclick="window.unlikeArtist(\'' + a.name.replace(/'/g, "\\'") + '\')" title="Remove">✕</button>'
            + '</div>';
        }).join('');

    panel.innerHTML =
      '<div class="blp-header">'
        + '<div class="blp-title"><div class="blp-title-icon">❤</div> Favourites <span class="blp-count">' + liked.length + '</span></div>'
        + '<button class="blp-close" onclick="document.getElementById(\'bee-liked-panel\').classList.remove(\'open\')">✕</button>'
      + '</div>'
      + '<div class="blp-body">' + itemsHTML + '</div>'
      + (liked.length > 0
        ? '<div class="blp-footer"><button class="blp-clear" onclick="window._beeClearAll()">Clear all</button><span class="blp-label">synced across pages</span></div>'
        : '');
  }

  function updateBadge() {
    var badge = document.getElementById('bee-liked-fab-badge');
    if (!badge) return;
    var count = getLiked().length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  window._beeClearAll = function () {
    setLiked([]);
    renderPanel();
    updateBadge();
  };

  var _toastTimer;
  function showToast(msg, icon) {
    // Try the existing bee-toast system first
    var toastRoot = document.getElementById('react-toast-root');
    if (toastRoot && window._beeToastQueue) {
      window._beeToastQueue(msg); return;
    }
    var t = document.getElementById('bee-mini-toast');
    if (!t) return;
    t.textContent = (icon || '🎵') + '  ' + msg;
    t.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }
})();
