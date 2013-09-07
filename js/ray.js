/**
 * @author Work
 * This how we check for collisions and create the light via raycasting
 */
var abox = new Box( new Vector( 0, 0), 10, 10, 0 );

function Ray( origin, angle_r, far ){
	this.pos = origin;
	this.a_r = angle_r;
	//this.a_d = toDegrees( angle_r );
	this.far = far;
	//this.end = new Vector( Math.cos(this.a_r)*this.far, 
							//Math.sin(this.a_r)*this.far );
	//this.end.addV( this.pos );
	//this.quad = 0;
	this.end = this.calcEnd();
	
	//this.cos = Math.cos( this.a_r );
	//this.sin = Math.sin( this.a_r );
	this.collision = false;
	//this.quad = getQuad( this.a_d );
	//this.m = this.sin / this.cos;
	//this.b = ( this.m * this.pos.x ) - this.pos.y;
} 
  
//Ray.prototype.intersectPoint = function(v) {

//};

//cast ray and checks for collisions against map objects
var vector = new Vector(0,0);

Ray.prototype.cast = function() {
	var x, y;// dx dy;
		//x_max = Math.cos(this.a_r)*this.far;
		
	
	//for( var n = 0; n < this.far; n++ ) {
	//for( var n = this.far-1; n > 0; n-- ) {
		
		/**
		//this needs to be cleaned and it handles cos/sin errors in each quadtrant
		if( this.a_d == 90 ){ //falling down
			//y = n*dy;
			y = n;
			x = 0
		}else if( this.a_d == 270){ //jumping upd
			y = -n;
			x = 0;
		}else if( this.a_d == 180){
			x = -n;
			y = 0;
		}else if( this.a_d === 0 || this.a_d == 360){
			x = n;
			y = 0;
		}else{
			//x = n;
			x = Math.cos( this.a_r ) * n;
			//y = Math.tan(this.a_r)*n;
			//y = this.m * n;
			y = Math.sin( this.a_r ) * n;
			switch( this.quad ){
				case 2:
					x = x > 0 ? -x : x;
					y = y < 0 ? -y : y;
				break;
				case 3:
					x = x > 0 ? -x : x;
					y = y > 0 ? -y : y;
				break;
			}
		}
		
		vector.set( x, y );
		vector.addV( this.pos );
		
		//this is the loop that actually checks each poin in the 
		//ray for intersection with any box - needs to be optimized later
		for(var k=0; k < map.length; k++) {
			for(var u=0; u < map[k].length; u++) {
				//if the box at (u, k) is a wall/1 == true
				if( map[k][u] ) {
					
					abox.set( u * BOX_D, k * BOX_D, BOX_D, 1 );
					if( abox.checkCollision( vector ) ) {
						this.end.copy( vector );
						this.collision = true;
						return true;
					}
					
				} 
				/**
				else if ( map[k][u+1] ) {
					
					if( getBox( u+1, k ).checkCollision( vector ) ) {
						this.end.copy( vector );
						this.collision = true;
						return true;
					}
					
				}
				
				
			}
		}
			
			**/
			var n = 0;
			do{
			 if( this.testAngle( n ) ) return true;
			 n++;
			} while ( n < this.far );
	//}
	
	return false;
};

