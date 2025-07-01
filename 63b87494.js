// Pch. 63B87494 P5js line constructor

let lineManager;
let regenerateButton;
let hasDrawnStaticLines = false;  // check for static lines

function setup() {
  createCanvas(595, 842);
  background(214, 213, 208);
  strokeWeight(1);
  noSmooth();

  lineManager = new LineManager();
  lineManager.generate();

  regenerateButton = createButton('Generate');
  regenerateButton.position(10, height + 10);
  regenerateButton.mousePressed(() => {
    background(214, 213, 208);
    hasDrawnStaticLines = false;  // drop flag
    lineManager.generate();
  });
}

function draw() {
  lineManager.update();

  if (!hasDrawnStaticLines) {
    lineManager.drawStatic();  // draw static lines once
    hasDrawnStaticLines = true;
  }

  lineManager.drawAnimated();  // draw animated lines
}

// Base interface for all lines
class BaseLine {
  update() {}
  draw() {}
  isFinished() { return false; }
}

// Static line
class StaticLine extends BaseLine {
  constructor(x1, y1, x2, y2) {
    super();
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }

  draw() {
    stroke(0);
    line(this.x1, this.y1, this.x2, this.y2);
  }
}

// Animated line
class AnimatedLine extends BaseLine {
  constructor(x1, y1, x2, y2, step, perpX, perpY) {
    super();
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
    stroke(0);
    line(this.x1, this.y1, this.x2, this.y2);
  }

  isFinished() {
    return this.finished;
  }
}

// Manager class for lines
class LineManager {
  constructor() {
    this.staticLines = [];
    this.animatedLines = [];
  }

  generate() {
    this.staticLines = [];
    this.animatedLines = [];

    let cols = 6;
    let rows = 9;
    let spacingX = width / cols;
    let spacingY = height / rows;
    let jitter = 20;

    // Static lines
    for (let i = 0; i < 10; i++) {
      let [x1, y1] = this.randomGridPoint(cols, rows, spacingX, spacingY, jitter);
      let [x2, y2] = this.randomGridPoint(cols, rows, spacingX, spacingY, jitter);
      this.staticLines.push(new StaticLine(x1, y1, x2, y2));
    }

    // Animated lines
    for (let i = 0; i < 7; i++) {
      let [x1, y1] = this.randomGridPoint(cols, rows, spacingX, spacingY, jitter);
      let [x2, y2] = this.randomGridPoint(cols, rows, spacingX, spacingY, jitter);

      let dx = x2 - x1;
      let dy = y2 - y1;
      let len = dist(x1, y1, x2, y2);
      let perpX = -dy / len;
      let perpY = dx / len;
      let step = random(1, 5);

      this.animatedLines.push(new AnimatedLine(x1, y1, x2, y2, step, perpX, perpY));
    }
  }

  update() {
    for (let line of this.animatedLines) {
      line.update();
    }
  }

  drawStatic() {
    for (let line of this.staticLines) {
      line.draw();
    }
  }

  drawAnimated() {
    for (let line of this.animatedLines) {
      line.draw();
    }
  }

  randomGridPoint(cols, rows, spacingX, spacingY, jitter) {
    let gx = int(random(cols));
    let gy = int(random(rows));
    let x = gx * spacingX + random(-jitter, jitter);
    let y = gy * spacingY + random(-jitter, jitter);
    return [x, y];
  }
}
