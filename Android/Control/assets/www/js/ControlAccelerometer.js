Control.Accelerometer = function(props) {
    this.make("sensor", props);
	this.x = 0;
	this.y = 0;
	this.z = 0;
	
	if(device.platform != "Android") {
	    this.hardwareMin = -2.307; // as found here: http://www.iphonedevsdk.com/forum/iphone-sdk-development/4822-maximum-accelerometer-reading.html
	    this.hardwareMax = 2.307;  // -1 to 1 works much better for devices without gyros to measure tilt, -2 to 2 much better to measure force
	}else{
	    this.hardwareMin = -9.81; //    
	    this.hardwareMax = 9.81;  // says that the range is [0, 1]. But, it seems more like [-1G, 1G]
	}
    this.hardwareRange = this.hardwareMax - this.hardwareMin;

	if(Control.protocol == "MIDI") {
		this.max = (typeof props.midiMax != "undefined") ? props.midiMax : 127;
		this.min = (typeof props.midiMin != "undefined") ? props.midiMin : 0;
	}else{
		this.max = (typeof props.max != "undefined") ? props.max : this.hardwareMax;
		this.min = (typeof props.min != "undefined") ? props.min : this.hardwareMin;			
	}
    this.userDefinedRange = this.max - this.min;
    
    if(typeof props.updateRate != "undefined") {
        this.updateRate = props.updateRate;
    }else{
        this.updateRate = 10;
    }
	var watchID = null;
	this.delay = 1000 / this.updateRate;
	
    return this;
}

Control.Accelerometer.prototype = new Widget();

Control.Accelerometer.prototype._onAccelUpdate = function(x,y,z) { 
    this.x = this.min + (((0 - this.hardwareMin) + x) / this.hardwareRange ) * this.userDefinedRange;
    this.y = this.min + (((0 - this.hardwareMin) + y) / this.hardwareRange ) * this.userDefinedRange;
    this.z = this.min + (((0 - this.hardwareMin) + z) / this.hardwareRange ) * this.userDefinedRange;
    
//    console.log("this.x = " + this.x + " || this.y = " + this.y + " || z = " + this.z);
    if(this.onvaluechange != null) {
        if(typeof this.onvaluechange !== "string") {
            this.onvaluechange();
        }else{
            eval(this.onvaluechange);
        }
    }
    
    if(!this.isLocal && Control.protocol == "OSC") {
        var valueString = "|" + this.address;
        valueString += ":" + this.x + "," + this.y + "," + this.z;
        Control.valuesString += valueString;
    }else if (!this.isLocal && Control.protocol == "MIDI") {
        var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber+ "," + Math.round(this.x);			
        Control.valuesString += valueString;
        valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber+ 1) + "," + Math.round(this.y);			
        Control.valuesString += valueString;
        valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber+ 2) + "," + Math.round(this.z);			
        Control.valuesString += valueString;	
    }
}

Control.Accelerometer.prototype.draw = function() {}
	
Control.Accelerometer.prototype.event = function() {}

function onSuccess(acceleration) {
    Control.acc._onAccelUpdate(acceleration.x, acceleration.y, acceleration.z);
}		
	
Control.Accelerometer.prototype.start = function() {
    //console.log("********************************* STARTING ACC");    
    var options = {frequency: Math.round(this.delay)};

    //console.log("************************ ACC FREQ = " + options.frequency);
    this.watchID = navigator.accelerometer.watchAcceleration(
        onSuccess, 
        function(ex) {
            alert("accel fail (" + ex.name + ": " + ex.message + ")");
        }, 
		options
	);
    //console.log("started accelerometer: "  + this.watchID);	        
}
			
Control.Accelerometer.prototype.unload = function() {
    // console.log("stopping accelerometer");
	//PhoneGap.exec("CNTRL_Accelerometer.stop");
    if (this.watchID) {
        navigator.accelerometer.clearWatch(this.watchID);
        this.watchID = null;
    }	    
}
    
Control.Accelerometer.prototype.setUpdateRate = function(rateInHz) {
    // console.log("********************************* SETTING UPDATE RATE");    
    this.unload();
    this.delay = (1/rateInHz) * 1000;
    this.start();
}
