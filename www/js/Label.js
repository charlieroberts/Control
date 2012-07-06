Control.Label = function(ctx, props) {
    this.make(ctx, props);
    
	this.size  = (typeof props.size != "undefined") ? props.size : 12;
    
    this.value = (typeof props.value == "undefined") ? "" : props.value;
    
    this.name = props.name; 
    this.labelSize = props.labelSize || 12;

    this.label = document.createElement("h3");
    $(this.label).addClass('widget label');

    this.align = (typeof props.align != "undefined") ? props.align : "center";
    this.verticalCenter = (typeof props.verticalCenter != "undefined") ? props.verticalCenter : true;
    
    $(this.label).css({
        "text-align": this.align,
        "z-index"   : 10,
        "position"  : "absolute",
        "left"      : this.x + "px",
        "top"       : (this.y - this.size) + "px",
        "color"     : this.color,
        "width"     : this.width + "px",
        "height"    : this.height + "px",
        "font-size" : this.size + "px",
        "overflow"  : "hidden",        
        "background-color" : this.backgroundColor,
    });
    
    this.container = this.label;
    
    this.label.style.lineHeight = (this.verticalCenter) ? this.height + "px" : (this.size + 2) + "px";
      
    this.ctx.appendChild(this.label);
    
    return this;
}

Control.Label.prototype = new Widget();

Control.Label.prototype.draw = function() {
    this.changeValue(this.value);
}

//    Label.prototype.draw = function() {
//        this.ctx.fillStyle = this.strokeColor;
//        this.ctx.textBaseline = 'middle';
//        this.ctx.textAlign = "center";
//        this.ctx.font = this.labelSize + "px helvetiker";
//        this.ctx.fillText(this.value, this.x + this.width / 2 , this.y + this.height / 2);
//    }

Control.Label.prototype.setColors = function(newColors) {
    this.backgroundColor = newColors[0];
    this.fillColor = newColors[1];
    this.strokeColor = newColors[2];
    
    this.label.style.color = this.fillColor;
    this.label.style.backgroundColor = this.backgroundColor;
}


Control.Label.prototype.event = function(event, eventType) {}

Control.Label.prototype.changeValue = function(x) {
    this.value = x;
    //$(this.label).text(this.value);
    this.label.innerHTML = this.value;
}

Control.Label.prototype.setValue = function(x) {
    this.changeValue(x);
}

Control.Label.prototype.setBounds = function(newBounds) {
    this.width = Math.round(newBounds[2] * $("#selectedInterface").width());
    this.height = Math.round(newBounds[3] * $("#selectedInterface").height());
    this.x = Math.round(newBounds[0] * $("#selectedInterface").width());
    this.y = Math.round(newBounds[1] * $("#selectedInterface").height());
    
    $(this.label).css({
        "width":    this.width,
        "height":   this.height,
        "top":      (this.y - this.size) + "px",
        "left":     this.x + "px",
        "line-height": (this.verticalCenter) ? this.height + "px" : (this.size + 2) + "px",
    });
}

Control.Label.prototype.output = function() { }

Control.Label.prototype.show = function() {
    this.label.style.display = "block";
}

Control.Label.prototype.hide = function() {
    this.label.style.display = "none";
}

Control.Label.prototype.unload = function() {
    this.ctx.removeChild(this.label);
}
