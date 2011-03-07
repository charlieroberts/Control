// Accelerometer is a singleton object.

function ControlAccelerometer(props) {
	this.name = props.name;
	var self = this;

	this.x = 0;
	this.y = 0;
	this.z = 0;
	
	var watchID = null;
	var delay = 1000;
	var first = true;
	
    this.hardwareMin = -9.81; // The documentation: http://docs.phonegap.com/phonegap_accelerometer_accelerometer.md.html
    this.hardwareMax = 9.81;  // says that the range is [0, 1]. But, it seems more like [-1G, 1G]
    this.hardwareRange = this.hardwareMax - this.hardwareMin;
    
	if(_protocol == "MIDI") {
		this.max = (typeof props.midiMax != "undefined") ? props.midiMax : 127;
		this.min = (typeof props.midiMin != "undefined") ? props.midiMin : 0;
	}else{
		this.max = (typeof props.max != "undefined") ? props.max : this.hardwareMax;
		this.min = (typeof props.min != "undefined") ? props.min : this.hardwareMin;			
	}
    this.userDefinedRange = this.max - this.min;
    
	this.isLocal = (typeof props.isLocal != "undefined") ? props.isLocal : false;
    
	this.midiType   = (typeof props.midiType   != "undefined") ? props.midiType   : "cc";
	this.channel    = (typeof props.channel    != "undefined") ? props.channel    : 1;
	this.midiNumber = (typeof props.midiNumber != "undefined") ? props.midiNumber : 0;
	
	this.address = (typeof props.address != "undefined") ? props.address : "/" + this.name;
	
	console.log("setting onvaluechange to: " + props.onvaluechange);
	this.onvaluechange = (typeof props.onvaluechange != "undefined") ? props.onvaluechange : null;
    console.log("set onvaluechange to: " + this.onvaluechange);
    
	this._onAccelUpdate = function(acceleration) {
	    var x = acceleration.x;
	    var y = acceleration.y;
	    var z = acceleration.z;
        //console.log("x = " + x + " || y = " + y + " || z = " + z);
        
        self.x = self.min + (((0 - self.hardwareMin) + x) / self.hardwareRange ) * self.userDefinedRange;
		self.y = self.min + (((0 - self.hardwareMin) + y) / self.hardwareRange ) * self.userDefinedRange;
		self.z = self.min + (((0 - self.hardwareMin) + z) / self.hardwareRange ) * self.userDefinedRange;
		
        //debug.log("this.x = " + this.x + " || this.y = " + this.y + " || z = " + this.z);
		if (first) {
		    console.log("new values: " + x + ", " + y + ", " + z + "; calling " + self.onvaluechange + " with new accell: " + self.x + ", " + self.y + ", " + self.z);
		    first = false;
		}
        if(typeof self.onvaluechange != "undefined") {
			eval(self.onvaluechange);
		}
        
		if(!self.isLocal && _protocol == "OSC") {
			var valueString = "|" + self.address;
			valueString += ":" + self.x + "," + self.y + "," + self.z;
			control.valuesString += valueString;
		}else if (!self.isLocal && _protocol == "MIDI") {
			var valueString = "|" + self.midiType + "," + (self.channel - 1) + "," + self.midiNumber+ "," + Math.round(self.x);			
			control.valuesString += valueString;
			valueString = "|" + self.midiType + "," + (self.channel - 1) + "," + (self.midiNumber+ 1) + "," + Math.round(self.y);			
			control.valuesString += valueString;
			valueString = "|" + self.midiType + "," + (self.channel - 1) + "," + (self.midiNumber+ 2) + "," + Math.round(self.z);			
			control.valuesString += valueString;	
		}
	}
	
	this.draw = function() {}

    function onSuccess(acceleration) {
        self._onAccelUpdate(acceleration.x, acceleration.y, acceleration.z);
    }		
	
	this.start = function() {
		//PhoneGap.exec("CNTRL_Accelerometer.start", null);
	    console.log("starting accelerometer");    
        var options = new Object();
        options.frequency = delay;  //options.frequency is actually the period in milliseconds
        this.watchID = navigator.accelerometer.watchAcceleration(
                self._onAccelUpdate, 
                function(ex) {
                    alert("accel fail (" + ex.name + ": " + ex.message + ")");
                }, options);
        console.log("started accelerometer: "  +this.watchID);	        
	}
			
	this.unload = function() {
	    console.log("stopping accelerometer");
		//PhoneGap.exec("CNTRL_Accelerometer.stop");
	      if (this.watchID) {
	            navigator.accelerometer.clearWatch(this.watchID);
	            this.watchID = null;
	      }	    
	}
    
    this.setUpdateRate = function(rateInHz) {
		//debug.log("setting accelerometer updateRate " + rateInHz);
        //PhoneGap.exec("CNTRL_Accelerometer.setUpdateRate", rateInHz);
        this.unload();
        delay = (1/rateInHz) * 1000;
        console.log("Delay set to " + delay + " milliseconds.");
        this.start();
    }
	
	if(typeof props.updateRate != "undefined") {
		this.setUpdateRate(props.updateRate);
	}else{
		this.setUpdateRate(10);
	}
	
	return this;
}