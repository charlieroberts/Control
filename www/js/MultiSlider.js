function MultiSlider(ctx, props) {//x, y, width, height, color, stroke, min, max, startingValue, ontouchstart, ontouchmove, ontouchend, protocol, address, isVertical, numberOfSliders) { 
	this.ctx = ctx;
    //this.ctx = arguments[2];
	// MUST BE BEFORE WIDGET INIT
    this.widthInPercentage  = props.width  || props.bounds[2];
    this.heightInPercentage = props.height || props.bounds[3];
	
    this.__proto__ = new Widget(ctx,props);
		
    this.numberOfSliders   = (typeof props.numberOfSliders   != "undefined") ? props.numberOfSliders   : 4;
    this.requiresTouchDown = (typeof props.requiresTouchDown != "undefined") ? props.requiresTouchDown : false;
    this.children = [];

    this.origX = props.x;
    this.origY = props.y;
	
    this.isVertical = (typeof props.isVertical != "undefined") ? props.isVertical : true;
	
    this.init = function() {
		var sliderWidth, sliderHeight;
		var pixelWidth = 1 / control.deviceWidth;
		var pixelHeight = 1 / control.deviceHeight;
		if(this.isVertical) {
			sliderWidth =  this.widthInPercentage / this.numberOfSliders;// + pixelWidth;
			sliderHeight = this.heightInPercentage;
		}else{
			sliderHeight = this.heightInPercentage / this.numberOfSliders;// + pixelHeight;
			sliderWidth =  this.widthInPercentage;
		}
		for(var i = 0; i < this.numberOfSliders; i++) {
			var _x, _y, _width, _height;
			
			if(this.isVertical) {
				_x = sliderWidth * i;// - (i * pixelWidth);
				//if(i != 0) _x -= pixelWidth;
				_y = 0;
				_width = sliderWidth;// - (pixelWidth * 1);
				_height = sliderHeight;
			}else{
				_x = 0;
				_y = sliderHeight * i;// - (i * pixelHeight);
				_height = sliderHeight;
				_width  = sliderWidth;				
			}
			var newProps = {
				"x":this.origX + _x,
				"y":this.origY + _y,
				"width":sliderWidth, 
				"height":sliderHeight,
				"fillColor":this.fillColor,
				"strokeColor":this.strokeColor,
				"backgroundColor":this.backgroundColor,				
				"min":this.min,
				"max":this.max,
				"startingValue":this.value,
				"midiStartingValue":this.value,
				"midiMin":this.min,
				"midiMax":this.max,
				"ontouchstart":this.ontouchstart,
				"ontouchmove":this.ontouchmove,
				"ontouchend":this.ontouchend,
                "onvaluechange":this.onvaluechange,                
				"isLocal":this.isLocal,
				"isVertical":this.isVertical,
                "requiresTouchDown": this.requiresTouchDown,
				"midiType":this.midiType,
				"channel":this.channel,
			};
			
			var _w = new Slider(this.ctx, newProps, this.ctx);
			_w.address = this.address + "/" + i;
			_w.midiNumber = this.midiNumber+ i;
			_w.childID = i;
			_w.requiresTouchDown = false;
			this.children.push(_w);
        }
	}
	
	this.draw = function() {
		for(var i = 0; i < this.children.length; i++) {
			var _w = this.children[i];
			_w.draw();
		}
	}
	
	this.show = function() {
		for(var i = 0; i < this.children.length; i++) {
			var _w = this.children[i];
			_w.show();
		}
	}
	
	this.hide = function() {
		for(var i = 0; i < this.children.length; i++) {
			var _w = this.children[i];
			_w.hide();
		}
	}
	
	this.event = function(event) {
		touch = event.changedTouches.item(0);
		if(this.hitTest(touch.pageX, touch.pageY) || event.type == "touchend") {
			for(var i = 0; i < this.numberOfSliders; i++) {
				_w = this.children[i];
				_w.event(event);
			}
		}
    }
	
	this.setValue = function(sliderNumber, value) {
		var _w = this.children[sliderNumber];
		if(!(arguments[2] === false)) {
			_w.setValue(value, false);
		}else{
			_w.setValue(value);
		}
	}
	
	this.setSequentialValues = function() {
		for(var i = 0; i < arguments.length; i++) {
			if(!arguments[arguments.length - 1] == false) {
				this.setValue(i, arguments[i], false);
			}else{
				this.setValue(i, arguments[i]);
			}
		}
	}
	
	this.unload = function() {
		for(var i = 0; i < this.children.length; i++) {
			this.children[i].unload();
		}
	} 
	return this;
}