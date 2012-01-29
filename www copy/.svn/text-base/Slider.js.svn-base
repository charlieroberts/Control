function Slider(ctx, x, y, width, height, color, min, max, numSliders, isVertical, isInverted, startingValue, ontouchstart, ontouchmove, ontouchend, protocol, hasLabel)
{
	this.__proto__ = new Widget(ctx,x,y,width,height,color,0);
	
	this.ontouchstart	= ontouchstart	|| null;
	this.ontouchmove	= ontouchmove		|| null;  
	this.ontouchend		= ontouchend		|| null;
	this.protocol			= protocol			|| "OSC";
	this.isInverted		= isInverted		|| false;
	this.numSliders		= numSliders		|| 1;
	this.isVertical		= isVertical;
	
	//if(this.numSliders == 1) this.isVertical = height > width ? true : false;
	
	this.value = [];
	this.lastValue = [];
	this.sliderSize = [];
	
	for(i = 0; i < this.numSliders; i++)
		this.lastValue[i] = 0;
	
	
	if(min < max)			// ensure max > min
	{
		this.min = min;
		this.max = max;
	} else {
		this.min = max;
		this.max = min;
	}
	
	this.valueRange = this.max - this.min;
	
	if ( (this.min < 0 && this.max > 0) || (this.min > 0 && this.max < 0) )
		this.hasNegPosRange = true;
	else 
		this.hasNegPosRange = false;
	
	this.sign = this.isInverted ? -1 : 1;
	
	if(this.isVertical)
		this.pixelRange = this.height;
	else 
		this.pixelRange = this.width;
	
	// what pixel will value = 0 (or min)?
	if(this.isVertical)
	{
		if(this.max <= 0) 
			this.zeroPixel = this.y + this.isInverted*this.height;
		else if(this.min >= 0)
			this.zeroPixel = this.y + !this.isInverted*this.height;
		else
			this.zeroPixel = this.y + !this.isInverted*this.height*Math.abs(this.max)/this.valueRange + this.isInverted*this.height*Math.abs(this.min)/this.valueRange;
	} 
	else 
	{
		if(this.max <= 0) 
			this.zeroPixel = this.x + !this.isInverted*this.width;
		else if(this.min >= 0)
			this.zeroPixel = this.x + this.isInverted*this.width;
		else 
			this.zeroPixel = this.x + !this.isInverted*this.width*Math.abs(this.min)/this.valueRange + this.isInverted*this.width*Math.abs(this.max)/this.valueRange;
	}
	
	this.hasLabel = hasLabel || false;
	this.shouldDraw = false;
	
	
	if(this.hasLabel) {
		this.label = new Label(ctx, 0, .5, width, height, color, "" + startingValue, 12);
		control.addWidget(this.label, 0); // TODO: need to get current page of interface for this method
	}
	
	this.draw = function() {
		this.ctx.clearRect(this.x,this.y,this.width,this.height);
		this.ctx.fillStyle = "rgb(0,0,80)";
		this.ctx.strokeStyle = "rgb(0,0,256)";
		this.ctx.strokeRect(this.x, this.y, this.width, this.height);
		
		for(j = 0; j < this.numSliders; j++)
		{
			if(this.isVertical)
				this.ctx.fillRect(this.x + j*this.width/this.numSliders, this.zeroPixel, this.width/this.numSliders, -this.sign * this.sliderSize[j]);
			else
				this.ctx.fillRect(this.zeroPixel, this.y + j*this.height/this.numSliders, this.sign * this.sliderSize[j], this.height/this.numSliders);
		}
		//if(this.hasLabel) this.label.draw();
	}
	
	
	
	this.event = function(event)
	{
	  for (j = 0; j < event.changedTouches.length; j++)
		{
			touch = event.changedTouches.item(j);
			
		  if(event.type == "touchstart" && this.hitTest(touch.pageX, touch.pageY)) // if touch starts over this widget
  		{
  			this.activeTouches.push(touch.identifier);
				
  			if(this.isVertical) 
					this.changeValue(touch.pageX, touch.pageY);
  			else 
					this.changeValue(touch.pageY, touch.pageX);
  		}
  		else for(i in this.activeTouches) 
  		{
				if(event.type == "touchmove" && touch.identifier == this.activeTouches[i])			// if moved touch ID is in the list of active touches
				{
					if(this.isVertical && touch.pageX > this.x && touch.pageX < this.x+this.width) 
						this.changeValue(touch.pageX, touch.pageY);
					else if(!this.isVertical && touch.pageY > this.y && touch.pageY < this.y+this.height)
						this.changeValue(touch.pageY, touch.pageX);
				}
  			else if(event.type == "touchend" && touch.identifier == this.activeTouches[i]) // if ended touch ID is in the list of active touches
  			{
  				this.activeTouches.splice(i,1);	// remove touch ID from array
  			}
  		}
  	}
	}
	
	this.changeValue = function(location, input)
	{
		// confusing - possible to simplify?
		
		for(i = 0; i < this.numSliders; i++)
			if(this.isVertical && location >= this.x + i*this.width/this.numSliders && location < this.x + (i+1)*this.width/this.numSliders
				 || !this.isVertical && location >= this.y + i*this.height/this.numSliders && location < this.y + (i+1)*this.height/this.numSliders)
			{
				whichSlider = i;
				break;
			}
		
		this.lastValue[whichSlider] = this.value[whichSlider];
		
		if(this.isVertical)
			this.value[whichSlider] = this.min + -this.sign * this.valueRange * (input - (this.y + !this.isInverted*this.height)) / this.pixelRange;	
		else 		
			this.value[whichSlider] = this.min + this.sign * this.valueRange * (input - (this.x + this.isInverted*this.width)) / this.pixelRange;	
		
		if (this.value[whichSlider] > this.max)
			this.value[whichSlider] = this.max;
		else if (this.value[whichSlider] < this.min)
			this.value[whichSlider] = this.min;
		
		if(this.min > 0)
			this.sliderSize[whichSlider] = (this.value[whichSlider] - this.min)* this.pixelRange / (this.valueRange);
		else if(this.max < 0) 
			this.sliderSize[whichSlider] = (this.value[whichSlider] - this.max)* this.pixelRange / (this.valueRange);
		else 
			this.sliderSize[whichSlider] = this.value[whichSlider]* this.pixelRange / (this.valueRange);
		
		if (this.lastValue[whichSlider] != this.value[whichSlider])
		{		
			/*if(this.hasLabel) {
			 this.label.value = "" + this.value;
			 this.label.draw();
			 }*/
			//this.draw();
			
			this.shouldDraw = true;
			//eval(this.ontouchmove);
			var valueString = "|" + this.address;
			if (this.numSliders > 1) {
			  valueString += "/" + whichSlider;
			}
			valueString += ":" + this.value;
      control.valuesString += valueString;
		}
	}
	
	return this;
}

