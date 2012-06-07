// TODO: Implement refresh for MIDI Hardware destinations. Might be best to do this using MIDI scanning instead of Bonjour, and just abandon
// Bonjour for MIDI sources altogether.

Control.destinationManager = {
    selectedListItem : 0,
    myRequest : new XMLHttpRequest(),
    
    destinationsSynch 		: [],
    midiDestinations 		: [],
    bonjourDestinations 	: [],		
    
    ipaddress : null,
    destinations : [],
    
    init : function() {
        if(typeof localStorage.destinations == "undefined") {
            //localStorage.destinations = [];
            this.destinations = [];
        }else{
            this.destinations = jQuery.parseJSON(localStorage.destinations);
        }
        //$("#destinationList").listview();

        Control.bonjour.start();
        
        this.createDestinationList();
        
    },

    refreshList : function() {
        this.clearList();
        this.destinationsSynch = [];
        this.midiDestinations = [];
        
        Control.bonjour.browse();

        Control.destinationManager.createDestinationList();
        
        $('#destinationList').listview('refresh');        

    },

    clearList : function() {
        $("#destinationList").empty();
    },

    setIPAndPort : function() {
        if(ipaddress != null) {
            Control.destinationManager.ipaddress = ipaddress;
            Control.destinationManager.addDestination(this.ipaddress);

            //PhoneGap.exec("OSCManager.setIPAddressAndPort", ipaddress, 10000);
        }
    },
    
    removeDestination : function(ip, port) {
        console.log("Control.destinationManager removing " + ip + " : " + port);
    },

    pushDestination : function(newDestination) {
        var segments = newDestination.split(":");
        this.selectIPAddressAndPort(segments[0], segments[1]);
        this.addDestination(segments[0], segments[1], false, false, false);
        this.selectPushedDestination(segments[0], segments[1]);
    },
    
    // TODO: change to add Bonjour destination. Make all midi in add MIDI destination.
    
    addDestination : function(address, port, isBonjour, isMIDI, isHardware) {
        for(var i = 0; i < this.destinationsSynch.length; i++) {
            var destCheck = this.destinationsSynch[i];
            if(address == destCheck.ip && port == destCheck.port) return;
        }
        
        this.destinationsSynch.push({ip:address, port:port});
        if(isBonjour) Control.destinationManager.bonjourDestinations.push([address, port]);
        
        var list = document.getElementById('destinationList');
        var item = document.createElement('li');
        $(item).addClass('destinationListItem');

        //console.log("address: " + address + " | port : " + port + " | isBonjour | " + isBonjour);
        
        function selectAddressAndPort(itemNumber, _address, _port, _isMIDI) {
            return function(e) {					
                Control.destinationManager.highlight(itemNumber);
                if(_isMIDI) {
                    Control.protocol = 'MIDI';
                    Control.destinationManager.selectMIDIIPAddressAndPort(_address, _port);
                }else{
                    Control.protocol = 'OSC';
                    Control.destinationManager.selectIPAddressAndPort(_address, _port);
                }
            }
        }
         
        $(item).bind("touchend",  selectAddressAndPort(list.childNodes.length, address, port, isMIDI));	

        var innerDiv = document.createElement('div');
        $(innerDiv).css('display', 'inline');
        $(innerDiv).append(document.createTextNode("" + address + ":" + port));
        
        if(isBonjour || isMIDI) {
            var _img = document.createElement('img');
            $(_img).addClass('destinationImage');
            if(isBonjour)
                $(_img).attr('src', 'images/bonjour.png');
            else
                $(_img).attr('src', 'images/MIDI_Icon.png');
            
            $(innerDiv).append(_img);
        }
        
        $(item).append(innerDiv);        
        list.appendChild(item);
        
        //$('#destinationList').listview('refresh');        
    },
    
    addMIDIDestination : function(destName) {
        for(var i = 0; i < this.midiDestinations.length; i++) {
            var destCheck = this.midiDestinations[i];
            if(destName == destCheck) return;
        }
        
        this.midiDestinations.push(destName);
        var list = document.getElementById('destinationList');
        var item = document.createElement('li');
        $(item).addClass('destinationListItem');
        
        function destinationListItemSelect(itemNumber, name) { 
            return function(e) {
                Control.destinationManager.highlight(itemNumber);
                Control.destinationManager.selectHardwareMIDI(name);                
                _protocol='MIDI';
            }
        }
                
        $(item).bind("touchend", destinationListItemSelect(list.childNodes.length, destName));		
        
        var innerDiv = document.createElement('div');
        $(innerDiv).css('display', 'inline');
        $(innerDiv).append(document.createTextNode(destName));

        var _img = document.createElement('img');
        $(_img).addClass('destinationImage');

        $(_img).attr('src', 'images/MIDI_Icon.png');
        
        $(innerDiv).append(_img);
        $(item).append(innerDiv);        
        $(list).append(item);
    
        //$('#destinationList').listview('refresh');    
    },
    
    selectHardwareMIDI : function(destName) {
        PhoneGap.exec('MIDI.connectMIDI', destName);
    },
    
    
    // takes a recently pushed destination (pushed via OSC), highlights it and mimics its selection 
    
    selectPushedDestination : function(address, port) {
        var list = document.getElementById('destinationList');
        Control.destinationManager.highlight(list.childNodes.length - 1);
        _protocol = "OSC";
        Control.destinationManager.selectIPAddressAndPort(address, port);
    },
    
    selectMIDIIPAddressAndPort : function(address,port) {
        this.ipaddress = address;
        this.port = port;
        PhoneGap.exec("MIDI.connect", 1, this.ipaddress, this.port);
        PhoneGap.exec("OSCManager.stopPolling");
    },
    
    selectIPAddress : function(address) {
        this.ipaddress = address;
        PhoneGap.exec("OSCManager.setIPAddressAndPort", this.ipaddress, "12000");
    },
    
    selectIPAddressAndPort : function(address, port) {
        if(this.ipaddress != address || this.port != port){
            this.ipaddress = address;	
            this.port = port;
            PhoneGap.exec("OSCManager.setIPAddressAndPort", this.ipaddress, this.port);
        }
    },
    
    promptForIP : function() { // TODO: NO ABSOLUTE PIXEL VALUES. SHEESH.
        var destinationsDiv = document.getElementById("Destinations");
        var promptDiv = document.createElement("div");
        var input = document.createElement("input");
        var portInput = document.createElement("input");
        var inputHeader = document.createElement("h2");
        var portHeader = document.createElement("h2");
        var cancelButton = document.createElement("button");
        var addButton = document.createElement("button");
        
        
        inputHeader.innerHTML = "Enter Destination URL";
        inputHeader.setAttribute("id", "inputFieldHeader");
        inputHeader.setAttribute("style", "top:45px; color:#fff; font-size:1.5em");
        
        portHeader.innerHTML = "Enter Destination Port";
        portHeader.setAttribute("id", "inputFieldHeader");
        portHeader.setAttribute("style", "top:160px; color:#fff; font-size:1.5em");
        
        input.setAttribute("style", "top: 90px; height:50px; width:90%; font-size:1.25em");
        input.setAttribute("autocorrect", "off");
        input.value = "";
        //input.setAttribute("onchange", "Control.destinationManager.inputEnd()");
        input.setAttribute("type", "text");
        input.setAttribute("id", "ipField");
    
        portInput.setAttribute("style", "top: 200px; height:50px; width:90%; font-size:1.25em");
        portInput.setAttribute("autocorrect", "off");
        portInput.value = "10000";
        portInput.setAttribute("type", "text");
        portInput.setAttribute("id", "portField");
    
        cancelButton.innerHTML = "Cancel";
        cancelButton.setAttribute("style", "margin-top: 1em; font-size:1.5em; width: 5em; height: 2em; background-color:black; color:#fff; border: 1px solid #fff");
        cancelButton.setAttribute("ontouchend", "document.getElementById('Destinations').removeChild(document.getElementById('promptDiv'))");
        
        addButton.innerHTML = "Add";
        addButton.setAttribute("ontouchend", "Control.destinationManager.inputEnd()");		
        addButton.setAttribute("style", "margin-top: 1em; margin-left: 1em; font-size:1.5em; width: 5em; height: 2em; background-color:#fff; color:#000; border: 1px solid #fff");
        
        promptDiv.setAttribute("style","z-index:2; left:0px; top:0px; position:absolute; background-color:rgba(0,0,0,.6); width:100%; height:100%;");
        promptDiv.setAttribute("id", "promptDiv");
        
        promptDiv.appendChild(inputHeader);
        promptDiv.appendChild(input);
        promptDiv.appendChild(portHeader);
        promptDiv.appendChild(portInput);		
        promptDiv.appendChild(cancelButton);
        promptDiv.appendChild(addButton);		
        
        destinationsDiv.appendChild(promptDiv);
    },
        
    highlight : function (listNumber) {
        this.selectedListItem = listNumber;
        var list = document.getElementById('destinationList');
        for(var i = 0; i < list.childNodes.length; i++) {
            if(i != listNumber) {
                list.childNodes[i].style.backgroundColor = "#000";
            }else{
                list.childNodes[i].style.backgroundColor = "#333";
            }
        }
    },
    
    inputEnd : function() { 
        var ipAddress = document.getElementById('ipField').value;
        var port = document.getElementById('portField').value;	
        
        document.getElementById("Destinations").removeChild(document.getElementById("promptDiv"));
        
        Control.destinationManager.addDestination(ipAddress, port, false, false);
        Control.destinationManager.destinations.push({"ip":ipAddress, "port":port});
        
        var results  = JSON.stringify(Control.destinationManager.destinations);
        localStorage.destinations = results;
        $('#destinationList').listview('refresh');        
    },
    
    createDestinationList : function() {
        $(this.destinations).each( function(index, r){ 
            Control.destinationManager.addDestination(r.ip, r.port, false, false); 
        });
    },
    
    editDestinationList : function() {
        var list = document.getElementById('destinationList');
        
        if(list.childNodes.length > 0) {
            $('#destinationEditBtn').html("Done");
            $('#destinationEditBtn').unbind("touchend", Control.destinationManager.editDestinationList);
            $('#destinationEditBtn').bind("touchend", Control.destinationManager.endEditing);
            
            for(var i = 0; i < list.childNodes.length; i++) {
                var item = list.childNodes[i];

                var deleteButton = document.createElement("div"); // -webkit-border-radius:10px;
                $(deleteButton).css({
                    "float" :"left",
                    "margin-right": "5px",
                    "position": "relative",
                    "border" : "#fff 2px solid",
                    "-webkit-border-radius" : "10px",
                    "width" : "15px",
                    "height" : "15px",
                    "background-color" : "#f00",
                    "color" : "#fff",
                    "font-weight" : "bold"
                });
                    
                deleteButton.innerHTML = "<img style='position:relative; top:-.65em; left:-.65em;' src='images/dash.png'>";
                deleteButton.setAttribute("ontouchend", "console.log('blhteateataeteatea');Control.destinationManager.removeDestination("+i+")");
                item.insertBefore(deleteButton, item.firstChild);
            }
        }
    },
    
    endEditing : function() {
        var list = document.getElementById('destinationList');
        
        $('#destinationEditBtn').html("Edit");
        $('#destinationEditBtn').unbind("touchend", Control.destinationManager.endEditing);
        $('#destinationEditBtn').bind("touchend", Control.destinationManager.editDestinationList);
        
        for(var i = 0; i < list.childNodes.length; i++) {
            var item = list.childNodes[i];
            item.removeChild(item.childNodes[0]);
        }
    },
    
    
    removeDestination : function (itemNumber) {
        var listItem = document.getElementById('destinationList').childNodes[itemNumber];
        var jsonKey = $(listItem).text();

        var arr = jsonKey.split(':');
        var obj = { "ip":arr[0], "port":arr[1] };
        
        document.getElementById('destinationList').removeChild(listItem);
        
        for(var i = 0; i < Control.destinationManager.destinations.length; i++) {
            var dest = Control.destinationManager.destinations[i];
            if(dest.ip === obj.ip && dest.port === obj.port) {
                Control.destinationManager.destinations.splice(i, 1);
            }
        }

        localStorage.destinations = JSON.stringify(Control.destinationManager.destinations);
    },
};