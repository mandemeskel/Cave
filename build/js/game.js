/**
 * @author Work
 * The main game file, where everything comes together and where the canvas is created.
 */
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
		//player has to be close to the rope or not idk yet...
		//if( player.ropes[n].start.distanceTo( player.pos_real() ) < 200 
		//|| player.ropes[n].end.distanceTo( player.pos_real() ) < 200 ) {
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
//TODO: implement universal audio (volume % 4) / 4
var background_audio = new Audio( "static/Track2.mp3" );
background_audio.loop = true;
//volume is on a scale of 0 to 1
//http://www.w3.org/TR/html5/embedded-content-0.html#effective-media-volume
background_audio.volume = 1;
//background_audio.controls = true; //show controls of audio object doesn't work
background_audio.load();

var audio = {
	footStep: 0,
	fall: 1
};

var sounds = [];

function initSounds() {
	var footStep = new Audio( "static/FootStep2.mp3" );
	footStep.volume = 0.25;
	footStep.load();
	
	var falling = new Audio( "static/Falling.mp3" );
	falling.volume = 1;
	falling.loop = true;
	falling.load();
	
	sounds.push( footStep );
	sounds.push( falling );
}

function AudioPlayer( audio ) {
	//game is muted lleave
	if( !sound ) return;
	//play sound if sounds are loaded and if the sound is not being played currently
	if( sounds.length > 0 ) {
		
		if( sounds[ audio ].currentTime == 0 || sounds[ audio ].ended ) 
			sounds[ audio ].play();
	
	}
}

//special function just for screaming when player is falling
function scream( arg ) {
	if( sounds[ audio.fall ].currentTime  != 0 && !sounds[ audio.fall ].ended ) 
		//arg = 2;
		return;
	switch( arg ) {
	case 1: //play sound
		AudioPlayer( audio.fall );
	break;
	case 2: //repeat scream
		sounds[ audio.fall ].currentTime = 1;
	break;
	case 3: //stop scream
		sounds[ audio.fall ].currentTime = 0;
		sounds[ audio.fall ].pause();
	break;
	}
}

//start
var game = false,
	sound = true;
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
    
    //reset player and map
    offset.set( w * 0.5, h * 0.5 ),
    offset.subV( player.pos );
    //prev_offset.copy( offset );
    player.pos.addV( offset );
    player.camp.length = 0;
    player.ropes.length = 0;
    player.startTime = (new Date().getTime() / 1000);
    player.color = 'ffff00';
    
    //load sound and play
 	if( sounds.length == 0 )
 		initSounds();
    background_audio.play();
    	
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
  	
  	//sound loop, if loop = true than why do we need this, yeah we dont need this
  	//if( background_audio.currentTime == 0 || background_audio.ended ) 
  		//background_audio.play();
};
