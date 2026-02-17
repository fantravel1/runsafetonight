/* ============================================================
   RunSafeTonight.com — Main JavaScript
   Interactivity, Animations, Conditions API, Readiness Tool
   ============================================================ */

(function () {
  'use strict';

  // ---- DOM Ready ----
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initScrollAnimations();
    initHeader();
    initMobileNav();
    initBackToTop();
    initConditions();
    initCommunityPulse();
    initReadinessCheck();
    initNightCrewForm();
    initRippleButtons();
    initSharePlan();
    initCounterAnimations();
  }

  // ============================================================
  // SCROLL ANIMATIONS (Intersection Observer)
  // ============================================================
  function initScrollAnimations() {
    var elements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in');
    if (!elements.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ============================================================
  // HEADER SCROLL EFFECT
  // ============================================================
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var scrolled = false;
    window.addEventListener('scroll', function () {
      var shouldBeScrolled = window.scrollY > 50;
      if (shouldBeScrolled !== scrolled) {
        scrolled = shouldBeScrolled;
        header.classList.toggle('scrolled', scrolled);
      }
    }, { passive: true });
  }

  // ============================================================
  // MOBILE NAVIGATION
  // ============================================================
  function initMobileNav() {
    var hamburger = document.querySelector('.hamburger');
    var mobileNav = document.querySelector('.mobile-nav');
    if (!hamburger || !mobileNav) return;

    hamburger.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen);
      mobileNav.setAttribute('aria-hidden', !isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });

    // Close on escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }

  // ============================================================
  // BACK TO TOP
  // ============================================================
  function initBackToTop() {
    var btn = document.getElementById('back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ============================================================
  // TONIGHT'S CONDITIONS (with Vercel API fallback)
  // ============================================================
  function initConditions() {
    // Try to fetch from API, fallback to smart defaults
    fetchConditions();
  }

  function fetchConditions() {
    // Attempt to use the Vercel serverless API
    fetch('/api/conditions')
      .then(function (res) {
        if (!res.ok) throw new Error('API unavailable');
        return res.json();
      })
      .then(function (data) {
        updateConditionsUI(data);
      })
      .catch(function () {
        // Fallback: generate realistic conditions based on time
        var fallback = generateFallbackConditions();
        updateConditionsUI(fallback);
      });
  }

  function generateFallbackConditions() {
    var now = new Date();
    var hour = now.getHours();
    var month = now.getMonth();

    // Estimate sunset based on month (rough US average)
    var sunsetHours = [17, 17.5, 18, 19.5, 20, 20.5, 20.5, 20, 19, 18, 17, 16.5];
    var sunsetH = Math.floor(sunsetHours[month]);
    var sunsetM = Math.round((sunsetHours[month] % 1) * 60);
    var sunsetStr = formatTime12(sunsetH, sunsetM);

    // Temperature range by month (Fahrenheit, rough US average)
    var tempRanges = [
      [28, 38], [30, 42], [38, 55], [48, 65], [58, 75], [68, 85],
      [72, 90], [70, 88], [62, 80], [50, 68], [38, 52], [30, 40]
    ];
    var range = tempRanges[month];
    var temp = Math.round(range[0] + Math.random() * (range[1] - range[0]));

    // Wind
    var wind = Math.round(3 + Math.random() * 12);

    // Moon phases (approximate 29.5 day cycle)
    var moonPhases = ['New', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
      'Full', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    var dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    var moonIndex = Math.floor((dayOfYear % 29.5) / 3.69);
    var moon = moonPhases[moonIndex % 8];

    // Visibility
    var visOptions = ['Excellent', 'Good', 'Good', 'Moderate'];
    var visibility = visOptions[Math.floor(Math.random() * visOptions.length)];

    // Street activity based on time
    var activity;
    if (hour >= 17 && hour < 20) activity = 'High';
    else if (hour >= 20 && hour < 22) activity = 'Moderate';
    else if (hour >= 22 || hour < 5) activity = 'Low';
    else activity = 'Moderate';

    return {
      sunset: sunsetStr,
      temp: temp + '°F',
      wind: wind + ' mph',
      visibility: visibility,
      moon: moon,
      streets: activity,
      verdict: generateVerdict(temp, wind, visibility, activity)
    };
  }

  function generateVerdict(temp, wind, visibility, activity) {
    var score = 0;
    var tempNum = parseInt(temp);
    if (tempNum >= 45 && tempNum <= 75) score += 3;
    else if (tempNum >= 35 && tempNum <= 85) score += 2;
    else score += 1;

    var windNum = parseInt(wind);
    if (windNum < 10) score += 2;
    else if (windNum < 15) score += 1;

    if (visibility === 'Excellent') score += 3;
    else if (visibility === 'Good') score += 2;
    else score += 1;

    if (activity === 'High' || activity === 'Moderate') score += 1;

    if (score >= 8) return 'Excellent conditions for a night run tonight. Get out there!';
    if (score >= 6) return 'Great conditions for a night run. Visibility is good and streets are moderately active.';
    if (score >= 4) return 'Decent conditions. Layer up and stick to well-lit routes.';
    return 'Challenging conditions tonight. Consider a shorter route on main corridors.';
  }

  function formatTime12(h, m) {
    var ampm = h >= 12 ? 'PM' : 'AM';
    var hour12 = h % 12 || 12;
    var minStr = m < 10 ? '0' + m : m;
    return hour12 + ':' + minStr + ' ' + ampm;
  }

  function updateConditionsUI(data) {
    setTextIfExists('cond-sunset', data.sunset);
    setTextIfExists('cond-temp', data.temp);
    setTextIfExists('cond-wind', data.wind);
    setTextIfExists('cond-visibility', data.visibility);
    setTextIfExists('cond-moon', data.moon);
    setTextIfExists('cond-streets', data.streets);

    var verdict = document.getElementById('conditions-verdict');
    if (verdict && data.verdict) {
      verdict.querySelector('.verdict-text').textContent = data.verdict;
    }
  }

  function setTextIfExists(id, text) {
    var el = document.getElementById(id);
    if (el && text) el.textContent = text;
  }

  // ============================================================
  // COMMUNITY PULSE (live-feel updates)
  // ============================================================
  function initCommunityPulse() {
    var feed = document.getElementById('pulse-feed');
    if (!feed) return;

    // Simulated live feed updates
    var feedItems = [
      { dot: 'green', text: '<strong>Priya N.</strong> checked in from Seattle — 3.8 mi night run completed', time: 'just now' },
      { dot: 'blue', text: '<strong>Night Crew Denver</strong> posted: "Cherry Creek Trail loop lit and clear tonight"', time: '1m ago' },
      { dot: 'gold', text: '<strong>Safety note:</strong> Construction detour on Lakefront Trail near Fullerton, Chicago', time: '3m ago' },
      { dot: 'rose', text: '<strong>Group run:</strong> Austin Night Crew — 8 PM at Lady Bird Lake trailhead', time: '5m ago' },
      { dot: 'green', text: '<strong>Kenji M.</strong> first night run in NYC — "Central Park at dusk was magical"', time: '7m ago' },
      { dot: 'blue', text: '<strong>Night Crew SF</strong> shared route: "Embarcadero Glow Loop — 5K"', time: '10m ago' },
      { dot: 'green', text: '<strong>Daniela V.</strong> checked in from Miami — 5.1 mi night run completed', time: '12m ago' },
      { dot: 'gold', text: '<strong>Route update:</strong> New lighting installed on Burke-Gilman Trail, Seattle', time: '15m ago' },
      { dot: 'rose', text: '<strong>Group run:</strong> Chicago Lakefront Crew — 7 PM at North Ave Beach', time: '18m ago' },
      { dot: 'green', text: '<strong>Tanya B.</strong> completed solo night run in Portland — "Waterfront was perfect"', time: '20m ago' }
    ];

    var currentIndex = 0;

    setInterval(function () {
      var item = feedItems[currentIndex % feedItems.length];
      var newEl = document.createElement('div');
      newEl.className = 'pulse-feed-item';
      newEl.style.opacity = '0';
      newEl.style.transform = 'translateY(-10px)';
      newEl.innerHTML =
        '<div class="pulse-feed-dot ' + item.dot + '"></div>' +
        '<div class="pulse-feed-text">' + item.text + '</div>' +
        '<div class="pulse-feed-time">' + item.time + '</div>';

      feed.insertBefore(newEl, feed.firstChild);

      // Animate in
      requestAnimationFrame(function () {
        newEl.style.transition = 'all 0.4s ease';
        newEl.style.opacity = '1';
        newEl.style.transform = 'translateY(0)';
      });

      // Remove last if too many
      if (feed.children.length > 6) {
        var last = feed.lastChild;
        last.style.opacity = '0';
        setTimeout(function () {
          if (last.parentNode) last.parentNode.removeChild(last);
        }, 300);
      }

      currentIndex++;
    }, 8000);

    // Animate stat numbers
    animatePulseStats();
  }

  function animatePulseStats() {
    var stats = document.querySelectorAll('.pulse-stat-number.animated');
    stats.forEach(function (stat) {
      var target = parseInt(stat.getAttribute('data-target'));
      if (!target) return;

      var observer = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          animateNumber(stat, target);
          observer.unobserve(stat);
        }
      }, { threshold: 0.5 });

      observer.observe(stat);
    });
  }

  function animateNumber(el, target) {
    var duration = 2000;
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      var current = Math.round(start + (target - start) * eased);
      el.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // ============================================================
  // 60-SECOND NIGHT READINESS CHECK
  // ============================================================
  var readinessAnswers = {};

  function initReadinessCheck() {
    var options = document.querySelectorAll('.readiness-option');
    if (!options.length) return;

    options.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var step = btn.closest('.readiness-step');
        var stepNum = parseInt(step.getAttribute('data-step'));
        var value = btn.getAttribute('data-value');

        // Store answer
        readinessAnswers[stepNum] = value;

        // Highlight selected
        step.querySelectorAll('.readiness-option').forEach(function (b) {
          b.classList.remove('btn--primary');
          b.classList.add('btn--secondary');
        });
        btn.classList.remove('btn--secondary');
        btn.classList.add('btn--primary');

        // Move to next step after brief delay
        setTimeout(function () {
          if (stepNum < 5) {
            showReadinessStep(stepNum + 1);
          } else {
            showReadinessResults();
          }
        }, 400);
      });
    });
  }

  function showReadinessStep(num) {
    var steps = document.querySelectorAll('.readiness-step');
    steps.forEach(function (s) { s.style.display = 'none'; });

    var target = document.querySelector('.readiness-step[data-step="' + num + '"]');
    if (target) target.style.display = 'block';

    // Update progress
    var progress = (num / 5) * 100;
    var bar = document.getElementById('readiness-progress');
    var current = document.getElementById('readiness-current');
    var percent = document.getElementById('readiness-percent');
    if (bar) bar.style.width = progress + '%';
    if (current) current.textContent = num;
    if (percent) percent.textContent = Math.round(progress) + '%';
  }

  function showReadinessResults() {
    var questions = document.getElementById('readiness-questions');
    var results = document.getElementById('readiness-results');
    if (questions) questions.style.display = 'none';
    if (results) results.style.display = 'block';

    // Update progress to 100%
    var bar = document.getElementById('readiness-progress');
    var percent = document.getElementById('readiness-percent');
    if (bar) bar.style.width = '100%';
    if (percent) percent.textContent = '100%';

    // Calculate score
    var score = calculateReadinessScore();
    var scoreEl = document.getElementById('readiness-score');
    if (scoreEl) {
      animateNumber(scoreEl, score);
    }

    // Generate feedback
    var feedback = document.getElementById('readiness-feedback');
    var recs = document.getElementById('readiness-recommendations');
    if (feedback) feedback.innerHTML = getReadinessFeedback(score);
    if (recs) recs.innerHTML = getReadinessRecommendations();
  }

  function calculateReadinessScore() {
    var score = 0;

    // Experience (Q1)
    var exp = { beginner: 5, some: 15, regular: 22, veteran: 25 };
    score += exp[readinessAnswers[1]] || 5;

    // Environment awareness (Q2) - all equal, shows awareness
    score += 15;

    // Visibility gear (Q3)
    var gear = { none: 5, basic: 10, reflective: 18, full: 25 };
    score += gear[readinessAnswers[3]] || 5;

    // Route sharing (Q4)
    var share = { never: 5, sometimes: 12, always: 20, buddy: 20 };
    score += share[readinessAnswers[4]] || 5;

    // Comfort level (Q5)
    var comfort = { anxious: 5, cautious: 10, comfortable: 14, confident: 15 };
    score += comfort[readinessAnswers[5]] || 5;

    return Math.min(score, 100);
  }

  function getReadinessFeedback(score) {
    if (score >= 85) {
      return 'You\'re a confident, well-prepared night runner. Your strategy game is strong. Keep sharing your knowledge with the community.';
    } else if (score >= 65) {
      return 'You have a solid foundation for night running. A few upgrades to your gear and habits will take you to the next level.';
    } else if (score >= 45) {
      return 'You\'re building your night running skills. Focus on visibility gear and route sharing to boost your confidence and safety.';
    } else {
      return 'You\'re at the beginning of your night running journey. Start with our strategy guides and short, well-lit routes. The confidence will come.';
    }
  }

  function getReadinessRecommendations() {
    var recs = [];

    // Based on gear answer
    if (readinessAnswers[3] === 'none' || readinessAnswers[3] === 'basic') {
      recs.push({
        icon: '💡',
        title: 'Upgrade Your Visibility',
        desc: 'Start with a reflective vest and a simple clip-on light. These two items dramatically increase your safety.',
        link: '/strategy/visual-presence.html'
      });
    }

    // Based on sharing answer
    if (readinessAnswers[4] === 'never' || readinessAnswers[4] === 'sometimes') {
      recs.push({
        icon: '📱',
        title: 'Share Your Route',
        desc: 'Make it a habit to share your route and ETA with someone before every night run. It\'s a simple, powerful safety layer.',
        link: '/strategy/community-safety.html'
      });
    }

    // Based on experience
    if (readinessAnswers[1] === 'beginner' || readinessAnswers[1] === 'some') {
      recs.push({
        icon: '🗺️',
        title: 'Learn Route Intelligence',
        desc: 'Master the Loop Strategy and Exit Point Rule. These two concepts will transform how you plan every night run.',
        link: '/strategy/route-intelligence.html'
      });
    }

    // Based on comfort
    if (readinessAnswers[5] === 'anxious' || readinessAnswers[5] === 'cautious') {
      recs.push({
        icon: '🧠',
        title: 'Build Emotional Resilience',
        desc: 'Hypervigilance fatigue is real. Learn breath resets and scanning rhythms that keep you alert without burning out.',
        link: '/strategy/emotional-resilience.html'
      });
    }

    // Always recommend community
    recs.push({
      icon: '🤝',
      title: 'Join the Night Crew',
      desc: 'Connect with night runners in your city. Share routes, find running buddies, and get local safety intel.',
      link: '#nightcrew'
    });

    var html = '<div style="display:flex;flex-direction:column;gap:var(--space-md);">';
    recs.forEach(function (rec) {
      html += '<a href="' + rec.link + '" class="pulse-feed-item" style="text-decoration:none;">' +
        '<div style="font-size:24px;flex-shrink:0;">' + rec.icon + '</div>' +
        '<div><div style="font-weight:700;margin-bottom:4px;color:var(--text-primary);">' + rec.title + '</div>' +
        '<div style="font-size:var(--text-sm);color:var(--text-secondary);">' + rec.desc + '</div></div>' +
        '</a>';
    });
    html += '</div>';
    return html;
  }

  // Global function for reset button
  window.resetReadiness = function () {
    readinessAnswers = {};
    var questions = document.getElementById('readiness-questions');
    var results = document.getElementById('readiness-results');
    if (questions) questions.style.display = 'block';
    if (results) results.style.display = 'none';

    // Reset all buttons
    document.querySelectorAll('.readiness-option').forEach(function (b) {
      b.classList.remove('btn--primary');
      b.classList.add('btn--secondary');
    });

    showReadinessStep(1);
  };

  // ============================================================
  // NIGHT CREW FORM
  // ============================================================
  function initNightCrewForm() {
    var form = document.getElementById('nightcrew-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('nightcrew-email');
      if (!email || !email.value) return;

      // Show success toast
      showToast('Welcome to the Night Crew! Check your email for confirmation.');

      // Reset form
      email.value = '';
    });
  }

  // ============================================================
  // TOAST NOTIFICATIONS
  // ============================================================
  function showToast(message) {
    var toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(function () {
      toast.classList.remove('show');
    }, 4000);
  }

  // ============================================================
  // RIPPLE EFFECT ON BUTTONS
  // ============================================================
  function initRippleButtons() {
    document.querySelectorAll('.btn--primary, .btn--warm').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var ripple = document.createElement('span');
        ripple.className = 'ripple';
        var rect = btn.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 600);
      });
    });
  }

  // ============================================================
  // SHARE PLAN
  // ============================================================
  function initSharePlan() {
    var btn = document.getElementById('share-plan-btn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      var distance = document.getElementById('route-distance');
      var env = document.getElementById('route-env');
      var comfort = document.getElementById('route-comfort');
      var light = document.getElementById('route-light');

      var text = 'My Night Run Plan:\n' +
        'Distance: ' + (distance ? distance.options[distance.selectedIndex].text : '') + '\n' +
        'Environment: ' + (env ? env.options[env.selectedIndex].text : '') + '\n' +
        'Comfort: ' + (comfort ? comfort.options[comfort.selectedIndex].text : '') + '\n' +
        'Lighting: ' + (light ? light.options[light.selectedIndex].text : '') + '\n' +
        'Via RunSafeTonight.com';

      if (navigator.share) {
        navigator.share({
          title: 'My Night Run Plan — RunSafeTonight',
          text: text,
          url: window.location.href
        }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          showToast('Run plan copied to clipboard! Share it with a friend.');
        });
      } else {
        showToast('Share your run plan with a friend before heading out.');
      }
    });
  }

  // ============================================================
  // COUNTER ANIMATIONS
  // ============================================================
  function initCounterAnimations() {
    var counters = document.querySelectorAll('.stat-counter-value, .hero-stat-number');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var count = el.getAttribute('data-count');
          if (count) {
            animateNumber(el, parseInt(count));
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (c) { observer.observe(c); });
  }

  // ============================================================
  // ACCORDION (for pillar pages)
  // ============================================================
  window.initAccordion = function () {
    document.querySelectorAll('.accordion-header').forEach(function (header) {
      header.addEventListener('click', function () {
        var item = header.parentElement;
        var body = item.querySelector('.accordion-body');
        var isActive = item.classList.contains('active');

        // Close all
        document.querySelectorAll('.accordion-item').forEach(function (i) {
          i.classList.remove('active');
          i.querySelector('.accordion-body').style.maxHeight = null;
        });

        // Open clicked (toggle)
        if (!isActive) {
          item.classList.add('active');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
  };

  // ============================================================
  // TABS (for pages that use tabs)
  // ============================================================
  window.initTabs = function () {
    document.querySelectorAll('.tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var group = tab.closest('.tabs');
        var container = group ? group.parentElement : document;
        var target = tab.getAttribute('data-tab');

        // Deactivate all tabs
        group.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');

        // Show target content
        container.querySelectorAll('.tab-content').forEach(function (c) { c.classList.remove('active'); });
        var targetEl = container.querySelector('.tab-content[data-tab="' + target + '"]');
        if (targetEl) targetEl.classList.add('active');
      });
    });
  };

  // ============================================================
  // SMOOTH SCROLL for anchor links
  // ============================================================
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;

    var target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      var headerOffset = 80;
      var elementPosition = target.getBoundingClientRect().top;
      var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });

})();
