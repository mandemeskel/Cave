/**
 * @author Work
 * The main game file, where everything comes together and where the canvas is created.
 */
var cnvs = document.createElement('canvas');
var ctx = cnvs.getContext('2d');
var map = [],
	temp_map = [],
	outline = [],
	map_h, map_w, 
	BOX_D = 30,
	draw_map = false;
var real_x = ( BOX_D * size_x ),
	real_y = ( BOX_D * size_y );
var w = real_x > document.width ? real_x : document.width,
	h = real_y > document.height ? real_y : document.height;
cnvs.width = w;
cnvs.height = h;
document.body.appendChild(cnvs);
var G = 9.8,
    FLOOR = map_h-100;
    
var draw_window = new Vector( 0, 0 ),
	draw_end =  new Vector( 0, 0 ),
	draw_x = 0,
	draw_y = 0;
var cast_range;
	
//player object
var dot_ray = new Ray( new Vector(0,0), 0, 0 );
var left, right;
var dot = {pos: new Vector( 200, 200 ),
		   prev: new Vector( 200, 200 ),
           rad: 10,
           speed: 5,
           draw: true,
           vy: 0,
           //hp: 100,
           rappelling: false,
           rope: new Rope( 0, 0 ),
           falling: false,
           fall: function( time, newtime ) {
				  if( this.pos.y < map_h-BOX_D ) {
				  	  //if(newtime == true) this.ti = time;
					  this.ti = this.ti || time;
					  var dt = (new Date().getTime() / 1000) - this.ti;
					  this.vy = (G*dt / 1);
					  /**
					  dot_ray.set( new Vector( this.pos.x, this.pos.y+this.rad ),
					  	_90, this.vy );
					  if( dot_ray.cast()  ) {
					  	this.falling = false;
					  	return false;
					  }
					  **/
					  this.pos.y += this.vy; 
					  //if( this.vy > G ) this.hp -= ( this.vy * 1.5 );
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
			isFalling: function(){
				dot_ray.set( new Vector( this.pos.x+this.rad, this.pos.y+this.rad ),
				 										_90, this.vy );
				right = !dot_ray.cast();
				dot_ray.set( new Vector( this.pos.x-this.rad, this.pos.y+this.radd ),
				 										_90, this.vy );
				left = !dot_ray.cast();
				
				if( left && right ) {
					this.falling = true;
				} else if( this.falling && ( !left || !right ) ) {
					this.falling = false;
				}
			}
		};

//cone, light object
var cone = {pos: dot.pos, // new Vector( dot.pos.x, dot.pos.y),
            r: 150,
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
  		//if( angle == _180 || angle == 0 ) { //swing left and right
  			
  		//}
  		//return false;
  	}
  	return move;
  	
    //return !ray_move.cast(); 

};

//chesk if player is falling
/**
function isFalling(){
	var left, right;
	ray_move.set( new Vector( dot.pos.x+dot.rad, dot.pos.y+dot.rad ),
	 										_90, dot.rad*2 + dot.vy );
	right = !ray_move.cast();
	ray_move.set( new Vector( dot.pos.x-dot.rad, dot.pos.y+dot.rad ),
	 										_90, dot.rad*2 + dot.vy );
	left = !ray_move.cast();
	
	if( left && right ) dot.falling = true;
}
**/

//updates player position
var update = function(){
  //isFalling();
  dot.isFalling();
  dot.prev.copy( dot.pos );
  if(65 in keysDown){ //A key left
    if( canMove( dot.bound( 0 ), _180) ){
    	
    	if( dot.rappelling ) {
    		dot.pos.y -= dot.speed * Math.sin( toRadians(30) );
    		dot.pos.x -= dot.speed;
    		dot.rope.updateLength( dot.pos );
    	} else {
        	dot.pos.x -= dot.speed;
        }
        dot.draw = true;
		
    }
  }
  //TODO: Optimize and fix jump mechanics 
  if(87 in keysDown){ //W key up
	if( dot.rappelling  ) {
		if( canMove( dot.bound( 1 ), _270, dot.rad*0.5 ) ) {
	        dot.pos.y -= dot.speed;
	        dot.rope.updateLength( dot.pos );
	        dot.draw = true;
    	}		
	} else {
	    if( canMove( dot.bound( 1 ), _270,  dot.speed*4 ) ) {
	        dot.pos.y -= dot.speed*4;
	        //dot.vy -= dot.speed*4;
	        dot.draw = true;
		}
	}
  }
  
  if(83 in keysDown && dot.rappelling ){ //S key down, falling
  	 if( canMove( dot.bound( 3 ), _90,  dot.rad*0.5 ) ){
        dot.pos.y += dot.speed;
        dot.rope.updateLength( dot.pos );
        dot.draw = true;
    }
  }
  
  if( dot.falling && !dot.rappelling ) {
    if( canMove( dot.bound( 3 ), _90, dot.rad*0.5 ) ){
        //dot.y += dot.speed;
        dot.fall( new Date().getTime() / 1000 );
        dot.draw = true;
		//cone.pos.copy( dot.pos );
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
 
  if(68 in keysDown){ //D key right
		if( canMove( dot.bound( 2 ), 0) ){
			  dot.pos.x += dot.speed;
			  dot.draw = true;
			  //cone.pos.copy( dot.pos );
		   //isFalling();
		}
  }
  
  //dot.pos.set( dot.x, dot.y );
};


//mouse and keyboard events
var click = false;
cnvs.onmousedown = function(e){
	e.preventDefault();
	var cord = getCords(cnvs, e.clientX, e.clientY);
	
	//can only hook rappell rope to near by box
	if( cord.distanceTo( dot.pos ) < BOX_D ) {
		//cant rappell while rappelling
		if( !dot.rappelling ) {
			
			dot.rope.set( cord, dot.pos );
			//dot.rope.end = dot.pos;
			dot.rope.draw();
			dot.rappelling = true;
			
		} else {
			
			dot.rappelling = false;
			
		}
	}
};

cnvs.onmousemove = function(e){
  e.preventDefault();
  var cord = getCords(cnvs, e.clientX, e.clientY);
  
  cone.angle = toRadians( getAngle( cone, cord ) );
  //cone.quad();
  cone.draw = true;
  dot.draw = true;
};

var keysDown = {};
addEventListener("keydown", function(e){
  keysDown[e.keyCode] = true;
}, false);
addEventListener("keyup", function(e){
  delete keysDown[e.keyCode];
}, false);


//draw functions, clears screen
function clear() {
    ctx.fillStyle="#ffffff";
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle="#888888";
    ctx.strokeRect(0,0,w,h);
}

//draws player
var draw = function(){
  if(dot.draw){
     //clear();
     //ctx.clearRect(0, 0, w, h);
     draw_window.set( dot.prev.x - cone.r, dot.prev.y - cone.r );
     draw_x = draw_y = cone.r*2;
     draw_end.set( draw_x, draw_y );
     draw_end.addV( draw_window );
     
     ctx.clearRect( draw_window.x, draw_window.y, draw_x, draw_y );
     
     //draw map first than player over the map
     if( draw_map ) drawMap( BOX_D );
     
     ctx.beginPath();
     ctx.save();
     ctx.font = '20pt Arial';
     ctx.fillStyle = 'darkgreen';
     ctx.strokeStyle = 'lightgreen';
     ctx.arc(dot.pos.x, dot.pos.y, dot.rad, 0, Math.PI*2,
             false);
     ctx.stroke();
     ctx.fill();
     ctx.closePath();
     dot.draw = false;
     
     if( dot.rappelling ) {
     	dot.rope.end.copy( dot.pos );
     	dot.rope.draw();
     }
     
     ctx.restore();

     
     cone.draw = true;
     dot.draw = false;
  }
  
  if( cone.draw ) {
    
    drawCone( cone.pos, cone.angle, cone.r, cone.offset );
    
    drawOutLine();
    
    cone.draw = false;
  }
};

//actually draws each beam of light, ray
var ray_light = new Ray( new Vector(0,0), 0, 0 );
function drawLine(v, angle, r) {
	ray_light.set( v, angle, r );
	//ray_light.calcEnd();
	//ray_light.calcEndQ( cone.quad() );
	//ray_light.collision = false;
	ray_light.cast();
    
    ctx.moveTo( v.x, v.y );
   	ctx.lineTo( ray_light.end.x, ray_light.end.y );
    ctx.closePath();
    ctx.stroke();
    
    ray_light.end.x = Math.floor( ray_light.end.x );
    ray_light.end.y = Math.floor( ray_light.end.y );
    
    //if( outline.indexOf( ray_light.end ) == -1 && ray_light.collision ) 
    		//outline.push( ray_light.end );
    if( outline.indexOf( { x: ray_light.end.x, y: ray_light.end.y } ) == -1 &&
    															 ray_light.collision ) 
    		outline.push( { x: ray_light.end.x, y: ray_light.end.y } );
    		
    
}

//calls drawLine to create light cone
function drawCone(v, angle, r, offset) {
    var a = toDegrees(angle);
	
    ctx.save();
    
    ctx.strokeStyle = cone.color;
    
    for( var n=a-offset; n <= a+offset; n++) {
      drawLine( v, toRadians(n), r );
    }
    
    ctx.restore();
	
}

//draw outline of cave using outline[]
function drawOutLine() {
	
	if( outline.length === 0 ) return false;
	
	ctx.save();
	
	ctx.fillStyle = "gray";
	
	for( var n = outline.length-1; n >= 0; n-- ) {
		
		if( outline[n].x < draw_window.x || outline[n].y <  draw_window.y ) continue;
		if( draw_end.x < outline[n].x || draw_end.y < outline[n].y ) continue;
		
		ctx.fillRect( outline[n].x, outline[n].y, 1, 1 );
		
	}
	
	ctx.restore();
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

//start
function init(){
	createMap( BOX_D );
	outline.length = 0;
}
//update loop
var main = function(){
	
    cast_range = getMapRange( cone.pos, cone.r );
  	update();
  	draw();
  	//requestanim makes the game slugish :/
	//requestAnimationFrame( main );
};

setInterval(main, 1);
init();
//main();
