/* ============================================================
   cms-content.js  –  Loads JSON content files and populates the
   Schmalzried Haustechnik page at runtime.
   The CMS (Sveltia) edits these JSON files via GitHub; the host
   (Cloudflare Pages / GitHub Pages) serves the static result.
   ============================================================ */
'use strict';

(async function () {

  // ── Fetch helpers ────────────────────────────────────────
  async function fetchJSON(path) {
    try {
      const r = await fetch(path);
      if (!r.ok) throw new Error(r.status);
      return r.json();
    } catch (e) {
      console.warn('[CMS] Could not load', path, e.message);
      return null;
    }
  }

  // ── Minimal Markdown → HTML (bold, italic, links only) ──
  function md(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  }

  // ── Safely set text on an element ────────────────────────
  function setText(el, value) {
    if (el && value != null) el.textContent = value;
  }

  // Replace only the LAST text-node child of el, keeping any
  // preceding icon markup (e.g. <i class="fa-solid ...">) intact.
  function setTrailingText(el, value) {
    if (!el || value == null) return;
    const textNodes = [...el.childNodes].filter(n => n.nodeType === Node.TEXT_NODE);
    if (textNodes.length) {
      textNodes[textNodes.length - 1].textContent = ' ' + value;
    } else {
      el.appendChild(document.createTextNode(' ' + value));
    }
  }

  // ── Render a service card (Leistungen) ──────────────────
  function renderServiceCard(item, index) {
    const isEmergency = !!item.istNotdienst;
    const cardClass = 'service-card reveal' + (isEmergency ? ' service-card--emergency' : '');
    const cta = isEmergency
      ? `<a href="tel:+49TELEFONNUMMER" class="service-card__link service-card__link--emergency" aria-label="Notdienst anrufen">
      <i class="fa-solid fa-phone" aria-hidden="true"></i> Jetzt anrufen
    </a>`
      : `<a href="#kontakt" class="service-card__link" aria-label="${item.titel} anfragen">
      Anfragen <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
    </a>`;
    return `
<li class="${cardClass}" style="--delay: ${index * 80}ms">
  <div class="service-card__icon">
    <i class="${item.icon}" aria-hidden="true"></i>
  </div>
  <h3 class="service-card__title">${item.titel}</h3>
  <p class="service-card__desc">${item.text}</p>
  ${cta}
</li>`.trim();
  }

  // ── Render a gallery card (Referenzprojekte) ────────────
  function renderGalleryCard(item, index) {
    const imgClass = `gallery-card__img--${(index % 4) + 1}`;
    return `
<li class="gallery-card reveal" style="--delay: ${index * 80}ms">
  <div class="gallery-card__img ${imgClass}" role="img" aria-label="${item.titel}, ${item.ort} ${item.jahr}">
    <div class="gallery-card__overlay">
      <span class="gallery-card__tag">${item.tag}</span>
    </div>
  </div>
  <div class="gallery-card__caption">
    <h3 class="gallery-card__title">${item.titel}</h3>
    <p class="gallery-card__meta">
      <i class="fa-solid fa-map-pin" aria-hidden="true"></i>
      ${item.ort} &middot; ${item.jahr}
    </p>
    <p class="gallery-card__desc">${item.beschreibung}</p>
  </div>
</li>`.trim();
  }

  // ── Render an about-feature bullet ───────────────────────
  function renderFeature(text) {
    return `<li class="about-feature"><i class="fa-solid fa-circle-check" aria-hidden="true"></i><span>${text}</span></li>`;
  }

  // ── Render an about-stat (num/label) ─────────────────────
  function renderAboutStat(s) {
    return `<div class="about-stat"><span class="about-stat__num">${s.num}</span><span class="about-stat__label">${s.label}</span></div>`;
  }

  // ── Render a hero trust badge ────────────────────────────
  function renderTrustBadge(b) {
    return `<div class="trust-badge"><i class="${b.icon}" aria-hidden="true"></i><span>${b.text}</span></div>`;
  }

  // ── Set a legal-page field: fills the placeholder with the real
  // value once one is entered in the CMS, and turns off the loud
  // "legal-placeholder" highlighting since the field is no longer
  // missing. Leaves the placeholder untouched while the value is
  // still empty, so it stays unmissable until go-live.
  function setLegalField(id, value) {
    const el = document.getElementById(id);
    if (!el || value == null || String(value).trim() === '') return;
    el.textContent = value;
    el.classList.remove('legal-placeholder');
  }

  // ── Fetch everything in parallel ─────────────────────────
  const [siteinfo, hero, leistungen, referenzen, ueberuns, kontakt, rechtliches] =
    await Promise.all([
      fetchJSON('content/siteinfo.json'),
      fetchJSON('content/hero.json'),
      fetchJSON('content/leistungen.json'),
      fetchJSON('content/referenzen.json'),
      fetchJSON('content/ueberuns.json'),
      fetchJSON('content/kontakt.json'),
      fetchJSON('content/rechtliches.json'),
    ]);

  // ── 1. Site meta ─────────────────────────────────────────
  if (siteinfo) {
    if (siteinfo.title) document.title = siteinfo.title;

    const desc = document.querySelector('meta[name="description"]');
    if (desc && siteinfo.meta_description) desc.setAttribute('content', siteinfo.meta_description);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && siteinfo.og_title) ogTitle.setAttribute('content', siteinfo.og_title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && siteinfo.og_description) ogDesc.setAttribute('content', siteinfo.og_description);
  }

  // ── 2. Hero ───────────────────────────────────────────────
  if (hero) {
    setTrailingText(document.querySelector('.hero__eyebrow'), hero.eyebrow);

    const headline = document.querySelector('.hero__headline');
    if (headline && hero.headline_line1 != null) {
      headline.innerHTML =
        `${hero.headline_line1}<br><span class="hero__headline-em">${hero.headline_em}</span><br>${hero.headline_line2}`;
    }

    setText(document.querySelector('.hero__sub'), hero.sub);

    if (hero.trust_badges?.length) {
      const trustWrap = document.querySelector('.hero__trust');
      if (trustWrap) trustWrap.innerHTML = hero.trust_badges.map(renderTrustBadge).join('\n');
    }
  }

  // ── 3. Leistungen ─────────────────────────────────────────
  if (leistungen?.items?.length) {
    const grid = document.querySelector('.services-grid');
    if (grid) grid.innerHTML = leistungen.items.map(renderServiceCard).join('\n');
  }

  // ── 4. Referenzprojekte ───────────────────────────────────
  if (referenzen?.items?.length) {
    const grid = document.querySelector('.gallery-grid');
    if (grid) grid.innerHTML = referenzen.items.map(renderGalleryCard).join('\n');
  }

  // ── 5. Über uns ───────────────────────────────────────────
  if (ueberuns) {
    const paras = document.querySelectorAll('.about-desc');
    if (paras[0] && ueberuns.absatz1) paras[0].innerHTML = md(ueberuns.absatz1);
    if (paras[1] && ueberuns.absatz2) paras[1].innerHTML = md(ueberuns.absatz2);

    if (ueberuns.features?.length) {
      const list = document.querySelector('.about-features');
      if (list) list.innerHTML = ueberuns.features.map(renderFeature).join('\n');
    }

    if (ueberuns.stats?.length) {
      const statsWrap = document.querySelector('.about-stats');
      if (statsWrap) statsWrap.innerHTML = ueberuns.stats.map(renderAboutStat).join('\n');
    }
  }

  // ── 6. Kontakt ────────────────────────────────────────────
  if (kontakt) {
    const addr = document.querySelector('.contact-details__address');
    if (addr && kontakt.ort && kontakt.bundesland) {
      const strasseLine = kontakt.strasse ? `${kontakt.strasse}<br>` : '';
      addr.innerHTML = `${strasseLine}${kontakt.ort}<br>${kontakt.bundesland}`;
    }

    const footerAddr = document.querySelector('.footer__address');
    if (footerAddr && kontakt.ort && kontakt.bundesland) {
      const strassePart = kontakt.strasse ? `${kontakt.strasse}, ` : '';
      footerAddr.textContent = `${strassePart}${kontakt.ort}, ${kontakt.bundesland}`;
    }

    const emailLink = document.getElementById('contact-email-link');
    const emailText = document.getElementById('contact-email-text');
    if (emailLink && emailText && kontakt.email) {
      emailLink.href = `mailto:${kontakt.email}`;
      emailText.textContent = kontakt.email;
      emailLink.hidden = false;
    }

    const buerozeitenEl = document.querySelector('.contact-hours__row:not(.contact-hours__row--emergency) span');
    setText(buerozeitenEl, kontakt.buerozeiten);

    const notdienstEl = document.querySelector('.contact-hours__row--emergency span');
    setText(notdienstEl, kontakt.notdienst_zeiten);

    if (kontakt.einzugsgebiet_orte?.length) {
      const listEl = document.querySelector('.contact-area__list');
      if (listEl) {
        const suffix = kontakt.einzugsgebiet_suffix ? ' ' + kontakt.einzugsgebiet_suffix : '';
        listEl.textContent = kontakt.einzugsgebiet_orte.join(' · ') + suffix;
      }
    }

    const iframe = document.querySelector('.contact-map iframe');
    if (iframe && kontakt.map_bbox && kontakt.map_marker) {
      iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${kontakt.map_bbox}&layer=mapnik&marker=${kontakt.map_marker}`;
    }

    // ── Fix the phone number EVERYWHERE it appears on the page ──
    // Covers: emergency banner, hero action button, mobile-nav emergency
    // call link, the Leistungen emergency service-card CTA (just rendered
    // above), the contact-form success "Oder direkt anrufen" button, the
    // Kontakt section's contact-phone link, and the footer phone link.
    // Placeholder "[TELEFONNUMMER]" / "+49TELEFONNUMMER" stays as the
    // fallback until the real number is entered in the CMS.
    const telLinks = document.querySelectorAll('a[href="tel:+49TELEFONNUMMER"]');
    telLinks.forEach(a => {
      if (kontakt.telefon_href) a.setAttribute('href', `tel:${kontakt.telefon_href}`);
      if (kontakt.telefon) {
        a.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.includes('[TELEFONNUMMER]')) {
            node.textContent = node.textContent.replace('[TELEFONNUMMER]', kontakt.telefon);
          }
        });
      }
    });
  }

  // ── 7. Impressum / Datenschutz (nur falls die Felder auf der
  // aktuellen Seite existieren – auf index.html greift das nicht) ──
  if (kontakt) {
    setText(document.getElementById('impressum-ort'), kontakt.ort);
    setText(document.getElementById('impressum-bundesland'), kontakt.bundesland);
    setText(document.getElementById('datenschutz-ort'), kontakt.ort);
    setText(document.getElementById('datenschutz-bundesland'), kontakt.bundesland);
    setLegalField('impressum-strasse', kontakt.strasse);
    setLegalField('datenschutz-strasse', kontakt.strasse);
    setLegalField('impressum-email', kontakt.email);
    setLegalField('datenschutz-email', kontakt.email);
  }

  if (rechtliches) {
    setLegalField('impressum-vertretung', rechtliches.vertretungsberechtigte_person);
    setLegalField('impressum-ust', rechtliches.ust_idnr);
    setLegalField('impressum-hr-gericht', rechtliches.handelsregister_gericht);
    setLegalField('impressum-hr-nummer', rechtliches.handelsregister_nummer);
    setLegalField('impressum-kammer', rechtliches.kammer);
    setLegalField('impressum-berufsbezeichnung', rechtliches.berufsbezeichnung);
  }

  // ── Re-observe any newly added .reveal elements ──────────
  if (typeof window.cmsObserveReveal === 'function') {
    window.cmsObserveReveal();
  }

  // ── Signal other scripts that CMS content is in the DOM ──
  document.dispatchEvent(new CustomEvent('cms-ready'));

})();
