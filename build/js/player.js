/**
 * @author Work
 * player object and functions
 */
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
				
				if( !this.camp ) return false;
				
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


