/**
 * @author Work
 * This is where the map is created and drawn, note the array that holds the map
 * is delcraed in games.js
 * The map is comprised of boxs which can be solid or not.
 */
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
