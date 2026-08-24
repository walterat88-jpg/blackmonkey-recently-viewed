/**
 * Black Monkey — Widget "Últimos vistos"
 * Trackea productos visitados (localStorage) y los muestra en un widget
 * flotante en la home. Sin dependencias externas.
 */
(function () {
  var STORAGE_KEY = 'bm_recently_viewed_v3';
  var MAX_STORED = 12;
  var DISPLAY_COUNT = 6;

  // URL del ícono del ojo servido desde jsDelivr (se reemplaza al pinear el commit).
  var BM_EYE_ICON = 'https://cdn.jsdelivr.net/gh/walterat88-jpg/blackmonkey-recently-viewed@c412177a891b44fa7a0eda81687373cc30f1bcf1/eye-icon.png';

  var STYLE = '' +
    '#bm-recently-viewed{position:fixed!important;top:50%;right:0;transform:translateY(-50%);z-index:999999!important;display:flex;align-items:stretch;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}' +
    '#bm-recently-viewed .bm-rv-tab{background:#000000;color:#f2ede3;padding:10px;border-radius:0;cursor:pointer;border:1px solid #999999;border-right:none;user-select:none;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:44px;height:44px;position:relative;}' +
    '#bm-recently-viewed .bm-rv-tab .bm-rv-tooltip{position:absolute;right:calc(100% + 8px);top:50%;transform:translateY(-50%);background:#000000;color:#f2ede3;border:1px solid #999999;padding:6px 10px;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity 0.15s ease;}' +
    '#bm-recently-viewed .bm-rv-tab:hover .bm-rv-tooltip{opacity:1;}' +
    '#bm-recently-viewed .bm-rv-tab img{width:30px;height:30px;display:block;object-fit:contain;}' +
    '#bm-recently-viewed .bm-rv-panel{background:#1a1a1a;border:1px solid #999999;border-radius:0;padding:10px;display:flex;flex-direction:column;gap:8px;max-height:70vh;overflow-y:auto;transform:translateX(0);opacity:1;transition:transform 0.3s ease,opacity 0.25s ease,max-width 0.3s ease,padding 0.3s ease;}' +
    '#bm-recently-viewed.bm-rv-collapsed .bm-rv-panel{transform:translateX(100%);opacity:0;max-width:0;padding-left:0;padding-right:0;overflow:hidden;border:none;}' +
    '#bm-recently-viewed .bm-rv-item{width:96px;height:96px;background:#f2ede3;border-radius:0;overflow:hidden;display:block;position:relative;text-decoration:none;border:1px solid #999999;flex-shrink:0;}' +
    '#bm-recently-viewed .bm-rv-item img{width:100%;height:100%;object-fit:cover;display:block;}' +
    '#bm-recently-viewed .bm-rv-item .bm-rv-price{position:absolute;bottom:0;left:0;right:0;background:rgba(26,26,26,0.85);color:#f2ede3;font-size:10px;text-align:center;padding:2px 0;}' +
    '@media (max-width:768px){#bm-recently-viewed .bm-rv-item{width:56px;height:56px;}#bm-recently-viewed .bm-rv-tab{width:36px;height:36px;}#bm-recently-viewed .bm-rv-tab img{width:22px;height:22px;}#bm-recently-viewed .bm-rv-panel{max-height:50vh;}}';

  function injectStyle() {
    var tag = document.createElement('style');
    tag.textContent = STYLE;
    document.head.appendChild(tag);
  }

  function getMeta(prop) {
    var el = document.querySelector('meta[property="' + prop + '"]') ||
             document.querySelector('meta[name="' + prop + '"]');
    return el ? el.getAttribute('content') : null;
  }

  // Tienda Nube envuelve la ficha de producto en un contenedor con
  // itemtype="http://schema.org/Product" (datos estructurados estándar del theme).
  // Más confiable que depender de meta og: tags, que varían por theme.
  function getProductContainer() {
    return document.querySelector('[itemtype="http://schema.org/Product"]') ||
           document.getElementById('single-product');
  }

  function isHomePage() {
    var p = window.location.pathname;
    return p === '/' || p === '' || p === '/index.html';
  }

  function isProductPage() {
    return !!getProductContainer() && !isHomePage();
  }

  function extractProductData() {
    var container = getProductContainer();
    if (!container) return null;

    var title =
      (container.querySelector('[itemprop="name"]') || {}).textContent ||
      getMeta('og:title') ||
      document.title;

    var imageEl = container.querySelector('[itemprop="image"]');
    var image =
      (imageEl && (imageEl.getAttribute('content') || imageEl.getAttribute('src'))) ||
      getMeta('og:image');

    var priceEl = container.querySelector('[itemprop="price"]');
    var price =
      (priceEl && (priceEl.getAttribute('content') || priceEl.textContent)) ||
      getMeta('product:price:amount') ||
      getMeta('og:price:amount');

    var url = window.location.href;

    if (!title || !url) return null;
    return { title: title.trim(), image: image, url: url, price: price };
  }

  function getViewed() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveViewed(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function formatPrice(raw) {
    var n = parseFloat(raw);
    if (isNaN(n)) return '';
    return '$' + Math.round(n).toLocaleString('es-AR');
  }

  function trackCurrentProduct() {
    if (!isProductPage()) return;

    var data = extractProductData();
    if (!data) return;

    var list = getViewed().filter(function (p) { return p.url !== data.url; });
    list.unshift({ title: data.title, image: data.image, url: data.url, price: data.price, ts: Date.now() });
    if (list.length > MAX_STORED) list = list.slice(0, MAX_STORED);
    saveViewed(list);
  }

  function renderWidget() {
    if (!isHomePage()) return;

    var list = getViewed().slice(0, DISPLAY_COUNT);
    if (!list.length) return;

    var wrap = document.createElement('div');
    wrap.id = 'bm-recently-viewed';

    var tab = document.createElement('div');
    tab.className = 'bm-rv-tab';
    tab.innerHTML = '<img src="' + BM_EYE_ICON + '" alt="Últimos vistos" />' +
      '<span class="bm-rv-tooltip">Últimos vistos</span>';

    var panel = document.createElement('div');
    panel.className = 'bm-rv-panel';

    list.forEach(function (item) {
      var a = document.createElement('a');
      a.className = 'bm-rv-item';
      a.href = item.url;
      a.title = item.title;

      if (item.image) {
        var img = document.createElement('img');
        img.src = item.image;
        img.alt = item.title;
        img.loading = 'lazy';
        a.appendChild(img);
      }

      var priceText = formatPrice(item.price);
      if (priceText) {
        var priceEl = document.createElement('span');
        priceEl.className = 'bm-rv-price';
        priceEl.textContent = priceText;
        a.appendChild(priceEl);
      }

      panel.appendChild(a);
    });

    tab.addEventListener('click', function () {
      wrap.classList.toggle('bm-rv-collapsed');
    });

    wrap.appendChild(panel);
    wrap.appendChild(tab);
    document.body.appendChild(wrap);
  }

  function init() {
    injectStyle();
    trackCurrentProduct();

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      renderWidget();
    } else {
      document.addEventListener('DOMContentLoaded', renderWidget);
    }
  }

  init();
})();
