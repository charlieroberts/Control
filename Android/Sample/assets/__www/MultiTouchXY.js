gNOT_ACTIVE = -10000;
    
function MultiTouchXY(ctx, props) {
	this.__proto__ = new Widget(ctx,props);
	
	this.xvalue = this.min;
	this.yvalue = this.min;
	this.half = (this.width / 8) / 2;
	this.maxTouches = props.maxTouches > 0 ? props.maxTouches : 1;
	this.children = new Array();
	this.valuesX = [];
	this.valuesY = [];
	this.isMomentary = (typeof props.isMomentary == "undefined") ? true : props.isMomentary;
	
	this.container = document.createElement('div');
	this.container.style.position = "absolute";
	this.container.style.display = "block";
	this.container.style.width = this.width + "px";
	this.container.style.height = this.height + "px";
	this.container.style.top = this.y + "px";
	this.container.style.left = this.x + "px";
	this.ctx.appendChild(this.container);
	
    this.touchCount = 0;
	this.container.style.border = "1px solid #999999";
	
	this.touchColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF', '#80FF00', '#8000FF', '#0080FF', '#FF8080'];
	
	this.init = function() {
		if(!this.isMomentary) {
			for(var i = 0; i < this.maxTouches; i++) {
                this.addTouch(this.x + (i * 15), this.y + (i * 15), i);
			}
		}
	}
	
	this.addTouch = function(xPos, yPos, id) {
		var touch = document.createElement('div');
		
		touch.style.display = "block";
		touch.style.position = "absolute";

        touch.style.border = "#999 solid 1px";
        touch.style.width = (this.width / 8) +"px";
		touch.style.height = touch.style.width;
        touch.style.textAlign = "center";
        touch.style.lineHeight = touch.style.height;  
        touch.style.verticalAlign = "center";

        touch.style.left = xPos + "px";
        touch.style.top  = yPos + "px";
        touch.style.color = "#ccc";
        touch.style.backgroundColor = "#333";
		touch.id = (this.isMomentary) ? id : gNOT_ACTIVE;
		touch.isActive = (this.isMomentary);
        if(!this.isMomentary) {
            touch.activeNumber = id + 1;
        }
		
		this.children.push(touch);
		touch.activeNumber = this.children.length;
        touch.innerHTML = touch.activeNumber;    
		this.container.appendChild(touch);
		//this.changeValue(touch, xPos, yPos);
	}
	
	this.removeTouch = function(touchToRemove) {
		for(var i = 0; i < this.children.length; i++) {
			var touch = this.children[i];
			if(touchToRemove.id == touch.id) {
				this.container.removeChild(touch);
				this.children.splice(i,1);
				break;
			}
		}
	}
		
	this.trackTouch = function(xPos, yPos, id) {
		var closestDiff = 10000;
		var touchFound = null;
		var touchNum = null;
		for(var i = 0; i < this.children.length; i++) {
			var touch = this.children[i];
			var xdiff = Math.abs((xPos - this.x) - (parseInt(touch.style.left) + (parseInt(touch.style.width)  / 2)));
			var ydiff = Math.abs((yPos - this.y) - (parseInt(touch.style.top)  + (parseInt(touch.style.height) / 2)));
			if(!touch.isActive) {
				if(xdiff + ydiff < closestDiff) {
					closestDiff = xdiff + ydiff;
					touchFound = touch;
					touchNum = i;
				}
			}
		}
		touchFound.id = id;
		touchFound.isActive = true;
		if(touchFound != null)
			this.changeValue(touchFound, xPos, yPos);
	}
	
	this.event = function(event) {
		for (var j = 0; j < event.changedTouches.length; j++) {
			var touch = event.changedTouches.item(j);
			
			switch(event.type) {
				case "touchstart":
					if(this.hitTest(touch.pageX, touch.pageY)) {
						if(this.isMomentary) 
							this.addTouch(touch.pageX , touch.pageY , touch.identifier);
						else
							this.trackTouch(touch.pageX, touch.pageY , touch.identifier);
					}
					eval(this.ontouchstart);
					break;
				case "touchmove":
					for(var t = 0; t < this.children.length; t++) {
						_t = this.children[t];
						if(touch.identifier == _t.id) {
							this.changeValue(_t, touch.pageX, touch.pageY);
							break;
						}
					}
					eval(this.ontouchmove);
					break;
				case "touchend":
					for(var t = 0; t < this.children.length; t++) {
						_t = this.children[t];
						if(touch.identifier == _t.id) {
							if(this.isMomentary) {
								this.removeTouch(_t);
							}else{
								_t.isActive = false;
								_t.id = gNOT_ACTIVE;
							}
						}
					}							
					eval(this.ontouchend);
					break;
			}
		}
	}
	
	this.changeValue = function(touch, inputX, inputY) {
        var xLeft   = inputX - this.half;
        var xRight  = inputX + this.half;
        var yTop    = inputY - this.half;
        var yBottom = inputY + this.half;
        
		//console.log("x touch = " + inputX + " :: xLeft = " + xLeft + " :: xRight = " + xRight + " :: x = " + this.x + " :: width = " + this.width);

        // adjust x?
        if(xLeft > this.x && xRight < this.x + this.width) {
			inputX -= this.half;
            touch.style.left = (inputX - this.x) + "px";
        }else{
            if(xLeft < this.x) {
                touch.style.left = "0px";
                inputX = 0;
            } else {
                touch.style.left = this.width - (this.half * 2) + "px";
                inputX = this.x - this.half * 2;
            }
        }
        
        // adjust y?
        if(yTop > this.y && yBottom < this.y + this.height) {
			inputY -= this.half;
            touch.style.top = (inputY - this.y) + "px";
        }else{
            if(yBottom < this.y + this.height) {
                touch.style.top = "0px";
                inputY = 0;
            }else{
                touch.style.top = this.height - (this.half * 2) + "px";
                inputY = this.height - this.half * 2;
            }
        }
		
        var xpercentage = (inputX - (this.x )) / (this.width  - this.half * 2);
        var ypercentage = (inputY - (this.y )) / (this.height - this.half * 2);
        
        var range = this.max - this.min;
        
		if(_protocol != "MIDI") {
			this.xvalue = this.min + (xpercentage * range);
			this.yvalue = this.min + (ypercentage * range);
		}else{
			this.xvalue = Math.round(this.min + (xpercentage * range));
			this.yvalue = Math.round(this.min + (ypercentage * range));
		}
        
		if(this.onvaluechange != null) eval(this.onvaluechange);
		this.output(touch);
	}
	
	this.output = function(touch) {
		var valueString = "";
        if(_protocol == "OSC") {
            valueString = "|" + this.address;
            if (this.maxTouches > 1) {
              valueString += "/" + touch.activeNumber;
            }
            valueString += ":" + this.xvalue + "," + this.yvalue;
        }else if(_protocol == "MIDI") {
            var xnum = this.midiNumber + (touch.activeNumber * 2) - 2;
            var ynum = xnum + 1;
            
            valueString  = "|" + this.midiType + "," + (this.channel - 1) + "," + xnum + "," + Math.round(this.xvalue);
            valueString += "|" + this.midiType + "," + (this.channel - 1) + "," + ynum + "," + Math.round(this.yvalue);
        }
		control.valuesString += valueString;

	}
	
	this.show = function() {
		this.container.style.display = "block";
		if(!this.isMomentary) {
			for(var i = 0; i < this.maxTouches; i++) {
				var d = this.children[i];
				d.style.display = "block";
			}
		}
	}
	
	this.hide = function() {
		this.container.style.display = "none";
		if(!this.isMomentary) {		
			for(var i = 0; i < this.maxTouches; i++) {
				var d = this.children[i];
				d.style.display = "none";
			}
		}
	}
	
	this.setValue = function(touchNumber, xValue, yValue) {
		var xPercentageOfRange = (xValue - (this.min )) / (this.max - this.min);
		var yPercentageOfRange = (yValue - (this.min )) / (this.max - this.min);
		
		var touch = this.children[touchNumber];
		touch.style.left = ( xPercentageOfRange * parseInt(this.container.style.width ) ) + "px";
		touch.style.top  = ( yPercentageOfRange * parseInt(this.container.style.height) ) + "px";
	}
	
	this.draw = function() {}

	return this;
}