
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
    try {
      const storedLang = localStorage.getItem(TRANSLATE_STORAGE_KEY);
      if (storedLang === 'en' || storedLang === 'ja') return storedLang;
    } catch (e) {
      // ignore
    }

    if (document.cookie.indexOf('googtrans=/ja/en') !== -1) return 'en';
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

  function setTranslateMenuState(isOpen, menuId) {
    if (!$translateMenu.length || !$translateToggle.length) return;

    $translateToggle.attr('aria-expanded', 'false');
    $translateMenu.prop('hidden', true);

    if (!isOpen) return;

    const targetMenuId = menuId || $translateToggle.first().attr('aria-controls');
    const $targetToggle = $translateToggle.filter('[aria-controls="' + targetMenuId + '"]');
    const $targetMenu = $('#' + targetMenuId);

    $targetToggle.attr('aria-expanded', 'true');
    $targetMenu.prop('hidden', false);
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

  function setTranslateCookies(lang) {
    const translateValue = lang === 'en' ? '/ja/en' : '/ja/ja';
    const hostname = window.location.hostname;
    const domains = [hostname, '.' + hostname];
    const expires = 'Fri, 31 Dec 9999 23:59:59 GMT';

    document.cookie = 'googtrans=' + translateValue + '; expires=' + expires + '; path=/';

    if (hostname.indexOf('.') !== -1) {
      const parts = hostname.split('.');
      for (let i = 1; i < parts.length - 1; i++) {
        domains.push('.' + parts.slice(i).join('.'));
      }
    }

    domains.forEach(function (domain) {
      document.cookie = 'googtrans=' + translateValue + '; expires=' + expires + '; path=/; domain=' + domain;
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
    setTranslateCookies('en');
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

  function fetchAddressDataByZip(zip) {
    if (zipAddressCache[zip]) return zipAddressCache[zip];
    zipAddressCache[zip] = $.getJSON('https://zipcloud.ibsnet.co.jp/api/search?callback=?', { zipcode: zip })
      .then(function (data) {
        if (!data || data.status !== 200 || !data.results || !data.results.length) return null;
        return data.results[0];
      })
      .catch(function () {
        return null;
      });
    return zipAddressCache[zip];
  }

  function formatZipAddress(address) {
    if (!address) return '';
    return (address.address1 || '') + (address.address2 || '') + (address.address3 || '');
  }

  function fetchAddressByZip(zip) {
    return fetchAddressDataByZip(zip).then(formatZipAddress);
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

  function initEntryZipAutoFill() {
    const $form = $('.p-entry__form');
    const $zip = $form.find('input[name="zip"]');
    const $prefecture = $form.find('select[name="prefecture"]');
    const $city = $form.find('input[name="city"]');
    if (!$zip.length || !$prefecture.length || !$city.length) return;

    let timer = null;
    let lastAutoCity = '';

    function setIfAutoOrEmpty($field, value, lastAutoValue) {
      const current = String($field.val() || '').trim();
      if (current !== '' && current !== lastAutoValue) return false;
      $field.val(value).trigger('change').trigger('input');
      return true;
    }

    function run() {
      const zip = normalizeZip($zip.val());
      if (zip.length !== 7) return;
      $zip.val(zip);

      fetchAddressDataByZip(zip).then(function (address) {
        if (!address) return;

        const prefecture = address.address1 || '';
        const city = (address.address2 || '') + (address.address3 || '');

        if (prefecture) {
          setIfAutoOrEmpty($prefecture, prefecture, prefecture);
        }

        if (city && setIfAutoOrEmpty($city, city, lastAutoCity)) {
          lastAutoCity = city;
        }
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
  initEntryZipAutoFill();

  $('#contact-panel-inquiry .p-contact__form, #contact-panel-apply .p-contact__form').on('submit', function () {
    try {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    } catch (e) {
      // ignore
    }
    $(this).find('input[name="page_url"]').val(window.location.href);
  });

  function updateTopBtnVisibility() {
    if (!$topBtn.length) return;
    const scrollTop = $(window).scrollTop();
    const shouldShow = scrollTop > 400;
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
    const initialTranslateLang = getCurrentTranslateLang();
    syncTranslateUi(initialTranslateLang);

    if (initialTranslateLang === 'en') {
      pendingTranslateLang = 'en';
      setTranslateCookies('en');
      ensureTranslateScript();
    } else {
      resetTranslateToJapanese();
    }
  }

  $translateToggle.on('click', function () {
    const $toggle = $(this);
    const menuId = $toggle.data('translate-menu') || $toggle.attr('aria-controls');
    const isOpen = $toggle.attr('aria-expanded') === 'true';
    setTranslateMenuState(!isOpen, menuId);
  });

  $translateOptions.on('click', function () {
    const isDrawerTranslate = $(this).closest('.p-drawer-content').length > 0;
    const lang = $(this).data('lang');
    setTranslateMenuState(false);

    if (isDrawerTranslate) {
      $('.p-drawer-icon').removeClass('is-active');
      $('.p-drawer-content').removeClass('is-active');
      $('.p-drawer-background').removeClass('is-active');
      $('.p-header').removeClass('is-drawer-active');
    }

    if (lang === 'en') {
      syncTranslateUi('en');
      setTranslateCookies('en');
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
    if ($(e.target).closest('.js-translate-toggle, .js-translate-menu').length) return;
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

  // Entry form file inputs
  (function initEntryFileFields() {
    const fields = document.querySelectorAll('.p-entry__file-field');
    if (!fields.length) return;

    fields.forEach(function (field) {
      const input = field.querySelector('.js-entry-file');
      const name = field.querySelector('.p-entry__file-name span');
      const clear = field.querySelector('.js-entry-file-clear');
      const existing = field.querySelector('.js-entry-existing-file');
      if (!input || !name || !clear) return;

      const defaultText = name.textContent;
      const emptyText = 'ファイル選択‥';

      function sync() {
        const file = input.files && input.files[0] ? input.files[0] : null;
        const hasExisting = existing && existing.value !== '';
        name.textContent = file ? file.name : (hasExisting ? defaultText : emptyText);
        input.required = !file && !hasExisting;
        clear.disabled = !file && !hasExisting;
      }

      input.addEventListener('change', function () {
        if (input.files && input.files[0] && existing) existing.value = '';
        sync();
      });
      clear.addEventListener('click', function () {
        input.value = '';
        if (existing) existing.value = '';
        sync();
      });

      sync();
    });
  })();

  // Entry form validation
  (function initEntryValidation() {
    const form = document.querySelector('.p-entry__form');
    if (!form) return;

    const kanaInputs = form.querySelectorAll('input[name="last_kana"], input[name="first_kana"]');
    const error = form.querySelector('.js-entry-form-error');
    const kanaPattern = /^[ァ-ヶー・　\s]+$/u;
    const kanaMessage = 'フリガナは全角カタカナで入力してください。';

    function showError(message) {
      if (!error) return;
      error.textContent = message;
      error.hidden = false;
    }

    function clearError() {
      if (!error) return;
      error.textContent = '';
      error.hidden = true;
    }

    function validateKana(input) {
      const value = input.value.trim();
      const isValid = value === '' || kanaPattern.test(value);
      input.setCustomValidity(isValid ? '' : kanaMessage);
      return isValid;
    }

    kanaInputs.forEach(function (input) {
      input.addEventListener('input', function () {
        validateKana(input);
        const invalidKana = Array.from(kanaInputs).find(function (kanaInput) {
          return !validateKana(kanaInput);
        });

        if (!invalidKana) {
          clearError();
        }
      });

      input.addEventListener('blur', function () {
        validateKana(input);
      });
    });

    form.addEventListener('submit', function (e) {
      const invalidKana = Array.from(kanaInputs).find(function (input) {
        return !validateKana(input);
      });

      if (!invalidKana) return;

      e.preventDefault();
      showError(kanaMessage);
      invalidKana.reportValidity();
      invalidKana.focus();
    });
  })();

  // FAQ details 開閉アニメーション
  (function initFaqDetailsAnimation() {
    const items = document.querySelectorAll('.p-faq__item');
    if (!items.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    items.forEach(function (item) {
      const summary = item.querySelector('.p-faq__question');
      const answer = item.querySelector('.p-faq__answer');
      if (!summary || !answer) return;

      let animation = null;

      function finishOpen() {
        answer.style.height = '';
        answer.style.opacity = '';
        answer.style.overflow = '';
        answer.style.paddingTop = '';
        answer.style.paddingBottom = '';
        animation = null;
      }

      function finishClose() {
        item.removeAttribute('open');
        answer.style.height = '';
        answer.style.opacity = '';
        answer.style.overflow = '';
        answer.style.paddingTop = '';
        answer.style.paddingBottom = '';
        animation = null;
      }

      summary.addEventListener('click', function (e) {
        e.preventDefault();
        if (animation) animation.cancel();

        answer.style.overflow = 'hidden';

        if (item.open) {
          const startHeight = answer.offsetHeight;
          const style = window.getComputedStyle(answer);
          const startPaddingTop = style.paddingTop;
          const startPaddingBottom = style.paddingBottom;
          animation = answer.animate(
            [
              {
                height: startHeight + 'px',
                opacity: 1,
                paddingTop: startPaddingTop,
                paddingBottom: startPaddingBottom
              },
              {
                height: '0px',
                opacity: 0,
                paddingTop: '0px',
                paddingBottom: '0px'
              }
            ],
            { duration: 360, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
          );
          animation.onfinish = finishClose;
          animation.oncancel = finishOpen;
          return;
        }

        item.setAttribute('open', '');
        const style = window.getComputedStyle(answer);
        const endPaddingTop = style.paddingTop;
        const endPaddingBottom = style.paddingBottom;
        const endHeight = answer.scrollHeight;

        answer.style.height = '0px';
        answer.style.opacity = '0';
        answer.style.paddingTop = '0px';
        answer.style.paddingBottom = '0px';

        animation = answer.animate(
          [
            {
              height: '0px',
              opacity: 0,
              paddingTop: '0px',
              paddingBottom: '0px'
            },
            {
              height: endHeight + 'px',
              opacity: 1,
              paddingTop: endPaddingTop,
              paddingBottom: endPaddingBottom
            }
          ],
          { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        );
        animation.onfinish = finishOpen;
        animation.oncancel = finishOpen;
      });
    });
  })();

  // 募集要項 タブ切り替え
  (function initRecruitTabs() {
    const tabs = document.querySelectorAll('.js-recruit-tab');
    const panels = document.querySelectorAll('.js-recruit-panel');
    if (!tabs.length || !panels.length) return;

    function activate(tab) {
      const target = tab.getAttribute('aria-controls');

      tabs.forEach(function (item) {
        const isActive = item === tab;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      panels.forEach(function (panel) {
        panel.hidden = panel.id !== target;
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activate(tab);
      });
    });
  })();

  (function initScrollHints() {
    const scrollAreas = document.querySelectorAll('.p-career__scroll');
    if (!scrollAreas.length) return;

    function sync(area) {
      const isScrollable = area.scrollWidth > area.clientWidth + 1;
      const hasScrolled = area.scrollLeft > 8;
      area.classList.toggle('is-scroll-hint-hidden', !isScrollable || hasScrolled);
    }

    scrollAreas.forEach(function (area) {
      sync(area);
      area.addEventListener('scroll', function () {
        sync(area);
      }, { passive: true });
    });

    window.addEventListener('resize', function () {
      scrollAreas.forEach(sync);
    });
  })();

});
jQuery('.p-drawer-icon').on('click', function (e) {
  e.preventDefault();
  jQuery('.p-drawer-icon').toggleClass('is-active');
  jQuery('.p-drawer-content').toggleClass('is-active');
  jQuery('.p-drawer-background').toggleClass('is-active');
  jQuery('.p-header').toggleClass('is-drawer-active');
  return false;
});
$('.p-drawer-content a[href]').on('click', function (event) { $('.p-drawer-icon').trigger('click') })
