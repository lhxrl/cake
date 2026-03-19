const scene = document.getElementById("scene");
const dogCakeGroup = document.getElementById("dogCakeGroup");
const dogImage = document.getElementById("dogImage");
const cakeStage = document.getElementById("cakeStage");
const photoContainer = document.getElementById("photoContainer");
const burstParticles = document.getElementById("burstParticles");
const decorStars = document.getElementById("decorStars");
const birthdayTitle = document.getElementById("birthdayTitle");
const paperCard = document.getElementById("paperCard");
const typedMessage = document.getElementById("typedMessage");
const paperSignature = document.getElementById("paperSignature");
const video = document.getElementById("webcam");
const canvas = document.getElementById("gestureCanvas");
const ctx = canvas.getContext("2d");

const IMAGE_FILES = [
  // Replace or extend this list with new photos placed in ./images.
  "photo1.jpg",
  "photo2.jpg",
  "photo3.jpg",
  "photo4.jpg",
  "photo5.jpg",
  "photo6.jpg",
  "photo7.jpg",
  "photo8.jpg",
  "photo9.jpg",
  "photo10.jpg",
  "photo11.jpg",
  "photo12.jpg",
  "photo13.jpg",
  "photo14.jpg",
  "photo15.jpg",
  "photo16.jpg",
  "photo17.jpg",
  "photo18.jpg",
];

const MESSAGE_TEXT = "生日快樂\n我的同姓同星座姐妹🎂";
const STAR_IMAGE = "images/star.png";
const GESTURE_FRAMES = 5;
const INTRO_BLANK_DURATION = 250;
const INTRO_DURATION = 5000;
const EXPLOSION_DURATION = 980;
const COLLAPSE_DURATION = 840;
const TYPEWRITER_DELAY = 110;

let state = "intro";
let dogProgress = 0;
let explosionProgress = 0;
let targetExplosionProgress = 0;
let typewriterProgress = 0;
let openPalmFrames = 0;
let fistFrames = 0;
let typingStarted = false;
let typedLength = 0;
let typingElapsed = 0;
let lastFrameTime = performance.now();
let introStartTime = performance.now();
let sceneCurrentX = 0;
let sceneCurrentY = 0;
let sceneTargetX = 0;
let sceneTargetY = 0;

