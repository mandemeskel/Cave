/**
 * @author Work
 * This is where the map is created and drawn, note the array that holds the map
 * is delcraed in games.js
 * The map is comprised of boxs which can be solid or not.
 */

//dimensions of box object, which is a square BOX_D BY BOX_D           
var BOX_D = 30;
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

var Map = {
	size_x: 60,
	size_y: 40,
	fillprob: 40,
	gens: 2,
	params: { r1_cutoff: 5, r2_cutoff: 1, reps: 2 },
	TILE_WALL: 1,
	TILE_FLOOR: 0,
	map_h: 0,
	map_w: 0,
	map: [],
	map1: [],
	initMap: function() {
		var x, y;
		
		for( y = 0; y < this.size_y; y++ ) {
		
			this.map[y] = [];
			this.map1[y] = [];
			
			for( x = 0; x < this.size_x; x++ ) {
	
				this.map[y].push( Map.randpick() );
				this.map1[y].push( this.TILE_WALL );
				
			}
		}
		
		//make  side edges into walls. 
		for( y = 0; y < this.size_y; y++ )
			this.map[y][0] = this.map[y][this.size_x-1] = this.TILE_WALL;
			
		//make  top and bottum edges into walls. 
		for( x = 0; x < this.size_x; x++ )
			this.map[0][x] = this.map[this.size_y-1][x] = this.TILE_WALL;
	},
	
	//map creation functions
	generateMap: function() {
		var x, y, n, k;
		
		//work within the boarders created in initMap
		for( y=1; y<this.size_y-1; y++ ) {
			for( x=1; x<this.size_x-1; x++ ) {
				var adjcount_r1 = 0, adjcount_r2 = 0;
				
				for( n=-1; n<=1; n++ ) {
					for( k=-1; k<=1; k++ ) {
						
						if( this.map[y+n][x+k] != this.TILE_FLOOR ) adjcount_r1++;
						
					}
				}
				
				for( n=y-2; n<y+2; n++ ){
					for( k=x-2; k<x+2; k++ ){
						
						if( Math.abs(n-y) == 2 && Math.abs(k-x) == 2 ) continue;
						if( n<0 || k<0 || n>=this.size_y || k>=this.size_x ) continue;
						if( this.map[n][k] != this.TILE_FLOOR ) adjcount_r2++;
					
					}
				}
				
				if( adjcount_r1 >= this.params.r1_cutoff || adjcount_r2 <= this.params.r2_cutoff ) {
					this.map1[y][x] = this.TILE_WALL;
				} else {
					this.map1[y][x] = this.TILE_FLOOR;
				}
			}	
		}
		
		for(y=1; y<this.size_y-1; y++) {
	      
			for(x=1; x<this.size_x-1; x++) {
				this.map[y][x] = this.map1[y][x];
			}
		}
		
	},
	cleanMap: function() {
	  for( var x, y=1; y<this.size_y-1; y++ ) {
			for( x=1; x<this.size_x-1; x++ ) {
	          
	          var adjcount_r1 = 0, adjcount_r2 = 0;
	          
	          for( n=-1; n<=1; n++ ) {
	            for( k=-1; k<=1; k++ ) {
	              
	              if( this.map[y+n][x+k] != this.TILE_FLOOR ) adjcount_r1++;
	              
	            }
	          }
				
				for( n=y-2; n<y+2; n++ ){
					for( k=x-2; k<x-2; k++ ){
						
						if( Math.abs(n-y) == 2 && Math.abs(k-x) == 2 ) continue;
						if( n<0 || k<0 || n>=this.size_y || k>=this.size_x ) continue;
						if( this.map[n][k] != this.TILE_FLOOR ) adjcount_r2++;
					
					}
				}
				
				if( adjcount_r1 >= this.params.r1_cutoff || adjcount_r2 <= this.params.r2_cutoff ) {
					this.map1[y][x] = this.TILE_WALL;
				} else {
					this.map1[y][x] = this.TILE_FLOOR;
				}
	          
	        }
	  }
	},
    drawMap: function( d ) {
	  	var box = new Box( new Vector( 0, 0), 10, 10, 0 ),
	  		r, c;
	
	  	ctx.strokeStyle = "black";
	  
	  	for( r = this.size_y-1; r >= 0; r-- ) {
	    	for( c = this.size_x-1; c >= 0; c-- ){
	    	
	      		box.set( c*d, r*d, d, this.map[r][c] );
	      		box.draw();
	      
	    	}
	  	}
	  
	   
	},
	createMap: function( d ) {
		
		Map.initMap();
		for( var n=0; n<this.gens; n++ ) {
			
			for( var k=0; k<this.params.reps; k++ ){
			
				Map.generateMap();
			    Map.cleanMap();
		      
			}
				
		}
		
		Map.drawMap( d );
		
		this.map_w = this.size_x * BOX_D;
		this.map_h = this.size_y * BOX_D;
	},
	//checks to see if the vector is in an ecnlosed space
	checkMap: function( v ) {
		
		var current_pos = new Vector( v.x, v.y ),
			next_pos = new Vector( v.x, v.y ),
			floors = [], walls = [],
			x, y, n = 0;
			
		floors.push( new Vector( next_pos.x, next_pos.y ) );
		
		do {
		
			if( n > (this.size_x * this.size_y) ) return false;
		
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
			
			if( this.map[ next_pos.y ][ next_pos.x ] == this.TILE_WALL ) {
				
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
		
	},
	randpick: function() { 
		if( getRandomInt(1, 100)%100 < this.fillprob ) return this.TILE_WALL;
		return this.TILE_FLOOR;
	}
}
