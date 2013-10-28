/**
 * @author Mandemeskel
 * The main game file, where everything comes together and where the canvas is created.
 */
 //these are helper functions and classes
        var cnvs = document.createElement('canvas');
        var ctx = cnvs.getContext('2d'),
            canvas_vector = new Vector( 200, 200 );
            
        var map = [],
            temp_map = [],
            outline = [],
            map_h, map_w, 
            BOX_D = 30,
            draw_map = false,
            spawn_v = new Vector( 0, 0 ),
            w = 1500, h = 700;
            
        var offset = new Vector( 0, 0 ),
            prev_offset = new Vector( 0, 0 );
            
        var draw_window = new Vector( 0, 0 ),
            draw_end =  new Vector( 0, 0 ),
            draw_x = 0,
            draw_y = 0,
            cast_range;
        
        cnvs.width = w;
        cnvs.height = h;
        document.body.appendChild(cnvs);

        var PI = Math.PI,
            _45 = PI*0.75,
            _90 = PI*0.5,
            _135 = PI*0.25,
            _180 = PI,
            _270 = PI*1.5,
            _360 = PI*2;
            
            
        //add some events here just for fun and show
        //mouseenter and mouselleave work in mozilla but otherwise are custom events
        //requiring jquery
        $(".toast").bind({
            
            mouseenter: function() {
                $( ".toast" ).addClass( "shadow" );
            },
            mouseleave: function() {
                $( ".toast" ).removeClass( "shadow" );
            }
            
        });
            
        //this class handles all locations on the canvas
        function Vector(x, y) {
          
          if( x instanceof Vector ) {
              
              this.copy( x );
              
          } else {
          
            this.x = x || 0;
            this.y = y || 0;
           
          }
          
        }
        
        Vector.prototype.offset = function(x, y) {
          this.x += x;
          this.y += y;
        };
        
        Vector.prototype.set = function(x, y) {
          this.x = x;
          this.y = y;
        };
            
        Vector.prototype.addV = function(v) {
          this.x += v.x;
          this.y += v.y;
        };
        
        Vector.prototype.subV = function(v) {
          this.x -= v.x;
          this.y -= v.y;
        };
        
        Vector.prototype.copy = function(v) {
          this.x = v.x;
          this.y = v.y;
        };
        
        Vector.prototype.distanceTo = function(v) {
            return Math.sqrt( Math.pow( (v.x - this.x), 2 ) + 
                                Math.pow( (v.y - this.y), 2 ) );
        };
        
        Vector.prototype.equals = function(v) {
            return ( this.x == v.x ) && ( this.y == v.y);
        };
        
        //gets angle from mouse position, obj is the player
        function getAngle( v, mouse ){
           var angle,
             ox = v.x - mouse.x,
             oy = v.y - mouse.y;
          
         if( ox !== 0 ){
            angle = toDegrees( Math.atan( oy/ox ) );
        
            if( ox > 0 && oy > 0){
                angle += 180;
            }else if( ox < 0 && oy > 0 ) {
                angle += 360;
            }else if( ox < 0 && oy < 0 ) {
                angle = angle;
            }else if( ox > 0 && oy < 0 ) {
                angle += 180 ;
            }else{
              angle = ox > 0 ? 180 : 0; 
            }
            
          } else {
            if(oy > 0){
              angle = 270;
            } else {
              angle = 90;
            }
          }
          
          return angle;
        }

        //gets mouse cords relative to the location of the canvas on the html body
        function getCords( cnvs, mx, my ){
            var bound = cnvs.getBoundingClientRect();
            var v = new Vector( mx - bound.left * (cnvs.width / bound.width),
                                my - bound.top * (cnvs.height / bound.height) );
            //v.subV( offset );
            return v;
        }
        
        function toRadians( angle ) {
          return angle * ( PI / 180 );
        }
        
        function toDegrees( angle ) {
          return angle * ( 180 / PI );
        }
        
        function getQuad( angle, inrad ) {
            var q = 0;
            if( inrad ) angle = toDegrees( angle );
            if( 0 < angle && angle < 90 ) {
                q = 1;
            } else if( 90 < angle && angle < 180 ) {
                q = 2;
            } else if( 180 < angle && angle < 270 ) {
                q = 3;
            } else if( 270 < angle && angle < 360 ) {
                q = 4;
            } else {
                q = 5;
            }
            return q;
        }
        
        function toggleMap(){
          draw_map = !draw_map;
          if( draw_map ) {
            document.body.style.background = "blue";
          } else {
            document.body.style.background = "black";
          }
        }
        
        //handels player response for death toast dialog 
        function handelDeath( yes ) {
            if( yes ) { //respawn from nearest camp if there is one
                if ( player.respawn() )  {               
                    player.draw = true;
                    game = true;
                    player.color = 'yellow';
                } else {
                    init(); 
                }
            } else {
                ctx.clearRect( 0, 0, w, h );
                document.getElementById( "introToast" ).className = "toast";
            }
            document.getElementById( "deadToast" ).className = "invis";
        }
        
        //handels player response for next level toast dialog 
        function handelNextLvl( yes ) {
            if( yes ) init();
            document.getElementById( "nextLvlToast" ).className = "invis";
        }
        
        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        
        //http://stackoverflow.com/questions/195951/change-an-elements-css-class-with-javascript
        //adds shadow to toasts when mouse over - no jquery much harder
        function addShadow( e ) {
            if ( !e.className.match(/(?:^|\s)shadow(?!\S)/) ) {
                e.className += ' shadow ';
            } else {
                e.className = e.className.replace( /(?:^|\s)shadow(?!\S)/g , '' );
            }
        }
        
        //toggle sounds
        function toggleAudio() {
            sound = !sound; 
            if( !sound ) {
                
                background_audio.pause(); 
                //go through sounds ending any sounds currently playing
                for( var n=0; n < sounds.length; n++ ) {
                    //unfortunetly there is no isPlaying function/attribute :(
                    if( sounds[ n ].currentTime != 0 )
                        //nor is there a end() function
                        sounds[ n ].currentTime = 0; 
                        //gotta pause it or else it will just play from start
                        sounds[ n ].pause();
                }
             
            } else {
                
                background_audio.play();
                
            }
        }

