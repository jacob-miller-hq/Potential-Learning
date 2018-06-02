
const BG_COLOR = "#333"
const ONE_SECOND = 1000
const TGT_FPS = 30;
const FRAME_TIME = ONE_SECOND / TGT_FPS;
const TGT_TR = 30;
const TICK_TIME = ONE_SECOND / TGT_TR;

var cvs;
var ctx;
var h, w;

var neurons;
var game;

var dragging, dragX, dragY, dragAnchor;

function draw() {
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, w, h);

  // color: ctx.fillStyle=color, ctx.strokeStyle=color
  // line: moveTo(x1, y1), lineTo(x2, y2), stroke()
  // circle: beginPath(), arc(xc, yc, r, 0, 2*Math.PI), stroke()
  // gradients: createLinearGradient(x,y,x1,y1), createRadialGradient(x,y,r,x1,y1,r1)
  //     grd.addColorStop(idx, color), ctx.fillStyle=grd
  // text: ctx.font=font, ctx.fillText(text,x,y), ctx.strokeText(text,x,y)
  //     ctx.fillStyle=color, ctx.textAlign=align
  // image: drawImage(img,x,y) (img = document.getElById("img_id"))
  // can also create patterns, shadows, and paths (lookup if required)

  for(let i = 0; i < neurons.length; i++) {
    neurons[i].drawConns(ctx, true);
  }
  for(let i = 0; i < neurons.length; i++) {
    neurons[i].draw(ctx);
  }

  game.draw(ctx);
}

function tick() {
  for(let i = 0; i < neurons.length; i++) {
    neurons[i].tick();
  }
  for(let i = 0; i < neurons.length; i++) {
    neurons[i].bound(ctx);
  }
}

var last = 0;
var extra;
var delta = 0;

function gameLoop(curr) {
  delta += curr - last;
  // console.log("delta =", delta);
  if(delta > 100 * TICK_TIME) {
    // we're 100 ticks behind. Give up to avoid starvation
    console.log("resetting delta");
    delta = 0;
  }

  for( ; delta >= TICK_TIME; delta -= TICK_TIME) {
    tick();
  }
  // console.log("leftover:", delta);

  draw();

  last = curr;
  window.requestAnimationFrame(gameLoop);
}

function updateBounds() {
  w = cvs.width = ctx.canvas.clientWidth;
  h = cvs.height = ctx.canvas.clientHeight;
}

function handleMouseDown(e) {
  for(let i = 0; i < neurons.length; i++) {
    if(neurons[i].contains(e.clientX, e.clientY)) {
      dragging = neurons[i];
      dragAnchor = dragging.isAnchor;
      dragging.isAnchor = true;
      dragX = dragging.x - e.clientX;
      dragY = dragging.y - e.clientY;
    }
  }
}

function handleMouseUp() {
  if(dragging != null) {
    dragging.prevX = dragging.x;
    dragging.prevY = dragging.y;
    dragging.isAnchor = dragAnchor;
    dragging = null;
  }
}

function handleMouseMove(e) {
  // console.log("mouse move");
  if(dragging != null) {
    dragging.x = e.clientX + dragX;
    dragging.y = e.clientY + dragY;
  }
}

function handleKeypress(e) {
  // TODO fix this
  game.play(3);
}

function init() {
  cvs = document.getElementById("main-canvas");
  cvs.addEventListener("mousedown", handleMouseDown);
  cvs.addEventListener("mouseup", handleMouseUp);
  cvs.addEventListener("mousemove", handleMouseMove);
  // to make the mouse look right:
  cvs.addEventListener("selectstart", (e) => {e.preventDefault();});
  ctx = cvs.getContext("2d");
  updateBounds();
  window.addEventListener("resize", updateBounds);
  window.addEventListener("keypress", handleKeypress);

  let useAnchors = true;

  neurons = [
    new Neuron(100, 90, useAnchors),
    new Neuron(150, 130, useAnchors),
    new Neuron(500, 60),
    new Neuron(600, 75),
    new Neuron(500, 95, useAnchors),
    new Neuron(400, 100),
  ]

  neurons[2].addIn(neurons[0]);
  neurons[2].addIn(neurons[1]);
  neurons[3].addIn(neurons[0]);
  neurons[3].addIn(neurons[1]);
  neurons[3].addIn(neurons[2]);
  neurons[4].addIn(neurons[0]);
  neurons[4].addIn(neurons[2]);
  neurons[4].addIn(neurons[3]);

  neurons[5].addIn(neurons[2]);
  neurons[4].addIn(neurons[5]);

  game = new Game2048(10, 10);

  console.log("initialization finished");
}

function clickHandler() {
  console.log("click");
}

function main() {
  init();
  window.requestAnimationFrame(gameLoop);
}

main();
