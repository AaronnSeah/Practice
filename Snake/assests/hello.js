//to configure the game for Phaser, config class and keys are known
//in phaser
var config ={          
    type : Phaser.WEBGL,
    width : 640, //what if i change pixel value?
    height : 480,
    backgroundColor : '#bfcc00',
    parent : 'phaser-example',
    scene : {
        preload: preload, //what if i change configurations?
        create : create,
        update : update
    }
};

var snake;
var food;
var cursors;

//direction constants
var UP = 0; //question: what if i change the configurations?
var DOWN = 1;
var LEFT = 2;
var RIGHT = 3;

var game = new Phaser.Game(config); //starts the game with the 
                                //stated config

//first scene
//loads food and body images
function preload() 
{
    this.load.image('food','./static/food.png');
    this.load.image('body','./static/body.png');
}

//second scene
function create()
{
    var Food = new Phaser.Class({
        Extends: Phaser.GameObjects.Image, //inherits from 
                                      //  GameObjects.Image Class
        //initial values of Food
        initialize:
    
        function Food(scene,x,y)
        {
            Phaser.GameObjects.Image.call(this,scene) 
            this.setTexture('food'); //gives it food image
            this.setPosition(x*16,y*16); //*16 to convert to pixels
            this.setOrigin(0); 

            this.total=0; //number of food eaten
            
            scene.children.add(this); //add this to the list of 
                                    //children in the scene
        },

        eat: function()
        {
            this.total++; //increment food eaten
            
            var x = Phaser.Math.Between(0,39); //randomly generate
            var y = Phaser.Math.Between(0,29);//position for food

            this.setPosition(x*16,y*16); //set its position
        }
    });
    //creates Snake phaser class with initializer, update(time),
    //faceLeft/Right/Up/Down(),
    var Snake = new Phaser.Class({
        initialize:
        //initializes the snake with
        //headPosition,body,head,alive status,speed,moveTime
        //heading and direction
        function Snake(scene,x,y) 
        {
            this.headPosition = new Phaser.Geom.Point(x,y);
            this.body = scene.add.group();
            this.head = this.body.create(x*16,y*16,'body'); //body is the image
            this.head.setOrigin(0);
            this.alive = true;
            this.moveTime = 0;
            this.speed = 100;
            this.tail = new Phaser.Geom.Point(x,y); //give tail same position initially
            this.heading = RIGHT;
            this.direction = RIGHT;
        },
        //if time is greater than time to move, then execute 
        //move function
        update : function(time)
        {
            if(time>=this.moveTime)
                return this.move(time);
        },
        //if initial directions correct, then accept change
        //in heading
        faceLeft : function()
        {
            if(this.direction===UP ||this.direction===DOWN)
                this.heading=LEFT;
        },
        faceRight : function()
        {
            if(this.direction===UP ||this.direction===DOWN)
                this.heading=RIGHT;
        },
        faceUp : function()
        {
            if(this.direction===LEFT ||this.direction===RIGHT)
                this.heading=UP;
        },
        faceDown : function()
        {
            if(this.direction===LEFT ||this.direction===RIGHT)
                this.heading=DOWN;
        },
        //from this.heading value, decide what is the next position
        move : function(time)
        {
            switch(this.heading)
            {
                case LEFT:
                    this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x-1,0,40);
                    break;
                case RIGHT:
                    this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x+1,0,40);
                    break;
                case UP:
                    this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y-1,0,30);
                    break;
                case DOWN:
                    this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y+1,0,30);
                    break;
            }
            //update the this.direction with new heading(from faceX functions)
            //else remains same direction
            this.direction = this.heading;

            //shifts body segments
            Phaser.Actions.ShiftPosition(this.body.getChildren(),this.headPosition.x*16,this.headPosition.y*16,1,this.tail);
            //shift by 1 until the tail.

            var hitBody = Phaser.Actions.GetFirst(this.body.getChildren(),{x:this.head.x, y:this.head.y},1);

            if(hitBody)
            {
                console.log('dead');

                this.alive = false;
                return false;
            }
            else
            {
                this.moveTime = time + this.speed; //speed is time for one unit dist.
                return true;
            }
        },
        grow : function()
        {
            var newPart = this.body.create(this.tail.x,this.tail.y,'body');
            //add another body part to tail
            newPart.setOrigin(0);
        },

        collideWithFood : function(food)
        {
            //if head touches food
            if(this.head.x===food.x && this.head.y === food.y)
            {
                this.grow(); //grow new body part
                food.eat(); //food eaten
                //for every 5 items of food eaten,speed increases a little
                if(this.speed>20 && food.total%5===0)
                    this.speed-=5;
                return true;
            }
            else
                return false;
        },
        
        updateGrid : function(grid)
        {
            this.body.children.each(function(segment){
                var bx = segment.x/16;
                var by = segment.y/16;
                grid[by][bx] = false;
            });
            return grid;
        }
    });
    food = new Food(this,3,4);
    //creates snake from snake class from create scene
    snake = new Snake(this,8,8);
    //map keyboard up down left right
    cursors = this.input.keyboard.createCursorKeys();
}

//third scene
function update(time,delta)
{
    //if snake not alive, game end
    if(!snake.alive)
        return ;
    //if cursor left is pressed, snake will attempt to turn left
    // if allowed
    if(cursors.left.isDown)
        snake.faceLeft();
    //if cursor right is pressed, snake will attempt to turn right
    // if allowed
    else if(cursors.right.isDown)
        snake.faceRight();
    //if cursor up is pressed, snake will attempt to turn up
    // if allowed
    else if(cursors.up.isDown)
        snake.faceUp();
    //if cursor down is pressed, snake will attempt to turn down
    // if allowed
    else if(cursors.down.isDown)
        snake.faceDown();
    //function in create scene.
    if (snake.update(time))  //if a move is made
    {
       if (snake.collideWithFood(food)) //check if collision with food
       {                         //occurs
            repositionFood();
        }
    }
}

function repositionFood()
{
    
    var testGrid = [];

    for(var y=0;y<30;y++)
    {
        testGrid[y]=[];
        for(var x =0; x<40;x++)
        {
            testGrid[y][x]=true;
        }
    }
    snake.updateGrid(testGrid);
    var validLocations = [];
    for(var y =0;y<30;y++)
    {
        for(var x=0;x<40;x++)
        {
            if(testGrid[y][x]===true)
                validLocations.push({ x:x, y:y }); //as an object
        }
    }
    if(validLocations.length>0)
    {
    //    var pos = Phaser.Math.RND.pick(validLocations); //pos is an object
    //    food.setPosition(pos.x*16,pos.y*16);//get val by the key
     //   return true;
    }
    else 
    {
       // return false;
    }
}
