'use strict';

/**
 * frames.js — SVG device frame definitions
 *
 * KEY INSIGHT: librsvg (used by Sharp) renders truly transparent alpha=0 pixels
 * wherever no SVG element is drawn. So we draw ONLY the frame parts that surround
 * the screen — never drawing anything over the screen opening itself.
 * composite.js then places the screenshot on a canvas FIRST, then overlays
 * the frame PNG on top, letting the screenshot show through the transparent hole.
 *
 * SCREEN_AREAS: pixel coords of the transparent screen opening in each frame PNG.
 */

const SCREEN_AREAS = {
  laptop: { x: 92, y: 56, w: 1256, h: 786, totalW: 1440, totalH: 960 },
  mobile: { x: 18, y: 60, w: 354,  h: 724, totalW: 390,  totalH: 844 },
};

// ─── Laptop ───────────────────────────────────────────────────────────────────
// Draws the frame in sections: left bezel, right bezel, top bezel, bottom bezel,
// hinge, base — but NOTHING over the screen area (x:92–1348, y:56–842).
function laptopFrameSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 960" width="1440" height="960">
  <defs>
    <linearGradient id="lid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#2c2c2e"/>
      <stop offset="100%" stop-color="#1a1a1c"/>
    </linearGradient>
    <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#3d3d3f"/>
      <stop offset="100%" stop-color="#2a2a2c"/>
    </linearGradient>
    <linearGradient id="hinge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#1a1a1c"/>
      <stop offset="50%"  stop-color="#3a3a3c"/>
      <stop offset="100%" stop-color="#1a1a1c"/>
    </linearGradient>
    <linearGradient id="bodyEdge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#3a3a3c"/>
      <stop offset="100%" stop-color="#1c1c1e"/>
    </linearGradient>
    <linearGradient id="gloss" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="shadow" x="-4%" y="-4%" width="108%" height="115%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.55"/>
    </filter>
  </defs>

  <!-- ═══ LID OUTER ROUNDED CORNERS (4 corner fills) ═══════════════════════ -->
  <!-- These fill the rounded corner areas of the lid that aren't screen. -->

  <!-- Top-left rounded corner region -->
  <path d="M60,12 Q60,12 74,12 L74,46 Q68,46 66,48 L60,48 Z" fill="url(#lid)"/>
  <!-- Outer rounded top-left lid corner -->
  <path d="M60,26 Q60,12 74,12 L74,12 L60,12 Z" fill="url(#lid)"/>

  <!-- Full top lid section (above screen bezel) -->
  <!-- Left outer lid strip (x:60 to x:92, full height of lid) -->
  <rect x="60" y="12" width="32" height="872" rx="0" fill="url(#lid)"/>
  <!-- Apply rounded left corners to lid -->
  <rect x="60" y="12" width="32" height="872" fill="url(#lid)"/>

  <!-- Right outer lid strip (x:1348 to x:1380, full height) -->
  <rect x="1348" y="12" width="32" height="872" fill="url(#lid)"/>

  <!-- Lid outer corners (rounded) — drawn as rounded rect, then overwrite center -->
  <!-- We achieve round corners by drawing the full lid rect, then blanking the screen area.
       BUT we can't blank (we'd need to cut out). Instead use path shapes. -->

  <!-- APPROACH: Draw 5 strips that form a picture-frame shape around screen -->

  <!-- TOP strip: full width lid top, from y=12 to y=56 (above screen) -->
  <rect x="60" y="12" width="1320" height="44" rx="14" ry="14" fill="url(#lid)"/>
  <!-- Overwrite bottom-half of top strip to be non-rounded: -->
  <rect x="60" y="26" width="1320" height="30" fill="url(#lid)"/>

  <!-- BOTTOM strip: from y=842 to y=884 (below screen) -->
  <rect x="60" y="842" width="1320" height="42" fill="url(#lid)"/>
  <!-- Round the bottom corners of the lid -->
  <rect x="60" y="842" width="1320" height="42" rx="0" fill="url(#lid)"/>
  <!-- Rounded bottom lid corners -->
  <rect x="60" y="856" width="1320" height="28" rx="14" ry="14" fill="url(#lid)"/>
  <rect x="60" y="842" width="1320" height="28" fill="url(#lid)"/>

  <!-- LEFT strip: x=60 to x=92, y=56 to y=842 (beside screen) -->
  <rect x="60" y="56" width="32" height="786" fill="url(#lid)"/>

  <!-- RIGHT strip: x=1348 to x=1380, y=56 to y=842 -->
  <rect x="1348" y="56" width="32" height="786" fill="url(#lid)"/>

  <!-- ═══ BEZEL (dark inner border around screen) ════════════════════════════ -->
  <!-- Top bezel: between lid top (y=44) and screen top (y=56) -->
  <rect x="82" y="44" width="1276" height="12" fill="#0a0a0a"/>
  <!-- Bottom bezel -->
  <rect x="82" y="842" width="1276" height="12" fill="#0a0a0a"/>
  <!-- Left bezel -->
  <rect x="82" y="44" width="10" height="812" fill="#0a0a0a"/>
  <!-- Right bezel -->
  <rect x="1348" y="44" width="10" height="812" fill="#0a0a0a"/>

  <!-- NOTE: No glass reflection over screen area — keep it alpha=0 for compositing -->

  <!-- ═══ LID EDGE HIGHLIGHT ══════════════════════════════════════════════════ -->
  <rect x="62" y="13" width="1316" height="2" rx="1" fill="#5c5c5e" opacity="0.5"/>

  <!-- ═══ WEBCAM ════════════════════════════════════════════════════════════════ -->
  <ellipse cx="720" cy="50" rx="5"   ry="5"   fill="#1a1a1a"/>
  <ellipse cx="720" cy="50" rx="2.5" ry="2.5" fill="#0d2137" opacity="0.82"/>
  <ellipse cx="718.5" cy="48.5" rx="1" ry="1" fill="#fff" opacity="0.22"/>

  <!-- ═══ HINGE ═════════════════════════════════════════════════════════════════ -->
  <rect x="100" y="882" width="1240" height="8" rx="3" fill="url(#hinge)"/>

  <!-- ═══ BASE ══════════════════════════════════════════════════════════════════ -->
  <rect x="40" y="888" width="1360" height="60" rx="8" fill="url(#base)"/>
  <!-- Keyboard suggestion -->
  <rect x="180" y="898" width="900" height="34" rx="4" fill="#000" opacity="0.18"/>
  <!-- Trackpad -->
  <rect x="580" y="910" width="280" height="22" rx="4" fill="#2a2a2c" stroke="#3e3e40" stroke-width="0.5"/>
  <!-- Base bottom shadow -->
  <rect x="0" y="944" width="1440" height="16" rx="6" fill="url(#bodyEdge)" opacity="0.7"/>

  <!-- Drop shadow for whole frame (drawn last so it's on top of body but not content) -->
  <!-- Applied via filter on a ghost rect for the lid region -->
  <rect x="60" y="12" width="1320" height="872" rx="14" fill="none" filter="url(#shadow)" opacity="0.5"/>
</svg>`;
}

// ─── Mobile ───────────────────────────────────────────────────────────────────
// Same principle: draw only 4 strips + bezel arcs, never touch screen area x:18–372, y:60–784
function mobileFrameSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">
  <defs>
    <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="#2c2c2e"/>
      <stop offset="100%" stop-color="#1c1c1e"/>
    </linearGradient>
    <linearGradient id="sides" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#1a1a1c"/>
      <stop offset="30%"  stop-color="#3a3a3c"/>
      <stop offset="70%"  stop-color="#3a3a3c"/>
      <stop offset="100%" stop-color="#1a1a1c"/>
    </linearGradient>
    <linearGradient id="gloss2" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="phoneShadow" x="-10%" y="-5%" width="120%" height="110%">
      <feDropShadow dx="0" dy="10" stdDeviation="20" flood-color="#000" flood-opacity="0.65"/>
    </filter>
  </defs>

  <!-- ═══ 4 STRIPS around screen (screen is x:18–372, y:60–784) ═══════════ -->

  <!-- TOP strip: full width, y=0 to y=60 (above screen) -->
  <!-- Draw rounded top of phone -->
  <rect x="0" y="0" width="390" height="60" rx="48" ry="48" fill="url(#body)"/>
  <rect x="0" y="20" width="390" height="40" fill="url(#body)"/>

  <!-- BOTTOM strip: full width, y=784 to y=844 -->
  <rect x="0" y="784" width="390" height="60" fill="url(#body)"/>
  <rect x="0" y="784" width="390" height="46" rx="0" fill="url(#body)"/>
  <rect x="0" y="796" width="390" height="48" rx="48" ry="48" fill="url(#body)"/>

  <!-- LEFT strip: x=0 to x=18, y=60 to y=784 -->
  <rect x="0" y="60" width="18" height="724" fill="url(#body)"/>

  <!-- RIGHT strip: x=372 to x=390, y=60 to y=784 -->
  <rect x="372" y="60" width="18" height="724" fill="url(#body)"/>

  <!-- ═══ BEZEL (thin dark inner border around screen) ══════════════════════ -->
  <!-- Top bezel -->
  <rect x="14" y="14" width="362" height="50" rx="34" ry="34" fill="#0a0a0a"/>
  <rect x="14" y="38" width="362" height="26" fill="#0a0a0a"/>
  <!-- Bottom bezel -->
  <rect x="14" y="780" width="362" height="12" fill="#0a0a0a"/>
  <rect x="14" y="782" width="362" height="48" rx="34" ry="34" fill="#0a0a0a"/>
  <!-- Left bezel -->
  <rect x="14" y="60" width="4" height="724" fill="#0a0a0a"/>
  <!-- Right bezel -->
  <rect x="372" y="60" width="4" height="724" fill="#0a0a0a"/>

  <!-- NOTE: No glass reflection over screen area — keep it alpha=0 for compositing -->

  <!-- ═══ DYNAMIC ISLAND ════════════════════════════════════════════════════ -->
  <rect x="148" y="18" width="94" height="30" rx="15" fill="#0a0a0a"/>
  <ellipse cx="220" cy="33" rx="7"   ry="7"   fill="#141414"/>
  <ellipse cx="220" cy="33" rx="4"   ry="4"   fill="#0d1f30" opacity="0.9"/>
  <ellipse cx="218" cy="31" rx="1.5" ry="1.5" fill="#fff" opacity="0.2"/>

  <!-- Speaker grille -->
  <rect x="166" y="21" width="38" height="5" rx="2.5" fill="#1a1a1c"/>

  <!-- ═══ SIDE BUTTONS ═══════════════════════════════════════════════════════ -->
  <rect x="385" y="180" width="5" height="72" rx="2.5" fill="url(#sides)"/>
  <rect x="0"   y="158" width="5" height="52" rx="2.5" fill="url(#sides)"/>
  <rect x="0"   y="224" width="5" height="52" rx="2.5" fill="url(#sides)"/>
  <rect x="0"   y="116" width="5" height="30" rx="2.5" fill="url(#sides)"/>

  <!-- ═══ BOTTOM DETAILS ═════════════════════════════════════════════════════ -->
  <circle cx="146" cy="826" r="2.5" fill="#3a3a3c"/>
  <circle cx="157" cy="826" r="2.5" fill="#3a3a3c"/>
  <circle cx="168" cy="826" r="2.5" fill="#3a3a3c"/>
  <circle cx="222" cy="826" r="2.5" fill="#3a3a3c"/>
  <circle cx="233" cy="826" r="2.5" fill="#3a3a3c"/>
  <circle cx="244" cy="826" r="2.5" fill="#3a3a3c"/>
  <rect x="170" y="832" width="50" height="8" rx="4" fill="#1a1a1c"/>

  <!-- Top rim highlight -->
  <rect x="14" y="2" width="362" height="2" rx="1" fill="#5a5a5c" opacity="0.4"/>

  <!-- Home indicator -->
  <rect x="152" y="795" width="86" height="5" rx="2.5" fill="#fff" opacity="0.2"/>

  <!-- Drop shadow ghost rect -->
  <rect x="0" y="0" width="390" height="844" rx="48" fill="none" filter="url(#phoneShadow)" opacity="0.5"/>
</svg>`;
}

module.exports = { laptopFrameSVG, mobileFrameSVG, SCREEN_AREAS };
