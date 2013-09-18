/**
 * @author Work
 * player object and functions
 */
var player_ray = new Ray( new Vector(0,0), 0, 0 );
var left, right, 
	G = 9.8 * 0.5;
var bounds = { left: 0, top: 1, right: 2, bot: 3, bot_left: 4, bot_right: 5,
	 top_left: 6, top_right: 7 };
var player = {
		    pos: new Vector( 210, 210 ),  //offset position
		    pos_real: function () { //regular position
				var temp = new Vector( 0, 0 );
				temp.copy( this.pos );
				temp.subV( offset );
				return temp;
		    },
            speed: 2,
            jumpvar: 2,
            rad: 5,
            r: 120,
            color: 'yellow',
            angle: toRadians(225),
            a_offset: 15,
            quad: function(){ return getQuad( this.angle, true ); },
            draw: true,
            rappelling: false,
            rope: false,
            vy: 0,
            climbing: false,
            falling: false,
            fallfrom: map_h,
            ti: undefined, //initial time, start of fall 
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
				
				if( this.climbing ) return false;
				
				/**
				player_ray.set( 
					new Vector( this.pos.x+this.rad, this.pos.y+this.rad ),
				 										_90, this.rad );
				right = !player_ray.cast();
				player_ray.set( 
					new Vector( this.pos.x-this.rad, this.pos.y+this.rad ),
				 										_90, this.rad );
				left = !player_ray.cast();
				**/
				
				left = canMove( this.bound( bounds.bot_left ), _90);
				right = canMove( this.bound( bounds.bot_right ), _90);

				if( left && right ) {
				
					this.falling = true;
					if( this.pos_real().y < this.fallfrom ) 
						this.fallfrom = this.pos_real().y;
					//if( this.rope_draw ) this.rappelling = true;
					
				} else if( this.falling && ( !left || !right ) ) {
				
					this.falling = false;
					this.fallfrom = map_h;
					this.ti = undefined;
					this.vy = 0;
					//if( this.rappeling ) this.rappelling = false;
				
				}
				return this.falling;
			},
            fall: function( time ) {
				  if( this.pos_real().y < map_h-BOX_D ) {
					  
					  this.ti = this.ti || time;
					  var dt = (new Date().getTime() / 1000) - this.ti;
					  this.vy += (G*dt / 2);
					  
					  //player_ray.set( new Vector( this.pos.x, this.pos.y+this.rad ),
					  //	_90, this.vy );
					  player_ray.set( this.bound( bounds.bot ), _90, this.vy );
					  
					  if( player_ray.cast() ) {
					  	this.falling = false;
					  	offset.y -= ( player_ray.far ); //- offset.y);
					  	
					  	//if( ( this.pos_real().y - this.fallfrom ) >= 120 ) 
					  		//this.death();
						this.ti = undefined;
						this.vy = 0; //this.speed * this.jumpvar;
					  	
					  } else {
					  	
					  	offset.y -= this.vy;
					  	
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
					
					this.climbing = !( left && right ); // this.climbing = false;
					
					//move player onto edge 
					if( !left ) {
						this.offset += this.rad;
					} else {
						this.offset -= this.rad;
					}
					
				//initiate climbing
				} else {
					
					//climb down
					if( left && right ) {
						
						if( canMove( this.bound( bounds.bot_left ), _90 ) 
						 	|| canMove( this.bound( bounds.bot_right ), _90 ) )
						 		this.climbing = true;
					//climb up
					} else if( left || right ){
						
						if( canMove( this.bound( bounds.top_left ), _270 ) 
						 	|| canMove( this.bound( bounds.top_right ), _270 ) )
						 		this.climbing = true;
						
					}
				
				}
			},
			jump: function() {
				//this.vy = this.speed * this.jumpvar;
				//this.jumpvar *= this.speed;
				player_ray.set( bounds.top, _270, this.speed * this.jumpvar );
				
				if( player_ray.cast() ) {
					offset.y += ( player_ray.far ); 
				} else {
					offset.y += this.speed * this.jumpvar;
				}
			},
			move: function() {

				prev_offset.copy( offset );
				
				//this.isFalling();
				
				//if( this.falling ) this.fall();
				
				if(87 in keysDown) { //W key up, jump, start climbing up
					if( canMove( this.bound( 1 ), _270,  this.speed ) ) {
						if( !this.climbing ) {
							//offset.y += this.speed * 4; //put jump function here
							this.jump();
						} else {
							offset.y += this.speed;
						}
					}
				}
				
				if(65 in keysDown) { //A key left
					 if( canMove( this.bound( 0 ), _180) ) {
					 	offset.x += this.speed;
					 }
				}
				
				if(83 in keysDown && !this.falling ) { //S key down, start climbing down
					if( canMove( new Vector( this.pos.x, this.pos.y + this.rad ), _90,  this.rad ) ) {
						offset.y -= this.speed;
					}
				}
				
				if(68 in keysDown) { //D key right
					if( canMove( this.bound( 2 ), 0) ) {
						offset.x -= this.speed;
					}
				}

				if(67 in keysDown) { //C key start climbing
					if( !this.falling && !this.climbing ) {
						this.climb();
					} else {
						this.climbing = false;
					}
				}
			
				if( this.climbing ) this.climb();
			
				this.draw = true;
			}
		};

//player movement collision detection happens here
var ray_move = new Ray( new Vector(0,0), 0, 0 );
var canMove = function( v, angle, rad ){
	var move = false;
  	ray_move.set( v, angle, rad || player.rad );
  	move = !ray_move.cast()
  	
  	/**
  	if( player.rappelling && move ) {
  		
  		if( angle == _90 || angle == _270 ) return true;
  		
  		if( player.rope.length > player.rope.start.distanceTo( player.pos ) ) {
  			return true;
  		}
  		
  		if( angle == _180 || angle == 0 ) { //swing left and right
  			return true;
  		}
  		
  	}
  	**/
  	return move;
  	
};