// --------------------------------------------------
// STRAPONTIN TRAIL + RETRACT + ROTATING TAGLINE
//
// DESKTOP
// - follows mouse
// - project swap after 3s quiet + real movement start
//
// MOBILE
// - autonomous serpentine motion
// - 4s blank pause between trails
// - guaranteed project swap at true start of next trail
// - minimum 10 images per trail
//
// IMPORTANT
// - stop card disabled to avoid blink / image re-appearance
// --------------------------------------------------

const PROJECT_COUNT = 10;
const FONT_FILE = "font.otf";

// --------------------------------------------------
// DISPLAY OPTIONS
// --------------------------------------------------
const SHOW_STOP_CARD_DESKTOP = false;
const SHOW_STOP_CARD_MOBILE = false;

// --------------------------------------------------
// ASSETS
// --------------------------------------------------
let imgs = [];
let imgReady = [];
let fallbackImg;
let uiFont = null;

// --------------------------------------------------
// TEXT
// --------------------------------------------------
const BASE_LINE = "Bureau 1217 is a design studio based in Geneva and Lyon.";

const TAGLINES = [
  "We combine Identity, Digital Design & Development",
  "We blend technology and design to foster bold ideas.",
  "We connect research, strategy and creativity.",
  "We help you step toward your next communication step.",
  "We bridges meaning and form to connect people to ideas."
];

let taglineIndex = 0;
let prevTaglineIndex = 0;
let taglineTransitionStart = 0;
const taglineTransitionDuration = 950;

let pendingTaglineSwap = false;
let taglineSwapAt = 0;
const taglineSwapDelay = 180;
let hasSwappedOnce = false;

// --------------------------------------------------
// TRAIL
// --------------------------------------------------
let stamps = [];
let emitX = 0, emitY = 0;

const stepDist = 28;
const minInterval = 35;
let lastSpawnTime = 0;

let sx = 0, sy = 0;
const smoothAmt = 0.22;

let hasPath = false;
let hasMovedOnce = false;

const MIN_TRAIL_IMAGES = 10;
const MAX_STAMPS = 320;

// --------------------------------------------------
// CARD SIZE
// --------------------------------------------------
const CARD_H = 220;
const CARD_AR = 0.72;
const CARD_W = Math.round(CARD_H * CARD_AR);

const IDLE_H = 240;
const IDLE_W = Math.round(IDLE_H * CARD_AR);

// --------------------------------------------------
// STATES
// --------------------------------------------------
const STATE_MOVE = "MOVE";
const STATE_HOLD = "HOLD";
const STATE_RETRACT = "RETRACT";
const STATE_YELLOW = "YELLOW";

let state = STATE_MOVE;
let stateStart = 0;

let lastMoveTime = 0;
let idleDelay = 340;
const holdDuration = 200;
let retractDuration = 650;

let stopX = 0, stopY = 0;
let retractN0 = 0;
const yellowDuration = 1500;

// --------------------------------------------------
// IMAGES
// --------------------------------------------------
let currentMoveImg = null;
let stopCardImg = null;
let lastPickedIndex = -1;

// --------------------------------------------------
// DESKTOP QUIET GATE
// --------------------------------------------------
const QUIET_BEFORE_NEXT_MS = 3000;
const MOVE_START_DIST = 10;

let lastMoveEventAt = 0;
let nextProjectArmed = false;
let quietQualified = false;
let quietAnchorX = 0, quietAnchorY = 0;

// --------------------------------------------------
// INPUT MODE
// --------------------------------------------------
let isMobileMode = false;

let pointerX = 0;
let pointerY = 0;
let prevPointerX = 0;
let prevPointerY = 0;

// --------------------------------------------------
// MOBILE AUTO MOVEMENT
// --------------------------------------------------
let autoX = 0;
let autoY = 0;

let autoMoveActive = false;
let autoMoveStartAt = 0;
let autoMoveDuration = 0;
let autoWaitUntil = 0;

let autoFromX = 0;
let autoFromY = 0;
let autoToX = 0;
let autoToY = 0;

let autoCtrl1X = 0;
let autoCtrl1Y = 0;
let autoCtrl2X = 0;
let autoCtrl2Y = 0;

const MOBILE_TRAIL_DELAY = 4000;
let mobileProjectSwapArmed = false;
let mobilePauseLock = false;

