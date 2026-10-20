(() => {
  const flowerField = document.getElementById("garden-flowers");
  const plantField = document.getElementById("garden-plants");
  const lightField = document.getElementById("fairy-lights");
  const starsField = document.getElementById("stars");
  const fireflyField = document.getElementById("fireflies");
  const petalsField = document.getElementById("falling-petals");
  const touchEffects = document.getElementById("touch-effects");
  const heartIntro = document.getElementById("heart-intro");
  const gardenPortrait = document.getElementById("garden-portrait");
  const wishButton = document.getElementById("wish-button");
  const wishMessage = document.getElementById("wish-message");
  const musicButton = document.getElementById("music-button");
  const musicPlayer = document.getElementById("garden-music");
  const musicStatus = document.getElementById("music-status");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  musicPlayer.volume = 0.22;
  const openingStartedAt = performance.now();
  let pausedByUser = false;
  let openingComplete = false;

  const flowers = [
    { x: 5, base: 9, stem: 118, bloom: 34, lean: -10, z: 2 },
    { x: 13, base: 12, stem: 170, bloom: 42, lean: 7, z: 1 },
    { x: 20, base: 7, stem: 104, bloom: 29, lean: -8, z: 3 },
    { x: 28, base: 10, stem: 147, bloom: 37, lean: 10, z: 2 },
    { x: 36, base: 6, stem: 128, bloom: 31, lean: -5, z: 4 },
    { x: 44, base: 11, stem: 202, bloom: 48, lean: 5, z: 1 },
    { x: 51, base: 7, stem: 164, bloom: 39, lean: -7, z: 3 },
    { x: 58, base: 12, stem: 190, bloom: 44, lean: 8, z: 2 },
    { x: 65, base: 6, stem: 132, bloom: 33, lean: -8, z: 4 },
    { x: 72, base: 10, stem: 172, bloom: 41, lean: 6, z: 2 },
    { x: 80, base: 7, stem: 126, bloom: 32, lean: -10, z: 3 },
    { x: 88, base: 12, stem: 158, bloom: 39, lean: 8, z: 1 },
    { x: 96, base: 8, stem: 112, bloom: 30, lean: -7, z: 3 },
    { x: 9, base: 4, stem: 78, bloom: 25, lean: -13, z: 5 },
    { x: 25, base: 3, stem: 87, bloom: 26, lean: 11, z: 5 },
    { x: 40, base: 2, stem: 72, bloom: 23, lean: -10, z: 6 },
    { x: 61, base: 3, stem: 83, bloom: 25, lean: 12, z: 5 },
    { x: 77, base: 2, stem: 76, bloom: 23, lean: -12, z: 6 },
    { x: 92, base: 4, stem: 85, bloom: 26, lean: 10, z: 5 }
  ];

  const random = (min, max) => Math.random() * (max - min) + min;
  const heartContour = [
    [50, 97], [43, 91], [35, 85], [27, 79], [19, 72], [12, 64],
    [6, 55], [2, 46], [0, 37], [1, 28], [4, 20], [10, 12],
    [18, 6], [27, 2], [35, 1], [43, 3], [48, 8], [50, 16],
    [53, 8], [58, 3], [66, 1], [75, 2], [84, 6], [91, 12],
    [97, 20], [100, 28], [100, 37], [98, 46], [94, 55], [88, 64],
    [81, 72], [73, 79], [65, 85], [57, 91]
  ];
  const portraitColumns = 31;
  const portraitRows = 30;
  const isInsideHeart = (x, y) => {
    let inside = false;
    for (let i = 0, j = heartContour.length - 1; i < heartContour.length; j = i, i += 1) {
      const [xi, yi] = heartContour[i];
      const [xj, yj] = heartContour[j];
      const crosses = (yi > y) !== (yj > y)
        && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (crosses) inside = !inside;
    }
    return inside;
  };
  const portraitShape = Array.from({ length: portraitRows }, (_, row) =>
    Array.from({ length: portraitColumns }, (_, column) =>
      isInsideHeart(
        ((column + 0.5) / portraitColumns) * 100,
        ((row + 0.5) / portraitRows) * 100
      ) ? "1" : "0"
    ).join("")
  );
  const makeElement = (className, parent, styles = {}) => {
    const element = document.createElement("span");
    element.className = className;
    for (const [property, value] of Object.entries(styles)) {
      element.style.setProperty(property, value);
    }
    parent.append(element);
    return element;
  };

  function createPortraitMosaic() {
    const rows = portraitRows;
    const columns = portraitColumns;
    gardenPortrait.style.setProperty("--portrait-columns", columns);
    gardenPortrait.style.setProperty("--portrait-rows", rows);
    gardenPortrait.style.setProperty("--portrait-image-size", `${columns * 100}% ${rows * 100}%`);
    gardenPortrait.style.setProperty(
      "--portrait-contour",
      `polygon(${heartContour.map(([x, y]) => `${x}% ${y}%`).join(", ")})`
    );
    let imageReady = false;
    let tilesReady = 0;
    let totalTiles = 0;
    let outline;
    const revealOutlineWhenReady = () => {
      if (imageReady && tilesReady === totalTiles) {
        outline.classList.add("is-visible");
      }
    };
    const image = new Image();
    image.onload = () => {
      gardenPortrait.classList.add("has-photo");
      gardenPortrait.style.setProperty("--portrait-image", `url("${image.src}")`);
      imageReady = true;
      revealOutlineWhenReady();
    };
    image.onerror = () => {
      gardenPortrait.classList.add("is-placeholder");
      imageReady = true;
      revealOutlineWhenReady();
    };
    image.src = "images/image.jpg";

    const tileLayer = document.createElement("div");
    tileLayer.className = "portrait-tiles";
    gardenPortrait.append(tileLayer);
    let tileIndex = 0;
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        if (portraitShape[row][column] !== "1") continue;
        const tile = makeElement("portrait-tile", tileLayer, {
          "--tile-x": `${(column / (columns - 1)) * 100}%`,
          "--tile-y": `${(row / (rows - 1)) * 100}%`,
          "--tile-delay": `${tileIndex * 2}ms`,
          "--scatter-x": `${random(-70, 70)}px`,
          "--scatter-y": `${random(-70, 70)}px`
        });
        tile.style.gridColumn = String(column + 1);
        tile.style.gridRow = String(row + 1);
        tile.addEventListener("animationend", (event) => {
          if (event.animationName !== "portrait-tile-in") return;
          tilesReady += 1;
          revealOutlineWhenReady();
        }, { once: true });
        tileIndex += 1;
      }
    }
    totalTiles = tileIndex;

    outline = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    outline.classList.add("portrait-outline");
    outline.setAttribute("viewBox", "0 0 100 100");
    outline.setAttribute("preserveAspectRatio", "none");
    outline.setAttribute("aria-hidden", "true");
    const contourPath = `M${heartContour.map(([x, y]) => `${x} ${y}`).join(" L")} Z`;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", contourPath);
    outline.append(path);
    const traveler = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    traveler.classList.add("portrait-outline__traveler");
    traveler.setAttribute("r", "1.8");
    const orbit = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
    orbit.setAttribute("dur", "7s");
    orbit.setAttribute("repeatCount", "indefinite");
    orbit.setAttribute("rotate", "auto");
    orbit.setAttribute("path", contourPath);
    traveler.append(orbit);
    outline.append(traveler);
    gardenPortrait.append(outline);
  }

  function createHeartIntro() {
    if (reducedMotion.matches) return;
    const particleCount = window.innerWidth < 600 ? 18 : 28;
    for (let i = 0; i < particleCount; i += 1) {
      const angle = (Math.PI * 2 * i) / particleCount + random(-0.12, 0.12);
      const distance = random(75, Math.min(window.innerWidth * 0.42, 220));
      const heart = makeElement("heart-intro__particle", heartIntro, {
        "--heart-x": `${Math.cos(angle) * distance}px`,
        "--heart-y": `${Math.sin(angle) * distance}px`,
        "--heart-delay": `${random(0, 180)}ms`,
        "--heart-size": `${random(11, 23)}px`,
        "--heart-rotation": `${random(-30, 30)}deg`
      });
      heart.textContent = i % 4 === 0 ? "♡" : "♥";
    }

  }

  function createFlower(flower, index) {
    const bloomSize = `clamp(${Math.round(flower.bloom * 0.72)}px, ${flower.bloom * 0.13}vw, ${Math.round(flower.bloom * 1.38)}px)`;
    const stemSize = `clamp(${Math.round(flower.stem * 0.65)}px, ${flower.stem * 0.125}vh, ${Math.round(flower.stem * 1.1)}px)`;
    const plant = makeElement("flower", flowerField, {
      "--x": `clamp(13%, ${flower.x}%, 87%)`,
      "--base": `${flower.base}%`,
      "--stem": stemSize,
      "--bloom": bloomSize,
      "--lean": `${flower.lean}deg`,
      "--lean-angle": `${flower.lean}deg`,
      "--sway": `${random(4.8, 7.8)}s`,
      "--bloom-speed": `${random(3.5, 5.8)}s`,
      "--delay": `${random(-5, 0)}s`,
      "--pulse": `${random(3.3, 5.5)}s`
    });
    plant.style.zIndex = String(flower.z);
    const flowerColors = [
      ["#fff1f8", "#ffc1df", "#db347f"],
      ["#fff0e8", "#ffc39d", "#e66d98"],
      ["#f7eaff", "#d9a9ff", "#9a65c7"],
      ["#fff4fa", "#ff9fce", "#c72e78"]
    ];
    const colors = flowerColors[index % flowerColors.length];
    plant.style.setProperty("--flower-light", colors[0]);
    plant.style.setProperty("--flower-mid", colors[1]);
    plant.style.setProperty("--flower-deep", colors[2]);

    const stem = document.createElement("span");
    stem.className = "flower__stem";
    plant.append(stem);

    const bloom = document.createElement("span");
    bloom.className = "flower__bloom";
    plant.append(bloom);
    const petalCount = 6 + (index % 3);
    for (let petal = 0; petal < petalCount; petal += 1) {
      makeElement("flower__petal", bloom, {
        "--angle": `${(360 / petalCount) * petal}deg`,
        "--petal-delay": `${random(-3, 0)}s`
      });
    }
    makeElement("flower__center", bloom);
  }

  function createGarden() {
    flowers.forEach(createFlower);

    for (let i = 0; i < 22; i += 1) {
      makeElement("plant", plantField, {
        "--x": `${random(0, 100)}%`,
        "--base": `${random(0, 12)}%`,
        "--height": `${random(24, 85)}px`,
        "--leaf-width": `${random(9, 22)}px`,
        "--lean": `${random(-25, 25)}deg`,
        "--sway": `${random(3.5, 6.5)}s`,
        "--delay": `${random(-5, 0)}s`
      }).style.zIndex = String(Math.round(random(1, 5)));
    }

    const bulbCount = window.innerWidth < 600 ? 24 : 42;
    for (let i = 0; i < bulbCount; i += 1) {
      makeElement("fairy-bulb", lightField, {
        "--x": `${5 + (i / bulbCount) * 90}%`,
        "--y": `${random(32, 84)}%`,
        "--bulb-color": i % 3 === 0 ? "#ffd895" : i % 3 === 1 ? "#fff8fc" : "#ff9fce",
        "--duration": `${random(1.6, 3.8)}s`,
        "--delay": `${random(-4, 0)}s`
      });
    }

    const detailCount = window.innerWidth < 600 ? 13 : 24;
    for (let i = 0; i < detailCount; i += 1) {
      makeElement("star", starsField, {
        "--x": `${random(4, 96)}%`,
        "--y": `${random(18, 76)}%`,
        "--size": `${random(1.5, 3.5)}px`,
        "--duration": `${random(2.5, 5.5)}s`,
        "--delay": `${random(-5, 0)}s`
      });
    }

    const fireflyCount = window.innerWidth < 600 ? 5 : 9;
    for (let i = 0; i < fireflyCount; i += 1) {
      makeElement("firefly", fireflyField, {
        "--x": `${random(8, 92)}%`,
        "--y": `${random(36, 82)}%`,
        "--duration": `${random(5, 10)}s`,
        "--delay": `${random(-8, 0)}s`
      });
    }

    const petalCount = window.innerWidth < 600 ? 4 : 7;
    for (let i = 0; i < petalCount; i += 1) {
      makeElement("falling-petal", petalsField, {
        "--x": `${random(7, 93)}%`,
        "--duration": `${random(13, 21)}s`,
        "--delay": `${random(-18, 0)}s`
      });
    }
  }

  function createSparkles(x, y, amount = 12) {
    if (reducedMotion.matches) return;
    for (let i = 0; i < amount; i += 1) {
      const angle = (Math.PI * 2 * i) / amount;
      const distance = random(24, 72);
      const sparkle = makeElement("sparkle-burst", touchEffects, {
        "--x": `${x}px`,
        "--y": `${y}px`,
        "--dx": `${Math.cos(angle) * distance}px`,
        "--dy": `${Math.sin(angle) * distance}px`,
        "--size": `${random(9, 17)}px`
      });
      sparkle.textContent = i % 3 === 0 ? "♡" : "✦";
      sparkle.addEventListener("animationend", () => sparkle.remove(), { once: true });
    }
  }

  wishButton.addEventListener("click", () => {
    wishMessage.textContent = "Mong mọi điều dịu dàng nhất sẽ luôn ở bên bạn ♡";
    wishMessage.classList.add("is-visible");
    createSparkles(window.innerWidth / 2, window.innerHeight * 0.78, 18);
    window.setTimeout(() => wishMessage.classList.remove("is-visible"), 4200);
  });

  async function playMusic() {
    try {
      await musicPlayer.play();
      musicButton.classList.add("is-playing");
      musicButton.classList.remove("is-muted");
      musicButton.classList.remove("needs-tap");
      musicButton.setAttribute("aria-label", "Tắt nhạc");
      musicStatus.textContent = "Đang phát nhạc.";
      return true;
    } catch (error) {
      musicButton.classList.remove("is-playing");
      musicButton.classList.add("is-muted");
      if (error.name === "NotAllowedError") {
        musicButton.classList.add("needs-tap");
        musicButton.setAttribute("aria-label", "Bật nhạc — trình duyệt chặn tự phát");
        musicStatus.textContent = "Trình duyệt chặn tự phát. Chạm nút Nhạc để bật “Heartwarming”.";
        return false;
      }

      musicStatus.textContent = "Không thể phát nhạc. Hãy kiểm tra tệp assets/heartwarming.mp3.";
      console.error("Không thể phát nhạc nền.", error);
      return false;
    }
  }

  musicButton.addEventListener("click", () => {
    if (!musicPlayer.paused) {
      musicPlayer.pause();
      musicButton.classList.remove("is-playing");
      musicButton.classList.add("is-muted");
      musicButton.setAttribute("aria-label", "Bật nhạc");
      musicButton.classList.remove("needs-tap");
      pausedByUser = true;
      musicStatus.textContent = "Đã tạm dừng nhạc.";
      return;
    }

    pausedByUser = false;
    playMusic();
  });

  document.addEventListener("pointerdown", (event) => {
    if (event.target.closest("#music-button")) return;
    createSparkles(event.clientX, event.clientY, 9);
    if (openingComplete && musicPlayer.paused && !pausedByUser) playMusic();
  }, { passive: true });

  musicPlayer.addEventListener("error", () => {
    musicStatus.textContent = "Không tìm thấy nhạc nền. Kiểm tra assets/heartwarming.mp3.";
    musicButton.classList.remove("is-playing");
    musicButton.classList.add("is-muted");
    musicButton.setAttribute("aria-label", "Bật nhạc");
  });

  createPortraitMosaic();
  createGarden();
  createHeartIntro();
  musicButton.disabled = true;

  function finishOpening() {
    const minimumDuration = reducedMotion.matches ? 600 : 4600;
    const remaining = Math.max(0, minimumDuration - (performance.now() - openingStartedAt));
    window.setTimeout(() => {
      document.body.classList.remove("not-loaded");
      heartIntro.remove();
      openingComplete = true;
      musicButton.disabled = false;
      playMusic();
    }, remaining);
  }

  finishOpening();
})();
