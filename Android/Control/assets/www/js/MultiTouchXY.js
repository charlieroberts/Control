gNOT_ACTIVE = -10000;
// TODO: touches don't adjust position when range is set via osc
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
	$(this.container).addClass('widget multiTouchXY');

	this.container.style.position = "absolute";
	this.container.style.display = "block";
	this.container.style.width  = this.width  - 2 + "px";
	this.container.style.height = this.height - 2 + "px";
	this.container.style.top = this.y + "px";
	this.container.style.left = this.x + "px";
	this.container.style.backgroundColor = this.backgroundColor;
	this.ctx.appendChild(this.container);
	
    this.touchCount = 0;
	this.container.style.border = "1px solid " + this.strokeColor;
	
	//this.touchColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF', '#80FF00', '#8000FF', '#0080FF', '#FF8080'];
	
	this.init = function() {
		if(!this.isMomentary) {
			for(var i = 0; i < this.maxTouches; i++) {
                this.addTouch(this.x + (i * 15), this.y + (i * 15), i);
			}
		}
	}
	
	this.addTouch = function(xPos, yPos, id) {
		var touch = document.createElement('div');
		//XXX should this be a widget or some sort of widget child?
		$(touch).addClass('widget touch');
		
		touch.style.display = "block";
		touch.style.position = "absolute";

        touch.style.border = this.strokeColor + " solid 1px";
        touch.style.width = (this.width / 8) +"px";
		touch.style.height = touch.style.width;
        touch.style.textAlign = "center";
        touch.style.lineHeight = touch.style.height;  
        touch.style.verticalAlign = "center";

        touch.style.left = xPos + "px";
        touch.style.top  = yPos + "px";
        touch.style.color = this.strokeColor;
        touch.style.backgroundColor = this.fillColor;
        touch.style.textShadow = "none";
		touch.id = (this.isMomentary) ? id : gNOT_ACTIVE;
		touch.childID = touch.id;
		touch.isActive = (this.isMomentary);
        if(!this.isMomentary) {
            touch.activeNumber = id + 1;
        }
		
		this.children.push(touch);
		touch.activeNumber = this.children.length;
        $(touch).text(touch.activeNumber);    
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
		if(touchFound != null) {
    		touchFound.id = id;
    		touchFound.isActive = true;
			this.changeValue(touchFound, xPos, yPos);
    	}
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
						
						eval(this.ontouchstart);
					}
					break;
				case "touchmove":
					for(var t = 0; t < this.children.length; t++) {
						_t = this.children[t];
						if(touch.identifier == _t.id) {
							this.changeValue(_t, touch.pageX, touch.pageY);
							eval(this.ontouchmove);
							break;
						}
					}
					
					break;
				case "touchend":
					for(var t = 0; t < this.children.length; t++) {
						_t = this.children[t];
						if(touch.identifier == _t.id) {
							eval(this.ontouchend);
							if(this.isMomentary) {
								this.removeTouch(_t);
							}else{
								_t.isActive = false;
								_t.id = gNOT_ACTIVE;
							}
						}
					}							
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
                touch.style.left = this.width - (this.half * 2) - 2 + "px";
                inputX = (this.x + this.width) - this.half * 2;
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
                touch.style.top = this.height - (this.half * 2) - 2 + "px";
                inputY = this.height - this.half * 2;
            }
        }
		
        touch.xpercentage = (inputX - (this.x )) / (this.width  - this.half * 2);
        touch.ypercentage = (inputY - (this.y )) / (this.height - this.half * 2);
        
        if(touch.xpercentage < 0) touch.xpercentage = 0; // needed to account for the - this.half * 2 above TODO: NOT PRECISE ON EDGES, SHOULD FIX
        if(touch.ypercentage < 0) touch.ypercentage = 0;
        
        var range = this.max - this.min;
        
		if(_protocol != "MIDI") {
			this.xvalue = this.min + (touch.xpercentage * range);
			this.yvalue = this.min + (touch.ypercentage * range);
		}else{
			this.xvalue = Math.round(this.min + (touch.xpercentage * range));
			this.yvalue = Math.round(this.min + (touch.ypercentage * range));
		}
        
		if(this.onvaluechange != null) eval(this.onvaluechange);
		if(!this.isLocal) this.output(touch);
	}
    
    this.setColors = function(newColors) {
        this.backgroundColor = newColors[0];
        this.fillColor = newColors[1];
        this.strokeColor = newColors[2];
        
        this.container.style.backgroundColor = this.backgroundColor;
        
        for(var i = 0; i < this.children.length; i++) {
			var touch = this.children[i];
            touch.style.color = this.strokeColor;
            touch.style.backgroundColor = this.fillColor;
            touch.style.border = this.strokeColor + " solid 1px";
        }
    }
    
    this.setBounds = function(newBounds) {
        this.width = Math.round(newBounds[2] * control.deviceWidth);
        this.height = Math.round(newBounds[3] * control.deviceHeight);
        this.x = Math.round(newBounds[0] * control.deviceWidth);
        this.y = Math.round(newBounds[1] * control.deviceHeight);
        
        this.container.style.width  = this.width - 2 + "px";
        this.container.style.height = this.height - 2 + "px";
        this.container.style.left = this.x  + "px";
        this.container.style.top  = this.y  + "px";
        
        if(typeof this.label != "undefined") {
            this.label.setBounds(newBounds);
        }
    }
	
//    this.setRange = function(min, max) {
//        this.min = min;
//        this.max = max;
//        
//        for(var i = 0; i < this.maxTouches; i++) {
//            var touch = this.children[i];
//            touch.style.left = ( touch.xpercentage * parseInt(this.container.style.width ) ) + "px";
//            touch.style.top  = ( touch.ypercentage * parseInt(this.container.style.height) ) + "px";
//        }
//
//    }
	this.output = function(touch) {
		//var valueString = "";
        //if(_protocol == "OSC") {
            // valueString = "|" + this.address;
            //            if (this.maxTouches > 1) {
            //              valueString += "/" + touch.activeNumber;
            //            }
            //            valueString += ":" + this.xvalue + "," + this.yvalue;
	        PhoneGap.exec(null, null, 'OSCManager', 'send', [this.address + "/" + touch.activeNumber, 'ff', this.xvalue, this.yvalue] );
        // }else if(_protocol == "MIDI") {
        //             var xnum = this.midiNumber + (touch.activeNumber * 2) - 2;
        //             var ynum = xnum + 1;
        //              
        //             valueString  = "|" + this.midiType + "," + (this.channel - 1) + "," + xnum + "," + Math.round(this.xvalue);
        //             valueString += "|" + this.midiType + "," + (this.channel - 1) + "," + ynum + "," + Math.round(this.yvalue);
        //         }
		//control.valuesString += valueString;

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
		
		var touch = this.children[touchNumber - 1];
		touch.style.left = ( xPercentageOfRange * parseInt(this.container.style.width ) ) + "px";
		touch.style.top  = ( yPercentageOfRange * parseInt(this.container.style.height) ) + "px";
	}
	
	this.draw = function() {}
	
	this.unload = function() {
		this.ctx.removeChild(this.container);
	}
	
	return this;
}
