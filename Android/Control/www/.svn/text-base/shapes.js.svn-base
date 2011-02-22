function Point(x,y,CEM) {
	this.x = x;
	this.y = y;
	this.CEM = CEM;
	debug.log("x = " + this.x + " :: y = " + this.y);
	this.draw();
}

Point.prototype.draw = function(color) {
	if(color != null) {
		this.CEM.ctx.fillStyle = color;
	}else{
		this.CEM.ctx.fillStyle = "rgba(255,0,255,.7)";	
	}					
	this.CEM.ctx.fillRect(this.x - 3, this.y - 3, 6, 6);					
}

function Poly(origin, CEM) {
	this.origin = origin;
	this.CEM = CEM;
	this.points = new Array(this.origin);
	this.fill = "rgba(255,0,255,.7)";
}

Poly.prototype.addPoint = function(newPoint) {
	//console.log("origin x = "+this.points[0].x+" mouseX = "+newPoint.x);
	if(Math.abs(newPoint.x - this.points[0].x) < 10 && Math.abs(newPoint.y - this.points[0].y) < 10) {			
		
		this.endPoly();
		this.CEM.polyStart = false;
		
		this.CEM.addPolygon(this);
		
	}else{
		this.points.push(newPoint);
		newPoint.draw();
	}
}

Poly.prototype.endPoly = function() {
	this.CEM.ctx.beginPath();
	this.CEM.ctx.moveTo(this.points[0].x, this.points[0].y);
	
	for(var i=1; i < this.points.length; i++) {
		this.CEM.ctx.lineTo(this.points[i].x, this.points[i].y);
	}
	this.CEM.ctx.fillStyle = this.fill;
	this.CEM.ctx.fill();
}

Poly.prototype.isInsidePolygon = function(p) { // p is point representing mouse location
	var counter = 0;
	
	var xinters;
	
	vertexArray = this.points;
	
	var N = vertexArray.length; // number of vertices
	
	p1 = vertexArray[0];
	
	for (i = 1; i <= N; i++) {
		p2 = vertexArray[i % N];
		if (p.y > Math.min(p1.y,p2.y)) {
			if (p.y <= Math.max(p1.y,p2.y)) {
				if (p.x <= Math.max(p1.x,p2.x)) {
					if (p1.y != p2.y) {
						xinters = (p.y-p1.y)*(p2.x-p1.x)/(p2.y-p1.y)+p1.x;
						if (p1.x == p2.x || p.x <= xinters)
							counter++;
					}
				}
			}
		}
		p1 = p2;
	}
	
	if (counter % 2 == 0)
		return(0);
	else
		return(1);
}