/*********** 
 *
 *  map.js 
 * 
 * *************/

var size_x = 60,
	size_y = 40,
	fillprob = 40,
	gens = 2,
	params = { r1_cutoff: 5, r2_cutoff: 1, reps: 2 },
	TILE_WALL = 1,
	TILE_FLOOR = 0,
	map1 = [];	
	
function Box( origin, w, l, solid ){
  	this.pos = origin; //top left cornor of box
  	this.w = w;
  	this.l = l;
  	this.solid = solid || false;
}

Box.prototype.draw = function( fill ) {
	
	ctx.strokeStyle = fill || "black";
	ctx.strokeRect( this.pos.x, this.pos.y, this.w, this.l );

	if( this.solid ) {
	    ctx.fillStyle = fill || "black";
	    ctx.fillRect( this.pos.x, this.pos.y, this.w, this.l );
	}

};

//TODO: remove
Box.prototype.checkCollision = function(v) {
	if( !this.solid ) return false;
  	var max_x = this.pos.x + this.w;
  	var max_y = this.pos.y + this.l;
  
  	if( max_x >= v.x && v.x >= this.pos.x ){
    	if( max_y >= v.y && v.y >= this.pos.y ) return true;
  	}
  	return false;
};

Box.prototype.set = function( x, y, d, solid ) {
  	this.pos = new Vector( x, y );
  	this.w = d;
  	this.l = d;
  	this.solid = solid;
};

function randpick() { 
	if( getRandomInt(1, 100)%100 < fillprob ) return TILE_WALL;
	return TILE_FLOOR;
}

function initMap() {
	var x, y;
	
	for( y = 0; y < size_y; y++ ) {
	
		map[y] = [];
		map1[y] = [];
		
		for( x = 0; x < size_x; x++ ) {

			map[y].push( randpick() );
			map1[y].push( TILE_WALL );
			
		}
	}
	
	//make  side edges into walls. 
	for( y = 0; y < size_y; y++ )
		map[y][0] = map[y][size_x-1] = TILE_WALL;
		
	//make  top and bottum edges into walls. 
	for( x = 0; x < size_x; x++ )
		map[0][x] = map[size_y-1][x] = TILE_WALL;
}

function generateMap(){
	var x, y, n, k;
	
	//work within the boarders created in initMap
	for( y=1; y<size_y-1; y++ ) {
		for( x=1; x<size_x-1; x++ ) {
			var adjcount_r1 = 0, adjcount_r2 = 0;
			
			for( n=-1; n<=1; n++ ) {
				for( k=-1; k<=1; k++ ) {
					
					if( map[y+n][x+k] != TILE_FLOOR ) adjcount_r1++;
					
				}
			}
			
			for( n=y-2; n<y+2; n++ ){
				for( k=x-2; k<x+2; k++ ){
					
					if( Math.abs(n-y) == 2 && Math.abs(k-x) == 2 ) continue;
					if( n<0 || k<0 || n>=size_y || k>=size_x ) continue;
					if( map[n][k] != TILE_FLOOR ) adjcount_r2++;
				
				}
			}
			
			if( adjcount_r1 >= params.r1_cutoff || adjcount_r2 <= params.r2_cutoff ) {
				map1[y][x] = TILE_WALL;
			} else {
				map1[y][x] = TILE_FLOOR;
			}
		}	
	}
	
	for(y=1; y<size_y-1; y++) {
      
		for(x=1; x<size_x-1; x++) {
			map[y][x] = map1[y][x];
		}
	}
	
}

function cleanMap() {
  for( var x, y=1; y<size_y-1; y++ ) {
		for( x=1; x<size_x-1; x++ ) {
          
          var adjcount_r1 = 0, adjcount_r2 = 0;
          
          for( n=-1; n<=1; n++ ) {
            for( k=-1; k<=1; k++ ) {
              
              if( map[y+n][x+k] != TILE_FLOOR ) adjcount_r1++;
              
            }
          }
			
			for( n=y-2; n<y+2; n++ ){
				for( k=x-2; k<x-2; k++ ){
					
					if( Math.abs(n-y) == 2 && Math.abs(k-x) == 2 ) continue;
					if( n<0 || k<0 || n>=size_y || k>=size_x ) continue;
					if( map[n][k] != TILE_FLOOR ) adjcount_r2++;
				
				}
			}
			
			if( adjcount_r1 >= params.r1_cutoff || adjcount_r2 <= params.r2_cutoff ) {
				map1[y][x] = TILE_WALL;
			} else {
				map1[y][x] = TILE_FLOOR;
			}
          
        }
  }
}

