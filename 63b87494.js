// Pch. 63B87494 P5js line constructor

let lineManager;
let regenerateButton;

// Input UI elements
let bgColorPicker;
let strokeColorPicker;
let staticCountInput;
let animatedCountInput;

// Initialize canvas, UI
function setup() {
  createCanvas(595, 842);
  noSmooth();

  // Default values
  bgColorPicker = createColorPicker('#D6D5D0');
  bgColorPicker.position(10, height + 10);
  createSpan(' Background').position(70, height + 10);

  strokeColorPicker = createColorPicker('#262324');
  strokeColorPicker.position(10, height + 40);
  createSpan(' Line Color').position(70, height + 40);

  staticCountInput = createInput('10', 'number');
  staticCountInput.position(10, height + 70);
  staticCountInput.size(50);
  createSpan(' Static Lines').position(70, height + 70);

  animatedCountInput = createInput('7', 'number');
  animatedCountInput.position(10, height + 100);
  animatedCountInput.size(50);
  createSpan(' Animated Lines').position(70, height + 100);

  regenerateButton = createButton('Regenerate');
  regenerateButton.position(10, height + 140);
  regenerateButton.mousePressed(() => {
    redrawCanvas();
  });

  // Initialize manager and draw once
  lineManager = new LineManager();
  redrawCanvas();
}

// Update lines with new settings
function redrawCanvas() {
  const bgColor = bgColorPicker.color();
  const strokeColor = strokeColorPicker.color();
  const staticCount = int(staticCountInput.value());
  const animatedCount = int(animatedCountInput.value());

  background(bgColor);
  lineManager.setColors(strokeColor, bgColor);
  lineManager.generate(staticCount, animatedCount);
  redraw(); // triggers one draw call
}

// Draws animated lines
function draw() {
  lineManager.update();
  lineManager.drawAnimated();
}

// Base class for all line
class BaseLine {
  constructor(strokeColor) {
    this.strokeColor = strokeColor;
  }

  update() {}
  draw() {}
  isFinished() { return false; }
}

// Draw static lines
class StaticLine extends BaseLine {
  constructor(x1, y1, x2, y2, strokeColor) {
    super(strokeColor);
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  draw() {
    stroke(this.strokeColor);
    line(this.x1, this.y1, this.x2, this.y2);
  }
}

// Draw lines animation
class AnimatedLine extends BaseLine {
  constructor(x1, y1, x2, y2, step, perpX, perpY, strokeColor) {
    super(strokeColor);
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.step = step;
    this.perpX = perpX;
    this.perpY = perpY;
    this.finished = false;
  }

  update() {
    if (this.finished) return;

    this.x1 += this.perpX * this.step;
    this.y1 += this.perpY * this.step;
    this.x2 += this.perpX * this.step;
    this.y2 += this.perpY * this.step;

    if (
      (this.x1 < 0 && this.x2 < 0) || (this.x1 > width && this.x2 > width) ||
      (this.y1 < 0 && this.y2 < 0) || (this.y1 > height && this.y2 > height)
    ) {
      this.finished = true;
    }
  }

  draw() {
    stroke(this.strokeColor);
    line(this.x1, this.y1, this.x2, this.y2);
  }

  isFinished() {
    return this.finished;
  }
}

// Line manager
class LineManager {
  constructor() {
    this.staticLines = [];
    this.animatedLines = [];
    this.strokeColor = color(0);
    this.bgColor = color(255);
  }

  // Set bg color
  setColors(strokeColor, bgColor) {
    this.strokeColor = strokeColor;
    this.bgColor = bgColor;
  }

  // Generate new static and animated lines
  generate(staticCount, animatedCount) {
    this.staticLines = [];
    this.animatedLines = [];

    let cols = 6;
    let rows = 9;
    let spacingX = width / cols;
    let spacingY = height / rows;
    let jitter = 20;

    // Static lines
    for (let i = 0; i < staticCount; i++) {
      let [x1, y1] = this.randomGridPoint(cols, rows, spacingX, spacingY, jitter);
      let [x2, y2] = this.randomGridPoint(cols, rows, spacingX, spacingY, jitter);
      const line = new StaticLine(x1, y1, x2, y2, this.strokeColor);
      line.draw(); // draw once
      this.staticLines.push(line);
    }

    // Animated lines
    for (let i = 0; i < animatedCount; i++) {
      let [x1, y1] = this.randomGridPoint(cols, rows, spacingX, spacingY, jitter);
      let [x2, y2] = this.randomGridPoint(cols, rows, spacingX, spacingY, jitter);
      let dx = x2 - x1;
      let dy = y2 - y1;
      let len = dist(x1, y1, x2, y2);
      let perpX = -dy / len;
      let perpY = dx / len;
      let step = random(1, 5);
      this.animatedLines.push(new AnimatedLine(x1, y1, x2, y2, step, perpX, perpY, this.strokeColor));
    }
  }

  // Update animated lines
  update() {
    for (let line of this.animatedLines) {
      line.update();
    }
  }

  // Draw animated lines
  drawAnimated() {
    for (let line of this.animatedLines) {
      line.draw();
    }
  }

  // Random grid jitter
  randomGridPoint(cols, rows, spacingX, spacingY, jitter) {
    let gx = int(random(cols));
    let gy = int(random(rows));
    let x = gx * spacingX + random(-jitter, jitter);
    let y = gy * spacingY + random(-jitter, jitter);
    return [x, y];
  }
}

