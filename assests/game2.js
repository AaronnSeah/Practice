var config = {
    type : Phaser.AUTO,
    width : 800,
    height : 600,
    physics:{   //to use physics arcade, need this
        default : 'arcade',
        arcade: {
            gravity :{y:300}, //set gravity
            debug : false
        }
    },
    scene : {
        preload : preload,
        create : create,
        update : update
    }
};

var player; //the main character
var platforms; //the land
var cursors; //the keyboard keys up down left right
var stars; //stars dropped
var score = 0; //initial score
var scoreText; //text showing score
var bombs; //bombs dropping
var gameOver = false; //boolean gameOver
var game = new Phaser.Game(config); //start game with desired config

function preload() //load all images before game
{
    this.load.image('sky','./static/sky.png'); //sky
    this.load.image('ground','./static/platform.png'); //platforms
    this.load.image('star','./static/star.png'); //stars
    this.load.image('bomb','./static/bomb.png'); //bombs
    this.load.spritesheet('dude','./static/dude.png',{frameWidth:32,frameHeight:48});//main character
                                        //with many frames
}

function create()
{
    this.add.image(400,300,'sky'); //add sky background FIRST

    platforms = this.physics.add.staticGroup(); //make all platforms a STATIC group
    platforms.create(400,568,'ground').setScale(2).refreshBody(); //platform as the ground
    platforms.create(600,400,'ground'); //other normal platforms
    platforms.create(50,250,'ground'); //all linked as a group(static)
    platforms.create(750,220,'ground');

    player = this.physics.add.sprite(100,450,'dude'); //make main char a sprite

    player.setBounce(0.2); //allow player to bounce very little
    player.setCollideWorldBounds(true); //allow player to fall

    this.anims.create({ //creates animation of player
        key:'left',  //for left
        frames: this.anims.generateFrameNumbers('dude',{start:0,end:3}), //animation series
        frameRate :10, //frame rate
        repeat : -1 //-1 for a loop
    });

    this.anims.create({
        key:'turn',
        frames:[{key:'dude',frame:4}], 
        frameRate: 20
    });
    this.anims.create({
        key:'right',
        frames : this.anims.generateFrameNumbers('dude',{start:5,end:8}),
        frameRate:10,
        repeat:-1
    });
    stars = this.physics.add.group({ //stars created as a group
        key:'star', //each star has 'star' pic
        repeat : 11, //do this 11 times, so have 12 stars
        setXY : { x:12, y:0, stepX: 70} //first star starts at 12,0 next ones increment 
    });
    stars.children.iterate(function(child){//for each children in stars group,
        child.setBounceY(Phaser.Math.FloatBetween(0.4,0.8));  //allow some random bounce for it
    });
    
    bombs = this.physics.add.group(); //create group for bombs

    this.physics.add.collider(stars,platforms); //platform and stars can collide 
    this.physics.add.collider(player,platforms); //platform and player can collide, and not pass through
    cursors = this.input.keyboard.createCursorKeys();//config keyboard
    this.physics.add.overlap(player,stars,collectStar,null,this); //if overlap, carryout collectStar
    this.physics.add.overlap(player,bombs,hitBomb,null,this); //if overlap, hitBomb executed

    scoreText = this.add.text(16,16,'score: 0',{fontSize:'32px',fill:'#000'}); //initial scoreText
}

function update()
{
    if(gameOver) //game is over, so end
        return;
    if(cursors.left.isDown) 
    {
        player.setVelocityX(-160); //velocity in x axis is set to left 160 units
        player.anims.play('left',true); //play the animation for left
    }
    else if(cursors.right.isDown)
    {
        player.setVelocityX(160);
        player.anims.play('right',true);
    }
    else
    {
        player.setVelocityX(0);
        player.anims.play('turn');
    }
    if(cursors.up.isDown && player.body.touching.down)
        player.setVelocityY(-330); //for upwards velcity 30, after counteracting gravity

}
//if player and star overlap
function collectStar(player, star) 
{
    star.disableBody(true,true); //star disappears
    score+=10; //score increases for each star overlapped
    scoreText.setText('Score: '+score); //scoreText updated
    
    if(stars.countActive(true)==0) //if all stars gone
    {
        stars.children.iterate(function(child){
            child.enableBody(true,child.x,0,true,true); //create 12 more stars
        });
    }
    //bomb drops on the other side of the map from the player
    var x =(player.x<400) ? Phaser.Math.Between(400,800) : Phaser.Math.Between(0,400);
    //creates a bomb
    var bomb = bombs.create(x,16,'bomb');
    //sets bounce of bomb
    bomb.setBounce(1);
    //bomb allowed to fall
    bomb.setCollideWorldBounds(true);
    //bomb of velocity varies, from upwards to downwards direction
    bomb.setVelocity(Phaser.Math.Between(-200,200));
    //bomb has no gravity
    bomb.allowGravity = false;
}
//if bomb and player overlap
function hitBomb(player, bomb)
{
    //game pauses
    this.physics.pause();
    //player turns red as if dead
    player.setTint(0xff0000);
    //last image of player when dead is the turn animation
    player.anims.play('turn');
    //gameOver is true as a result
    gameOver = true;
}