// --------------------------------------------------
// PRELOAD
// --------------------------------------------------
function preload() {
  fallbackImg = makeFallbackGraphic();

  uiFont = loadFont(
    FONT_FILE,
    () => {},
    () => { uiFont = null; }
  );

  imgs = new Array(PROJECT_COUNT);
  imgReady = new Array(PROJECT_COUNT).fill(false);

  for (let i = 1; i <= PROJECT_COUNT; i++) {
    const idx = i - 1;
    const filename = `${i}.png`;

    imgs[idx] = loadImage(
      filename,
      () => { imgReady[idx] = true; },
      () => {
        imgs[idx] = fallbackImg;
        imgReady[idx] = true;
      }
    );
  }
}

// --------------------------------------------------
// SETUP
// --------------------------------------------------
function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  noStroke();

  if (uiFont) textFont(uiFont);

  detectInputMode();

  const cx = width * 0.5;
  const cy = height * 0.5;

  if (isMobileMode) {
    autoX = cx;
    autoY = cy;

    pointerX = autoX;
    pointerY = autoY;
    prevPointerX = pointerX;
    prevPointerY = pointerY;

    sx = pointerX;
    sy = pointerY;
    emitX = pointerX;
    emitY = pointerY;

    mobilePauseLock = true;
    mobileProjectSwapArmed = false;
    autoMoveActive = false;
    scheduleNextAutoMove(millis(), true);
  } else {
    pointerX = mouseX || cx;
    pointerY = mouseY || cy;
    prevPointerX = pointerX;
    prevPointerY = pointerY;

    sx = pointerX;
    sy = pointerY;
    emitX = pointerX;
    emitY = pointerY;
  }

  currentMoveImg = pickNextMovementImage();
  stopCardImg = currentMoveImg;

  const now = millis();
  lastMoveTime = now;
  lastMoveEventAt = now;
  lastSpawnTime = now;
  stateStart = now;
  taglineTransitionStart = now;
}

// --------------------------------------------------
// DRAW
// --------------------------------------------------
function draw() {
  background(0, 0, 0, 0);
  const now = millis();

  updatePointer(now);

  if (isMobileMode) {
    sx = pointerX;
    sy = pointerY;
  } else {
    sx = lerp(sx, pointerX, smoothAmt);
    sy = lerp(sy, pointerY, smoothAmt);
  }

  const moved = dist(pointerX, pointerY, prevPointerX, prevPointerY) > 0.5;
  if (moved) lastMoveEventAt = now;

  // ---------------- DESKTOP QUIET QUALIFICATION ----------------
  if (!isMobileMode && nextProjectArmed && !quietQualified) {
    if (now - lastMoveEventAt >= QUIET_BEFORE_NEXT_MS) {
      quietQualified = true;
      quietAnchorX = pointerX;
      quietAnchorY = pointerY;
    }
  }

  const canSwitchDesktop =
    !isMobileMode &&
    nextProjectArmed &&
    quietQualified &&
    dist(pointerX, pointerY, quietAnchorX, quietAnchorY) >= MOVE_START_DIST;

  // ---------------- MOVEMENT ----------------
  if (moved) {
    hasMovedOnce = true;

    if (canSwitchDesktop) {
      beginNewTrail(now, pickNextMovementImage());
      nextProjectArmed = false;
      quietQualified = false;
    }

    if (!(isMobileMode && mobilePauseLock)) {
      state = STATE_MOVE;
      lastMoveTime = now;
      pendingTaglineSwap = false;

      if (now - lastSpawnTime >= minInterval) {
        emitAlongPath(emitX, emitY, sx, sy, stepDist);
        emitX = sx;
        emitY = sy;
        lastSpawnTime = now;
      }
    }
  }

  // ---------------- STATE MACHINE ----------------
  if (state === STATE_MOVE) {
    // critical fix:
    // while mobile is in blank pause, NEVER enter HOLD
    if (!(isMobileMode && mobilePauseLock)) {
      if (hasPath && (now - lastMoveTime > idleDelay)) {
        state = STATE_HOLD;
        stateStart = now;
        stopX = pointerX;
        stopY = pointerY;
        stopCardImg = currentMoveImg;
      }
    }
  }

  else if (state === STATE_HOLD) {
    if (now - stateStart >= holdDuration) {
      state = STATE_RETRACT;
      stateStart = now;
      retractN0 = stamps.length;
      retractDuration = constrain(320 + retractN0 * 14, 420, 950);
    }
  }

  else if (state === STATE_RETRACT) {
    const t = (now - stateStart) / retractDuration;
    if (t >= 1) {
      stamps = [];

      if (hasPath && hasMovedOnce) {
        state = STATE_YELLOW;
        stateStart = now;

        if (isMobileMode) {
          mobileProjectSwapArmed = true;
          mobilePauseLock = true;
          autoMoveActive = false;
          autoWaitUntil = now + MOBILE_TRAIL_DELAY;
        } else {
          nextProjectArmed = true;
          quietQualified = false;
        }

        pendingTaglineSwap = true;
        taglineSwapAt = now + taglineSwapDelay;
      } else {
        state = STATE_MOVE;
      }
    }
  }

  else if (state === STATE_YELLOW) {
    if (pendingTaglineSwap && now >= taglineSwapAt) {
      pendingTaglineSwap = false;
      prevTaglineIndex = taglineIndex;
      taglineIndex = (taglineIndex + 1) % TAGLINES.length;
      taglineTransitionStart = now;
      hasSwappedOnce = true;
    }

    if (now - stateStart >= yellowDuration) {
      state = STATE_MOVE;
      emitX = sx;
      emitY = sy;
      lastMoveTime = now;

      if (isMobileMode) {
        mobilePauseLock = true;
        autoWaitUntil = now + MOBILE_TRAIL_DELAY;
      }
    }
  }

  // ---------------- DRAW TRAIL ----------------
  if (state === STATE_MOVE || state === STATE_HOLD) {
    drawStampsFull();
  } else if (state === STATE_RETRACT) {
    drawStampsRetracting(now);
  }

  // ---------------- STOP CARD ----------------
  if (state === STATE_YELLOW) {
    const showStop = isMobileMode ? SHOW_STOP_CARD_MOBILE : SHOW_STOP_CARD_DESKTOP;
    if (showStop) {
      drawStopCardWithFlow(now);
    }
  }

  // ---------------- TEXT ----------------
  // drawDifferenceText();

  prevPointerX = pointerX;
  prevPointerY = pointerY;
}

