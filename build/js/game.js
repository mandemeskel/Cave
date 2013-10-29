/**
 * @author Work
 * The main game file, where everything comes together 
 * and where the canvas is created.
 */
var Game = {
	//game properties
	start: false,
	spawn_box: new Box( new Vector( 0, 0 ), 0, 0, 0 ),
	spawn_v: new Vector( 0, 0 ),
	
	//map properties
	map_outline: [],
	draw_map: false,
	
	//draw properties
	draw_offset: new Vector( 0, 0 ),
	draw_start: new Vector( 0, 0 ),
	draw_end: new Vector( 0, 0 ),
	draw_x: 0,
	draw_y: 0,
	cast_range: {},
	draw_outline: false,
	ray_light: new Ray( new Vector(0,0), 0, 0 ),
	skip_collision: false,
	
	//sound properties
	sound: true,
	background_audio: new Audio( "static/Background.mp3" ),
	audio_keys: { footStep: 0, fall: 1 },
	sounds: [],
	
	//functions
	init: function() {
        do {
        	
			//setting up map
			ctx.clearRect( 0, 0, cnvs.width, cnvs.height );
			createMap( BOX_D );	
			
			//setting up player
			player.pos.copy( getSpawnVector() );
		    player.color = "yellow";
	    
		//check if player spawned in area that is not enclosed
	    } while( !checkMap( this.spawn_v ) ); 
	    
	    //reset player and map
	    this.draw_offset.set( cnvs.width * 0.5, cnvs.height * 0.5 ),
	    this.draw_offset.subV( player.pos );
		this.map_outline.length = 0;
		
	    player.pos.addV( this.draw_offset );
	    player.camps.length = 0;
	    player.camp = false;
	    player.ropes.length = 0;
	    player.startTime = (new Date().getTime() / 1000);
	    player.color = 'ffff00';
	    
	    //load sound and play
	 	this.initSounds();
	    	
	    //lets a'go!
		document.getElementById( "introToast" ).className = "invis";
        this.start = true;
		if( this.start ) setInterval(main, 1);
	},
	update: function() {
		if( player.isFalling() ) 
			player.fall( new Date().getTime() / 1000 );
	
		if( moved ) {
			player.move();
		}
	
		//might need to move this into the main loop instead of update
		player.batteryOut();
	},
	draw: function(){

		if( !player.draw ) return;

		 this.draw_start.copy( player.pos_real() );
		 this.draw_start.offset( -(player.r+5), -(player.r+5) );
		 this.draw_x = this.draw_y = (player.r+10)*2;
		 this.draw_end.set( this.draw_x, this.draw_y );
		 this.draw_end.addV( this.draw_start );
		 
		 ctx.clearRect( 0, 0, cnvs.width, cnvs.height );
		
		 //offset canvas
		 ctx.save();
		 
		 ctx.translate( this.draw_offset.x, this.draw_offset.y );
		 
		 if( this.draw_map )
		 	drawMap( BOX_D );
		 
		 if( this.draw_outline )
		 	this.drawOutLine();
		 
		 //draw spawn box/entrance/exit
		 this.spawn_box.draw( "yellow" );
		 
		 //draw ropes
		 if( player.rappelling ) player.rope.draw();
		 if( player.ropes.length ) this.drawRopes();
		 //easier than making a functiont that only draws the visible portion of 
		 //a rope :D
		 ctx.clearRect( 0, 0, cnvs.width, this.draw_start.y ); //clear top
		 ctx.clearRect( 0, 0, this.draw_start.x, cnvs.height ); //clear left
		 ctx.clearRect( 0, this.draw_end.y, cnvs.width, cnvs.height ); //clear bot
		 ctx.clearRect( this.draw_end.x, 0, cnvs.width, cnvs.height ); //clear right
		 
		 //draw checkpoints
		 if( player.camp ) this.drawCamps();
		 
		 ctx.restore();
		      
		 //draw light cone
		 ctx.save();
		 
		 this.drawCone( player.pos_real(), player.angle, player.r, player.a_offset );
		
		 ctx.restore();
		
		 player.draw = false;
		 
	},
	//draws each beam of light, ray
	drawLine: function(v, angle, r) {
		//var temp = new Vector(v );
		this.ray_light.set( v, angle, r );
		this.ray_light.cast();
	    
	    //offset the ray vectors after it has been cast
	    v.addV( this.draw_offset );
	    this.ray_light.end.addV( this.draw_offset );
	    
	    //draw ray
	    ctx.beginPath();
	    ctx.moveTo( v.x, v.y );
	   	ctx.lineTo( this.ray_light.end.x, this.ray_light.end.y );
	    ctx.closePath();
	    ctx.stroke();
	     
	    //add to outline on ray callision
	    if( player.a_offset <= 0 ) return; //lights are off dont draw any more dots
	    if( this.ray_light.collision && this.draw_outline ) { 
	    	
	    	this.ray_light.end.subV( this.draw_offset );
		    this.ray_light.end.x = Math.floor( this.ray_light.end.x );
		    this.ray_light.end.y = Math.floor( this.ray_light.end.y );
			
			/**
			skip = !skip; 
			if( skip ) return;
			**/
			
			if( !vectorIn( this.map_outline, this.ray_light.end ) )
		    		this.map_outline.push( new Vector( this.ray_light.end.x, this.ray_light.end.y ) );
	    	
	    }
	    
	},
	//calls drawLine to create light cone
	drawCone: function(v, angle, r, a_offset) {
	    var a = toDegrees(angle);
	    
	    ctx.strokeStyle = player.color;
	    
	    //i hate how everything passed in java is by refrence, sucks :(
	    for( var n = a - a_offset; n <= a + a_offset; n++) {
	    	this.drawLine( new Vector( v ), toRadians(n), r );
	    }
	    
	},
	//draw outline of cave using outline[]
	drawOutLine: function() {
		
		if( this.map_outline.length === 0 ) return false;
		
		ctx.fillStyle = "gray";
		
		for( var n = this.map_outline.length-1; n >= 0; n-- ) {
			
			if( this.map_outline[n].x < this.draw_start.x 
				|| this.map_outline[n].y <  this.draw_start.y ) continue;
			if( this.draw_end.x < this.map_outline[n].x 
				|| this.draw_end.y < this.map_outline[n].y ) continue;
			
			ctx.fillRect( this.map_outline[n].x, this.map_outline[n].y, 1, 1 );
			
		}
		
	},
	//draws campsite, checkpoint
	drawCamp: function( v ) {
	
		ctx.fillStyle = 'yellow';
		ctx.beginPath();
		ctx.arc(v.x, v.y, player.rad, 0, Math.PI*2, false);
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
		
	},
	//draw all camps
	drawCamps: function() {
		for( var n = player.camps.length-1; n >= 0; n-- )
			this.drawCamp( player.camps[n] );
	},
	//draws ropes that player rappelled with
    drawRopes: function() {
		for( var n = player.ropes.length-1; n >= 0; n-- ){
			if( player.ropes[n].start.distanceTo( player.pos_real() ) < 200 
			|| player.ropes[n].end.distanceTo( player.pos_real() ) < 200 ) {
				player.ropes[n].draw();
			}
		}		
	},
	initSounds: function() {
		if( this.sounds.length != 0 ) {
			//restart background audio
			this.background_audio.currentTime = 0;
	    	this.background_audio.play();
			return;
		}
		
		var footStep = new Audio( "static/FootStep2.mp3" );
		footStep.volume = 0.25;
		footStep.load();
		
		var falling = new Audio( "static/Falling.mp3" );
		falling.volume = 1;
		falling.loop = true;
		falling.load();
		
		this.background_audio.loop = true;
		//volume is on a scale of 0 to 1
		//http://www.w3.org/TR/html5/embedded-content-0.html#effective-media-volume
		this.background_audio.volume = 1;
		//background_audio.controls = true; //show controls of audio object doesn't work
		this.background_audio.load();
	    this.background_audio.play();

		this.sounds.push( footStep );
		this.sounds.push( falling );
	},
	AudioPlayer: function( audioKey ) {
		
		if( !this.sound ) return;
		//play sound if sounds are loaded and if the sound is not being played currently
		if( this.sounds.length === 0 ) return;
		if( this.sounds[ audioKey ].currentTime == 0 || this.sounds[ audioKey ].ended ) 
			this.sounds[ audioKey ].play();
	
	},
	//special function just for screaming when player is falling
	scream: function( arg ) {
		if( sounds[ audio.fall ].currentTime  != 0 && !sounds[ audio.fall ].ended ) 
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
}  
            
//mouse and keyboard events
//var click = false;
cnvs.onmousedown = function(e){
	e.preventDefault();
	var cord = getCords(cnvs, e.clientX, e.clientY);
	
	//can only hook rappell rope to near by box
	if( cord.distanceTo( player.pos ) < BOX_D ) {
		
		Game.spawn_box.pos.offset( BOX_D*0.5, BOX_D*0.5 );
		if( player.pos_real().distanceTo( Game.spawn_box.pos ) < (BOX_D*0.5) ) {
			
			document.getElementById( "nextLvlToast" ).className = "toast";
			
		} else if( !player.rappelling && !player.falling ) {
			
			//offset cord
			cord.subV( Game.draw_offset );
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
		
		Game.spawn_box.pos.offset( -BOX_D*0.5, -BOX_D*0.5 );

	}
};

cnvs.onmousemove = function(e){
  e.preventDefault();
  var cord = getCords(cnvs, e.clientX, e.clientY);
  cord.subV( Game.draw_offset );
  
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
	e.preventDefault();
	delete keysDown[e.keyCode];
	moved = false;
}

addEventListener("keydown", keydown, false);
addEventListener("keyup", keyup, false);


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
      				Game.spawn_box.set( (c * BOX_D), 
      							(r * BOX_D), BOX_D, 0 );
      				Game.spawn_v.set( c, r );
      				return new Vector( Game.spawn_box.pos.x + BOX_D*0.5,
      					Game.spawn_box.pos.y + BOX_D*0.5 );
      			}
      		}
      
    	}
  	}
}

//update loop
var main = function(){
	var temp = new Vector( 0, 0 );
	temp.copy( player.pos );
	temp.subV( Game.draw_offset );
	if( !Game.start ) return;
	
    Game.cast_range = getMapRange( temp, player.r );
  	Game.update();
  	Game.draw();

};
