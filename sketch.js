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
  // Muted cool blue-green radial gradient background
  for (let i = 0; i < width; i += 10) {
    for (let j = 0; j < height; j += 10) {
      let d = dist(i, j, width / 2, height / 2);
      let maxDist = dist(0, 0, width / 2, height / 2);
      let ratio = d / maxDist;
      
      // Muted cool blue-green gradient
      let r = lerp(95, 120, ratio);
      let g = lerp(125, 140, ratio);
      let b = lerp(135, 155, ratio);
      
      fill(r, g, b);
      noStroke();
      rect(i, j, 10, 10);
    }
  }

  // Text styling with scientific/digital font
  fill(90, 75, 60); // Dark warm grey
  textAlign(CENTER, CENTER);
  textFont('Courier New, monospace');
  
  textSize(width * 0.08);
  textStyle(BOLD);
  text("satellite", width / 2, height / 2 - height * 0.15);

  textSize(width * 0.025);
  textStyle(NORMAL);
  fill(90, 75, 60);
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

  fill(90, 75, 60);
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