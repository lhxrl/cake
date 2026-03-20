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
  "photo19.jpg",
  "photo20.jpg",
  "photo21.jpg",
];

const MESSAGE_TEXT = "生日快樂\n我的同姓同星座姐妹🎂";
const STAR_IMAGE = "images/star.png";
const SONG_FILE = "song.mp3";
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
const songAudio = new Audio(SONG_FILE);
songAudio.preload = "auto";
songAudio.loop = false;
songAudio.playsInline = true;

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

function shuffleArray(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

function createDecorativeParticles() {
  decorStars.innerHTML = "";
  decorParticles.length = 0;
}

function createPhotoParticles() {
  photoContainer.innerHTML = "";
  photoParticles.length = 0;

  const total = IMAGE_FILES.length;
  const centerX = 0;
  const centerY = 0;
  const isMobile = window.innerWidth <= 720;
  const photoWidth = isMobile ? 88 : 118;
  const photoHeight = isMobile ? 110 : 148;
  const screenPaddingX = isMobile ? 16 : 28;
  const screenPaddingY = isMobile ? 18 : 30;

  function distributeLine(count, start, end) {
    if (count <= 0) {
      return [];
    }

    if (count === 1) {
      return [(start + end) / 2];
    }

    const values = [];
    const step = (end - start) / (count - 1);
    for (let index = 0; index < count; index += 1) {
      values.push(start + step * index);
    }
    return values;
  }

  function buildPhotoTargets() {
    const minX = -window.innerWidth / 2 + photoWidth / 2 + screenPaddingX;
    const maxX = window.innerWidth / 2 - photoWidth / 2 - screenPaddingX;
    const minY = -window.innerHeight / 2 + photoHeight / 2 + screenPaddingY;
    const maxY = window.innerHeight / 2 - photoHeight / 2 - screenPaddingY;
    const liftY = isMobile ? 62 : 94;
    const edgeInsetX = isMobile ? 10 : 16;
    const edgeInsetY = isMobile ? 8 : 14;
    const reservedTop = isMobile ? 118 : 132;
    const topCount = Math.max(5, Math.ceil(total * 0.34));
    const bottomCount = Math.max(5, Math.ceil(total * 0.34));
    const sideCount = Math.max(0, total - topCount - bottomCount);
    const leftCount = Math.ceil(sideCount / 2);
    const rightCount = sideCount - leftCount;
    const baseScale = total >= 21 ? (isMobile ? 0.86 : 0.9) : 0.94;
    const targets = [];

    distributeLine(
      topCount,
      minX + photoWidth * 0.18,
      maxX - photoWidth * 0.18
    ).forEach((x, index) => {
      const jitterX = (Math.random() - 0.5) * (isMobile ? 16 : 26);
      const jitterY = (Math.random() - 0.5) * (isMobile ? 8 : 14);
      targets.push({
        x: clamp(x + jitterX, minX, maxX),
        y: clamp(
          minY + reservedTop + edgeInsetY + (index % 2) * (isMobile ? 6 : 10) + jitterY - liftY,
          minY,
          maxY
        ),
        rotation: -15 + Math.random() * 22,
        scale: baseScale + Math.random() * 0.04,
        depth: -8 + Math.random() * 28,
      });
    });

    distributeLine(
      bottomCount,
      minX + photoWidth * 0.18,
      maxX - photoWidth * 0.18
    ).forEach((x, index) => {
      const jitterX = (Math.random() - 0.5) * (isMobile ? 18 : 28);
      const jitterY = (Math.random() - 0.5) * (isMobile ? 10 : 16);
      targets.push({
        x: clamp(x + jitterX, minX, maxX),
        y: clamp(
          maxY - edgeInsetY - (index % 2) * (isMobile ? 8 : 12) + jitterY - liftY,
          minY,
          maxY
        ),
        rotation: -15 + Math.random() * 22,
        scale: baseScale + Math.random() * 0.04,
        depth: -8 + Math.random() * 28,
      });
    });

    distributeLine(
      leftCount,
      minY + reservedTop + photoHeight * 1.05 - liftY,
      maxY - photoHeight * 1.05 - liftY
    ).forEach((y, index) => {
      const jitterX = (Math.random() - 0.5) * (isMobile ? 10 : 18);
      const jitterY = (Math.random() - 0.5) * (isMobile ? 18 : 28);
      targets.push({
        x: clamp(
          minX + edgeInsetX + (index % 2) * (isMobile ? 10 : 14) + jitterX,
          minX,
          maxX
        ),
        y: clamp(y + jitterY, minY, maxY),
        rotation: -16 + Math.random() * 14,
        scale: baseScale + Math.random() * 0.03,
        depth: -8 + Math.random() * 28,
      });
    });

    distributeLine(
      rightCount,
      minY + reservedTop + photoHeight * 1.05 - liftY,
      maxY - photoHeight * 1.05 - liftY
    ).forEach((y, index) => {
      const jitterX = (Math.random() - 0.5) * (isMobile ? 10 : 18);
      const jitterY = (Math.random() - 0.5) * (isMobile ? 18 : 28);
      targets.push({
        x: clamp(
          maxX - edgeInsetX - (index % 2) * (isMobile ? 10 : 14) + jitterX,
          minX,
          maxX
        ),
        y: clamp(y + jitterY, minY, maxY),
        rotation: 2 + Math.random() * 16,
        scale: baseScale + Math.random() * 0.03,
        depth: -8 + Math.random() * 28,
      });
    });

    shuffleArray(targets);

    return targets.slice(0, total).map((target, index) => ({
      ...target,
      delay: Math.min(index * 0.012, 0.16),
    }));
  }

  const photoTargets = buildPhotoTargets();

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

    const target = photoTargets[index];

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
  const starCount = Math.max(24, photoParticles.length);

  for (let index = 0; index < starCount; index += 1) {
    const star = document.createElement("div");
    star.className = "burst-particle star image-star";
    star.style.setProperty("--size", `${24 + Math.random() * 24}px`);
    const starImage = document.createElement("img");
    starImage.src = STAR_IMAGE;
    starImage.alt = "";
    star.appendChild(starImage);
    burstParticles.appendChild(star);
    const anchor = photoParticles[index % Math.max(1, photoParticles.length)];
    const anchorX = anchor ? anchor.targetX : 0;
    const anchorY = anchor ? anchor.targetY : 0;
    const jitterX = (Math.random() - 0.5) * 54;
    const jitterY = (Math.random() - 0.5) * 54;
    burstParticlePool.push({
      element: star,
      kind: "star",
      x: anchorX + jitterX,
      y: anchorY + jitterY,
      scale: 0.8 + Math.random() * 0.8,
      depth: -50 + Math.random() * 240,
      blur: 0.2 + Math.random() * 0.9,
      delay: Math.random() * 0.14,
    });
  }
}

function renderDecor(now) {
  const hiddenOpacity = now ? "0" : "0";
  decorStars.style.opacity = hiddenOpacity;
}

async function unlockAudioContext() {
  try {
    songAudio.muted = true;
    await songAudio.play();
    songAudio.pause();
    songAudio.currentTime = 0;
    songAudio.muted = false;
  } catch (error) {
    return;
  }
}

function stopBirthdaySong() {
  songAudio.pause();
  songAudio.currentTime = 0;
}

async function playBirthdaySong() {
  stopBirthdaySong();
  songAudio.currentTime = 0;
  songAudio.volume = 0.9;
  try {
    await songAudio.play();
  } catch (error) {
    return;
  }
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
  createBurstParticles();
  state = "explosion";
  targetExplosionProgress = 1;
  resetTypewriter();
  playBirthdaySong();
}

function enterTypewriterState() {
  state = "typewriter";
  targetExplosionProgress = 0;
  resetTypewriter();
  startTypewriterIfNeeded();
  stopBirthdaySong();
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
    createDecorativeParticles();
    createPhotoParticles();
  });
  await initCamera();
  introStartTime = performance.now();
  lastFrameTime = performance.now();
  window.requestAnimationFrame(tick);
}

init();
