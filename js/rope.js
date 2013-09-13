/**
 * @author Work
 * work in progress, my not be needed
 */
var rope_length = 100;
function Rope( start, end ) {
	this.start = start;
	this.end = end;
	this.length = 100;
	this.max_length = 100;
}
Rope.prototype.draw = function() {
	
	ctx.strokeStyle = "green";
	
	ctx.moveTo( this.start.x, this.start.y );
	ctx.lineTo( this.end.x, this.end.y );
	
	ctx.stroke();
	
}
Rope.prototype.set = function( start, end ) {
	this.start = start;
	this.end = end;
	this.updateLength( this.end );
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