/**
 * @author Work
 * work in progress, my not be needed
 * steps
 * 1. hook rope to box edge
 * 2. walk over edge
 * 3. rappell down/up
 * 		-> swing left/right?
 * 4. unhook from rope
 * ALGO.
 * set up:
 * 1. click on point in a box near player
 * 2. check if point is at a box edge
 * 		-> cast two rays at two different angles left edge( 0, 135 ), 
 * 			right edge( 180, 45 ) and one ray at 270
 * 3. set point as rope origin, set player pos( player.pos_real ) as rope end
 * 4. draw rope
 * moving:
 * 1. reset rope end whenever player moves
 * 		-> disable jumping
 * 2. player moves over edge ( player.isfalling = true )
 * 		than disable left right motion( no swinging for now )
 * 3. player reaches bottum ( player.isfalling = false )
 * 		than enable left right motion
 * 		-> stop copying player position?
 * end:
 * 1. click near player, rope end stops being updated with player position
 * 2. rope is added to ropes[] array
 * 3. when player is near a rope in ropes[] than draw rope to a visible distance
 * 		-> check that rope start and end are in draw window or cut the rope short
 */
var rope_length = 100,
	rope_ray = new Ray( new Vector( 0, 0), 0, 0 );
function Rope( start, end, left ) {
	//this.start = new Vector( start );
	//this.end = new Vector( end );
	//this.draw = false;
	//this.length = 100;
	//this.max_length = 100;
	this.ishooked = false;
	rope_ray.set( start, _270, BOX_D * 0.9 );
	
	if( rope_ray.cast() ) return false; //hooking rope to close to cieling
	
	//rope is left player
	if( left ) {
		
		rope_ray.set( start, _180, BOX_D );
		if( rope_ray.cast() ) return false; //theres a wall to the left of the hook
		rope_ray.set( start, _45, BOX_D*0.75 );
		if( rope_ray.cast() ) return false; //no wall behind and below point
		
	} else {
		
		rope_ray.set( start, 0, BOX_D );
		if( rope_ray.cast() ) return false; //theres a wall to the left of the hook
		rope_ray.set( start, _135, BOX_D*0.75 );
		if( rope_ray.cast() ) return false; //no wall behind and below point
		
	}
	
	//hook rope to point and player 
	this.start = new Vector( start );
	this.end = new Vector( end );
	this.ishooked = true;
	this.draw();
}
Rope.prototype.rappell = function( player_pos ) {
	this.end.copy( player_pos );
	//this.draw = true;
	this.draw();
}
//might not need this
Rope.prototype.unHook = function() {
	
}
//do we even need this
Rope.prototype.hookUp = function( left ) {
	
	rope_ray.set( this.start, _270, BOX_D * 0.9 );
	
	if( rope_ray.cast() ) return false; //hooking rope to close to cieling
	
	//rope is left player
	if( left ) {
		
		rope_ray.set( this.start, _180, BOX_D );
		if( rope_ray.cast() ) return false; //theres a wall to the left of the hook
		rope_ray.set( this.start, _45, BOX_D*0.75 );
		if( rope_ray.cast() ) return false; //no wall behind and below point
		
	} else {
		
		rope_ray.set( this.start, 0, BOX_D );
		if( rope_ray.cast() ) return false; //theres a wall to the left of the hook
		rope_ray.set( this.start, _135, BOX_D*0.75 );
		if( rope_ray.cast() ) return false; //no wall behind and below point
		
	}
	
	//hook rope to point and player 
	this.end = new Vector( end );
	this.start = new Vector( start );
	//this.draw = true;
	this.draw();
}
Rope.prototype.draw = function() {
	
	//if( this.draw ) {
		
	ctx.strokeStyle = "green";
		
	ctx.moveTo( this.start.x, this.start.y );
	ctx.lineTo( this.end.x, this.end.y );
		
	ctx.stroke();
	
	//}
	
}
Rope.prototype.set = function( start, end ) {
	this.start.copy( start );
	this.end.copy( end );
	//this.updateLength( this.end );
}
Rope.prototype.updateLength = function( v ) {
	this.length = this.start.distanceTo( v );	
}
Rope.prototype.addLength = function( num ) {
	this.length += num;
}
//TODO: fix this swing so that it keeps the ration ofstart.x and end.x
Rope.prototype.swing = function() {
	var difference_x = 0;
	if( this.end.x != this.start.x ) {
		difference_x = this.start.x - this.end.x;
		this.end.x += difference_x * 0.5;
  	}	 
}