/**
 * @author Work
 * This how we check for collisions and create the light via raycasting
 */
var abox = new Box( new Vector( 0, 0), 10, 10, 0 );

function Ray( origin, angle_r, far ){
	this.pos = origin;
	this.a_r = angle_r;
	this.far = far;
	this.end = this.calcEnd();
	this.collision = false;
} 

//cast ray and checks for collisions against map objects
var vector = new Vector(0,0);

Ray.prototype.cast = function() {
	var n = 0;
	do{
		
		if( this.testAngle( n ) ) return true;
	 	n++;
	 	
	} while ( n < this.far );
	
	return false;
};

Ray.prototype.testAngle = function( n ) {
	var x, y;
	
	//90 to 180 2nd quadrant
	if( _90 < this.a_r && this.a_r < _180 ) {
		
    	x = x > 0 ? -x : x;
		y = y < 0 ? -y : y;
		x = Math.cos( this.a_r ) * n;
		y = Math.sin( this.a_r ) * n;
	
	//180 to 270 3rd quadrant
    } else if( _180 < this.a_r && this.a_r < _270 ) {
    	
    	x = x > 0 ? -x : x;
		y = y > 0 ? -y : y;
		x = Math.cos( this.a_r ) * n;
		y = Math.sin( this.a_r ) * n;
		
	//if on x or y axis
    }else if( this.a_r == _180 || this.a_r === 0 || this.a_r == _360 ){
    	
		x = this.a_r == _180 ? -n : n;
		y = 0;
		
	}else if( this.a_r == _90  || this.a_r == _270){
		
		y = this.a_r > _90 ? -n : n;
		x = 0;
		
	//handels first and fourth quadrant
	}else{

		x = Math.cos( this.a_r ) * n;
		y = Math.sin( this.a_r ) * n;

	}
	
	vector.set( x, y );
	vector.addV( this.pos );
		
	for( var u, k = cast_range.start.y; k < cast_range.end.y; k++ ) {
		for( u = cast_range.start.x; u < cast_range.end.x; u++ ) {
				
			if( map[k][u] && 
				checkCollision( new Vector( u * BOX_D, k * BOX_D ), vector) ) {
				
				this.far = n;
				this.end.copy( vector );
				this.collision = true;
				return true;
				
			}
				
			if( map[k][++u] && 
				checkCollision( new Vector( u * BOX_D, k * BOX_D ), vector) ) {
				
				this.far = n;
				this.end.copy( vector );
				this.collision = true;
				return true;
				
			}
			
			if( map[k][++u] && 
				checkCollision( new Vector( u * BOX_D, k * BOX_D ), vector) ) {
				
				this.far = n;
				this.end.copy( vector );
				this.collision = true;
				return true;
				
			}
			
			if( map[k][++u] && 
				checkCollision( new Vector( u * BOX_D, k * BOX_D ), vector) ) {
				
				this.far = n;
				this.end.copy( vector );
				this.collision = true;
				return true;
				
			}
			
			if( map[k][++u] && 
				checkCollision( new Vector( u * BOX_D, k * BOX_D ), vector) ) {
				
				this.far = n;
				this.end.copy( vector );
				this.collision = true;
				return true;
				
			}
			
		}
	}
	
	return false;
	
} 

//set ray properties
Ray.prototype.set = function( origin, angle_r, far ) {
	
	this.pos.copy( origin );
	this.a_r = angle_r;
	this.far = far;
	this.end = this.calcEnd();
	this.collision = false;
	
};

//creates a default end point to the ray
var v = new Vector(0,0);
Ray.prototype.calcEnd = function() {
  
	v.x = Math.cos( this.a_r ) * this.far;
	v.y = Math.sin( this.a_r ) * this.far;
	
	if( _90 < this.a_r && this.a_r < _180 ) {
		//this.quad = 2;
		v.x = v.x > 0 ? -v.x : v.x;
		v.y = v.y < 0 ? -v.y : v.y;
	} else if( _90 < this.a_r && this.a_r < _270 ) {
		//this.quad = 3;
		v.x = v.x > 0 ? -v.x : v.x;
		v.y = v.y > 0 ? -v.y : v.y;
	} 

	v.addV( this.pos );
    return v;
};

//this is actually used by drawLine() in game.js
Ray.prototype.calcEndQ = function( q ) {
	var v = new Vector(0,0);
  
	v.x = this.cos * this.far;
	v.y = this.sin * this.far;
	
	if( q == 2) {
		v.x = v.x > 0 ? -v.x : v.x;
		v.y = v.y < 0 ? -v.y : v.y;
	} else if( q == 3) {
		v.x = v.x > 0 ? -v.x : v.x;
		v.y = v.y > 0 ? -v.y : v.y;
	} else if( q == 4 ) {
		v.x = v.x < 0 ? -v.x : v.x;
		v.y = v.y > 0 ? -v.y : v.y;
	}
	
	v.addV( this.pos );
    return v;
};

//checks collision of rays with boxs for raycasting
var max_x, max_y;
function checkCollision( box_v, v ) {
	
	box_v.addV( offset );
	max_x = box_v.x + BOX_D;
  	max_y = box_v.y + BOX_D;
  	
  	if( max_x >= v.x && v.x >= box_v.x )
  		 return ( max_y >= v.y && v.y >= box_v.y );
  		
  	return false;
	
}