function drawMap( d ) {
  	var box = new Box( new Vector( 0, 0), 10, 10, 0 ),
  		r, c;

  	ctx.strokeStyle = "black";
  
  	for( r = size_y-1; r >= 0; r-- ) {
    	for( c = size_x-1; c >= 0; c-- ){
    	
      		box.set( c*d, r*d, d, map[r][c] );
      		box.draw();
      
    	}
  	}
  
   
}

function createMap( d ) {
	
	initMap();
	for( var n=0; n<gens; n++ ) {
		
		for( var k=0; k<params.reps; k++ ){
		
			generateMap();
		    cleanMap();
	      
		}
			
	}
	
	drawMap( d );
	
	map_w = size_x * BOX_D;
	map_h = size_y * BOX_D;
}

//checks to see if the 
function checkMap( v ) {
	
	var current_pos = new Vector( v.x, v.y ),
		next_pos = new Vector( v.x, v.y ),
		floors = [], walls = [],
		x, y, n = 0;
		
	floors.push( new Vector( next_pos.x, next_pos.y ) );
	
	do {
	
		if( n > (size_x * size_y) ) return false;
	
		next_pos.copy( current_pos );
		x = getRandomInt( -1, 1 );
		y = getRandomInt( -1, 1 );
		next_pos.offset( x, y );
		
		if( vectorIn( floors, next_pos ) && !next_pos.equals( v ) ) {
			
			if( !vectorIn( walls, next_pos ) ) 
				walls.push( new Vector( next_pos.x, next_pos.y ) )
			if( walls.length == 8 ) {
				if( current_pos.equals(v) ) {
					return false;
				} else {
					current_pos.copy( v );
					walls.length = 0;
				}
			}
			
			continue;
			
		}
		
		if( map[ next_pos.y ][ next_pos.x ] == TILE_WALL ) {
			
			if( !vectorIn( walls, next_pos ) ) walls.push( new Vector( next_pos.x, next_pos.y ) );
			if( walls.length == 8 ) {
				if( current_pos.equals(v) ) {
					return false;
				} else {
					current_pos.copy( v );
					walls.length = 0;
				}
			}
			
			
		} else {
			
			current_pos.copy( next_pos );
			floors.push( new Vector( next_pos.x, next_pos.y ) );
			walls.length = 0;
			
			if( floors.length > 50 ) return true;
		}
		
		n++;
		
	} while( true );
	
}

function vectorIn( varray , v ) {
	
	if( varray.length === 0 ) return false;
	
	for( var n = varray.length - 1; n >= 0; n-- ) {
		if( varray[n].equals( v ) ) return true;
	}
	
	return false;
}


/*********** 
 *
 *  ray.js 
 * 
 * *************/

var abox = new Box( new Vector( 0, 0), 10, 10, 0 );

function Ray( origin, angle_r, far ){
	this.pos = origin;
	this.a_r = angle_r;
	this.far = far;
	this.end = this.calcEnd();
	this.collision = false;
} 

//cast ray and checks for collisions against map objects
var vector = new Vector(0,0);

//TODO: calculate far after collision so that it could be used in player.falling()
Ray.prototype.cast = function() {
	var n = 0;
	do{
		
		if( this.testAngle( n ) ) return true;
	 	n++;
	 	
	} while ( n < this.far );
	
	return false;
};

Ray.prototype.testAngle = function( n ) {
	var x, y;
	
	//90 to 180 2nd quadrant
	if( _90 < this.a_r && this.a_r < _180 ) {
		
    	x = x > 0 ? -x : x;
		y = y < 0 ? -y : y;
		x = Math.cos( this.a_r ) * n;
		y = Math.sin( this.a_r ) * n;
	
	//180 to 270 3rd quadrant
    } else if( _180 < this.a_r && this.a_r < _270 ) {
    	
    	x = x > 0 ? -x : x;
		y = y > 0 ? -y : y;
		x = Math.cos( this.a_r ) * n;
		y = Math.sin( this.a_r ) * n;
		
	//if on x or y axis
    }else if( this.a_r == _180 || this.a_r === 0 || this.a_r == _360 ){
    	
		x = this.a_r == _180 ? -n : n;
		y = 0;
		
	}else if( this.a_r == _90  || this.a_r == _270){
		
		y = this.a_r > _90 ? -n : n;
		x = 0;
		
	//handels first and fourth quadrant
	}else{

		x = Math.cos( this.a_r ) * n;
		y = Math.sin( this.a_r ) * n;

	}
	
	vector.set( x, y );
	vector.addV( this.pos );
		
	for( var u, k = cast_range.start.y; k < cast_range.end.y; k++ ) {
		for( u = cast_range.start.x; u < cast_range.end.x; u++ ) {
				
			if( map[k][u] && 
				checkCollision( new Vector( u * BOX_D, k * BOX_D ), vector) ) {
				
				this.far = n;
				this.end.copy( vector );
				this.collision = true;
				return true;
				
			}
				
			if( map[k][++u] && 
				checkCollision( new Vector( u * BOX_D, k * BOX_D ), vector) ) {
				
				this.far = n;
				this.end.copy( vector );
				this.collision = true;
				return true;
				
			}
			
			if( map[k][++u] && 
				checkCollision( new Vector( u * BOX_D, k * BOX_D ), vector) ) {
				
				this.far = n;
				this.end.copy( vector );
				this.collision = true;
				return true;
				
			}
			
			if( map[k][++u] && 
				checkCollision( new Vector( u * BOX_D, k * BOX_D ), vector) ) {
				
				this.far = n;
				this.end.copy( vector );
				this.collision = true;
				return true;
				
			}
			
			if( map[k][++u] && 
				checkCollision( new Vector( u * BOX_D, k * BOX_D ), vector) ) {
				
				this.far = n;
				this.end.copy( vector );
				this.collision = true;
				return true;
				
			}
			
		}
	}
	
	return false;
	
} 

