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
var offset = new Vector( 0, 0 ),
	prev_offset = new Vector( 0, 0 );

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
var player_ray = new Ray( new Vector(0,0), 0, 0 );
var left, right;
var player = {pos: new Vector( 210, 210 ),  //offset position
		   pos_real: function () { 
		   		var temp = new Vector( 0, 0 ); //regular position
		   		temp.copy( this.pos );
		   		temp.subV( offset );
		   		return temp;
		   },
           speed: 10,
           rad: 10,
           r: 120,
           color: 'yellow',
           angle: toRadians(225),
           a_offset: 15,
           quad: function(){ return getQuad( this.angle, true ); },
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
					  
					  player_ray.set( new Vector( this.pos.x, this.pos.y+this.rad ),
					  	_90, this.vy );
					  if( player_ray.cast() ) {
					  	this.falling = false;
					  	this.pos.y += player_ray.far;
					  	
					  	if( ( this.pos.y - this.fallfrom ) >= 120 ) this.death();
					  	
					  } else {
					  	this.pos.y += this.vy;
					  }
					 
				}  
			},
			bound: function( dir ) {
				var x = player.pos.x, y = player.pos.y;
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
				}
				return new Vector( x, y );
			},
			isFalling: function() {
				
				if( this.climbing.is ) return false;
				
				player_ray.set( new Vector( this.pos.x+this.rad, this.pos.y+this.rad ),
				 										_90, this.rad );
				right = !player_ray.cast();
				player_ray.set( new Vector( this.pos.x-this.rad, this.pos.y+this.rad ),
				 										_90, this.rad );
				left = !player_ray.cast();
				
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
				
				player.color = "black";
				game = false;
				document.getElementById( "deadToast" ).className = "toast";
				
			}
		};