// --------------------------------------------------
// START NEW TRAIL CLEANLY
// --------------------------------------------------
function beginNewTrail(now, nextImg) {
  currentMoveImg = nextImg || fallbackImg;
  stamps = [];

  if (isMobileMode) {
    pointerX = autoX;
    pointerY = autoY;
    prevPointerX = pointerX;
    prevPointerY = pointerY;
  }

  sx = pointerX;
  sy = pointerY;
  emitX = pointerX;
  emitY = pointerY;

  lastSpawnTime = now;
  lastMoveTime = now;
  lastMoveEventAt = now;

  hasPath = false;
  mobilePauseLock = false;
}

// --------------------------------------------------
// POINTER UPDATE
// --------------------------------------------------
function updatePointer(now) {
  if (isMobileMode) {
    updateAutoMovement(now);
    pointerX = autoX;
    pointerY = autoY;
  } else {
    pointerX = mouseX;
    pointerY = mouseY;
  }
}

function detectInputMode() {
  isMobileMode =
    ("ontouchstart" in window) ||
    navigator.maxTouchPoints > 0 ||
    windowWidth <= 900;
}

// --------------------------------------------------
// MOBILE AUTO MOVEMENT
// --------------------------------------------------
function updateAutoMovement(now) {
  if (autoMoveActive) {
    const t = constrain((now - autoMoveStartAt) / autoMoveDuration, 0, 1);
    const e = easeInOutSine(t);

    autoX = cubicBezierPoint(autoFromX, autoCtrl1X, autoCtrl2X, autoToX, e);
    autoY = cubicBezierPoint(autoFromY, autoCtrl1Y, autoCtrl2Y, autoToY, e);

    if (t >= 1) {
      autoMoveActive = false;
      autoX = autoToX;
      autoY = autoToY;
    }
    return;
  }

  // launch next trail only during blank mobile pause
  if (isMobileMode && mobilePauseLock && now >= autoWaitUntil) {
    startAutoMove(now);
  }
}

function scheduleNextAutoMove(now, immediateStart = false) {
  autoWaitUntil = now + (immediateStart ? 250 : MOBILE_TRAIL_DELAY);
}