//set ray properties
Ray.prototype.set = function( origin, angle_r, far ) {
	
	this.pos.copy( origin );
	this.a_r = angle_r;
	this.far = far;
	this.end = this.calcEnd();
	this.collision = false;
	
};

//creates a default end point to the ray
var v = new Vector(0,0);
Ray.prototype.calcEnd = function() {
  
	v.x = Math.cos( this.a_r ) * this.far;
	v.y = Math.sin( this.a_r ) * this.far;
	
	if( _90 < this.a_r && this.a_r < _180 ) {
		//this.quad = 2;
		v.x = v.x > 0 ? -v.x : v.x;
		v.y = v.y < 0 ? -v.y : v.y;
	} else if( _90 < this.a_r && this.a_r < _270 ) {
		//this.quad = 3;
		v.x = v.x > 0 ? -v.x : v.x;
		v.y = v.y > 0 ? -v.y : v.y;
	} 

	v.addV( this.pos );
    return v;
};

//this is actually used by drawLine() in game.js
Ray.prototype.calcEndQ = function( q ) {
	var v = new Vector(0,0);
  
	v.x = this.cos * this.far;
	v.y = this.sin * this.far;
	
	if( q == 2) {
		v.x = v.x > 0 ? -v.x : v.x;
		v.y = v.y < 0 ? -v.y : v.y;
	} else if( q == 3) {
		v.x = v.x > 0 ? -v.x : v.x;
		v.y = v.y > 0 ? -v.y : v.y;
	} else if( q == 4 ) {
		v.x = v.x < 0 ? -v.x : v.x;
		v.y = v.y > 0 ? -v.y : v.y;
	}
	
	v.addV( this.pos );
    return v;
};

//checks collision of rays with boxs for raycasting
var max_x, max_y;
function checkCollision( box_v, v ) {
	
	//box_v.addV( offset );
	max_x = box_v.x + BOX_D;
  	max_y = box_v.y + BOX_D;
  	
  	if( max_x >= v.x && v.x >= box_v.x )
  		 return ( max_y >= v.y && v.y >= box_v.y );
  		
  	return false;
	
}


/*********** 
 *
 *  rope.js 
 * 
 * *************/


var _bhalf = BOX_D * 0.5;
function Rappell( start, player_pos ) {
	
	if( start instanceof Rappell ) {
		
		this.start = new Vector( start.start );
		this.end = new Vector( start.end );
		this.ray = new Ray( this.end, _180, _bhalf );
		this.leftside = start.leftside;
		
	} else {
		
		this.start = new Vector( start );
		this.end = new Vector( start );
		this.ray = new Ray( this.end, _180, _bhalf );
		//this.leftside = this.ray.cast(); //rope is on left side of player
		this.leftside = (start.x < player_pos.x);

		//make the rope longer than the player
		this.end.y += BOX_D;
		
	}
	
}
Rappell.prototype.update = function( player_pos ) {
	if( (this.end.y - player_pos.y) < _bhalf ) { 
		
		this.end.copy( player_pos );
		this.ray.set( this.end, _90, _bhalf );
		if( !this.ray.cast() ) {
			this.end.y += _bhalf;
		} else {
			//the rope has hit the ground, stop rappelling
			this.end.y += this.ray.far;
			//TODO: we should move this elsewhere later
			player.rappelling = false;
			if( !inRopes( player.rope ) )
				player.ropes.push( new Rappell( player.rope ) );
		}
		
	}
}
Rappell.prototype.onRope = function( click ) {
	//go through every point on rope and compare with click
	var temp = new Vector( this.start );
	while( temp.y <= this.end.y ) {
		if( temp.distanceTo( click ) < 5 ) return temp;
		temp.y++
	}
	return false;
}
Rappell.prototype.equals = function( rope ) {
	return ( this.start == rope.start && this.end == rope.end );	
}
Rappell.prototype.draw = function() {
	
	ctx.strokeStyle = player.color;
	
	ctx.moveTo( this.start.x, this.start.y );
	ctx.lineTo( this.end.x, this.end.y );
		
	ctx.stroke();

}
Rappell.prototype.hookUp = function() {
	
	this.ray.set( this.start, _270, BOX_D * 0.9 );
	
	if( this.ray.cast() ) return false; //hooking rope to close to cieling
	
	this.ray.set( this.start, _90, BOX_D * 0.9 );
	
	if( this.ray.cast() ) return false; //hooking rope to close to floor
	
	if( this.leftside ) {
		
		this.ray.set( this.start, _180, BOX_D );
		if( this.ray.cast() ) return false; //theres a wall to the left of the hook
		this.ray.set( this.start, _45, BOX_D*0.75 );
		if( this.ray.cast() ) return false; //no wall behind and below point
		
	} else {
		
		this.ray.set( this.start, 0, BOX_D );
		if( this.ray.cast() ) return false; //theres a wall to the left of the hook
		this.ray.set( this.start, _135, BOX_D*0.75 );
		if( this.ray.cast() ) return false; //no wall behind and below point
		
	}
	
	return true;
}

