// Loader
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => loader?.classList.add('hidden'), 500);
});

// Navbar scroll state
const header = document.getElementById('header');
const onScroll = () => {
  header?.classList.toggle('scrolled', window.scrollY > 40);
};
document.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

const closeMenu = () => {
  hamburger?.classList.remove('open');
  navLinksEl?.classList.remove('open');
  hamburger?.setAttribute('aria-expanded', 'false');
};

hamburger?.addEventListener('click', () => {
  const isOpen = navLinksEl?.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', String(!!isOpen));
});

navLinksEl?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

// Scroll-reveal
const revealEls = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// Scroll-spy nav
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
if ('IntersectionObserver' in window && sections.length) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.dataset.section === entry.target.id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach((sec) => spy.observe(sec));
}

// Hero parallax
const heroWave = document.getElementById('heroWave');
const heroLogo = document.getElementById('heroLogo');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && heroWave) {
  let ticking = false;
  document.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        heroWave.style.transform = `translateY(${y * 0.15}px)`;
        if (heroLogo) heroLogo.style.transform = `translateY(${y * -0.08}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// Ripple effect on buttons
document.querySelectorAll('.ripple-btn').forEach((btn) => {
  btn.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    this.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

// Tilt effect on team cards
if (!prefersReducedMotion) {
  document.querySelectorAll('.team-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-8px) scale(1.02) rotateX(${y * -8}deg) rotateY(${x * 8}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// Live player
const playButton = document.getElementById('playButton');
const playIcon = document.getElementById('playIcon');
const playerStatus = document.getElementById('playerStatus');
const eqBars = document.getElementById('eqBars');
const heroDot = document.getElementById('heroDot');

const ICON_PLAY = 'M8 5v14l11-7z';
const ICON_PAUSE = 'M6 5h4v14H6zM14 5h4v14h-4z';

let liveAudio = null;
let isPlaying = false;

const setPlayerStatus = (state) => {
  playerStatus.classList.remove('is-live', 'is-error');
  if (state === 'live') {
    playerStatus.classList.add('is-live');
    playerStatus.innerHTML = '<span class="dot dot-live"></span> En vivo ahora';
  } else if (state === 'connecting') {
    playerStatus.innerHTML = '<span class="dot"></span> Conectando…';
  } else if (state === 'error') {
    playerStatus.classList.add('is-error');
    playerStatus.innerHTML = '<span class="dot"></span> Sin señal ahora — probá los lunes 11:14 a 12:14';
  } else {
    playerStatus.innerHTML = '<span class="dot"></span> Al aire los lunes';
  }
  eqBars?.classList.toggle('playing', state === 'live');
  heroDot?.classList.toggle('dot-live', state === 'live');
};

playButton?.addEventListener('click', () => {
  if (isPlaying) {
    liveAudio?.pause();
    isPlaying = false;
    playIcon.setAttribute('d', ICON_PLAY);
    playButton.classList.remove('playing');
    setPlayerStatus('idle');
    return;
  }

  if (!liveAudio) {
    liveAudio = new Audio('/api/stream');
    liveAudio.preload = 'none';
    liveAudio.addEventListener('playing', () => setPlayerStatus('live'));
    liveAudio.addEventListener('error', () => {
      isPlaying = false;
      playIcon.setAttribute('d', ICON_PLAY);
      playButton.classList.remove('playing');
      setPlayerStatus('error');
    });
  }

  setPlayerStatus('connecting');
  liveAudio.play().then(() => {
    isPlaying = true;
    playIcon.setAttribute('d', ICON_PAUSE);
    playButton.classList.add('playing');
  }).catch(() => setPlayerStatus('error'));
});

// Episodios (Programas)
const episodesLatest = document.getElementById('episodesLatest');
const episodesList = document.getElementById('episodesList');
const episodesToolbar = document.getElementById('episodesToolbar');
const episodesSearch = document.getElementById('episodesSearch');
const episodesMore = document.getElementById('episodesMore');

const EPISODES_PAGE_SIZE = 6;
let allEpisodios = [];
let episodesShowAll = false;

const episodeMediaHtml = (ep) => (ep.archivo
  ? `<audio controls preload="none" src="${ep.archivo}"></audio>`
  : `<a href="${ep.url}" target="_blank" rel="noopener" class="episode-external">Escuchar en Spotify</a>`);

const renderEmptyEpisodes = () => {
  if (episodesLatest) {
    episodesLatest.innerHTML = `
      <div class="episodes-empty">
        <img src="assets/microfono.png" alt="" aria-hidden="true">
        <strong>Todavía no subimos programas</strong>
        <p>Acá vas a encontrar el audio completo de cada lunes, apenas salga al aire.</p>
      </div>`;
  }
};

const renderLatestEpisode = (ep) => {
  episodesLatest.innerHTML = `
    <article class="episode-featured">
      <span class="episode-featured-tag">Último programa</span>
      <div class="episode-date">${ep.fecha}</div>
      <div class="episode-info">
        <h3>${ep.titulo}</h3>
        ${ep.descripcion ? `<p>${ep.descripcion}</p>` : ''}
      </div>
      ${episodeMediaHtml(ep)}
    </article>`;
};

const renderEpisodesList = (items, searching) => {
  if (items.length === 0) {
    episodesList.innerHTML = '<p class="episodes-no-results">No encontramos programas con esa búsqueda.</p>';
    episodesMore.hidden = true;
    return;
  }
  const visible = (episodesShowAll || searching) ? items : items.slice(0, EPISODES_PAGE_SIZE);
  episodesList.innerHTML = visible.map((ep) => `
    <article class="episode-card">
      <div class="episode-date">${ep.fecha}</div>
      <div class="episode-info">
        <h3>${ep.titulo}</h3>
        ${ep.descripcion ? `<p>${ep.descripcion}</p>` : ''}
      </div>
      ${episodeMediaHtml(ep)}
    </article>
  `).join('');
  episodesMore.hidden = episodesShowAll || searching || items.length <= EPISODES_PAGE_SIZE;
};

const applyEpisodesFilter = () => {
  const query = episodesSearch.value.trim().toLowerCase();
  const rest = allEpisodios.slice(1);
  const filtered = query
    ? rest.filter((ep) => `${ep.fecha} ${ep.titulo}`.toLowerCase().includes(query))
    : rest;
  renderEpisodesList(filtered, Boolean(query));
};

if (episodesLatest) {
  fetch('episodes.json')
    .then((res) => (res.ok ? res.json() : []))
    .then((episodios) => {
      if (!Array.isArray(episodios) || episodios.length === 0) {
        renderEmptyEpisodes();
        return;
      }
      allEpisodios = episodios;
      renderLatestEpisode(episodios[0]);
      if (episodios.length > 1) {
        episodesToolbar.hidden = false;
        applyEpisodesFilter();
      }
    })
    .catch(renderEmptyEpisodes);

  episodesSearch?.addEventListener('input', () => {
    episodesShowAll = false;
    applyEpisodesFilter();
  });

  episodesMore?.addEventListener('click', () => {
    episodesShowAll = true;
    applyEpisodesFilter();
  });
}

// Chat-style contact widget
const chatForm = document.getElementById('chatForm');
const chatNombre = document.getElementById('chatNombre');
const chatMensaje = document.getElementById('chatMensaje');
const bubbleOut = document.getElementById('bubbleOut');
const chatHint = document.getElementById('chatHint');

chatMensaje?.addEventListener('input', () => {
  const value = chatMensaje.value.trim();
  if (value) {
    bubbleOut.hidden = false;
    bubbleOut.textContent = value;
  } else {
    bubbleOut.hidden = true;
  }
});

chatForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const nombre = chatNombre.value.trim();
  const mensaje = chatMensaje.value.trim();
  if (!nombre || !mensaje) return;

  const texto = `Hola HNV! Soy ${nombre}. ${mensaje}`;

  navigator.clipboard?.writeText(texto).catch(() => {});
  window.open('https://ig.me/m/hastaquenosvayamos', '_blank', 'noopener');

  chatHint.textContent = 'Copiamos tu mensaje: "' + texto + '" — pegalo en el DM que se acaba de abrir 📋';
  chatHint.classList.add('success');

  chatForm.reset();
  bubbleOut.hidden = true;
});
