/**
 * @author Work
 * The main game file, where everything comes together and where the canvas is created.
 */
var cnvs = document.createElement('canvas');
var ctx = cnvs.getContext('2d'),
	canvas_vector = new Vector( 200, 200 );
var map = [],
	temp_map = [],
	outline = [],
	map_h, map_w, 
	BOX_D = 30,
	draw_map = false;
	spawn = new Box( new Vector( 0, 0 ), 0, 0, 0 ),
	spawn_v = new Vector( 0, 0 );
var real_x = ( BOX_D * size_x ),
	real_y = ( BOX_D * size_y );
var w = real_x > document.width ? real_x : document.width,
	h = real_y > document.height ? real_y : document.height;
	w = 1500, h = 700;
var offset = new Vector( w * 0.5, h * 0.5 ),
	prev_offset = new Vector( w * 0.5, h * 0.5 );;

var G = 9.8,
    wall = map_h-100;
    
var draw_window = new Vector( 0, 0 ),
	draw_end =  new Vector( 0, 0 ),
	draw_x = 0,
	draw_y = 0;
var cast_range;

cnvs.width = w;
cnvs.height = h;
document.body.appendChild(cnvs);

//player object
var dot_ray = new Ray( new Vector(0,0), 0, 0 );
var left, right;
var dot = {pos: new Vector( 210, 210 ),
		   prev: new Vector( 210, 210 ),
           rad: 5,
           speed: 10,
           draw: true,
           vy: 0,
           climbing: { is: false, left_edge: false },
           falling: false,
           fallfrom: map_h,
           fall: function( time, newtime ) {
				  if( this.pos.y < map_h-BOX_D ) {
					  this.ti = this.ti || time;
					  var dt = (new Date().getTime() / 1000) - this.ti;
					  this.vy = (G*dt / 1);
					  
					  dot_ray.set( new Vector( this.pos.x, this.pos.y+this.rad ),
					  	_90, this.vy );
					  if( dot_ray.cast() ) {
					  	this.falling = false;
					  	this.pos.y += dot_ray.far;
					  	
					  	if( ( this.pos.y - this.fallfrom ) >= 120 ) this.death();
					  	
					  } else {
					  	this.pos.y += this.vy;
					  }
					 
				}  
			},
			bound: function( dir ) {
				var x = dot.pos.x, y = dot.pos.y;
				switch( dir ) {
					case 0:	//left
						x -= dot.rad
					break;
					case 1:	//top
						y -= dot.rad;
					break;
					case 2:	//right
						x += dot.rad;
					break;
					case 3:	//bot
						y += dot.rad;
					break;
				}
				return new Vector( x, y );
			},
			isFalling: function() {
				
				if( this.climbing.is ) return false;
				
				dot_ray.set( new Vector( this.pos.x+this.rad, this.pos.y+this.rad ),
				 										_90, this.rad );
				right = !dot_ray.cast();
				dot_ray.set( new Vector( this.pos.x-this.rad, this.pos.y+this.rad ),
				 										_90, this.rad );
				left = !dot_ray.cast();
				
				if( left && right ) {
					this.falling = true;
					if( this.pos.y < this.fallfrom ) this.fallfrom = this.pos.y;
					if( this.rope_draw ) this.rappelling = true;
				} else if( this.falling && ( !left || !right ) ) {
					this.falling = false;
					this.fallfrom = map_h;
					if( this.rappeling ) this.rappelling = false;
				}
			},
			death: function() {
				
				cone.color = "black";
				game = false;
				document.getElementById( "deadToast" ).className = "toast";
				
			}
		};

//cone, light object
var cone = {pos: dot.pos,
			real: new Vector( 0, 0 ),
            r: 120,
            color: 'yellow',
            angle: toRadians(225),
            quad: function(){ return getQuad( this.angle, true ); },
            draw: true,
            offset: 15 };


//player movement collision detection happens here
var ray_move = new Ray( new Vector(0,0), 0, 0 );
var canMove = function( v, angle, rad ){
	var move = false;
  	ray_move.set( v, angle, rad || dot.rad );
  	move = !ray_move.cast()
  	
  	if( dot.rappelling && move ) {
  		
  		if( angle == _90 || angle == _270 ) return true;
  		if( dot.rope.length > dot.rope.start.distanceTo( dot.pos ) ) {
  			return true;
  		}
  		if( angle == _180 || angle == 0 ) { //swing left and right
  			return true;
  		}
  		
  	}
  	return move;
  	
};


