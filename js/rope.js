/**
 * @author Work
 * work in progress, my not be needed
 */
var rope_length = 100;
function Rope( start, end ) {
	this.start = start;
	this.end = end;
	this.length = 100;
}
Rope.prototype.draw = function() {
	
	//ctx.beginPath();
	ctx.strokeStyle = "green";
	
	ctx.moveTo( this.start.x, this.start.y );
	ctx.lineTo( this.end.x, this.end.y );
	
	ctx.stroke();
	//ctx.closePath();
	
}
Rope.prototype.set = function( start, end ) {
	this.start = start;
	this.end = end;
	this.updateLength( this.end );
}
Rope.prototype.updateLength = function( v ) {
	//var newlength = this.start.distanceTo( this.end );
	this.length = this.start.distanceTo( v );	
}
Rope.prototype.addLength = function( num ) {
	this.length += num;
}


/**
var rope = {  
			pos: new Vector( 0, 0 ),
			end: new Vector( 0, 0 ),
			size: 100,
			angle: Math.PI*0.5,
			points: [],
			bends: [],
			ropeRay: new Ray( this.pos, this.angle, this.size ),
			draw: function() {
				ctx.save();
				
				//ctx.moveTo( this.pos.x, this.pos.y );
				//ctx.lineTo( points[ 99].x
				
				var  n = this.bends.length - 1;
				var stroke = false;
				do{
				
					if( !stroke ) {
						ctx.moveTo( points[ bend[n] ].x, points[ bend[n] ].y );
					 } else {
						ctx.lineTo( points[ bend[n] ].x, points[ bend[n] ].y );
						ctx.stroke();8
					}
					
				
				}while( n >= 0 );
				
				ctx.lineTo( this.pos.x, this.pos.y );
				
				ctx.restore();
			},
			calcBends: function() {
			
				var  n = this.points.length - 1;
				do{
				
					if( this.points[n].y == this.points[n-1].y )
						this.bends.push( { a: n, b: n-1 } );
				
				}while( n > 0 );
				
				
			}
		};

**/