function startAutoMove(now) {
  mobilePauseLock = false;
  state = STATE_MOVE;
  stateStart = now;

  if (mobileProjectSwapArmed) {
    mobileProjectSwapArmed = false;
    beginNewTrail(now, pickNextMovementImage());
  } else {
    beginNewTrail(now, currentMoveImg);
  }

  autoMoveActive = true;
  autoMoveStartAt = now;

  autoFromX = autoX;
  autoFromY = autoY;

  const marginX = width * 0.08;
  const marginY = height * 0.08;
  const base = min(width, height);

  let tx = random(marginX, width - marginX);
  let ty = random(marginY, height - marginY);

  let attempts = 0;
  while (dist(autoFromX, autoFromY, tx, ty) < base * 0.28 && attempts < 8) {
    tx = random(marginX, width - marginX);
    ty = random(marginY, height - marginY);
    attempts++;
  }

  autoToX = tx;
  autoToY = ty;

  const dx = autoToX - autoFromX;
  const dy = autoToY - autoFromY;
  const d = dist(autoFromX, autoFromY, autoToX, autoToY);

  const nx = d > 0 ? -dy / d : 0;
  const ny = d > 0 ? dx / d : 0;

  const curveAmp = random(base * 0.10, base * 0.26);
  const side1 = random() < 0.5 ? -1 : 1;
  const side2 = random() < 0.5 ? -1 : 1;

  autoCtrl1X = autoFromX + dx * 0.28 + nx * curveAmp * side1;
  autoCtrl1Y = autoFromY + dy * 0.28 + ny * curveAmp * side1;

  autoCtrl2X = autoFromX + dx * 0.72 + nx * curveAmp * side2;
  autoCtrl2Y = autoFromY + dy * 0.72 + ny * curveAmp * side2;

  autoCtrl1X = constrain(autoCtrl1X, marginX, width - marginX);
  autoCtrl1Y = constrain(autoCtrl1Y, marginY, height - marginY);
  autoCtrl2X = constrain(autoCtrl2X, marginX, width - marginX);
  autoCtrl2Y = constrain(autoCtrl2Y, marginY, height - marginY);

  let pxPerMs;
  if (d < base * 0.30) {
    pxPerMs = random(0.45, 0.75);
  } else if (d < base * 0.55) {
    pxPerMs = random(0.65, 1.05);
  } else {
    pxPerMs = random(0.90, 1.35);
  }

  autoMoveDuration = constrain(d / pxPerMs, 420, 1400);
  ensureMinTrailTiming(d);
}

function ensureMinTrailTiming(distancePx) {
  const minDistanceNeeded = MIN_TRAIL_IMAGES * stepDist;

  if (distancePx < minDistanceNeeded) {
    const speedBoost = distancePx / max(autoMoveDuration, 1);
    autoMoveDuration = constrain(
      minDistanceNeeded / max(speedBoost, 0.2),
      520,
      1600
    );
  }
}

// --------------------------------------------------
// IMAGE PICK
// --------------------------------------------------
function pickNextMovementImage() {
  const readyIdx = [];
  for (let i = 0; i < imgs.length; i++) {
    if (imgReady[i]) readyIdx.push(i);
  }

  if (!readyIdx.length) return fallbackImg;

  if (readyIdx.length === 1) {
    lastPickedIndex = readyIdx[0];
    return imgs[readyIdx[0]] || fallbackImg;
  }

  let idx = readyIdx[floor(random(readyIdx.length))];
  if (idx === lastPickedIndex) {
    const k = readyIdx.indexOf(idx);
    idx = readyIdx[(k + 1) % readyIdx.length];
  }

  lastPickedIndex = idx;
  return imgs[idx] || fallbackImg;
}

// --------------------------------------------------
// TRAIL DRAWING
// --------------------------------------------------
function drawStampsFull() {
  for (const s of stamps) {
    drawImageCroppedToAspect(s.img, s.x, s.y, CARD_W, CARD_H);
  }
}

function drawStampsRetracting(now) {
  const t = constrain((now - stateStart) / retractDuration, 0, 1);
  const p = easeInExpo(t);

  const remaining = ceil((1 - p) * retractN0);
  const startIndex = max(0, stamps.length - remaining);

  for (let i = startIndex; i < stamps.length; i++) {
    const s = stamps[i];
    drawImageCroppedToAspect(s.img, s.x, s.y, CARD_W, CARD_H);
  }
}

// --------------------------------------------------
// STOP CARD
// --------------------------------------------------
function drawStopCardWithFlow(now) {
  const img = stopCardImg || fallbackImg;
  const tt = now - stateStart;

  const inDur = 140;
  const outDur = 260;
  const holdEnd = max(inDur, yellowDuration - outDur);

  let a = 1;
  if (tt < inDur) {
    a = easeOutCubic(constrain(tt / inDur, 0, 1));
  } else if (tt > holdEnd) {
    const u = constrain((tt - holdEnd) / outDur, 0, 1);
    a = 1 - easeInOutCubic(u);
  }

  const sc = lerp(0.99, 1.0, a);

  push();
  translate(stopX, stopY);
  scale(sc);
  tint(255, 255 * a);
  drawImageCroppedToAspect(img, 0, 0, IDLE_W, IDLE_H);
  pop();
  noTint();
}