//mouse and keyboard events
var click = false;
cnvs.onmousedown = function(e){
	e.preventDefault();
	var cord = getCords(cnvs, e.clientX, e.clientY);
	
	//can only hook rappell rope to near by box
	if( cord.distanceTo( dot.pos ) < BOX_D ) {
		
		if( dot.pos.distanceTo( spawn.origin ) < (BOX_D*2) ) {
			document.getElementById( "nextLvlToast" ).className = "toast";
			return false;
		}
		
		//cant rappell while rappelling
		if( !dot.rope_draw ) {
			
			dot.rope.set( cord, dot.pos );
			dot.rope.draw();
			dot.rope_draw = true;
			
		} else {
			
			dot.rope_draw = false;
			dot.rappelling = false;
			
		}
	}
};

cnvs.onmousemove = function(e){
  e.preventDefault();
  var cord = getCords(cnvs, e.clientX, e.clientY);
  
  cone.angle = toRadians( getAngle( cone, cord ) );

  cone.draw = true;
  dot.draw = true;
};

//keyboard event listeners
var keysDown = {},
	moved = false;
function keydown(e) { 
	keysDown[e.keyCode] = true;
	moved = true;
}
addEventListener("keydown", keydown, false);

function keyup(e) { delete keysDown[e.keyCode]; }
addEventListener("keyup", keyup, false);


