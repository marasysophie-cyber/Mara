let layers = [];
let t = 0;
let started = false;

let smoothMouseX = 300;
let smoothMouseY = 300;

let scattered = false;
let scatterProgress = 0;

// Color phase for rainbow background
let colorPhase = 0;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  pixelDensity(1);
  noStroke();

  // Start at blue tone (around 200-240 on the hue scale)
  colorPhase = -0.45;

  layers = [
    {
      thresholdVal: 0.65,
      alpha: 60,
      step: 4,
      noiseScale: 0.004,
      vx: 0.003,
      vy: 0.001,
      offset: random(1000),
      repulseX: 0,
      repulseY: 0,
      repulseStrength: 0.012,
      decay: 0.985,

      scatterDX: 2.5,
      scatterDY: -1.0,
    },
    {
      thresholdVal: 0.6,
      alpha: 100,
      step: 3,
      noiseScale: 0.005,
      vx: -0.002,
      vy: 0.002,
      offset: random(1000),
      repulseX: 0,
      repulseY: 0,
      repulseStrength: 0.009,
      decay: 0.99,
      scatterDX: -2.0,
      scatterDY: -1.5,
    },
    {
      thresholdVal: 0.55,
      alpha: 160,
      step: 2,
      noiseScale: 0.006,
      vx: 0.001,
      vy: -0.003,
      offset: random(1000),
      repulseX: 0,
      repulseY: 0,
      repulseStrength: 0.007,
      decay: 0.995,
      scatterDX: 0.5,
      scatterDY: 2.5,
    },
  ];

  // Create audio element for ambient music
  createAudioElement();
}

function createAudioElement() {
  let audio = document.getElementById('ambientAudio');
  if (!audio) {
    audio = document.createElement('audio');
    audio.id = 'ambientAudio';
    audio.loop = true;
    audio.volume = 0.5;
    audio.src = 'softclouds.mp3';
    document.body.appendChild(audio);
  }
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

function draw() {
  if (!started) {
    drawFrontPage();
  } else {
    drawSketch();
  }
}

function drawFrontPage() {
  // Starting blue background (same as artwork)
  background(100, 140, 180);
  
  // Soft radial gradient of green (complementary to blue) blending into blue
  colorMode(HSB, 360, 100, 100);
  let complementaryHue = 60; // Green - complementary to blue
  colorMode(RGB);
  
  let maxRadius = dist(0, 0, width, height) / 2;
  for (let i = 0; i < maxRadius; i += 5) {
    let ratio = i / maxRadius;
    
    // Interpolate from green center to blue edges
    colorMode(HSB, 360, 100, 100);
    let h = lerp(complementaryHue, 220, ratio);
    let s = lerp(50, 30, ratio);
    let b = lerp(70, 85, ratio);
    fill(h, s, b);
    colorMode(RGB);
    
    noStroke();
    ellipse(width / 2, height / 2, i * 2, i * 2);
  }

  // Text styling with scientific/digital font
  fill(0, 0, 0); // Black
  textAlign(CENTER, CENTER);
  textFont('Courier New, monospace');
  
  textSize(width * 0.08);
  textStyle(BOLD);
  text("satellite", width / 2, height / 2 - height * 0.15);

  textSize(width * 0.025);
  textStyle(NORMAL);
  fill(0, 0, 0); // Black
  text("by Mara Sophie List", width / 2, height / 2 - height * 0.05);

  let bx = width / 2;
  let by = height / 2 + height * 0.12;
  let bw = width * 0.15;
  let bh = height * 0.08;

  let hovering =
    mouseX > bx - bw / 2 &&
    mouseX < bx + bw / 2 &&
    mouseY > by - bh / 2 &&
    mouseY < by + bh / 2;

  // Translucent grey button
  if (hovering) {
    fill(130, 120, 110, 200);
    cursor(HAND);
  } else {
    fill(130, 120, 110, 150);
    cursor(ARROW);
  }

  rectMode(CENTER);
  rect(bx, by, bw, bh, 8);

  fill(0, 0, 0); // Black
  textSize(width * 0.03);
  textStyle(BOLD);
  text("observar", bx, by);
  rectMode(CORNER);
}

function drawSketch() {
  // Slowly cycle through rainbow colors (slightly faster)
  colorPhase += 0.00055;
  let hueValue = (colorPhase % 1.0) * 360;
  if (hueValue < 0) hueValue += 360;
  
  colorMode(HSB, 360, 100, 100);
  background(hueValue, 30, 85);
  colorMode(RGB);

  t += 0.5;

  if (scattered) {
    scatterProgress = min(1.0, scatterProgress + 0.003);

    if (scatterProgress >= 1.0) {
      scattered = false; 
    }
  } else if (scatterProgress > 0) {
    scatterProgress = max(0.0, scatterProgress - 0.0008);
  }

  let eased =
    scatterProgress < 0.5
      ? 2 * scatterProgress * scatterProgress
      : 1 - pow(-2 * scatterProgress + 2, 2) / 2;

  let scatterScale = 600;
  let lerpAmt = 0.015;
  let prevSX = smoothMouseX;
  let prevSY = smoothMouseY;
  smoothMouseX = lerp(smoothMouseX, mouseX, lerpAmt);
  smoothMouseY = lerp(smoothMouseY, mouseY, lerpAmt);

  let cursorDX = smoothMouseX - prevSX;
  let cursorDY = smoothMouseY - prevSY;

  for (let l = 0; l < layers.length; l++) {
    let layer = layers[l];

    let dxInfluence = l === 1 ? -1 : 1;
    let dyInfluence = l === 2 ? -1 : 1;

    layer.repulseX =
      layer.repulseX * layer.decay -
      cursorDX * layer.repulseStrength * dxInfluence;
    layer.repulseY =
      layer.repulseY * layer.decay -
      cursorDY * layer.repulseStrength * dyInfluence;

    let sOffX = layer.scatterDX * eased * scatterScale * layer.noiseScale;
    let sOffY = layer.scatterDY * eased * scatterScale * layer.noiseScale;

    fill(0, layer.alpha);

    for (let x = 0; x < width; x += layer.step) {
      for (let y = 0; y < height; y += layer.step) {
        let n = noise(
          x * layer.noiseScale + t * layer.vx + layer.repulseX + sOffX,
          y * layer.noiseScale +
            t * layer.vy +
            layer.offset +
            layer.repulseY +
            sOffY
        );

        if (n > layer.thresholdVal) {
          rect(x, y, layer.step + 1, layer.step + 1);
        }
      }
    }
  }
}

function mousePressed() {
  if (!started) {
    let bx = width / 2;
    let by = height / 2 + height * 0.12;
    let bw = width * 0.15;
    let bh = height * 0.08;

    if (
      mouseX > bx - bw / 2 &&
      mouseX < bx + bw / 2 &&
      mouseY > by - bh / 2 &&
      mouseY < by + bh / 2
    ) {
      started = true;
      cursor(ARROW);
      
      // Play ambient music when entering sketch
      let audio = document.getElementById('ambientAudio');
      if (audio) {
        audio.play();
      }
    }
  } else {
    if (scatterProgress < 0.1) {
      scattered = true;
    }
  }
}