//checks if rope is in player.ropes array
function inRopes( r ) {
	
	if( player.ropes.length === 0 ) return false;
	
	for( var n = player.ropes.length - 1; n >= 0; n-- ) {
		if( player.ropes[n].equals( r ) ) return true;
	}
	
	return false;
}


/*********** 
 *
 *  player.js 
 * 
 * *************/

var player_ray = new Ray( new Vector(0,0), 0, 0 ),
	temp_v = new Vector(0,0);
var left, right, 
	G = 9.8 * 0.5;
var bounds = { left: 0, top: 1, right: 2, bot: 3, bot_left: 4, bot_right: 5,
	 top_left: 6, top_right: 7 };
var player = {
		    pos: new Vector( 210, 210 ),  //offset position
		    pos_real: function() { //regular position
				var temp = new Vector( 0, 0 );
				temp.copy( this.pos );
				temp.subV( offset );
				return temp;
		    },
		    setPos: function( v ) { //this actually sets the offset but who cares
		    	offset.set( player.pos.x - v.x, 
								player.pos.y - v.y );
		    },
            speed: 2,
            jumpvar: 2,
            rad: 5,
            r: 120,
            color: 'ffff00', //'yellow',
            angle: toRadians(225),
            a_offset: 15,
            quad: function(){ return getQuad( this.angle, true ); },
            draw: true,
            rappelling: false,
            rope: false,
            ropes: [],
            vy: 0,
            climbing: false,
            falling: false,
            fallfrom: map_h,
            ti: undefined, //initial time, start of fall 
            camp: false, //basically a checkpoint
            camps: [], //array of checkpoints
			bound: function( dir ) {
				var x = this.pos_real().x, y = this.pos_real().y;
				switch( dir ) {
					case 0:	//left
						x -= player.rad
					break;
					case 1:	//top
						y -= player.rad;
					break;
					case 2:	//right
						x += player.rad;
					break;
					case 3:	//bot
						y += player.rad;
					break;
					case 4: //bot left
						y += player.rad;
						x -= player.rad;
					break;
					case 5: //bot right
						y += player.rad;
						x += player.rad;
					break;
					case 6: //top left
						y -= player.rad;
						x -= player.rad;
					break;
					case 7: //top right
						y -= player.rad;
						x += player.rad;
					break;
				}
				return new Vector( x, y );
			},
			isFalling: function() {
				
				if( this.climbing || this.rappelling ) return false;
				
				left = canMove( this.bound( bounds.bot_left ), _90);
				right = canMove( this.bound( bounds.bot_right ), _90);

				if( left && right ) {
				
					this.falling = true;
					if( this.pos_real().y < this.fallfrom ) 
						this.fallfrom = this.pos_real().y;
					
				} else if( this.falling && ( !left || !right ) ) {
				
					this.falling = false;
					this.fallfrom = map_h;
					this.ti = undefined;
					this.vy = 0;
				
				}
				return this.falling;
			},
            fall: function( time ) {
				  if( this.pos_real().y < map_h-BOX_D ) {
					  
					  //start screaming
					  //scream( 1 );
					  
					  this.ti = this.ti || time;
					  var dt = (new Date().getTime() / 1000) - this.ti;
					  this.vy += (G*dt / 2);
					  
					  player_ray.set( this.bound( bounds.bot ), _90, this.vy );
					  
					  if( player_ray.cast() ) {
					  	
					  	this.falling = false;
					  	offset.y -= ( player_ray.far );
					  	
					  	if( ( this.pos_real().y - this.fallfrom ) >= 200 &&
					  	 this.fallfrom > 0 ) {
					  		this.death();
					  	
					  		//shut up
					  		//scream( 3 );
					  	
					  	}
						this.ti = undefined;
						this.vy = 0; //this.speed * this.jumpvar;
					  	this.fallfrom = 0;
					  	
					  } else {
					  	
					  	offset.y -= this.vy;
					  	//scream( 3 );
					  	
					  }
					  
					  this.draw = true;
					 
				}  
			},
			death: function() {
				
				player.color = "black";
				game = false;
				document.getElementById( "deadToast" ).className = "toast";
				
			},
			climb: function() {
					
				left = canMove( this.bound( bounds.left ), _180);
				right = canMove( this.bound( bounds.right ), 0);
				
				if( this.climbing ) {
					
					this.climbing = !( left && right );
					
					//move player onto edge when not climbing
					if( !this.climbing ) {
						
						if( !left ) {
							this.offset += this.rad;
						} else {
							this.offset -= this.rad;
						}
						
					}
					
				//initiate climbing
				} else {
					
					//climb down
					if( left && right ) {
						
						if( canMove( this.bound( bounds.bot_left ), _90 ) 
						 	|| canMove( this.bound( bounds.bot_right ), _90 ) ) {
						 	
						 	this.climbing = true;
						 	
						 }
					//climb up
					} else if( left || right ){
						
						if( canMove( this.bound( bounds.top_left ), _270 ) 
						 	|| canMove( this.bound( bounds.top_right ), _270 ) )
						 		this.climbing = true;
						
					}
				
				}
			},
			//if the player is trying to jump next to a wall than climb it
			doClimb: function() {
				player_ray.set( this.bound( bounds.top), _180, 10 );
				if( player_ray.cast() ) {
					this.climbing = true;
					this.setPos( new Vector( this.pos_real().x - player_ray.far*0.5,
											 this.pos_real().y ) );
				}
				player_ray.set( this.bound( bounds.top), 0, 10 );
				if( player_ray.cast() ){
					this.climbing = true;
					this.setPos( new Vector( this.pos_real().x + player_ray.far*0.5,
											 this.pos_real().y ) );
				}
				return this.climbing;
			},
			jump: function() {
				player_ray.set( this.bound(bounds.top), _270, 
														this.speed * this.jumpvar );
				
				if( player_ray.cast() ) {
					offset.y += ( player_ray.far ); 
				} else {
					offset.y += this.speed * this.jumpvar;
				}
			},
			buildCamp: function() {
				player_ray.set( this.bound(bounds.bot), _90, this.rad );
				if( player_ray.cast() ) {
					
					if( vectorIn( this.camps, this.pos_real() ) ) return false;
					if( !this.camp ) this.camp = true;
					
					//only to checkpoints can be set up
					if( this.camps.length >= 2 ) {
					
						var furthest = 0, distance = 0;
						for( var n=0; n < this.camps.length; n++ ) {
							
							if( this.pos_real().distanceTo( this.camps[n] ) >
							distance ) {
								distance = this.pos_real().distanceTo( this.camps[n] );
								furthest = n;
							}
						}
						//remove furthest camp by overwriting it
						this.camps[furthest].copy( new Vector( this.pos_real() ) )
						
					} else {
						
						this.camps.push( new Vector( this.pos_real() ) );
					
					}
					
				}
			},
			respawn: function() {
				var closest, distance = this.pos_real().distanceTo( spawn_v );
				
				if( !this.camps.length ) return false;
				
				for( var n = 0; n < this.camps.length; n++ ) {
					
					if( this.pos_real().distanceTo( this.camps[n] ) < distance ) {
						closest = n;
						distance = offset.distanceTo( this.camps[n] );
					}
				}
				
				temp_v.copy( this.pos );
				temp_v.subV( this.camps[closest] );
				offset.copy( temp_v );
				return true;
				
			},
			rappell: function( direction ) { //handels movement while rappelling
				switch( direction ) {
					case 87: //up
						if( this.pos_real().distanceTo( this.rope.start ) 
							< this.speed ) {
							this.rappelling = false;
							this.jump();
						} else {
							offset.y += this.speed;
						}
					break;
					case 65: //left
						this.rappelling = false;
						offset.x += this.speed;
					break;
					case 83: //down
						offset.y -= this.speed;
					break;
					case 68: //right
						this.rappelling = false;
						offset.x -= this.speed;
					break;
				}
				
				if( this.rappelling ) { 
					this.rope.update( this.pos_real() );
				} else {
					if( !inRopes( player.rope ) )
						this.ropes.push( new Rappell( this.rope ) );
				}
			},
			startTime: 0,
			battery: function() {
				var passed = (new Date().getTime() / 1000) - this.startTime;
				var colorNum = parseInt( this.color, 16 );
				colorNum--;
				this.color = colorNum.toString( 16 );
			},
			batteryOut: function() {
				if( this.a_offset <= 0 ) return;
				this.a_offset -= 0.0001;
			},
			move: function() {

				prev_offset.copy( offset );
				
				if(87 in keysDown) { //W key up, jump, start climbing up
					if( canMove( this.bound( 1 ), _270,  this.speed ) ) {
						if( !this.climbing && !this.rappelling ) {
							if( !this.doClimb() ) this.jump();
						} else if( this.rappelling ) { 
							this.rappell( 87 );	
						} else {
							offset.y += this.speed;
						}
					}
				}
				
				if(65 in keysDown) { //A key left
					 if( canMove( this.bound( 0 ), _180) ) {
					 	if( this.rappelling ) { 
							this.rappell( 65 );	
						} else {
					 		offset.x += this.speed;
					 	}
					 }
				}
				
				//S key down, start climbing down
				if(83 in keysDown && !this.falling ) { 
					if( canMove( this.bound( bounds.bot ), _90,  this.rad ) ) {
						if( this.rappelling ) { 
							this.rappell( 83 );	
						} else {
							offset.y -= this.speed;
						}
					}
				}
				
				if(68 in keysDown) { //D key right
					if( canMove( this.bound( 2 ), 0) ) {
						if( this.rappelling ) { 
							this.rappell( 68 );	
						} else {
							offset.x -= this.speed;
						}
					}
				}

				if(67 in keysDown) { //C key start climbing
					if( !this.falling && !this.climbing ) {
						this.climb();
					} else {
						this.climbing = false;
					}
				}
				
				if(32 in keysDown) this.buildCamp(); //space build camp
			
				if( this.climbing ) this.climb();
			
				//there is a lag with the updates here, rope is laggin behind
				//if( this.rappelling ) this.rope.update( this.pos_real() );
			
				this.draw = true;
			}
		};

