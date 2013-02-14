// Video is a singleton object.
Control.Video = function(ctx, props) {
    this.make(ctx, props);
    this.ctx = ctx;
	this.canvas  = document.createElement("canvas");
	this.canvas.width = 144;
	this.canvas.height = 192;
	
	$(this.canvas).css({
		"position": "absolute",
		"top": "0px", 
		"left": "0px", 
		"display": "block", 
		"background-color": "#f00", 
	});
	
	this.ctx.appendChild(this.canvas);
	this.canvasCtx = this.canvas.getContext('2d');
	
	if(Control.protocol == "MIDI") {
		this.max = (typeof props.midiMax != "undefined") ? props.midiMax : 127;
		this.min = (typeof props.midiMin != "undefined") ? props.midiMin : 0;
	}else{
		this.max = (typeof props.max != "undefined") ? props.max : 1;
		this.min = (typeof props.min != "undefined") ? props.min : 0;			
	}
	this.userDefinedRange = this.max - this.min;
    
	console.log("MADE A VIDEO OBJECT");
	Control.video = this;
    this.start(this.x, this.y, this.width, this.height);
    
    return this;
}

Control.Video.prototype = new Widget();

Control.Video.prototype.onUpdate = function(blobX, blobY) {
    //console.log("BLOB"  + blobX + ":" + blobY);
    this.x = blobX * this.userDefinedRange;
    this.y = blobY * this.userDefinedRange;
    //console.log(this.x + ":" + this.y);
    if(!this.isLocal && Control.protocol == "OSC") {
        var valueString = "|" + this.address;
        valueString += ":" + this.x + "," + this.y;
        Control.valuesString += valueString;
    }else if (!this.isLocal && Control.protocol == "MIDI") {
        var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber+ "," + Math.round(this.x);
        Control.valuesString += valueString;
        valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber+ 1) + "," + Math.round(this.y);
        Control.valuesString += valueString;
    }
    
    
	//console.log("RECEIVED FRAME!" + videoFrame[0] + ": " + videoFrame[20] + ":" + videoFrame[30]);
	
	/*var newFrame = [];
	var myImageData = this.canvasCtx.getImageData(0, 0, 144, 192);
	for(var i = 0; i < videoFrame.length; i++) {
		var pixVal = Math.floor(videoFrame[i] * 255);
		if(i == 0) console.log(pixVal);
		for(var j = 0; j < 4; j++) {
			myImageData[i * 4 + j] = pixVal;
		}
	}
	
	this.canvasCtx.putImageData(myImageData, 0, 0);
	*/
     
    // this.x = x;
    // this.y = y;
    // this.z = z;
    // this.heading = this.min + (((0 - this.hardwareMin) + _heading) / this.hardwareRange ) * this.userDefinedRange;
    // 
    // if(!this.isLocal && Control.protocol == "OSC") {
    //     var valueString = "|" + this.address;
    //     valueString += ":" + this.heading;
    //     Control.valuesString += valueString;
    // }else if (!this.isLocal && Control.protocol == "MIDI") {
    //     var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber+ "," + Math.round(this.heading);
    //     Control.valuesString += valueString;
    // }
    // 
    // if(this.onvaluechange != null) {
    //     if(typeof this.onvaluechange === "string") {
    //         eval(this.onvaluechange);
    //     }else{
    //         this.onvaluechange();
    //     }
    // }
}

Control.Video.prototype.draw = function() {}

Control.Video.prototype.start = function() {
    console.log("STARTING VIDEO");
    PhoneGap.exec(null, null, "Video", "start", [this.x, this.y, this.width, this.height]);
}

Control.Video.prototype.unload = function() {
    console.log("ENDING VIDEO");
    PhoneGap.exec("Video.stop", null);
}