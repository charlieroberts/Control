function Label(ctx, props) { //x, y, width, height, color, value, size, align) {
	this.__proto__ = new Widget(ctx,props); //x,y,width,height,color);
    //this.ctx = arguments[2];
	this.size = (typeof props.size != "undefined") ? props.size : 12;

	this.value = props.value;
    if(typeof this.value == "undefined") this.value = "";
	this.widgetID = -1;
    
    this.name = props.name;
    this.labelSize = props.labelSize || 12;

    this.label = document.createElement("h3");
	 $(this.label).addClass('widget label');

    this.align = (typeof props.align != "undefined") ? props.align : "center";
    this.verticalCenter = (typeof props.verticalCenter != "undefined") ? props.verticalCenter : true;
    
    this.label.setAttribute("style", "text-align:" + this.align + "; z-index:10; position:absolute; left:" + this.x + "px; top:" + (this.y - this.size) + "px; color:" + this.color + "; width:" + this.width + "px; height:" + this.height + "px; font-size:" + this.size + "px;");
    this.label.style.lineHeight = (this.verticalCenter) ? this.height + "px" : (this.size + 2) + "px";
    //this.label.style.textShadow = "none";
    this.label.style.backgroundColor = this.backgroundColor;
    //this.label.innerHTML = this.value;        
    this.ctx.appendChild(this.label);
    
    
    
	this.draw = function() {
        //console.log("draw " + this.name);
		this.changeValue(this.value);
	}
    
    this.setColors = function(newColors) {
        this.backgroundColor = newColors[0];
        this.fillColor = newColors[1];
        this.strokeColor = newColors[2];
        
        this.label.style.color = this.fillColor;
        this.label.style.backgroundColor = this.backgroundColor;
    }
//    this.draw = function() {
//        this.ctx.fillStyle = this.strokeColor;
//        this.ctx.textBaseline = 'middle';
//        this.ctx.textAlign = "center";
//        this.ctx.font = this.labelSize + "px helvetiker";
//        this.ctx.fillText(this.value, this.x + this.width / 2 , this.y + this.height / 2);
//    }

	this.event = function(event, eventType) {}

	this.changeValue = function(x) {
        this.value = x;
        //$(this.label).text(this.value);
        this.label.innerHTML = this.value;
	}
	
	this.setValue = function(x) {
		this.changeValue(x);
	}
    
    this.setBounds = function(newBounds) {
        this.width = Math.round(newBounds[2] * control.deviceWidth);
        this.height = Math.round(newBounds[3] * control.deviceHeight);
        this.x = Math.round(newBounds[0] * control.deviceWidth);
        this.y = Math.round(newBounds[1] * control.deviceHeight);
        
        this.label.style.width  = this.width;						// DO NOT USE STYLES TO RESIZE CANVAS OBJECT
        this.label.style.height = this.width;					// DO NOT USE STYLES TO RESIZE CANVAS OBJECT
        this.label.style.top  = (this.y - this.size) + "px";
        this.label.style.left = this.x + "px";
        
        this.label.style.lineHeight = (this.verticalCenter) ? this.height + "px" : (this.size + 2) + "px";        
    }
	this.output = function() {
	//control.send("/msg", "i", this.value);
	}
	
	this.show = function() {
		this.label.style.display = "block";
	}
	
	this.hide = function() {
		this.label.style.display = "none";
	}
	this.unload = function() {
		this.ctx.removeChild(this.label);
	}
	return this;
}