/*
 this.ctx.lineWidth = 8;
 this.ctx.lineJoin = "round";
 this.ctx.fillStyle = "rgb(0,0,80)";
 this.ctx.strokeStyle = "rgb(0,0,80)";
 cornerRadius = 10;
 
 this.ctx.beginPath();
 this.ctx.moveTo(this.x + this.width/2, this.y);
 this.ctx.lineTo(this.x + this.width/2, this.y + this.height);
 this.ctx.stroke();
 
 
 this.ctx.strokeStyle = "rgb(0,0,256)";
 this.ctx.strokeRect(this.x,this.y,this.width,this.height);
 this.ctx.beginPath();
 this.ctx.moveTo(this.x, this.y);
 this.ctx.lineTo(this.x + this.width, this.y);
 this.ctx.lineTo(this.x + this.width, this.y + this.height);
 this.ctx.lineTo(this.x, this.y + this.height);
 this.ctx.closePath();
 //this.ctx.stroke();
 this.ctx.clip();
 
 this.ctx.beginPath();
 this.ctx.moveTo(this.x, this.y + cornerRadius);
 this.ctx.arc(this.x+cornerRadius, this.y+cornerRadius, cornerRadius, Math.PI, 3*Math.PI/2, false);
 this.ctx.lineTo(this.x+this.width-cornerRadius, this.y);
 this.ctx.arc(this.x+this.width-cornerRadius, this.y+cornerRadius, cornerRadius, 3*Math.PI/2, 0, false);
 this.ctx.lineTo(this.x+this.width, this.y+this.height-cornerRadius);
 this.ctx.arc(this.x+this.width-cornerRadius, this.y+this.height-cornerRadius, cornerRadius, 0, Math.PI/2, false);
 this.ctx.lineTo(this.x+cornerRadius, this.y+this.height);
 this.ctx.arc(this.x+cornerRadius, this.y+this.height-cornerRadius, cornerRadius, Math.PI/2, Math.PI, false);
 this.ctx.closePath();
 //this.ctx.stroke();
 this.ctx.clip();
 */