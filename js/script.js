const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 480;
canvas.height = 640;

const halfWidth = canvas.width / 2;
const halfHeight = canvas.height / 2;

const gravity = 0.5;
var die = false;
var icicleList = [];

var eagle = loadImage('./img/eagle.png');
var floor = loadImage('./img/floor.png');
var background = loadImage('./img/bg.png');
var icicles = loadImage('./img/icicles.png');

function loadImage(src) {
    var img = new Image();
    img.src = src;
    return img;
}  

class Icicles {
    constructor(pos, velocity) {
        this.pos = pos;
        this.velocity = velocity;
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

function gameDraw() {
    ctx.drawImage(background, 0, 0);
    for (var i = 0; i < icicleList.length; i++) {
        icicleList[i].draw();
    }
    Floor.draw();
    Bird.draw();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    window.requestAnimationFrame(gameLoop);
    
    gameUpdate();
    gameDraw()
}

var dieCount = 0;
function floorCollide() {
    if (Bird.pos.y >= (canvas.height - (floor.height + eagle.height + 24))) {
        die = true;
        console.log("Collided with floor.")
        dieCount++;
        if (dieCount == 1) {
            dieSound.play();
        }
    }
}

function icicleCollide() {
    h1 = 162;
    h2 = icicles.height - h1;
    for (var i = 0; i < icicleList.length; i++) {
        currentIcicle = icicleList[i];
        console.log(`icicle ${i} at ${currentIcicle.pos.x}`);
        if (Bird.pos.x > currentIcicle.pos.x && Bird.pos.x < currentIcicle.pos.x + icicles.width && Bird.pos.y > currentIcicle.pos.y && Bird.pos.x < currentIcicle.pos.y + icicles.height) {
            console.log("hit");
        }
    }
}

document.body.onkeyup = function(e) {
    if (die == false && e.key == " ") {
        Bird.up();
        flap.play();
    }
}

gameLoop();