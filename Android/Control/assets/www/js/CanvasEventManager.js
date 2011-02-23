function CanvasEventManager() {
	this.polygons = new Array();
	//this.ctx = canvas.getContext('2d');
    
	this.polyStart = false;
	this.draggingPoint = false;
	this.draggingPoly = false;
	
	this.dragPoint = null;
	this.dragPoly = null;
	this.currentPoly = null;
	
	this.prevX = 0;
	this.prevY = 0;
}

CanvasEventManager.prototype.addPolygon = function(polygon) { this.polygons.push(polygon); }	

CanvasEventManager.prototype.mouseDown = function(e) { // checks to see if a point is being dragged, if not, checks to see if a poly is being dragged
  eventTouch = e.changedTouches.item(0);
	dragPoint = new Point(eventTouch.pageX, eventTouch.pageY, this);
	if(!this.isDraggingPoint(dragPoint)) {						
		this.isDraggingPoly(dragPoint);
	}
}

CanvasEventManager.prototype.mouseUp = function(e) {
  eventTouch = e.changedTouches.item(0);
  
	if(this.draggingPoint || this.draggingPoly) { 
		if(this.draggingPoly) {
			this.polygons[this.dragPoly].fill = "rgba(255,0,255,.7)";
			this.refresh();
		}
	}else{ 
		var newPoint = new Point(eventTouch.pageX, eventTouch.pageY, this);
		if(!this.polyStart) {
			if(!this.draggingPoint && !this.draggingPoly) {
				this.currentPoly = new Poly(newPoint, this);
				this.polyStart = true;
				newPoint.draw();
			}
		}else{
			this.currentPoly.addPoint(newPoint);
		}
	}
	this.draggingPoint = false;
	this.draggingPoly = false;
}

CanvasEventManager.prototype.mouseMove = function(e) {
  eventTouch = e.changedTouches.item(0);
  
	if(this.draggingPoint) {
		var newPoint = new Point(eventTouch.pageX, eventTouch.pageY, this);
		this.polygons[this.dragPoly].points[this.dragPoint] = newPoint;
		this.refresh();
	}else if(this.draggingPoly) {
		var poly = this.polygons[CEM.dragPoly];
		for(var i=0; i < poly.points.length; i++) {
			var point = poly.points[i];
			point.x -= this.prevX - eventTouch.pageX
			point.y -= this.prevY - eventTouch.pageY;
		}
		this.refresh();
	}
	this.prevX = eventTouch.pageX;
	this.prevY = eventTouch.pageY;
}

CanvasEventManager.prototype.isDraggingPoly = function(dragPoint) {
	for(var i=0; i < this.polygons.length; i++) {
		if(this.polygons[i].isInsidePolygon(dragPoint)) {
			this.draggingPoly = true;
			this.dragPoly = i;
			this.polygons[i].fill = "rgba(255,255,0,.7)";
			break;
		}
	}	
}

CanvasEventManager.prototype.isDraggingPoint = function(dragPoint) {
	for(var i=0; i < this.polygons.length; i++) {
		var poly = this.polygons[i];
		for(var j=0; j < poly.points.length; j++ ) {
			var point = poly.points[j];
			
			if(Math.abs(dragPoint.x - point.x) < 10 && Math.abs(dragPoint.y - point.y) < 10) {
				this.dragPoly = i;
				this.dragPoint = j;
				this.draggingPoint = true;
				return true;
			}
		}
	}
	return false;
}

CanvasEventManager.prototype.refresh = function() {
	this.ctx.clearRect(0,0,750,750);
	for(var i=0; i < this.polygons.length; i++) {
		var poly = this.polygons[i];					
		for(var j=0; j < poly.points.length; j++ ) {
			if(j==0) {
				poly.points[j].draw("rgba(255,0,255,.7)");
			}else{
				poly.points[j].draw("rgba(255,0,255,.7)");
			}
		}
		poly.endPoly();
	}
}