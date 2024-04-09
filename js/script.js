const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 480;
canvas.height = 640;

const halfWidth = canvas.width / 2;
const halfHeight = canvas.height / 2;

const gravity = 0.5;
var die = false;
var icicleList = [];
var points = 0;
var best = 0;

var eagle =         loadImage('./img/eagle.png');
var floor =         loadImage('./img/floor.png');
var background =    loadImage('./img/bg.png');
var icicles =       loadImage('./img/icicles.png');
var retryButton =   loadImage('./img/Retry.png');
var scoreMenu =     loadImage('./img/scores.png');

var showFPS = false;

function loadImage(src) {
    var img = new Image();
    img.src = src;
    return img;
}  

class Icicles {
    constructor(pos, velocity) {
        this.pos = pos;
        this.velocity = velocity;
        this.passedMidpoint = false;
        console.log("An icicles was spawned");
    }

    update() {
        if (die) {
            return;
        }
        this.pos.x += this.velocity.x;
    }

    draw() {
        ctx.drawImage(icicles, this.pos.x, this.pos.y);
    }
}

class ground {
    constructor(pos, velocity) {
        this.pos = pos;
        this.velocity = velocity;
    }

    update() {
        if (die) {
            return;
        }
        
        this.pos.x += this.velocity.x;
        if (this.pos.x < -floor.width) {
            this.pos.x += floor.width;
        }
    }

    draw() {
        ctx.drawImage(floor, this.pos.x, this.pos.y);
        ctx.drawImage(floor, this.pos.x + floor.width, this.pos.y);
    }
}

class bird {
    constructor(pos, velocity, radius) {
        this.pos = pos;
        this.velocity = velocity;
        this.radius = radius;
        this.frameX = 0;
        this.frameCount = 0;
        this.frameSpeed = 5;
        this.numberOfFrames = 4;
    }

    up() {
        this.velocity.y = -10;
        console.log("flap");
    }
    
    update() {
        if (die == true) {
            return;
        }
        this.velocity.y += gravity;
        this.pos.y += this.velocity.y;

        // Animation from spritesheet code must be more modular coming soon
        this.frameCount++;
        // I am controlling how long it displays the frame
        if (this.frameCount % this.frameSpeed == 0) {
            this.frameX++;
            // Go back to first frame
            if (this.frameX >= this.numberOfFrames) {
                this.frameX = 0;
            }
            this.frameCount=0;
        }
    };
    
    draw() {
        // Sprite Sheet moment
        var width = eagle.width / 4;
        var height = eagle.height;
        ctx.save();

        ctx.translate(this.pos.x + this.radius / 2, this.pos.y + this.radius / 2);
        let rotation = Math.atan2(this.velocity.y, 17);

        // Rotate the canvas by the calculated angle
        ctx.rotate(rotation);

        // Draw the bird
        ctx.drawImage(
            eagle, 
            this.frameX * width, 0,
            width, height,
            -this.radius / 2, -this.radius / 2, // Draw the bird centered at (0, 0)
            width, height
        );

        // Restore the previous transformation state of the canvas
        ctx.restore();
    };
}


const Bird = new bird(vec2(halfWidth - 50, halfHeight), vec2(5,0), 15);
const Floor = new ground(vec2(0, canvas.height-floor.height), vec2(-5, 5));

function startGame() {
    gameLoop();
}

// https://jakesgordon.com/writing/javascript-game-foundations-sound/
function createAudio(src) {
    var audio = document.createElement('audio');
    audio.volume = 0.5;
    //audio.loop   = options.loop;
    audio.src = src;
    return audio;
}

var flap = createAudio('./sound/flap.wav');
var swoosh = createAudio('./sound/swoosh.wav');
var dieSound = createAudio('./sound/die.wav');
var pointSound = createAudio('./sound/point.wav');
var hitSound = createAudio('./sound/hit.wav');

var PublicPixel = new FontFace('PublicPixel', 'url(font/PublicPixel.ttf)');
document.fonts.add(PublicPixel)

function vec2(x, y) {
    return {x: x, y: y};
}

function died() {
    if (die) {
        return;
    }
}

function swooshed() {
    if (die) {
        return;
    }
    
    if (Bird.velocity.y >= 15) {
        swoosh.play();
    }
}

function getSpawn() {
    // Top is       -420
    // Middle is    -295
    // Bottom is    -170
    return Math.random() * (-170 - (-420)) + -420;
}

icicleList.push(new Icicles(vec2(canvas.width, getSpawn()), vec2(-5, 5)));
var counter = 0;

var lastCalledTime;
function fpsCounter() {
    // https://stackoverflow.com/questions/8279729/calculate-fps-in-canvas-using-requestanimationframe
    if(!lastCalledTime) {
        lastCalledTime = performance.now();
        fps = 0;
        return;
    }
    delta = (performance.now() - lastCalledTime)/1000;
    lastCalledTime = performance.now();
    fps = 1/delta;

    fps = Math.round(fps);
    return fps;
}