const photoParticles = [];
const burstParticlePool = [];
const decorParticles = [];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function mix(start, end, progress) {
  return start + (end - start) * progress;
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function resizeCanvas() {
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
}

function createDecorativeParticles() {
  decorStars.innerHTML = "";
  decorParticles.length = 0;

  for (let index = 0; index < 22; index += 1) {
    const star = document.createElement("div");
    star.className = "decor-star image-star";
    star.style.setProperty("--size", `${18 + Math.random() * 24}px`);
    const starImage = document.createElement("img");
    starImage.src = STAR_IMAGE;
    starImage.alt = "";
    star.appendChild(starImage);
    decorStars.appendChild(star);
    decorParticles.push({
      element: star,
      kind: "star",
      x: 6 + Math.random() * 88,
      y: 6 + Math.random() * 82,
      driftX: -16 + Math.random() * 32,
      driftY: -14 + Math.random() * 28,
      phase: Math.random() * Math.PI * 2,
      speed: 0.16 + Math.random() * 0.28,
      depth: -220 + Math.random() * 440,
      blur: 0.3 + Math.random() * 1.2,
      scale: 0.55 + Math.random() * 0.65,
      opacity: 0.92 + Math.random() * 0.08,
    });
  }
}

function createPhotoParticles() {
  photoContainer.innerHTML = "";
  photoParticles.length = 0;

  const total = IMAGE_FILES.length;
  const centerX = 0;
  const centerY = 0;
  const placedRects = [];
  const isMobile = window.innerWidth <= 720;
  const photoWidth = isMobile ? 88 : 118;
  const photoHeight = isMobile ? 110 : 148;
  const spreadX = window.innerWidth * 0.45;
  const spreadY = window.innerHeight * 0.35;
  const centerAvoidX = isMobile ? 210 : 290;
  const centerAvoidY = isMobile ? 180 : 240;
  const screenPaddingX = isMobile ? 18 : 28;
  const screenPaddingY = isMobile ? 22 : 30;

  function overlaps(rectA, rectB, gap = 16) {
    return !(
      rectA.right + gap < rectB.left ||
      rectA.left - gap > rectB.right ||
      rectA.bottom + gap < rectB.top ||
      rectA.top - gap > rectB.bottom
    );
  }

  function buildPhotoTarget(index) {
    for (let attempt = 0; attempt < 160; attempt += 1) {
      let x = (Math.random() - 0.5) * spreadX * 2;
      let y = (Math.random() - 0.5) * spreadY * 2;

      y = Math.max(-spreadY, Math.min(spreadY, y));

      if (Math.abs(x) < centerAvoidX && Math.abs(y) < centerAvoidY) {
        x += (x > 0 ? 1 : -1) * centerAvoidX;
        y += (y > 0 ? 1 : -1) * centerAvoidY;
      }

      const minX = -window.innerWidth / 2 + photoWidth / 2 + screenPaddingX;
      const maxX = window.innerWidth / 2 - photoWidth / 2 - screenPaddingX;
      const minY = -window.innerHeight / 2 + photoHeight / 2 + screenPaddingY;
      const maxY = window.innerHeight / 2 - photoHeight / 2 - screenPaddingY;
      x = clamp(x, minX, maxX);
      y = clamp(y, minY, maxY);

      const rect = {
        left: x - photoWidth / 2,
        right: x + photoWidth / 2,
        top: y - photoHeight / 2,
        bottom: y + photoHeight / 2,
      };

      if (placedRects.some((placed) => overlaps(rect, placed, 18))) {
        continue;
      }

      placedRects.push(rect);
      return {
        x,
        y,
        rotation: -14 + Math.random() * 28,
        scale: 0.9 + Math.random() * 0.08,
        depth: -10 + Math.random() * 24,
        delay: Math.min(index * 0.015, 0.12),
      };
    }

    const fallbackAngle = (Math.PI * 2 * index) / total;
    const fallbackX = clamp(
      Math.cos(fallbackAngle) * spreadX * 0.88,
      -window.innerWidth / 2 + photoWidth / 2 + screenPaddingX,
      window.innerWidth / 2 - photoWidth / 2 - screenPaddingX
    );
    const fallbackY = clamp(
      Math.sin(fallbackAngle) * spreadY * 0.82,
      -window.innerHeight / 2 + photoHeight / 2 + screenPaddingY,
      window.innerHeight / 2 - photoHeight / 2 - screenPaddingY
    );
    return {
      x: fallbackX,
      y: fallbackY,
      rotation: -8 + Math.random() * 16,
      scale: 0.92,
      depth: 0,
      delay: Math.min(index * 0.015, 0.12),
    };
  }

  IMAGE_FILES.forEach((fileName, index) => {
    const img = new Image();
    img.src = `images/${fileName}`;
    img.alt = `Birthday memory ${index + 1}`;
    img.loading = "eager";
    img.onerror = () => {
      wrapper.remove();
    };

    const wrapper = document.createElement("figure");
    wrapper.className = "photo-particle";
    wrapper.appendChild(img);
    photoContainer.appendChild(wrapper);

    const target = buildPhotoTarget(index);

    photoParticles.push({
      element: wrapper,
      x: centerX,
      y: centerY,
      targetX: target.x,
      targetY: target.y,
      rotation: target.rotation,
      scale: target.scale,
      depth: target.depth,
      delay: target.delay,
    });
  });
}

function createBurstParticles() {
  burstParticles.innerHTML = "";
  burstParticlePool.length = 0;

  for (let index = 0; index < 18; index += 1) {
    const star = document.createElement("div");
    star.className = "burst-particle star image-star";
    star.style.setProperty("--size", `${14 + Math.random() * 18}px`);
    const starImage = document.createElement("img");
    starImage.src = STAR_IMAGE;
    starImage.alt = "";
    star.appendChild(starImage);
    burstParticles.appendChild(star);
    const angle = (Math.PI * 2 * index) / 18 + (Math.random() - 0.5) * 0.28;
    const radius = 90 + Math.random() * 70;
    burstParticlePool.push({
      element: star,
      kind: "star",
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius * 0.45 - 180,
      scale: 0.65 + Math.random() * 0.55,
      depth: -40 + Math.random() * 220,
      blur: 0.3 + Math.random() * 1.2,
      delay: Math.min(index * 0.016, 0.16),
    });
  }
}

function renderDecor(now) {
  const decorVisible = state === "explosion" ? Math.max(0, explosionProgress) : 0;

  decorParticles.forEach((particle) => {
    const drift = now * 0.001 * particle.speed + particle.phase;
    const offsetX = Math.sin(drift) * particle.driftX + sceneCurrentX * 12;
    const offsetY = Math.cos(drift * 0.92) * particle.driftY + sceneCurrentY * 10;
    const depthScale = 1 + particle.depth / 900;

    particle.element.style.left = `${particle.x}%`;
    particle.element.style.top = `${particle.y}%`;
    particle.element.style.opacity = `${particle.opacity * decorVisible}`;
    particle.element.style.filter = `blur(${particle.blur}px) drop-shadow(0 0 20px rgba(255,232,164,0.6))`;
    particle.element.style.transform =
      `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), ${particle.depth}px) scale(${depthScale * particle.scale})`;
  });
}

function renderIntro(progress) {
  if (progress <= 0) {
    dogCakeGroup.style.opacity = "0";
    return;
  }

  const eased = easeInOutCubic(progress);
  const groupWidth = Math.min(window.innerWidth * 0.78, 600);
  const startX = -window.innerWidth * 0.5 - groupWidth * 1.15;
  const endX = 0;
  const x = mix(startX, endX, eased);
  const bounceProgress = clamp((progress - 0.92) / 0.08, 0, 1);
  const stopScale = bounceProgress > 0
    ? 1 + Math.sin(bounceProgress * Math.PI) * 0.05
    : 1;

  dogCakeGroup.style.opacity = "1";
  dogCakeGroup.style.transform = `translate3d(${x}px, 0, 0) scale(${stopScale})`;
  cakeStage.style.opacity = "1";
}

function renderExplosion(progress) {
  if (state === "intro") {
    return;
  }

  const eased = easeOutCubic(progress);
  const hidden = state === "typewriter" ? 0 : 1;
  const introGroupOpacity = state === "typewriter" ? 1 : 1 - eased;

  dogCakeGroup.style.opacity = `${introGroupOpacity}`;
  dogCakeGroup.style.transform = state === "typewriter"
    ? "translate3d(0, 0, 0) scale(1)"
    : `translate3d(0, 0, 0) scale(${mix(1, 0.92, eased)})`;
  cakeStage.style.opacity = `${introGroupOpacity}`;
  cakeStage.style.transform = "translateX(0)";

  birthdayTitle.style.opacity = `${eased * hidden}`;
  birthdayTitle.style.transform =
    `translate(-50%, -50%) scale(${mix(0.9, 1, eased)})`;

  photoParticles.forEach((particle) => {
    const local = clamp((eased - particle.delay) / (1 - particle.delay), 0, 1);
    const p = easeOutCubic(local);
    particle.element.style.opacity = `${p * hidden}`;
    particle.element.style.transform =
      `translate3d(calc(-50% + ${mix(0, particle.targetX, p)}px), calc(-50% + ${mix(0, particle.targetY, p)}px), ${mix(0, particle.depth, p)}px)` +
      ` rotate(${mix(0, particle.rotation, p)}deg) scale(${mix(0.24, particle.scale, p)})`;
  });

  burstParticlePool.forEach((particle) => {
    const local = clamp((eased - particle.delay) / (1 - particle.delay), 0, 1);
    const p = easeOutCubic(local);
    particle.element.style.opacity = `${p * 0.92 * hidden}`;
    particle.element.style.filter = `blur(${mix(0.2, particle.blur, p)}px)`;
    particle.element.style.transform =
      `translate3d(calc(-50% + ${mix(0, particle.x, p)}px), calc(-50% + ${mix(0, particle.y, p)}px), ${mix(0, particle.depth, p)}px)` +
      ` scale(${mix(0.2, particle.scale, p)})`;
  });
}

function renderTypewriter(progress) {
  const eased = easeOutCubic(progress);
  paperCard.style.opacity = `${eased}`;
  paperCard.style.transform =
    `translateY(${mix(40, 0, eased)}px) scale(${mix(0.96, 1, eased)})`;
}

function isFingerExtended(tip, pip, landmarks) {
  return landmarks[tip].y < landmarks[pip].y - 0.015;
}

function isFingerCurled(tip, pip, landmarks) {
  return landmarks[tip].y > landmarks[pip].y + 0.015;
}

function isThumbExtended(landmarks) {
  return Math.abs(landmarks[4].x - landmarks[2].x) > 0.09;
}

function isThumbCurled(landmarks) {
  return (
    Math.abs(landmarks[4].x - landmarks[5].x) < 0.11 &&
    Math.abs(landmarks[4].y - landmarks[5].y) < 0.12
  );
}

function isOpenPalm(landmarks) {
  return (
    isThumbExtended(landmarks) &&
    isFingerExtended(8, 6, landmarks) &&
    isFingerExtended(12, 10, landmarks) &&
    isFingerExtended(16, 14, landmarks) &&
    isFingerExtended(20, 18, landmarks)
  );
}

function isClosedFist(landmarks) {
  return (
    isThumbCurled(landmarks) &&
    isFingerCurled(8, 6, landmarks) &&
    isFingerCurled(12, 10, landmarks) &&
    isFingerCurled(16, 14, landmarks) &&
    isFingerCurled(20, 18, landmarks)
  );
}

function updateSceneFromHand(landmarks) {
  const palm = landmarks[0];
  sceneTargetX = clamp((0.5 - palm.x) * 1.2, -1, 1);
  sceneTargetY = clamp((0.5 - palm.y) * 1.1, -1, 1);
}

function startTypewriterIfNeeded() {
  if (typingStarted) {
    return;
  }

  typingStarted = true;
  typedLength = 0;
  typingElapsed = 0;
  typedMessage.textContent = "";
}

function resetTypewriter() {
  typingStarted = false;
  typedLength = 0;
  typingElapsed = 0;
  typewriterProgress = 0;
  typedMessage.textContent = "";
  if (paperSignature) {
    paperSignature.classList.remove("visible");
  }
}

function enterExplosionState() {
  createPhotoParticles();
  state = "explosion";
  targetExplosionProgress = 1;
  resetTypewriter();
}

function enterTypewriterState() {
  state = "typewriter";
  targetExplosionProgress = 0;
  resetTypewriter();
  startTypewriterIfNeeded();
}

async function initCamera() {
  if (!window.Hands || !window.Camera) {
    return;
  }

  const hands = new window.Hands({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0,
    minDetectionConfidence: 0.58,
    minTrackingConfidence: 0.5,
  });

  hands.onResults((results) => {
    resizeCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks?.length) {
      const landmarks = results.multiHandLandmarks[0];
      updateSceneFromHand(landmarks);

      if (state === "intro") {
        if (isOpenPalm(landmarks)) {
          openPalmFrames += 1;
          fistFrames = 0;
          if (openPalmFrames >= GESTURE_FRAMES) {
            enterExplosionState();
          }
        } else {
          openPalmFrames = 0;
        }
      } else if (state === "typewriter") {
        if (isOpenPalm(landmarks)) {
          openPalmFrames += 1;
          fistFrames = 0;
          if (openPalmFrames >= GESTURE_FRAMES) {
            enterExplosionState();
          }
        } else {
          openPalmFrames = 0;
        }
      } else if (state === "explosion") {
        if (isClosedFist(landmarks)) {
          fistFrames += 1;
          openPalmFrames = 0;
          if (fistFrames >= GESTURE_FRAMES) {
            enterTypewriterState();
          }
        } else {
          fistFrames = 0;
        }
      }
    } else {
      sceneTargetX = 0;
      sceneTargetY = 0;
      openPalmFrames = 0;
      fistFrames = 0;
    }
  });

  const camera = new window.Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480,
  });

  try {
    await camera.start();
  } catch (error) {
    return;
  }
}