// --------------------------------------------------
// TEXT
// --------------------------------------------------
function drawDifferenceText() {
  const maxW = min(560, width - 80);
  const x = width / 2 - maxW / 2;
  const y = height / 2;

  const prev = TAGLINES[prevTaglineIndex];
  const next = TAGLINES[taglineIndex];

  push();
  blendMode(DIFFERENCE);
  fill(255);
  textSize(20);
  textLeading(28);
  textAlign(LEFT, CENTER);

  text(BASE_LINE, x, y - 14, maxW);

  if (!hasSwappedOnce) {
    text(next, x, y + 14, maxW);
    blendMode(BLEND);
    pop();
    return;
  }

  const raw = constrain(
    (millis() - taglineTransitionStart) / taglineTransitionDuration,
    0,
    1
  );
  const t = easeInOutCubic(raw);

  const lineH = 28;
  const rectX = x;
  const rectW = maxW;
  const rectH = lineH;
  const rectY = (y + 14) - rectH / 2;
  const slideDist = 34;

  const outY = (y + 14) + lerp(0, slideDist, t);
  const inY = (y + 14) + lerp(-slideDist, 0, t);

  const aOut = 1 - t;
  const aIn = t;

  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(rectX, rectY, rectW, rectH);
  drawingContext.clip();
  fill(255, 255 * aOut);
  text(prev, x, outY, maxW);
  drawingContext.restore();
  pop();

  push();
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(rectX, rectY, rectW, rectH);
  drawingContext.clip();
  fill(255, 255 * aIn);
  text(next, x, inY, maxW);
  drawingContext.restore();
  pop();

  blendMode(BLEND);
  pop();
}

// --------------------------------------------------
// EMISSION
// --------------------------------------------------
function emitAlongPath(x0, y0, x1, y1, step) {
  const d = dist(x0, y0, x1, y1);

  if (d < step * 0.65) {
    spawnStamp(x1, y1);
    return;
  }

  let steps = floor(d / step);
  steps = max(1, steps);

  for (let i = 1; i <= steps; i++) {
    const u = i / steps;
    spawnStamp(lerp(x0, x1, u), lerp(y0, y1, u));
  }
}

function spawnStamp(x, y) {
  const img = currentMoveImg || fallbackImg;
  stamps.push({ x, y, img });

  hasPath = true;
  if (stamps.length > MAX_STAMPS) stamps.shift();
}

// --------------------------------------------------
// CROPPING
// --------------------------------------------------
function drawImageCroppedToAspect(img, x, y, dw, dh) {
  img = img || fallbackImg;
  if (!img || !img.width || !img.height) return;

  const iw = img.width;
  const ih = img.height;

  const targetAR = dw / dh;
  const srcAR = iw / ih;

  let sx, sy, sw, sh;

  if (srcAR > targetAR) {
    sh = ih;
    sw = ih * targetAR;
    sx = (iw - sw) * 0.5;
    sy = 0;
  } else {
    sw = iw;
    sh = iw / targetAR;
    sx = 0;
    sy = (ih - sh) * 0.5;
  }

  image(img, x, y, dw, dh, sx, sy, sw, sh);
}

// --------------------------------------------------
// UTILS
// --------------------------------------------------
function makeFallbackGraphic() {
  const g = createGraphics(240, 160);
  g.background(240);
  g.fill(0);
  g.textAlign(CENTER, CENTER);
  g.text("loading…", 120, 80);
  return g;
}

function cubicBezierPoint(a, b, c, d, t) {
  const mt = 1 - t;
  return mt * mt * mt * a
    + 3 * mt * mt * t * b
    + 3 * mt * t * t * c
    + t * t * t * d;
}

// --------------------------------------------------
// EASING
// --------------------------------------------------
function easeInExpo(x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return pow(2, 10 * (x - 1));
}

function easeOutCubic(x) {
  return 1 - pow(1 - x, 3);
}

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - pow(-2 * x + 2, 3) / 2;
}

function easeInOutSine(x) {
  return -(cos(PI * x) - 1) / 2;
}

// --------------------------------------------------
// RESIZE
// --------------------------------------------------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  detectInputMode();

  if (isMobileMode) {
    autoX = constrain(autoX || width * 0.5, width * 0.08, width * 0.92);
    autoY = constrain(autoY || height * 0.5, height * 0.08, height * 0.92);

    pointerX = autoX;
    pointerY = autoY;
    prevPointerX = pointerX;
    prevPointerY = pointerY;

    sx = pointerX;
    sy = pointerY;
    emitX = pointerX;
    emitY = pointerY;

    if (!autoMoveActive) {
      mobilePauseLock = true;
      autoWaitUntil = millis() + 250;
    }
  } else {
    pointerX = mouseX;
    pointerY = mouseY;
    prevPointerX = pointerX;
    prevPointerY = pointerY;
  }
}
