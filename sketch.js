let layers = [];
let t = 0;
let started = false;

let smoothMouseX = 300;
let smoothMouseY = 300;

let scattered = false;
let scatterProgress = 0;

function setup() {
  createCanvas(600, 600);
  pixelDensity(1);
  noStroke();

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
}

function draw() {
  if (!started) {
    drawFrontPage();
  } else {
    drawSketch();
  }
}

function drawFrontPage() {
  background(100, 120, 130);

  fill(255, 255, 255, 20);
  noStroke();
  drawStaticCloud(120, 150, 1.2);
  drawStaticCloud(400, 100, 0.9);
  drawStaticCloud(420, 200, 3.0);

  fill(200, 240, 240);
  textAlign(CENTER, CENTER);
  textSize(42);
  textStyle(BOLD);
  text("satellite", width / 2, height / 2 - 80);

  textSize(16);
  textStyle(NORMAL);
  fill(200, 240, 240);
  text("by Mara Sophie List", width / 2, height / 2 - 35);

  let bx = width / 2;
  let by = height / 2 + 60;
  let bw = 160;
  let bh = 50;

  let hovering =
    mouseX > bx - bw / 2 &&
    mouseX < bx + bw / 2 &&
    mouseY > by - bh / 2 &&
    mouseY < by + bh / 2;

  if (hovering) {
    fill(60, 100, 200);
    cursor(HAND);
  } else {
    fill(80, 130, 220);
    cursor(ARROW);
  }

  rectMode(CENTER);
  rect(bx, by, bw, bh, 12);

  fill(255);
  textSize(20);
  textStyle(BOLD);
  text("observar", bx, by);
  rectMode(CORNER);
}

function drawStaticCloud(cx, cy, scale) {
  ellipse(cx, cy, 120 * scale, 60 * scale);
  ellipse(cx - 40 * scale, cy + 10 * scale, 80 * scale, 50 * scale);
  ellipse(cx + 40 * scale, cy + 10 * scale, 80 * scale, 50 * scale);
  ellipse(cx - 20 * scale, cy - 20 * scale, 70 * scale, 50 * scale);
  ellipse(cx + 20 * scale, cy - 20 * scale, 70 * scale, 50 * scale);
}

function drawSketch() {
  background(200, 230, 230);

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
    let by = height / 2 + 60;
    let bw = 160;
    let bh = 50;

    if (
      mouseX > bx - bw / 2 &&
      mouseX < bx + bw / 2 &&
      mouseY > by - bh / 2 &&
      mouseY < by + bh / 2
    ) {
      started = true;
      cursor(ARROW);
    }
  } else {
    if (scatterProgress < 0.1) {
      scattered = true;
    }
  }
}