//player movement collision detection happens here
var ray_move = new Ray( new Vector(0,0), 0, 0 );
var canMove = function( v, angle, rad ){
	var move = false;

  	ray_move.set( v, angle, rad || player.rad*0.5 );
  	move = !ray_move.cast()
  	
  	return move;
  	
};


/*********** 
 *
 *  game.js 
 * 
 * *************/

var spawn = new Box( new Vector( 0, 0 ), 0, 0, 0 );       
            
//mouse and keyboard events
var click = false;
cnvs.onmousedown = function(e){
	e.preventDefault();
	var cord = getCords(cnvs, e.clientX, e.clientY);
	
	//can only hook rappell rope to near by box
	if( cord.distanceTo( player.pos ) < BOX_D ) {
		
		spawn.pos.offset( BOX_D*0.5, BOX_D*0.5 );
		if( player.pos_real().distanceTo( spawn.pos ) < (BOX_D*0.5) ) {
			
			document.getElementById( "nextLvlToast" ).className = "toast";
			
		} else if( !player.rappelling && !player.falling ) {
			
			//offset cord
			cord.subV( offset );
			var temp = onRope( cord );
			if( temp ) {
				
				player.setPos( temp );
				
			} else {
			
				player.rope = new Rappell( cord, player.pos_real() );
				if( player.rope.hookUp() ) {
					player.setPos( player.rope.end );
					player.rope.end.y += _bhalf;
					player.rappelling = true;
					player.draw = true;
				}
				
			}
		} else if( player.rappelling ){
			
			player.rappelling = false;
			if( !inRopes( player.rope ) )
				player.ropes.push( new Rappell( player.rope ) );
		
		}
		
		spawn.pos.offset( -BOX_D*0.5, -BOX_D*0.5 );

	}
};