//updates player position
var update1 = function(){

  dot.isFalling();
  dot.prev.copy( dot.pos );
  
  	//A key left
  	if(65 in keysDown){ 
    	if( canMove( dot.bound( 0 ), _180) ){
    		dot.pos.x -= dot.speed;
        	
        	if( dot.climbing.is && !dot.climbing.left_edge ) dot.climbing.is = false;
        	
        	dot.draw = true;
		
    	}
  	}

	//W key up/jump
  	if(87 in keysDown){ 
  		if( !dot.climbing.is ) {
  			if( canMove( dot.bound( 1 ), _270,  dot.speed ) ) {
  				
  				if( !canMove( new Vector( dot.pos.x - dot.rad, dot.pos.y - dot.rad ), _180 ) ) {
  					dot.pos.y -= dot.speed;
		        	dot.climbing.is = true;
		    		dot.climbing.left_edge = true;
		        	dot.draw = true;
  				} else if ( !canMove( new Vector( dot.pos.x + dot.rad, dot.pos.y - dot.rad ), 0 ) ) {
  					dot.pos.y -= dot.speed;
		    		dot.climbing.is = true;
		    		dot.climbing.left_edge = false;
		        	dot.draw = true;
  				} else {
  					if( canMove( dot.bound( 1 ), _270,  dot.speed*4 ) ) {
	        			dot.pos.y -= dot.speed*4;
	        			dot.draw = true;
	        		} 
	        	}
			}
  		} else {
  			if( canMove( dot.bound( 1 ), _270,  dot.speed ) ) {
	        	dot.pos.y -= dot.speed;
	        	dot.draw = true;
	        	
	        	if( canMove( new Vector( dot.pos.x + dot.rad, dot.pos.y - dot.rad ), 0 ) 
	        		&& !dot.climbing.left_edge ) {
	        		dot.climbing.is = false; 
	       		} else if( canMove( new Vector( dot.pos.x - dot.rad, dot.pos.y - dot.rad ), _180 )
	       			&& dot.climbing.left_edge ) {
	       			dot.climbing.is = false; 	
	       		}
			}
  		}
  	}
  
  	//S key down, start climbing down
  	if(83 in keysDown ){ 
  		if( !dot.climbing.is ) {
  			//climbing a wall on the right side
	  		if( canMove( new Vector( dot.pos.x, dot.pos.y + dot.rad ), _90,  dot.rad*0.5 ) 
	  			&& !canMove( new Vector( dot.pos.x - dot.rad, dot.pos.y + dot.rad ),
	    	 _90,  dot.rad*0.5 ) ) {
	        	dot.pos.y += dot.speed;
	        	dot.climbing.is = true;
	    		dot.climbing.left_edge = false;
	        	dot.draw = true;
	       	//climbing a wall on the left side
	    	} else if( canMove( new Vector( dot.pos.x, dot.pos.y + dot.rad ), _90,  dot.rad*0.5 ) 
	    	&& !canMove( new Vector( dot.pos.x+dot.rad, dot.pos.y + dot.rad ), _90,  dot.rad*0.5 ) ) { 		
	    		dot.pos.y += dot.speed;
	    		dot.climbing.is = true;
	    		dot.climbing.left_edge = true;
	        	dot.draw = true;
	    	}
    	} else {
  			//climbing a wall on the right side
    		if( canMove( new Vector( dot.pos.x, dot.pos.y + dot.rad ), _90,  dot.rad*0.5 ) 
	  			&& !canMove( new Vector( dot.pos.x + dot.rad, dot.pos.y + dot.rad ), 0 ) ) {
	        	dot.pos.y += dot.speed;
	        	dot.climbing.is = true;
	    		dot.climbing.left_edge = false;
	        	dot.draw = true;
	       	//climbing a wall on the left side
	    	} else if( canMove( new Vector( dot.pos.x, dot.pos.y + dot.rad ),
	    	 _90,  dot.rad*0.5 ) && 
	    	 !canMove( new Vector( dot.pos.x - dot.rad, dot.pos.y + dot.rad ), _180 )) { 		
	    		dot.pos.y += dot.speed;
	    		dot.climbing.is = true;
	    		dot.climbing.left_edge = true;
	        	dot.draw = true;
	    	} else {
	    		dot.climbing.is = false; 
	    	}
    	}
  	}
  
	//falling 
  	if( dot.falling && !dot.rappelling ) {
    	if( canMove( dot.bound( 3 ), _90, dot.rad*0.5 ) ){
        
        	dot.fall( new Date().getTime() / 1000 );
        	dot.draw = true;
        
	    }else{
	    	dot.vy = 0;
	    	dot.falling = false;
	    	dot.ti = undefined;
	    }
	}else{
		dot.vy = 0;
		dot.falling = false;
	    dot.ti = undefined;
	}
 
	//D key right
	if(68 in keysDown){ 
		if( canMove( dot.bound( 2 ), 0) ){
			dot.pos.x += dot.speed;
			dot.draw = true;
			
			if( dot.climbing.is && dot.climbing.left_edge ) dot.climbing.is = false;
		}
 	}
  

};


var update = function() {
	
	if( moved ) prev_offset.copy( offset );
	
	if(65 in keysDown) { //A key left
		 if( canMove( dot.bound( 0 ), _180) ){
		 	offset.x += dot.speed;
		 }
	}
	
	if(87 in keysDown) { //W key up/jump
		if( canMove( dot.bound( 1 ), _270,  dot.speed ) ) {
			offset.y += dot.speed;
		}
	}
		
	if(83 in keysDown ) { //S key down, start climbing down
		if( canMove( new Vector( dot.pos.x, dot.pos.y + dot.rad ), _90,  dot.rad ) ) {
			offset.y -= dot.speed;
		}
	}
	
	if(68 in keysDown) { //D key right
		if( canMove( dot.bound( 2 ), 0) ){
			offset.x -= dot.speed;
		}
	}
	
	if( !prev_offset.equals( offset ) ) {
		dot.draw = true;
		moved = false;
	}
}