//player movement collision detection happens here
var ray_move = new Ray( new Vector(0,0), 0, 0 );
var canMove = function( v, angle, rad ){
	var move = false;
  	ray_move.set( v, angle, rad || player.rad );
  	move = !ray_move.cast()
  	
  	if( player.rappelling && move ) {
  		
  		if( angle == _90 || angle == _270 ) return true;
  		if( player.rope.length > player.rope.start.distanceTo( player.pos ) ) {
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
	if( cord.distanceTo( player.pos ) < BOX_D ) {
		
		//if( player.pos.distanceTo( spawn.pos ) < (BOX_D*2) ) {
		if( player.pos_real().distanceTo( spawn.pos ) < (BOX_D*2) ) {
			document.getElementById( "nextLvlToast" ).className = "toast";
			return false;
		}
		
		//cant rappell while rappelling
		if( !player.rope_draw ) {
			
			player.rope.set( cord, player.pos );
			player.rope.draw();
			player.rope_draw = true;
			
		} else {
			
			player.rope_draw = false;
			player.rappelling = false;
			
		}
	}
};

cnvs.onmousemove = function(e){
  e.preventDefault();
  var cord = getCords(cnvs, e.clientX, e.clientY);
  
  player.angle = toRadians( getAngle( player, cord ) );

  player.draw = true;
  player.draw = true;
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

  player.isFalling();
  player.prev.copy( player.pos );
  
  	//A key left
  	if(65 in keysDown){ 
    	if( canMove( player.bound( 0 ), _180) ){
    		player.pos.x -= player.speed;
        	
        	if( player.climbing.is && !player.climbing.left_edge ) player.climbing.is = false;
        	
        	player.draw = true;
		
    	}
  	}

	//W key up/jump
  	if(87 in keysDown){ 
  		if( !player.climbing.is ) {
  			if( canMove( player.bound( 1 ), _270,  player.speed ) ) {
  				
  				if( !canMove( new Vector( player.pos.x - player.rad, player.pos.y - player.rad ), _180 ) ) {
  					player.pos.y -= player.speed;
		        	player.climbing.is = true;
		    		player.climbing.left_edge = true;
		        	player.draw = true;
  				} else if ( !canMove( new Vector( player.pos.x + player.rad, player.pos.y - player.rad ), 0 ) ) {
  					player.pos.y -= player.speed;
		    		player.climbing.is = true;
		    		player.climbing.left_edge = false;
		        	player.draw = true;
  				} else {
  					if( canMove( player.bound( 1 ), _270,  player.speed*4 ) ) {
	        			player.pos.y -= player.speed*4;
	        			player.draw = true;
	        		} 
	        	}
			}
  		} else {
  			if( canMove( player.bound( 1 ), _270,  player.speed ) ) {
	        	player.pos.y -= player.speed;
	        	player.draw = true;
	        	
	        	if( canMove( new Vector( player.pos.x + player.rad, player.pos.y - player.rad ), 0 ) 
	        		&& !player.climbing.left_edge ) {
	        		player.climbing.is = false; 
	       		} else if( canMove( new Vector( player.pos.x - player.rad, player.pos.y - player.rad ), _180 )
	       			&& player.climbing.left_edge ) {
	       			player.climbing.is = false; 	
	       		}
			}
  		}
  	}
  
  	//S key down, start climbing down
  	if(83 in keysDown ){ 
  		if( !player.climbing.is ) {
  			//climbing a wall on the right side
	  		if( canMove( new Vector( player.pos.x, player.pos.y + player.rad ), _90,  player.rad*0.5 ) 
	  			&& !canMove( new Vector( player.pos.x - player.rad, player.pos.y + player.rad ),
	    	 _90,  player.rad*0.5 ) ) {
	        	player.pos.y += player.speed;
	        	player.climbing.is = true;
	    		player.climbing.left_edge = false;
	        	player.draw = true;
	       	//climbing a wall on the left side
	    	} else if( canMove( new Vector( player.pos.x, player.pos.y + player.rad ), _90,  player.rad*0.5 ) 
	    	&& !canMove( new Vector( player.pos.x+player.rad, player.pos.y + player.rad ), _90,  player.rad*0.5 ) ) { 		
	    		player.pos.y += player.speed;
	    		player.climbing.is = true;
	    		player.climbing.left_edge = true;
	        	player.draw = true;
	    	}
    	} else {
  			//climbing a wall on the right side
    		if( canMove( new Vector( player.pos.x, player.pos.y + player.rad ), _90,  player.rad*0.5 ) 
	  			&& !canMove( new Vector( player.pos.x + player.rad, player.pos.y + player.rad ), 0 ) ) {
	        	player.pos.y += player.speed;
	        	player.climbing.is = true;
	    		player.climbing.left_edge = false;
	        	player.draw = true;
	       	//climbing a wall on the left side
	    	} else if( canMove( new Vector( player.pos.x, player.pos.y + player.rad ),
	    	 _90,  player.rad*0.5 ) && 
	    	 !canMove( new Vector( player.pos.x - player.rad, player.pos.y + player.rad ), _180 )) { 		
	    		player.pos.y += player.speed;
	    		player.climbing.is = true;
	    		player.climbing.left_edge = true;
	        	player.draw = true;
	    	} else {
	    		player.climbing.is = false; 
	    	}
    	}
  	}
  
	//falling 
  	if( player.falling && !player.rappelling ) {
    	if( canMove( player.bound( 3 ), _90, player.rad*0.5 ) ){
        
        	player.fall( new Date().getTime() / 1000 );
        	player.draw = true;
        
	    }else{
	    	player.vy = 0;
	    	player.falling = false;
	    	player.ti = undefined;
	    }
	}else{
		player.vy = 0;
		player.falling = false;
	    player.ti = undefined;
	}
 
	//D key right
	if(68 in keysDown){ 
		if( canMove( player.bound( 2 ), 0) ){
			player.pos.x += player.speed;
			player.draw = true;
			
			if( player.climbing.is && player.climbing.left_edge ) player.climbing.is = false;
		}
 	}
  

};


var update = function() {
	
	if( moved ) prev_offset.copy( offset );
	
	if(65 in keysDown) { //A key left
		 if( canMove( player.bound( 0 ), _180) ){
		 	offset.x += player.speed;
		 }
	}
	
	if(87 in keysDown) { //W key up/jump
		if( canMove( player.bound( 1 ), _270,  player.speed ) ) {
			offset.y += player.speed;
		}
	}
		
	if(83 in keysDown ) { //S key down, start climbing down
		if( canMove( new Vector( player.pos.x, player.pos.y + player.rad ), _90,  player.rad ) ) {
			offset.y -= player.speed;
		}
	}
	
	if(68 in keysDown) { //D key right
		if( canMove( player.bound( 2 ), 0) ){
			offset.x -= player.speed;
		}
	}
	
	if( !prev_offset.equals( offset ) ) {
		player.draw = true;
		moved = false;
	}
}


//draws player
var tempv = new Vector( 0, 0 );
var draw = function(){

	if(player.draw){

		 draw_window.copy( player.pos );
		 draw_window.subV( offset );
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
		 
		 ctx.restore();
		      
		 //draw light cone
		 ctx.save();
		 
		 //tempv.copy( player.pos );
		 drawCone( player.pos, player.angle, player.r, player.a_offset );
		
		 ctx.restore();
		
		 player.draw = false;
		 
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
	    //temp.set( Math.ceil( ray_light.end.x ), Math.ceil( ray_light.end.x ) )
	    ray_light.end.x = Math.floor( ray_light.end.x );
	    ray_light.end.y = Math.floor( ray_light.end.y );
		
		/**
		skip = !skip; 
		if( skip ) {
			return;
		}
		**/
		
		if( !vectorIn( outline, ray_light.end ) ) //&&  !vectorIn( outline, temp ) )
	    		outline.push( new Vector( ray_light.end.x, ray_light.end.y ) );
    	
    }
    
}

//calls drawLine to create light cone
function drawCone(v, angle, r, a_offset) {

    var a = toDegrees(angle);
    
    ctx.strokeStyle = player.color;
    
    
    for( var n = a - a_offset; n <= a + a_offset; n++) {
    	drawLine( v, toRadians(n), r );
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

//start
var game = false;
function init(){

    do {
    		
		//setting up map
		ctx.clearRect( 0, 0, w, h );
		createMap( BOX_D );	
		outline.length = 0;
		
		//setting up player
		player.pos.copy( getSpawnVector() );
	    player.color = "yellow";
    	
    } while( !checkMap( spawn_v ) ); //check the map
    
    offset.set( w * 0.5, h * 0.5 ),
    offset.subV( player.pos );
    prev_offset.copy( offset );
    player.pos.addV( offset );
    
    //lets a'go!
	document.getElementById( "introToast" ).className = "invis";
	game = true;
	if( game ) setInterval(main, 1);
}

//update loop
var main = function(){
	var temp = new Vector( 0, 0 );
	temp.copy( player.pos );
	temp.subV( offset );
	if( !game ) return false;
	
	//it was fing cast_range all along :(
    cast_range = getMapRange( temp, player.r );
  	update();
  	draw();
  	
};