cnvs.onmousemove = function(e){
  e.preventDefault();
  var cord = getCords(cnvs, e.clientX, e.clientY);
  cord.subV( offset );
  
  player.angle = toRadians( getAngle( player.pos_real(), cord ) );
  player.draw = true;
  
};

//keyboard event listeners
var keysDown = {}, moved = false;
function keydown(e) { 
	e.preventDefault();
	keysDown[e.keyCode] = true;
	moved = true;
}
function keyup(e) { 
	delete keysDown[e.keyCode];
	moved = false;
}

addEventListener("keydown", keydown, false);
addEventListener("keyup", keyup, false);

var update = function() {
	
	if( player.isFalling() ) player.fall( new Date().getTime() / 1000 );
	
	if( moved ) {
		player.move();
		//AudioPlayer( audio.footStep );
	}

	//not the effect we wanted
	//player.battery();
	player.batteryOut();
}

//draws player
var tempv = new Vector( 0, 0 );
var draw = function(){

	if(player.draw){

		 draw_window.copy( player.pos_real() );
		 draw_window.offset( -(player.r+5), -(player.r+5) );
		 draw_x = draw_y = (player.r+10)*2;
		 draw_end.set( draw_x, draw_y );
		 draw_end.addV( draw_window );
		 
		 ctx.clearRect( 0, 0, w, h );
		
		 //offset canvas
		 ctx.save();
		 
		 ctx.translate( offset.x, offset.y );
		 //ctx.clearRect( draw_window.x, draw_window.y, draw_x, draw_y );
		 
		 if( draw_map ) drawMap( BOX_D );
		 drawOutLine();
		 
		 //draw spawn box/entrance/exit
		 spawn.draw( "yellow" );
		 
		 //draw ropes
		 if( player.rappelling ) player.rope.draw();
		 if( player.ropes.length ) drawRopes();
		 //easier than make a functiont that only draws the visible portion of 
		 //a rope :D
		 ctx.clearRect( 0, 0, w, draw_window.y ); //clear top
		 ctx.clearRect( 0, 0, draw_window.x, h ); //clear left
		 ctx.clearRect( 0, draw_end.y, w, h ); //clear bot
		 ctx.clearRect( draw_end.x, 0, w, h ); //clear right
		 
		 //draw checkpoints
		 if( player.camp ) drawCamps();
		 
		 ctx.restore();
		      
		 //draw light cone
		 ctx.save();
		 
		 //drawCone( player.pos, player.angle, player.r, player.a_offset );
		 drawCone( player.pos_real(), player.angle, player.r, player.a_offset );
		
		 ctx.restore();
		
		 player.draw = false;
		 
	}	

};

//draws each beam of light, ray
var ray_light = new Ray( new Vector(0,0), 0, 0 );
var skip = false;
var draw_outline = false;
function drawLine(v, angle, r) {
	//var temp = new Vector(v );
	ray_light.set( v, angle, r );
	ray_light.cast();
    
    //offset the ray vectors after it has been cast
    v.addV( offset );
    ray_light.end.addV( offset );
    
    //draw ray
    ctx.beginPath();
    ctx.moveTo( v.x, v.y );
   	ctx.lineTo( ray_light.end.x, ray_light.end.y );
    ctx.closePath();
    ctx.stroke();
     
    //add to outline on ray callision
    if( player.a_offset <= 0 ) return; //lights are off dont draw any more dots
    if( ray_light.collision && draw_outline ) { 
    	
    	ray_light.end.subV( offset );
	    ray_light.end.x = Math.floor( ray_light.end.x );
	    ray_light.end.y = Math.floor( ray_light.end.y );
		
		if( !vectorIn( outline, ray_light.end ) ) 
	    		outline.push( new Vector( ray_light.end.x, ray_light.end.y ) );
    	
    }
    
}

//calls drawLine to create light cone
function drawCone(v, angle, r, a_offset) {
    var a = toDegrees(angle);
    
    ctx.strokeStyle = player.color;
    
    //i hate how everything passed in java is by refrence, sucks :(
    for( var n = a - a_offset; n <= a + a_offset; n++) {
    	drawLine( new Vector( v ), toRadians(n), r );
    }
    
}

