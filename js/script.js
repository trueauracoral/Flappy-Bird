const canvas = document.getElementById('canvas');

const ctx = canvas.getContext('2d');

canvas.width = 480;
canvas.height = 640;

const halfWidth = canvas.width / 2;
const halfHeight = canvas.height / 2;

const gravity = 0.5;
var die = false;

var eagle = loadImage('./img/eagle.png');
var floor = loadImage('./img/floor.png');
var background = loadImage('./img/bg.png');
var icicles = loadImage('./icicles.png');

function loadImage(src) {
    var img = new Image();
    img.src = src;
    return img;
}  

class Icicles {
    constructor(pos, velocity) {
        this.pos = pos;
        this.velocity = velocity;
    }

    update() {
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
console.log(halfWidth-50);
const Floor = new ground(vec2(0, canvas.height-floor.height), vec2(-5, 5));
const icicle = new Icicles(vec2(halfWidth, 0), vec2(-5, 5));

console.log(halfWidth - floor.height);
console.log(halfHeight);

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

//var bounce = createAudio('./sound/bounce.wav');

function vec2(x, y) {
    return {x: x, y: y};
}

function gameUpdate() {
    Bird.update();
    Floor.update();

    floorCollide();
}

function gameDraw() {
    ctx.drawImage(background, 0, 0);
    Bird.draw();
    Floor.draw();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    window.requestAnimationFrame(gameLoop);
    
    gameUpdate();
    gameDraw()
}

function floorCollide() {
    if (Bird.pos.y >= (canvas.height - (floor.height + eagle.height + 24))) {
        die = true;
        console.log("Collided with floor.")
    }
}

document.body.onkeyup = function(e) {
    if (die == false && e.key == " ") {
        Bird.up();
    }
}

gameLoop();