function updateTypewriter(delta) {
  if (!typingStarted) {
    return;
  }

  typingElapsed += delta;
  while (typingElapsed >= TYPEWRITER_DELAY && typedLength < MESSAGE_TEXT.length) {
    typingElapsed -= TYPEWRITER_DELAY;
    typedLength += 1;
    typedMessage.textContent = MESSAGE_TEXT.slice(0, typedLength);
  }

  if (typedLength >= MESSAGE_TEXT.length) {
    paperSignature.classList.add("visible");
  }
}

function tick(now) {
  const delta = now - lastFrameTime;
  lastFrameTime = now;

  sceneCurrentX += (sceneTargetX - sceneCurrentX) * 0.08;
  sceneCurrentY += (sceneTargetY - sceneCurrentY) * 0.08;

  scene.style.transform =
    `rotateX(${sceneCurrentY * -2.4}deg) rotateY(${sceneCurrentX * 3}deg)`;

  const introActiveTime = Math.max(0, now - introStartTime - INTRO_BLANK_DURATION);
  dogProgress = clamp(introActiveTime / INTRO_DURATION, 0, 1);
  if (state === "intro") {
    renderIntro(dogProgress);
  }

  if (targetExplosionProgress > explosionProgress) {
    explosionProgress = Math.min(1, explosionProgress + delta / EXPLOSION_DURATION);
  } else if (targetExplosionProgress < explosionProgress) {
    explosionProgress = Math.max(0, explosionProgress - delta / COLLAPSE_DURATION);
  }

  if (state !== "intro" || explosionProgress > 0) {
    renderExplosion(explosionProgress);
  }

  if (state === "typewriter") {
    typewriterProgress = Math.min(1, typewriterProgress + delta / 800);
    updateTypewriter(delta);
  } else {
    typewriterProgress = 0;
  }
  renderTypewriter(typewriterProgress);

  renderDecor(now);
  window.requestAnimationFrame(tick);
}

async function init() {
  createDecorativeParticles();
  createPhotoParticles();
  createBurstParticles();
  paperSignature.classList.remove("visible");
  window.addEventListener("resize", () => {
    createPhotoParticles();
  });
  await initCamera();
  introStartTime = performance.now();
  lastFrameTime = performance.now();
  window.requestAnimationFrame(tick);
}

init();
