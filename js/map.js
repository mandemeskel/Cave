/**
 * @author Work
 * This is where the map is created and drawn, note the array that holds the map
 * is delcraed in games.js
 * The map is comprised of boxs which can be solid or not.
 */
var size_x = 60,
	size_y = 50,
	fillprob = 40,
	gens = 2,
	params = { r1_cutoff: 5, r2_cutoff: 1, reps: 2 },
	TILE_WALL = 1,
	TILE_FLOOR = 0,
	map1 = [];	
	
function Box( origin, w, l, solid ){
  origin.offset(10, 10);
  this.origin = origin; 
  this.w = w;
  this.l = l;
  this.solid = solid || false;
}

//we dont need to draw the boxes but we do because it makes things easier
Box.prototype.draw = function() {
  //ctx.save();
  
  ctx.strokeRect( this.origin.x, this.origin.y, this.w, this.l );

  if( this.solid ) {
    ctx.fillStyle = "black";
    ctx.fillRect( this.origin.x, this.origin.y, this.w, this.l );
  }
  
  //ctx.restore();
};

//rays call this function and the box checks if the passed point in the ray intersects it
Box.prototype.checkCollision = function(v) {
  if( !this.solid ) return false;
  var max_x = this.origin.x + this.w;
  var max_y = this.origin.y + this.l;
  
  if( max_x >= v.x && v.x >= this.origin.x ){
    if( max_y >= v.y && v.y >= this.origin.y ) return true;
  }
  return false;
};

Box.prototype.set = function( x, y, d, solid ) {
  this.origin = new Vector( x, y );
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
	var x, y, n, k; //n=ii, k=jj
	
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
  	
  ctx.save();
  ctx.strokeStyle = "black";
  
  for( r = size_y-1; r >= 0; r-- ) {
    for( c = size_x-1; c >= 0; c-- ){
    	
      box.set( c*d, r*d, d, map[r][c] );
      box.draw();
      
    }
  }
  
  ctx.restore();
   
  
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

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