//draws player
var tempv = new Vector( 0, 0 );
var draw = function(){

	if(dot.draw){

		 //draw_window.set( dot.prev.x - (cone.r+5), dot.prev.y - (cone.r+5) );
		 //draw_window.subV( offset );
		 draw_window.set( prev_offset.x , prev_offset.y );
		 //draw_window.subV( offset );
		 draw_x = draw_y = (cone.r+10)*2;
		 draw_end.set( draw_x, draw_y );
		 draw_end.addV( draw_window );
		 draw_end.addV( offset );
		 
		 //ctx.clearRect( draw_window.x, draw_window.y, draw_x, draw_y );
		
		 ctx.clearRect( 0, 0, w, h );
		
		 //offset canvas
		 ctx.save();
		 
		 ctx.translate( offset.x, offset.y );
		 
		 if( draw_map ) drawMap( BOX_D );
		 drawOutLine();
		 //wctx.moveTo( 0, 100 );
		 
		 //draw spawn box/entrance/exit
		 spawn.draw( "yellow" );
		 
		 ctx.restore();
		      
		      
		 //draw map, player and rope
		 ctx.save();
		 
		 tempv.copy( cone.pos );
		 //tempv.addV( offset );
		 drawCone( tempv, cone.angle, cone.r, cone.offset );
		
		 ctx.restore();
		
		 dot.draw = false;
		 
	}	

};

//draws each beam of light, ray
var ray_light = new Ray( new Vector(0,0), 0, 0 );
var skip = false;
function drawLine(v, angle, r) {
	var temp = new Vector( 0, 0 );
	ray_light.set( v, angle, r );
	ray_light.cast();
    
    ctx.beginPath();
    ctx.moveTo( v.x, v.y );
   	ctx.lineTo( ray_light.end.x, ray_light.end.y );
    ctx.closePath();
    ctx.stroke();
     
    if( ray_light.collision ) { 
    	
    	ray_light.end.subV( offset );
	    temp.set( Math.ceil( ray_light.end.x ), Math.ceil( ray_light.end.x ) )
	    ray_light.end.x = Math.floor( ray_light.end.x );
	    ray_light.end.y = Math.floor( ray_light.end.y );
		
		skip = !skip; 
		if( skip ) {
			return;
		}
		
		if( !vectorIn( outline, ray_light.end ) &&  !vectorIn( outline, temp ) )
	    		outline.push( new Vector( ray_light.end.x, ray_light.end.y ) );
    	
    }
    
}

//calls drawLine to create light cone
function drawCone(v, angle, r, a_offset) {
	var temp = new Vector( 0, 0 );
    var a = toDegrees(angle);
    
    temp.copy(v)
    //temp.subV( offset );
    
    ctx.strokeStyle = cone.color;
    
    
    for( var n = a - a_offset; n <= a + a_offset; n++) {
    	drawLine( v, toRadians(n), r );
    }
	
}

//draw outline of cave using outline[]
function drawOutLine() {
	
	if( outline.length === 0 ) return false;
	
	ctx.fillStyle = "gray";
	
	for( var n = outline.length-1; n >= 0; n-- ) {
		
		//if( outline[n].x < draw_window.x || outline[n].y <  draw_window.y ) continue;
		//if( draw_end.x < outline[n].x || draw_end.y < outline[n].y ) continue;
		//if( outline[n].x > draw_window.x || outline[n].y >  draw_window.y ) continue;
		//if( draw_end.x > outline[n].x || draw_end.y > outline[n].y ) continue;
		
		ctx.fillRect( outline[n].x, outline[n].y, 1, 1 );
		
	}
	
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
      				return new Vector( spawn.origin.x + BOX_D*0.5, spawn.origin.y + BOX_D*0.5 );
      			}
      		}
      
    	}
  	}
}

//start
var game = false;
function init(){

    do {
    		
		//setting up map
		ctx.clearRect( 0, 0, w, h );
		createMap( BOX_D );	
		outline.length = 0;
		
		//setting up player
		dot.pos.copy( getSpawnVector() );
		dot.prev.copy( dot.pos );
	    cone.color = "yellow";
    	
    } while( !checkMap( spawn_v ) ); //check the map
    
    //cone.real.copy()
    offset.subV( dot.pos );
    dot.pos.addV( offset );
    //spawn.origin.addV( offset );
    
    //lets a'go!
	document.getElementById( "introToast" ).className = "invis";
	game = true;
	if( game ) setInterval(main, 1);
}

//update loop
var main = function(){
	var temp = new Vector( 0, 0 );
	temp.copy( cone.pos );
	//temp.subV( spawn_v );
	if( !game ) return false;
	
	//it was fing cast_range all along :(
    cast_range = getMapRange( temp, cone.r );
    cast_range.start.set( 0, 0 );
    cast_range.end.set( size_x, size_y );
  	update();
  	draw();
  	
};