function gameUpdate() {
    Bird.update();
    Floor.update();
    counter++;
    if (!die && counter % 65 == 0) {
        icicleList.push(new Icicles(vec2(canvas.width, getSpawn()), vec2(-5, 5)));
    }

    for (var i = 0; i < icicleList.length; i++) {
        icicleList[i].update();
        if (icicleList[i].pos.x + icicles.width < 0) {
            icicleList.slice(i, i - 1);
        }
    }
    floorCollide();
    icicleCollide();
    swooshed();
}

function outlineText(text, x, y, size, outline) {
    ctx.font = `${size}px PublicPixel, Sans-serif`;
    if (outline) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 8;
        ctx.strokeText(text, x, y);
    }
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
}

function gameDraw() {
    ctx.drawImage(background, 0, 0);
    for (var i = 0; i < icicleList.length; i++) {
        icicleList[i].draw();
    }
    Floor.draw();
    Bird.draw();

    // Font
    PublicPixel.load().then(() => {
        if (!die) {
            outlineText(points, halfWidth, 85, 50, true);
        } else {
            outlineText("Game Over", 20, 150, 50, true);

            outlineText(points, halfWidth + 60, halfHeight - scoreMenu.height + 65, 20, false);
            if (points > best) {
                best = points;
            }
            outlineText(best, halfWidth + 60, halfHeight - scoreMenu.height + 125, 20, false);
        }
    });

    // Game Over/Die
    if (die) {
        ctx.drawImage(scoreMenu, halfWidth - scoreMenu.width / 2, halfHeight - scoreMenu.height);
        ctx.drawImage(retryButton, halfWidth - retryButton.width / 2, halfHeight + retryButton.height);
    }
    
    if (showFPS) {
        ctx.font = '50px Arial';
        ctx.fillStyle = 'white';
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'black';
        ctx.strokeText(fpsCounter(), 0, 40);
    }
    //drawCollisionBoxes();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    window.requestAnimationFrame(gameLoop);
    
    gameUpdate();
    gameDraw()
}

function floorCollide() {
    if (!die && Bird.pos.y >= (canvas.height - (floor.height + eagle.height + 24))) {
        die = true;
        console.log("Collided with floor.")
        dieSound.play();
    }
}

function icicleCollide() {
    var birdRight = Bird.pos.x + eagle.width / 4;
    var birdBottom = Bird.pos.y + eagle.height;
    var icicleGap = 72 * 3;
    
    if (die && Bird.pos.y <= (canvas.height - (floor.height + eagle.height + 24))) {
        Bird.velocity.y += 5;
        Bird.pos.y += 25;
    }

    for (var i = 0; i < icicleList.length; i++) {
        var currentIcicle = icicleList[i];
        var icicleLeft = currentIcicle.pos.x;
        var icicleRight = currentIcicle.pos.x + icicles.width;
        var icicleTop = currentIcicle.pos.y;
        var icicleBottomTopPipe = currentIcicle.pos.y + (162 * 3);
        var icicleTopBottomPipe = icicleBottomTopPipe + icicleGap; 
        var icicleBottom = icicleTopBottomPipe + (162 * 3);
        
        if (!die && (birdRight > icicleLeft && Bird.pos.x < icicleRight) &&
        ((birdBottom > icicleTop && Bird.pos.y < icicleBottomTopPipe) ||
        (birdBottom > icicleTopBottomPipe && Bird.pos.y < icicleBottom))) { 
            die = true;
            console.log("Hit the icicle");
            hitSound.play();
            break;
        }

        if (!currentIcicle.passedMidpoint && birdRight > (currentIcicle.pos.x + icicles.width / 2)) {
            points++;
            console.log("Points: " + points);
            currentIcicle.passedMidpoint = true;
            pointSound.play();
        }
    }
}

function drawCollisionBoxes() {
    // Draw bird collision box
    ctx.strokeStyle = "red";
    ctx.strokeRect(Bird.pos.x, Bird.pos.y, eagle.width / 4, eagle.height);

    // Draw icicle collision boxes
    ctx.strokeStyle = "blue";
    for (var i = 0; i < icicleList.length; i++) {
        var currentIcicle = icicleList[i];
        ctx.strokeRect(currentIcicle.pos.x, currentIcicle.pos.y, icicles.width, icicles.height - (162+72) * 3);
        ctx.strokeRect(currentIcicle.pos.x, currentIcicle.pos.y + (162+72) * 3, icicles.width, icicles.height);

        // COIN!!!
        ctx.strokeRect(currentIcicle.pos.x + icicles.width / 2, currentIcicle.pos.y, 5, icicles.height);
    }
}

function flapinator() {
    Bird.up();
    flap.play();
}
document.body.onkeyup = function(e) {
    if (die == false && e.key == " ") {
        flapinator();
    }
}

document.addEventListener('pointerdown', (event) => {
    if (event.pointerType === "mouse" || event.pointerType  === "touch") {
        flapinator()
    }
  });

gameLoop();