/**
Ray.prototype.cast = function() {
	
	var iterations = this.far;
	var n = iterations / 8;
	var caseTest = iterations % 8;
	
	do {
	
		switch( caseTest ) {
			case 0:
				
			case 7:
		
			case 6:
			
			case 5:
			
			case 4:
			
			case 3:
		
			case 2:
			
			case 1:
			
		}
		
		caseTest = 0;
		
	} while( --n > 0 )
	
}
**/
Ray.prototype.testAngle = function( n ) {
	/**
	switch( this.quad ){
		case 2:
			x = Math.cos( this.a_r ) * n;
			y = Math.sin( this.a_r ) * n;
			x = x > 0 ? -x : x;
			y = y < 0 ? -y : y;
		break;
		case 3:
			x = Math.cos( this.a_r ) * n;
			y = Math.sin( this.a_r ) * n;
			x = x > 0 ? -x : x;
			y = y > 0 ? -y : y;
		break;
		case 5:
			if( this.a_d == 180 || this.a_d === 0 || this.a_d == 360 ){
				x = this.a_d == 180 ? -n : n;
				y = 0;
			}else if( this.a_d == 90  || this.a_d == 270){
				y = this.a_d == 270 ? -n : n;
				x = 0;
			}
		break;
		default:
			x = Math.cos( this.a_r ) * n;
			y = Math.sin( this.a_r ) * n;
		break;
	}
	**/
	/**
	if( ( 0 < this.a_r && this.a_r < _90 ) || 
								( _270 < this.a_r && this.a_r < _360) ) {
		x = Math.cos( this.a_r ) * n;
		y = Math.sin( this.a_r ) * n;
	}else **/
	
	if( _90 < this.a_r && this.a_r < _180 ) {
    	x = x > 0 ? -x : x;
		y = y < 0 ? -y : y;
		x = Math.cos( this.a_r ) * n;
		y = Math.sin( this.a_r ) * n;
    } else if( _180 < this.a_r && this.a_r < _270 ) {
    	x = x > 0 ? -x : x;
		y = y > 0 ? -y : y;
		x = Math.cos( this.a_r ) * n;
		y = Math.sin( this.a_r ) * n;
    }else if( this.a_r == _180 || this.a_r === 0 || this.a_r == _360 ){
		x = this.a_r == _180 ? -n : n;
		y = 0;
	}else if( this.a_r == _90  || this.a_r == _270){
		y = this.a_r > _90 ? -n : n;
		x = 0;
	}else{
		//x = n;
		x = Math.cos( this.a_r ) * n;
		//y = Math.tan(this.a_r)*n;
		//y = this.m * n;
		y = Math.sin( this.a_r ) * n;
		/**
		switch( this.quad ){
			case 2:
				x = x > 0 ? -x : x;
				y = y < 0 ? -y : y;
			break;
			case 3:
				x = x > 0 ? -x : x;
				y = y > 0 ? -y : y;
			break;
		}
		**/
		/**
		if( _90 < this.a_r && this.a_r < _180 ) {
        	x = x > 0 ? -x : x;
			y = y < 0 ? -y : y;
        } else if( _180 < this.a_r && this.a_r < _270 ) {
        	x = x > 0 ? -x : x;
			y = y > 0 ? -y : y;
        }
        **/
	}
	
	vector.set( x, y );
	vector.addV( this.pos );
		
	//for( var u, k = 0; k < size_y; k++ ) {
		//for( u = 0; u < size_x; u++ ) {
	for( var u, k = cast_range.start.y; k < cast_range.end.y; k++ ) {
		for( u = cast_range.start.x; u < cast_range.end.x; u++ ) {
			
			//if( map[k][u] ) {
				
				/**
				abox.set( u * BOX_D, k * BOX_D, BOX_D, 1 );
				if( abox.checkCollision( vector ) ) {
					this.end.copy( vector );
					this.collision = true;
					return true;
				}
				**/
				
				if( map[k][u] && 
					checkCollision( {x: u * BOX_D, y: k * BOX_D }, vector) ) {
					
					this.end.copy( vector );
					this.collision = true;
					return true;
					
				}
					
				if( map[k][++u] && 
					checkCollision( {x: u * BOX_D, y: k * BOX_D }, vector) ) {
					
					this.end.copy( vector );
					this.collision = true;
					return true;
					
				}
				
				if( map[k][++u] && 
					checkCollision( {x: u * BOX_D, y: k * BOX_D }, vector) ) {
					
					this.end.copy( vector );
					this.collision = true;
					return true;
					
				}
				
				if( map[k][++u] && 
					checkCollision( {x: u * BOX_D, y: k * BOX_D }, vector) ) {
					
					this.end.copy( vector );
					this.collision = true;
					return true;
					
				}
				
				if( map[k][++u] && 
					checkCollision( {x: u * BOX_D, y: k * BOX_D }, vector) ) {
					
					this.end.copy( vector );
					this.collision = true;
					return true;
					
				}
			//} 
			
		}
	}
	
	return false;
	
} 

//set ray properties
Ray.prototype.set = function( origin, angle_r, far ) {
	this.pos.copy( origin );
	this.a_r = angle_r;
	//this.a_d = toDegrees( angle_r );
	this.far = far;
	
	this.end = this.calcEnd();
	this.collision = false;
	
	//this.quad = getQuad( this.a_r, true );
};

//creates a default end point to the ray
var v = new Vector(0,0);
Ray.prototype.calcEnd = function() {
  
	v.x = Math.cos( this.a_r ) * this.far;
	v.y = Math.sin( this.a_r ) * this.far;
	
	//if( this.a_r < _90 ) {
		//this.quad = 1;
	//} else
	
	if( _90 < this.a_r && this.a_r < _180 ) {
		//this.quad = 2;
		v.x = v.x > 0 ? -v.x : v.x;
		v.y = v.y < 0 ? -v.y : v.y;
	} else if( _90 < this.a_r && this.a_r < _270 ) {
		//this.quad = 3;
		v.x = v.x > 0 ? -v.x : v.x;
		v.y = v.y > 0 ? -v.y : v.y;
	} 
	/**
	else if( _90 < this.a_r && this.a_r < _360 ) {
		//this.quad = 4;
		v.x = v.x < 0 ? -v.x : v.x;
		v.y = v.y > 0 ? -v.y : v.y;
	}**/
	
		//v.x = v.x < 0 ? -v.x : v.x;
		//v.y = v.y < 0 ? -v.y : v.y;
		
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

var max_x, max_y;
function checkCollision( box_v, v ) {
	
	max_x = box_v.x + BOX_D;
  	max_y = box_v.y + BOX_D;
  	
  	if( max_x >= v.x && v.x >= box_v.x )
  		 return ( max_y >= v.y && v.y >= box_v.y );
  		
  	return false;
	
}

function getBox( x, y ) {
	
	//PASSED boxes are solid because collisions detection only works for solid boxes
	box.set( x * BOX_D, y * BOX_D, BOX_D, 1 );
	return box;
	
}
