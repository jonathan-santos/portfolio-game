const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

let gameLoop;

const drawImageRotated = (obj, img) => {
    let x = obj.x + obj.size / 2
    let y = obj.y + obj.size /2
    const to_radians = Math.PI/180
    ctx.translate(x, y)
    ctx.rotate(obj.direction * to_radians)
    ctx.drawImage(img, -obj.size/2, -obj.size/2, obj.size, obj.size)
    ctx.rotate(-obj.direction * to_radians)
    ctx.translate(-x, -y)
}

const character = {
    x: 0,
    y: 0,
    xVelocity: 0,
    yVelocity: 0,
    size: 10,
    velocity: 1,
    spriteSrc: null,
    sprite: null,
    direction: 0,

    draw: function() {
        drawImageRotated(this, this.sprite)
    },

    changeDirection: function() {
        // x =  1, y =  0   | 90
        // x = -1, y =  0   | 270
        // x =  0, y =  1   | 180
        // x =  0, y = -1   | 0
        // ----------------------
        // x =  1, y =  1   | 135
        // x =  1, y = -1   | 45
        // x = -1, y =  1   | 225
        // x = -1, y = -1   | 315

        if(this.xVelocity == 1 && this.yVelocity == 0) {
            this.direction = 90
        } else if(this.xVelocity == -1 && this.yVelocity == 0) {
            this.direction = 270
        } else if(this.xVelocity == 0 && this.yVelocity == 1) {
            this.direction = 180
        } else if(this.xVelocity == 0 && this.yVelocity == -1) {
            this.direction = 0
        } else if(this.xVelocity == 1 && this.yVelocity == 1) {
            this.direction = 135
        } else if(this.xVelocity == 1 && this.yVelocity == -1) {
            this.direction = 45
        } else if(this.xVelocity == -1 && this.yVelocity == 1) {
            this.direction = 225
        } else if(this.xVelocity == -1 && this.yVelocity == -1) {
            this.direction = 315  
        }
    },

    move: function() {
        this.changeDirection()

        if((this.xVelocity != 0 && this.yVelocity != 0)) {
            
            this.x += Math.floor(this.velocity * this.xVelocity * 0.75)
            this.y += Math.floor(this.velocity * this.yVelocity * 0.75)
        } else {
            this.x += this.velocity * this.xVelocity
            this.y += this.velocity * this.yVelocity
        }

        if(this.x < 0) {
            this.x = 0
        } else if(this.x + this.size > canvas.width) {
            this.x = canvas.width - this.size
        } 

        if(this.y < 0) {
            this.y = 0
        } else if(this.y + this.size > canvas.height) {
            this.y = canvas.height - this.size
        }
    },
}

const player = {
    ...character,
    spriteSrc: 'assets/personagem.png',
    size: 30,
    velocity: 3,
}

const enemy = {
    ...character,
    spriteSrc: 'assets/inimigo.png',
    size: 40,
    velocity: 2,
    aggroRange: 200,

    moveToPlayer: function() {
        if((Math.abs(this.x - player.x) < this.aggroRange) && (Math.abs(this.y - player.y) < this.aggroRange)) {
            if(player.x < this.x) {
                this.xVelocity = -1
            } else if(player.x > this.x) {
                this.xVelocity = 1
            } else {
                this.xVelocity = 0
            }

            if(player.y < this.y) {
                this.yVelocity = -1
            } else if(player.y > this.y) {
                this.yVelocity = 1
            } else {
                this.yVelocity = 0
            }
        } else {
            this.xVelocity = 0
            this.yVelocity = 0
        }
        this.move()
    }
}

const sword = {
    size: { x: 48, y: 32 },
    frames: [],
    framesSrc: [
        'assets/espada_1.png',
        'assets/espada_2.png',
        'assets/espada_3.png',
    ],
    frameToDraw: 0,
    count: 0,

    draw: function() {
        ctx.drawImage(this.frames[this.frameToDraw], player.x - player.size / 4, player.y - this.size.y, this.size.x, this.size.y)
        this.count += 1
        if(this.count == 10) {
            this.count = 0
            this.frameToDraw += 1
        }
            
        if(this.frameToDraw == this.frames.length)
            this.frameToDraw = 0
    }
}

const game = () => {
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const drawTestScenario = () => {
        ctx.fillStyle = '#00f'
        for(let i = 0; i < canvas.height; i += canvas.height / 10) {
            ctx.fillRect(0, i, canvas.width, 1)
        }
        for(let i = 0; i < canvas.width; i += canvas.width / 10) {
            ctx.fillRect(i, 0, 1, canvas.height)
        }
    }
    drawTestScenario()

    ctx.fillStyle = '#f00'
    ctx.fillRect(canvas.width / 2, 0, 1, canvas.height)
    ctx.fillRect(0, canvas.height / 2, canvas.width, 1)

    player.draw()
    enemy.draw()

    // sword.draw()

    player.move()
    enemy.moveToPlayer()
}

const gameInit = () => {
    const loadAssets = () => {
        let playerSprite = new Image()
        playerSprite.src = player.spriteSrc,
        player.sprite = playerSprite

        let enemySprite = new Image()
        enemySprite.src = enemy.spriteSrc,
        enemy.sprite = enemySprite

        sword.framesSrc.map((frameSrc) => {
            let frameSprite = new Image()
            frameSprite.src = frameSrc
            sword.frames.push(frameSprite)
        })
    }

    const initializePositions = () => {
        player.x = Math.floor((canvas.width / 2) - (player.size / 2))
        player.y = Math.floor((canvas.height / 2) - (player.size / 2))

        enemy.x = 30
        enemy.y = 100
    }

    loadAssets()
    initializePositions()
}

const registerControlEvents = () => {
    document.addEventListener('keydown', (e) => {
        if(e.key == 'd' || e.key == 'ArrowRight')
            player.xVelocity = 1
        else if(e.key == 'a' || e.key == 'ArrowLeft')
            player.xVelocity = -1
        if(e.key == 'w' || e.key == 'ArrowUp')
            player.yVelocity = -1
        else if(e.key == 's' || e.key == "ArrowDown")
            player.yVelocity = 1
    })

    document.addEventListener('keyup', (e) => {
        if((e.key == 'd' || e.key == 'ArrowRight') && player.xVelocity == 1)
            player.xVelocity = 0
        else if((e.key == 'a' || e.key == 'ArrowLeft') && player.xVelocity == -1 )
            player.xVelocity = 0
        if((e.key == 'w' || e.key == 'ArrowUp') && player.yVelocity == -1)
            player.yVelocity = 0
        else if((e.key == 's' || e.key == "ArrowDown") && player.yVelocity == 1)
            player.yVelocity = 0
    })
}

gameInit()
registerControlEvents()
gameLoop = setInterval(game, 1000 / 60)