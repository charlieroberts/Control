// Gyro is a singleton object.

Control.Gyro = function(props) {
	this.make("sensor", props);
    
    this.hardwareMin = -1.57;
    this.hardwareMax = 1.57;
    this.hardwareRange = this.hardwareMax - this.hardwareMin;
    
	this.rotationHardwareMin = - 25.0;
	this.rotationHardwareMax = 25.0;
	this.rotationHardwareRange = this.rotationHardwareMax - this.rotationHardwareMin;
	
    this.yawHardwareMin = -3.14;
    this.yawHardwareMax = 3.14;
    this.yawHardwareRange = this.yawHardwareMax - this.yawHardwareMin;
	
	if(Control.protocol == "MIDI") {
		this.max = (typeof props.midiMax != "undefined") ? props.midiMax : 127;
		this.min = (typeof props.midiMin != "undefined") ? props.midiMin : 0;
	}else{
		this.max = (typeof props.max != "undefined") ? props.max : this.hardwareMax;
		this.min = (typeof props.min != "undefined") ? props.min : this.hardwareMin;			
	}
    this.userDefinedRange = this.max - this.min;
    
	this.pitch = 0;
	this.roll = 0;
	this.yaw = 0;
    
    if(typeof props.updateRate != "undefined") {
        this.updateRate = props.updateRate;
    }else{
        this.updateRate = 10;
    }
    
    return this;
}

Control.Gyro.prototype = new Widget();
    	
//gyro._onGyroUpdate({'xRotationRate':0.002622,'yRotationRate':-0.004301,'zRotationRate':-0.012185},{'pitch':0.021584,'roll':-0.002796,'yaw':-0.016728})
	
Control.Gyro.prototype.onUpdate = function(rotationRate, euler) {
    this.pitch = this.min + (Math.abs(this.hardwareMin    + euler.pitch)  / this.hardwareRange )    * this.userDefinedRange;
    this.roll =  this.min + (Math.abs(this.yawHardwareMin + euler.roll)   / this.yawHardwareRange ) * this.userDefinedRange;
    this.yaw =   this.min + (Math.abs(this.yawHardwareMin + euler.yaw )   / this.yawHardwareRange ) * this.userDefinedRange;
    
//    this.xRotationRate = this.rotationHardwareMin + (Math.abs(this.rotationHardwareMin + rotationRate.xRotationRate) / this.rotationHardwareRange) * this.userDefinedRange;
//    this.yRotationRate = this.rotationHardwareMin + (Math.abs(this.rotationHardwareMin + rotationRate.yRotationRate) / this.rotationHardwareRange) * this.userDefinedRange;
//    this.zRotationRate = this.rotationHardwareMin + (Math.abs(this.rotationHardwareMin + rotationRate.zRotationRate) / this.rotationHardwareRange) * this.userDefinedRange;
    this.xRotationRate = rotationRate.xRotationRate;
    this.yRotationRate = rotationRate.yRotationRate;
    this.zRotationRate = rotationRate.zRotationRate;
    
    if(this.onvaluechange != null) {
        if(typeof this.onvaluechange === "string") {
            eval(this.onvaluechange);
        }else{
            this.onvaluechange();
        }
    }
    
    if(!this.isLocal && Control.protocol == "OSC") {
        var valueString = "|" + this.address;
        valueString += ":" + this.xRotationRate + "," + this.yRotationRate + "," + this.zRotationRate + "," + this.pitch + "," + this.roll + "," + this.yaw;
        Control.valuesString += valueString;
    }else if (!this.isLocal && Control.protocol == "MIDI") {
        var valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + this.midiNumber+ "," + Math.round(this.xRotationRate);			
        Control.valuesString += valueString;
        valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber+ 1) + "," + Math.round(this.yRotationRate);			
        Control.valuesString += valueString;
        valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber+ 2) + "," + Math.round(this.zRotationRate);			
        Control.valuesString += valueString;
        valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber+ 3) + "," + Math.round(this.pitch);			
        Control.valuesString += valueString;
        valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber+ 4) + "," + Math.round(this.roll);			
        Control.valuesString += valueString;
        valueString = "|" + this.midiType + "," + (this.channel - 1) + "," + (this.midiNumber+ 5) + "," + Math.round(this.yaw);			
        Control.valuesString += valueString;
    }

}

Control.Gyro.prototype.draw = function() {}

Control.Gyro.prototype.start = function() {
    PhoneGap.exec("Gyro.start");
    this.setUpdateRate(this.updateRate);
}

Control.Gyro.prototype.unload = function() {
    PhoneGap.exec("Gyro.stop");
}

Control.Gyro.prototype.setReferenceAttitude = function() {
    PhoneGap.exec("Gyro.setReferenceAttitude");
}

Control.Gyro.prototype.setUpdateRate = function(rateInHz) {
    //console.log("setting gyro rate " + rateInHz);
    PhoneGap.exec("Gyro.setUpdateRate", rateInHz);
}
    

