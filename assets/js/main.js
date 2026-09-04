// ===================== FAITHFUL CARE HAVEN — site.js =====================

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Preloader fade out ---------- */
  var preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', function () {
      setTimeout(function () {
        preloader.classList.add('loaded');
      }, 800);
    });
  }

  /* ---------- Homepage hero ---------- */
  // The hero is now a static, single-slide section.

  /* ---------- Header scroll state ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 30) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var overlay = document.querySelector('.mobile-overlay');
  if (toggle && overlay) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('open');
      overlay.classList.toggle('open');
      document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
    });
    overlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Active nav link (based on current file) ---------- */
  var current = (window.location.pathname.split('/').pop() || 'index.html');
  document.querySelectorAll('.nav-links a, .mobile-overlay a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ---------- Scroll reveal (lightweight, no external lib) ---------- */
  var revealEls = document.querySelectorAll('[data-aos]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.getAttribute('data-aos-delay') || 0;
          setTimeout(function () { entry.target.classList.add('aos-in'); }, parseInt(delay, 10));
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('aos-in'); });
  }

  /* ---------- Root-line signature: grow in shortly after load ---------- */
  var rootLine = document.querySelector('.root-line');
  if (rootLine) {
    requestAnimationFrame(function () {
      setTimeout(function () { rootLine.classList.add('grow'); }, 350);
    });
  }

  /* ---------- Gentle parallax on hero / page-hero photography ---------- */
  var parallaxImgs = document.querySelectorAll('.hero-bg img, .page-hero-bg img');
  if (parallaxImgs.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var ticking = false;
    function updateParallax() {
      var y = window.scrollY;
      parallaxImgs.forEach(function (img) {
        var rect = img.parentElement.parentElement.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          img.style.transform = 'translateY(' + (y * 0.12) + 'px) scale(1.06)';
        }
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
    }, { passive: true });
    updateParallax();
  }

  /* ---------- Animated count-up for stat numbers with data-count ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    var countIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.getAttribute('data-count'));
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1200;
        var start = null;
        function step(ts) {
          if (!start) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        countIo.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countIo.observe(el); });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll('.current-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- File input pretty label (Job Application page) ---------- */
  var fileDrop = document.querySelector('.file-drop');
  var fileInput = document.querySelector('#resumeUpload');
  if (fileDrop && fileInput) {
    fileDrop.addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function () {
      var label = fileDrop.querySelector('.file-drop-text');
      if (fileInput.files && fileInput.files[0]) {
        label.textContent = fileInput.files[0].name;
        fileDrop.classList.add('has-file');
      } else {
        fileDrop.classList.remove('has-file');
      }
    });
  }

  /* ---------- Formspree Submit Handler ---------- */
  document.querySelectorAll('form[data-static-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // simple required-field check
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        if (!field.value || (field.type === 'checkbox' && !field.checked)) {
          valid = false;
          field.style.borderColor = '#c0503f';
        } else {
          field.style.borderColor = '';
        }
      });
      if (!valid) return;

      var successId = form.getAttribute('data-static-form');
      var successBox = document.getElementById(successId);
      var submitBtn = form.querySelector('button[type="submit"]');

      if (submitBtn) {
        var originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Sending…';
        submitBtn.disabled = true;

        var data = new FormData(form);
        var action = form.getAttribute('action');

        fetch(action, {
          method: 'POST',
          body: data,
          headers: {
            'Accept': 'application/json'
          }
        }).then(response => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          if (response.ok) {
            form.reset();
            var dropText = form.querySelector('.file-drop-text');
            if (dropText) dropText.textContent = 'Click to upload, or drag your file here';
            var dropZone = form.querySelector('.file-drop');
            if (dropZone) dropZone.classList.remove('has-file');
            if (successBox) {
              successBox.querySelector('p').textContent = "Thank you — our team will review and respond shortly.";
              successBox.classList.add('show');
              successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
              setTimeout(function () { successBox.classList.remove('show'); }, 7000);
            }
          } else {
            response.json().then(data => {
              if (Object.hasOwn(data, 'errors')) {
                alert(data["errors"].map(error => error["message"]).join(", "));
              } else {
                alert("Oops! There was a problem submitting your form");
              }
            })
          }
        }).catch(error => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          alert("Oops! There was a problem submitting your form");
        });
      }
    });
  });

  /* ---------- Service Detail Tab Switching (Dynamic Hero + Tab Panels) ---------- */
  var sdTabs = document.querySelectorAll('.sd-tab');
  var sdHeroSlides = document.querySelectorAll('.sd-hero-slide');
  var sdTabPanels = document.querySelectorAll('.sd-tabpanel');
  var sdTabNav = document.querySelector('.sd-tab-nav');

  if (sdTabs.length && sdHeroSlides.length && sdTabPanels.length) {
    var currentTab = 'residential';
    var isSwitching = false;

    function activateTab(targetId, updateHash) {
      if (isSwitching || targetId === currentTab) return;
      isSwitching = true;

      // --- Update tab buttons ---
      sdTabs.forEach(function (tab) {
        var isTarget = tab.getAttribute('data-target') === targetId;
        tab.classList.toggle('active', isTarget);
        tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
      });

      // --- Hero slide transition ---
      var oldHero = document.querySelector('.sd-hero-slide[data-hero-for="' + currentTab + '"]');
      var newHero = document.querySelector('.sd-hero-slide[data-hero-for="' + targetId + '"]');
      if (oldHero && newHero) {
        // Trigger exit animation on old hero text
        oldHero.classList.add('exit');
        // Crossfade: add active to new hero slightly before old one fades
        setTimeout(function () {
          oldHero.classList.remove('active', 'exit');
          newHero.classList.add('active');
          // Re-trigger text entry animation
          newHero.classList.remove('re-animate');
          // Force reflow to restart CSS animation
          void newHero.offsetWidth;
          newHero.classList.add('re-animate');
          // Clean up re-animate after animation completes
          setTimeout(function () {
            newHero.classList.remove('re-animate');
          }, 1200);
        }, 250);
      }

      // --- Tab panel transition ---
      var oldPanel = document.getElementById(currentTab);
      var newPanel = document.getElementById(targetId);
      if (oldPanel && newPanel) {
        oldPanel.classList.add('exit');
        oldPanel.classList.remove('active');

        setTimeout(function () {
          oldPanel.classList.remove('exit');
          newPanel.classList.add('enter');

          // After enter animation, set to active state and scroll tabs into view
          var enterDuration = 550;
          setTimeout(function () {
            newPanel.classList.remove('enter');
            newPanel.classList.add('active');
            isSwitching = false;
            currentTab = targetId;

            // Gentle scroll so the tab nav is at top of viewport (if below fold)
            if (sdTabNav) {
              var navRect = sdTabNav.getBoundingClientRect();
              if (navRect.top < 80 || navRect.top > window.innerHeight * 0.5) {
                window.scrollTo({
                  top: window.scrollY + navRect.top - 90,
                  behavior: 'smooth'
                });
              }
            }
          }, enterDuration);
        }, 320);
      } else {
        isSwitching = false;
        currentTab = targetId;
      }

      // Update URL hash (silently, don't trigger another scroll)
      if (updateHash !== false && history.replaceState) {
        history.replaceState(null, '', '#' + targetId);
      }
    }

    // --- Tab button clicks ---
    sdTabs.forEach(function (tab) {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        var target = tab.getAttribute('data-target');
        if (target) activateTab(target, true);
      });

      // Keyboard support for tablist
      tab.addEventListener('keydown', function (e) {
        var tabsArr = Array.prototype.slice.call(sdTabs);
        var idx = tabsArr.indexOf(tab);
        var nextIdx = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextIdx = (idx + 1) % tabsArr.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          nextIdx = (idx - 1 + tabsArr.length) % tabsArr.length;
        } else if (e.key === 'Home') {
          nextIdx = 0;
        } else if (e.key === 'End') {
          nextIdx = tabsArr.length - 1;
        }
        if (nextIdx !== null) {
          e.preventDefault();
          tabsArr[nextIdx].focus();
          var tgt = tabsArr[nextIdx].getAttribute('data-target');
          if (tgt) activateTab(tgt, true);
        }
      });
    });

    // --- Deep-link: open a specific tab if URL has #hash ---
    function applyInitialHash() {
      var hash = (window.location.hash || '').replace('#', '');
      var validIds = ['residential', 'clinical', 'development'];
      if (hash && validIds.indexOf(hash) !== -1 && hash !== currentTab) {
        // Small delay so the initial page hero animation isn't immediately overwritten
        setTimeout(function () { activateTab(hash, false); }, 300);
      }
    }
    applyInitialHash();

    // Respond to manual hash changes (e.g., browser back/forward)
    window.addEventListener('hashchange', function () {
      var hash = (window.location.hash || '').replace('#', '');
      var validIds = ['residential', 'clinical', 'development'];
      if (hash && validIds.indexOf(hash) !== -1) activateTab(hash, false);
    });
  }

  /* ---------- Parallax on sd-page-hero images (new hero) ---------- */
  var sdParallaxImgs = document.querySelectorAll('.sd-page-hero .sd-hero-bg img');
  if (sdParallaxImgs.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var sdTicking = false;
    function updateSdParallax() {
      var y = window.scrollY;
      sdParallaxImgs.forEach(function (img) {
        var section = img.closest('.sd-page-hero');
        if (!section) return;
        var rect = section.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          img.style.transform = 'translateY(' + (y * 0.12) + 'px) scale(1.06)';
        }
      });
      sdTicking = false;
    }
    window.addEventListener('scroll', function () {
      if (!sdTicking) { requestAnimationFrame(updateSdParallax); sdTicking = true; }
    }, { passive: true });
    updateSdParallax();
  }

});
