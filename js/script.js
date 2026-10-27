// ---------- Nav bar color aligns with section ----------
(function () {
  const links = document.querySelectorAll('.nav__links a[href^="#"]');
  const sections = [];

  // Pair each nav link with the section it points to
  links.forEach(function (link) {
    const id = link.getAttribute('href').slice(1);
    const section = document.getElementById(id);
    if (section) sections.push({ link: link, section: section });
  });

  function setActive(link) {
    links.forEach(function (l) { l.classList.remove('is-active'); });
    if (link) link.classList.add('is-active');
  }

  function update() {
    const navHeight = document.querySelector('.nav').offsetHeight;
    const line = navHeight + 40;   // a point just below the nav bar
    let current = sections[0];

    // The current section is the last one whose top has passed that point
    sections.forEach(function (s) {
      if (s.section.getBoundingClientRect().top <= line) current = s;
    });

    // At the very bottom, highlight the last section
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) current = sections[sections.length - 1];

    setActive(current && current.link);
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();



// ---------- Typing SQL widget ----------
(function () {
  const code = document.getElementById('sql-code');
  if (!code) return;

  const widget = code.closest('.terminal');

  // Show everything at once for visitors who prefer reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    widget.classList.add('is-done');
    return;
  }

  const START_DELAY   = 600;   // pause after the page loads
  const RUNNING_TIME  = 900;   // how long "Running query…" shows
  const RESTART_DELAY = 4000;  // how long the finished result stays before restarting

  // Reserve the widget's full height so the page doesn't jump while it types
  widget.style.minHeight = widget.offsetHeight + 'px';

  // Collect every piece of text inside the code (keeps the colored spans intact)
  const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
  const nodes = [];
  const texts = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
    texts.push(walker.currentNode.textContent);
  }

  let n = 0; // which text piece
  let c = 0; // which character in that piece

  function start() {
    // Clear the code and reset to the beginning
    nodes.forEach(function (node) { node.textContent = ''; });
    n = 0;
    c = 0;

    widget.classList.remove('is-done', 'is-running');
    widget.classList.add('is-typing');

    type();
  }

  function type() {
    if (n >= nodes.length) return finish();

    const full = texts[n];
    const ch = full[c];
    nodes[n].textContent = full.slice(0, c + 1);
    c++;
    if (c >= full.length) { n++; c = 0; }

    // Pause at line breaks, rush through spaces, vary normal keystrokes
    let delay = 40 + Math.random() * 45;
    if (ch === '\n') delay = 280;
    else if (ch === ' ') delay = 15;

    setTimeout(type, delay);
  }

  function finish() {
    widget.classList.remove('is-typing');
    widget.classList.add('is-running');

    setTimeout(function () {
      widget.classList.remove('is-running');
      widget.classList.add('is-done');

      // Wait, then type the query again
      setTimeout(start, RESTART_DELAY);
    }, RUNNING_TIME);
  }

  setTimeout(start, START_DELAY);
})();