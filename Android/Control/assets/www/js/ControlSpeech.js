// Speech is a singleton object.
Control.Speech = function(props) {
    this.make("sensor", props);
    this.commands = props.commands;
	this.onUpdate = props.onUpdate;
    return this;
}

Control.Speech.prototype = new Widget();

Control.Speech.prototype.onUpdate = function(textReceived) {
    // this default behavior is only provided for OSC output. If you want MIDI output you have to pass your
	// own onUpdate callback to the widget.
	if(!this.isLocal && Control.protocol == "OSC") {
        var valueString = "|" + this.address;
        valueString += ":" + textReceived;
        Control.valuesString += valueString;
    }
    
    if(this.onvaluechange != null) {
        if(typeof this.onvaluechange === "string") {
            eval(this.onvaluechange);
        }else{
            this.onvaluechange();
        }
    }
}

Control.Speech.prototype.draw = function() {}

Control.Speech.prototype.start = function() {
    console.log("STARTING SPEECH");
    PhoneGap.exec("Speech.start", { "commands": this.commands } );
}

Control.Speech.prototype.suspend = function() {
	console.log("PAUSE");
    PhoneGap.exec("Speech.stopListening", {});
	
}
Control.Speech.prototype.resume = function() {
	console.log("UNPAUSE");
    PhoneGap.exec("Speech.listen", {});
}

Control.Speech.prototype.unload = function() {
    console.log("ENDING SPEECH");
    PhoneGap.exec("Speech.stop", {}); // tells pocketsphinx to stop listening
}