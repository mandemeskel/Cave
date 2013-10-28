/**
 * @author Work
 */
var _bhalf = BOX_D * 0.5;
function Rappell( start, player_pos ) {
	
	if( start instanceof Rappell ) {
		
		this.start = new Vector( start.start );
		this.end = new Vector( start.end );
		this.ray = new Ray( this.end, _180, _bhalf );
		this.leftside = start.leftside;
		
	} else {
		
		this.start = new Vector( start );
		this.end = new Vector( start );
		this.ray = new Ray( this.end, _180, _bhalf );
		//this.leftside = this.ray.cast(); //rope is on left side of player
		this.leftside = (start.x < player_pos.x);

		//make the rope longer than the player
		this.end.y += BOX_D;
		
	}
	
}
Rappell.prototype.update = function( player_pos ) {
	if( (this.end.y - player_pos.y) < _bhalf ) { 
		
		this.end.copy( player_pos );
		this.ray.set( this.end, _90, _bhalf );
		if( !this.ray.cast() ) {
			this.end.y += _bhalf;
		} else {
			//the rope has hit the ground, stop rappelling
			this.end.y += this.ray.far;
			//TODO: we should move this elsewhere later
			player.rappelling = false;
			if( !inRopes( player.rope ) )
				player.ropes.push( new Rappell( player.rope ) );
		}
		
	}
}
Rappell.prototype.onRope = function( click ) {
	//go through every point on rope and compare with click
	var temp = new Vector( this.start );
	while( temp.y <= this.end.y ) {
		if( temp.distanceTo( click ) < 5 ) return temp;
		temp.y++
	}
	return false;
}
Rappell.prototype.equals = function( rope ) {
	return ( this.start == rope.start && this.end == rope.end );	
}
Rappell.prototype.draw = function() {
	
	ctx.strokeStyle = player.color;
	
	ctx.moveTo( this.start.x, this.start.y );
	ctx.lineTo( this.end.x, this.end.y );
		
	ctx.stroke();

}
Rappell.prototype.hookUp = function() {
	
	this.ray.set( this.start, _270, BOX_D * 0.9 );
	
	if( this.ray.cast() ) return false; //hooking rope to close to cieling
	
	this.ray.set( this.start, _90, BOX_D * 0.9 );
	
	if( this.ray.cast() ) return false; //hooking rope to close to floor
	
	if( this.leftside ) {
		
		this.ray.set( this.start, _180, BOX_D );
		if( this.ray.cast() ) return false; //theres a wall to the left of the hook
		this.ray.set( this.start, _45, BOX_D*0.75 );
		if( this.ray.cast() ) return false; //no wall behind and below point
		
	} else {
		
		this.ray.set( this.start, 0, BOX_D );
		if( this.ray.cast() ) return false; //theres a wall to the left of the hook
		this.ray.set( this.start, _135, BOX_D*0.75 );
		if( this.ray.cast() ) return false; //no wall behind and below point
		
	}
	
	return true;
}

//checks if rope is in player.ropes array
function inRopes( r ) {
	
	if( player.ropes.length === 0 ) return false;
	
	for( var n = player.ropes.length - 1; n >= 0; n-- ) {
		if( player.ropes[n].equals( r ) ) return true;
	}
	
	return false;
}
