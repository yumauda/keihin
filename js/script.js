
jQuery(function ($) { // この中であればWordpressでも「$」が使用可能になる

  const $topBtn = $('.js-pagetop');
  const $mv = $('.p-mv');
  const $header = $('.js-header');
  const $translate = $('.js-translate');
  const $translateToggle = $('.js-translate-toggle');
  const $translateMenu = $('.js-translate-menu');
  const $translateOptions = $('.js-translate-option');

  const params = new URLSearchParams(window.location.search);
  const sentType = params.get('sent');

  const SCROLL_KEY = 'hakoSkan_scrollY';
  const TRANSLATE_STORAGE_KEY = 'keihinTranslateLang';
  let translateScriptRequested = false;
  let pendingTranslateLang = null;

  function getCurrentTranslateLang() {
    return 'ja';
  }

  function syncTranslateUi(lang) {
    const currentLang = lang === 'en' ? 'en' : 'ja';
    if (!$translate.length) return;

    $translate.attr('data-current-lang', currentLang);
    $translateOptions.removeClass('is-current');
    $translateOptions.filter('[data-lang="' + currentLang + '"]').addClass('is-current');

    try {
      localStorage.setItem(TRANSLATE_STORAGE_KEY, currentLang);
    } catch (e) {
      // ignore
    }
  }

  function setTranslateMenuState(isOpen) {
    if (!$translateMenu.length || !$translateToggle.length) return;
    $translateToggle.attr('aria-expanded', isOpen ? 'true' : 'false');
    $translateMenu.prop('hidden', !isOpen);
  }

  function getTranslateCombo() {
    return document.querySelector('.goog-te-combo');
  }

  function clearTranslateCookies() {
    const hostname = window.location.hostname;
    const domains = [hostname, '.' + hostname];

    if (hostname.indexOf('.') !== -1) {
      const parts = hostname.split('.');
      for (let i = 1; i < parts.length - 1; i++) {
        domains.push('.' + parts.slice(i).join('.'));
      }
    }

    domains.forEach(function (domain) {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=' + domain;
    });
  }

  function resetTranslateToJapanese() {
    clearTranslateCookies();
    try {
      localStorage.setItem(TRANSLATE_STORAGE_KEY, 'ja');
    } catch (e) {
      // ignore
    }
  }

  function applyEnglishTranslation() {
    const combo = getTranslateCombo();
    if (!combo) return false;
    combo.value = 'en';
    combo.dispatchEvent(new Event('change'));
    syncTranslateUi('en');
    return true;
  }

  function waitForTranslateCombo(callback) {
    let tries = 0;
    const timer = window.setInterval(function () {
      const combo = getTranslateCombo();
      tries += 1;

      if (combo) {
        window.clearInterval(timer);
        callback(combo);
        return;
      }

      if (tries > 50) {
        window.clearInterval(timer);
      }
    }, 200);
  }

  window.googleTranslateElementInit = function () {
    if (!window.google || !window.google.translate) return;

    new window.google.translate.TranslateElement({
      pageLanguage: 'ja',
      includedLanguages: 'ja,en',
      autoDisplay: false
    }, 'google_translate_element');

    waitForTranslateCombo(function () {
      if (pendingTranslateLang === 'en') {
        applyEnglishTranslation();
        pendingTranslateLang = null;
      }
    });
  };

  function ensureTranslateScript() {
    if (window.google && window.google.translate && getTranslateCombo()) return;
    if (translateScriptRequested) return;

    translateScriptRequested = true;
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }

  function formatDateTimeJP(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const pad2 = (n) => String(n).padStart(2, '0');
    return (
      date.getFullYear() +
      '/' + pad2(date.getMonth() + 1) +
      '/' + pad2(date.getDate()) +
      ' (' + days[date.getDay()] + ') ' +
      pad2(date.getHours()) + ':' + pad2(date.getMinutes()) + ':' + pad2(date.getSeconds())
    );
  }

  // お申し込み：箱数 → 合計金額（N×66,000）自動計算
  const $applyBoxes = $('#apply-boxes');
  const $applyTotal = $('#apply-total');

  function toHalfWidthNumbers(value) {
    return String(value).replace(/[０-９]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
  }

  // 郵便番号 → 住所 自動補完（ZipCloud / JSONP）
  const zipAddressCache = {};

  function normalizeZip(value) {
    const normalized = toHalfWidthNumbers(value);
    return normalized.replace(/[^\d]/g, '').slice(0, 7);
  }

  function fetchAddressByZip(zip) {
    if (zipAddressCache[zip]) return zipAddressCache[zip];
    zipAddressCache[zip] = $.getJSON('https://zipcloud.ibsnet.co.jp/api/search?callback=?', { zipcode: zip })
      .then(function (data) {
        if (!data || data.status !== 200 || !data.results || !data.results.length) return null;
        const r = data.results[0];
        return (r.address1 || '') + (r.address2 || '') + (r.address3 || '');
      })
      .catch(function () {
        return null;
      });
    return zipAddressCache[zip];
  }

  function initZipAutoFill(zipSelector, addressSelector) {
    const $zip = $(zipSelector);
    const $addr = $(addressSelector);
    if (!$zip.length || !$addr.length) return;

    let timer = null;
    function run() {
      const zip = normalizeZip($zip.val());
      if (zip.length !== 7) return;
      fetchAddressByZip(zip).then(function (address) {
        if (!address) return;
        const current = String($addr.val() || '').trim();
        if (current !== '') return;
        $addr.val(address).trigger('input');
      });
    }

    $zip.on('input change blur', function () {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(run, 250);
    });
  }

  function updateApplyTotalFromBoxes() {
    if (!$applyBoxes.length || !$applyTotal.length) return;
    const raw = $applyBoxes.val();
    const normalized = toHalfWidthNumbers(raw);
    const match = normalized.match(/\d+/);
    if (!match) {
      $applyTotal.val('');
      return;
    }

    const n = parseInt(match[0], 10);
    if (!Number.isFinite(n) || n <= 0) {
      $applyTotal.val('');
      return;
    }

    const total = n * 66000;
    $applyTotal.val(total.toLocaleString('ja-JP') + '円');
    $applyTotal.trigger('input');
  }

  updateApplyTotalFromBoxes();
  $applyBoxes.on('input change', function () {
    updateApplyTotalFromBoxes();
  });

  initZipAutoFill('#apply-zip', '#apply-address');
  initZipAutoFill('#inq-zip', '#inq-address');

  $('#contact-panel-inquiry .p-contact__form, #contact-panel-apply .p-contact__form').on('submit', function () {
    try {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    } catch (e) {
      // ignore
    }
    $(this).find('input[name="page_url"]').val(window.location.href);
  });

  function updateTopBtnVisibility() {
    if (!$topBtn.length || !$mv.length) return;
    const mvBottom = $mv.offset().top + $mv.outerHeight();
    const scrollTop = $(window).scrollTop();
    const shouldShow = scrollTop > mvBottom;
    $topBtn.toggleClass('is-visible', shouldShow);
  }

  function updateHeaderScroll() {
    if (!$header.length || !$mv.length) return;
    const mvBottom = $mv.offset().top + $mv.outerHeight();
    const scrollTop = $(window).scrollTop();
    const shouldScroll = scrollTop > mvBottom;
    $header.toggleClass('js-header-scroll', shouldScroll);
  }

  updateTopBtnVisibility();
  updateHeaderScroll();
  $(window).on('scroll resize', function () {
    updateTopBtnVisibility();
    updateHeaderScroll();
  });

  $topBtn.on('click', function (e) {
    e.preventDefault();
    $('body,html').animate({ scrollTop: 0 }, 300, 'swing');
  });

  if ($translate.length) {
    resetTranslateToJapanese();
    syncTranslateUi(getCurrentTranslateLang());
  }

  $translateToggle.on('click', function () {
    const isOpen = $translateToggle.attr('aria-expanded') === 'true';
    setTranslateMenuState(!isOpen);
  });

  $translateOptions.on('click', function () {
    const lang = $(this).data('lang');
    setTranslateMenuState(false);

    if (lang === 'en') {
      syncTranslateUi('en');
      pendingTranslateLang = 'en';
      if (!applyEnglishTranslation()) {
        ensureTranslateScript();
      }
      return;
    }

    syncTranslateUi('ja');
    clearTranslateCookies();
    window.location.reload();
  });

  $(document).on('click', function (e) {
    if (!$translate.length) return;
    if ($translate.get(0).contains(e.target)) return;
    setTranslateMenuState(false);
  });

 
  // お申し込み / お問い合わせ タブ切り替え
  const $tabs = $('.js-contact-tab');
  const $panels = $('.js-contact-panel');

  function setActiveTab(tabEl) {
    const $tab = $(tabEl);
    const targetId = $tab.attr('aria-controls');

    $tabs.each(function () {
      const isActive = this === tabEl;
      $(this)
        .toggleClass('is-active', isActive)
        .attr('aria-selected', isActive ? 'true' : 'false')
        .attr('tabindex', isActive ? '0' : '-1');
    });

    $panels.each(function () {
      const isTarget = this.id === targetId;
      $(this).prop('hidden', !isTarget);
    });
  }

  $tabs.on('click', function () {
    setActiveTab(this);
  });

  // 送信ボタンのdisabled制御（未入力/未同意のとき押せない＋灰色表示）
  (function initSubmitDisabled() {
    const $forms = $('#contact-panel-apply .p-contact__form, #contact-panel-inquiry .p-contact__form');
    if (!$forms.length) return;

    function sync($form) {
      const formEl = $form.get(0);
      const $submit = $form.find('.p-contact__submit');
      if (!formEl || !$submit.length) return;
      const isValid = typeof formEl.checkValidity === 'function' ? formEl.checkValidity() : true;
      $submit.prop('disabled', !isValid);
    }

    $forms.each(function () {
      const $form = $(this);
      sync($form);
      $form.on('input change', function () {
        sync($form);
      });
    });
  })();

  // 送信後の表示（ボタン直下にメッセージ表示）
  (function showSubmitResult() {
    if (sentType !== 'apply' && sentType !== 'inquiry') return;

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const tabEl = sentType === 'apply'
      ? document.getElementById('contact-tab-apply')
      : document.getElementById('contact-tab-inquiry');
    if (tabEl) setActiveTab(tabEl);

    const $form = sentType === 'apply'
      ? $('#contact-panel-apply .p-contact__form')
      : $('#contact-panel-inquiry .p-contact__form');
    const $note = $form.find('.js-submit-note');
    if ($note.length) {
      const msg = sentType === 'apply' ? '送信されました。' : '送信されました。';
      $note.text(msg).prop('hidden', false);
    }

    // 送信前のスクロール位置を復元（送信ボタン付近に留める）
    try {
      const y = Number(sessionStorage.getItem(SCROLL_KEY));
      sessionStorage.removeItem(SCROLL_KEY);
      if (Number.isFinite(y)) {
        requestAnimationFrame(function () {
          const html = document.documentElement;
          const prev = html.style.scrollBehavior;
          html.style.scrollBehavior = 'auto';
          window.scrollTo(0, y);
          html.style.scrollBehavior = prev;
        });
      }
    } catch (e) {
      // ignore
    }

    // リロードで再表示され続けないようURLを掃除（#contactは保持）
    if (window.history && window.history.replaceState) {
      const cleaned = window.location.pathname + window.location.hash;
      window.history.replaceState(null, '', cleaned);
    }
  })();

  $tabs.on('keydown', function (e) {
    const key = e.key;
    if (key !== 'ArrowLeft' && key !== 'ArrowRight' && key !== 'Home' && key !== 'End') return;

    e.preventDefault();
    const currentIndex = $tabs.index(this);
    let nextIndex = currentIndex;

    if (key === 'ArrowLeft') nextIndex = Math.max(0, currentIndex - 1);
    if (key === 'ArrowRight') nextIndex = Math.min($tabs.length - 1, currentIndex + 1);
    if (key === 'Home') nextIndex = 0;
    if (key === 'End') nextIndex = $tabs.length - 1;

    const nextTab = $tabs.get(nextIndex);
    nextTab.focus();
    setActiveTab(nextTab);
  });

});