//draw outline of cave using outline[]
function drawOutLine() {
	
	if( outline.length === 0 ) return false;
	
	ctx.fillStyle = "gray";
	
	for( var n = outline.length-1; n >= 0; n-- ) {
		
		if( outline[n].x < draw_window.x || outline[n].y <  draw_window.y ) continue;
		if( draw_end.x < outline[n].x || draw_end.y < outline[n].y ) continue;
		
		ctx.fillRect( outline[n].x, outline[n].y, 1, 1 );
		
	}
	
}

//draws campsite, checkpoint
function drawCamp( v ) {

	ctx.fillStyle = 'yellow';
	ctx.beginPath();
	ctx.arc(v.x, v.y, player.rad, 0, Math.PI*2,
             false);
	ctx.stroke();
	ctx.fill();
	ctx.closePath();
	
}

//draw all camps
function drawCamps() {
	
	for( var n = player.camps.length-1; n >= 0; n-- ) {
		drawCamp( player.camps[n] );	
	}
	
}

//draws ropes that player rappelled with
function drawRopes() {
	for( var n = player.ropes.length-1; n >= 0; n-- ){
		if( player.ropes[n].start.distanceTo( player.pos_real() ) < 200 
		|| player.ropes[n].end.distanceTo( player.pos_real() ) < 200 ) {
			player.ropes[n].draw();
		}
	}	
}

//check if mouse click is next to any ropes
function onRope( click ) {
	var temp;
	for( var n = player.ropes.length-1; n >= 0; n-- ){
		temp = player.ropes[n].onRope( click );
		if( temp ) {
			player.rope = player.ropes[n];
			player.rappelling = true;
			return temp;
		}
		//}
	}
	return false;
}

//get map row and collumn indexes within the reach of the light, cone
function getMapRange( v, distance ) {

	var start = new Vector(0, 0),
		  end = new Vector(0, 0);
	var x, y;
	
	//floor so that we don't lleave any rows and collumns out
	x = Math.floor( ( v.x - distance ) / BOX_D );
	y = Math.floor( ( v.y - distance ) / BOX_D );
	start.x = x < 0 ? 0 : x;
	start.y = y < 0 ? 0 : y;
	
	//round so that we have an extra buffer of rows and collumnswd
	x = Math.round( ( v.x + distance ) / BOX_D );
	y = Math.round( ( v.y + distance ) / BOX_D );
	end.x = x > size_x ? size_x : x;
	end.y = y > size_y ? size_y : y;
	
	return { start: start, end: end };

}


//find an empty square in top left cornor to spawn in
function getSpawnVector() {
	var walls = 0;
	//ignore edge boxes that are adjacent to wall sorounding map
	for( r = 1; r < size_y; r++ ) {
    	for( c = 1; c < size_x; c++ ){
    	
      		if( map[r][c] === TILE_FLOOR ) {
      			
      			if( map[r+1][c] === TILE_WALL ) {
      				spawn.set( (c * BOX_D), (r * BOX_D), BOX_D, 0 );
      				spawn_v.set( c, r );
      				return new Vector( spawn.pos.x + BOX_D*0.5, spawn.pos.y + BOX_D*0.5 );
      			}
      		}
      
    	}
  	}
}


//sound
var background_audio = new Audio( "static/Background.mp3" );
background_audio.loop = true;
background_audio.volume = 1;
background_audio.load();

/*
var audio = {
	footStep: 0,
	fall: 1
};

var sounds = [];

function initSounds() {
	//var footStep = new Audio( "static/FootStep2.mp3" );
	//footStep.volume = 0.25;
	//footStep.load();
	
	var falling = new Audio( "static/Falling.mp3" );
	falling.volume = 1;
	falling.loop = true;
	falling.load();
	
	sounds.push( footStep );
	sounds.push( falling );
}

function AudioPlayer( audio ) {
	if( !sound ) return;
	if( sounds.length > 0 ) {
		
		if( sounds[ audio ].currentTime == 0 || sounds[ audio ].ended ) 
			sounds[ audio ].play();
	
	}
}

function scream( arg ) {
	if( sounds[ audio.fall ].currentTime  != 0 && !sounds[ audio.fall ].ended ) 
		return;
	switch( arg ) {
	case 1:
		AudioPlayer( audio.fall );
	break;
	case 2:
		sounds[ audio.fall ].currentTime = 1;
	break;
	case 3:
		sounds[ audio.fall ].currentTime = 0;
		sounds[ audio.fall ].pause();
	break;
	}
}
*/

//start
var game = false,
	sound = true;
function init(){

    do {
    		
		ctx.clearRect( 0, 0, w, h );
		createMap( BOX_D );	
		outline.length = 0;
		
		player.pos.copy( getSpawnVector() );
	    player.color = "yellow";
    	
    } while( !checkMap( spawn_v ) ); 
    
    offset.set( w * 0.5, h * 0.5 ),
    offset.subV( player.pos );
    player.pos.addV( offset );
    player.camps = [];
    player.ropes.length = 0;
    player.startTime = (new Date().getTime() / 1000);
    player.color = 'ffff00';
    player.a_offset = 15;
    
 	//if( sounds.length == 0 )
 		//initSounds();
    background_audio.play();
    	
	document.getElementById( "introToast" ).className = "invis";
	game = true;
	if( game ) setInterval(main, 1);
}

var main = function(){
	var temp = new Vector( 0, 0 );
	temp.copy( player.pos );
	temp.subV( offset );
	if( !game ) return false;
	
    cast_range = getMapRange( temp, player.r );
  	update();
  	draw();

};
