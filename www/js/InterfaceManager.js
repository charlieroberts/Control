/* TODO: Defaults should only load if app is updated, otherwise they should stay deleted. Maybe have a button in preferences that reloads them??? */

window.interfaceManager = {
	init : function() {
        this.selectedListItem = 0;
		this.loadedInterfaces = [];

        this.currentInterfaceName = null;
        this.currentInterfaceJSON = null;
        
        this.interfaceIP = null;
        constants = null;
        
        this.interfaceDefaults = [
	        "multiXY.js",
	        "iphoneLandscapeMixer.js",
	        "djcut.js",
	        "life.js",
	        "monome.js",
	        "multibutton.js",
	        "sequencer.js",
	        "gyro.js",
        //"spacetime.js",
        ];

        control.ifCount = 0;
        if(typeof localStorage.interfaceFiles == "undefined") {
            this.loadedInterfaces = [];
            //console.log("INIT LOADING SCRIPTS");
            //var msg = "now loading default interfaces. this will only happen the first time the app is launched (possibly also after updates) and takes about 8 seconds";
            //navigator.notification.alert(msg, null, "loading");
            setTimeout(function() {interfaceManager.loadScripts();}, 1000);
        }else{
            //console.log("NOT RELOADING");
            this.loadedInterfaces = JSON.parse(localStorage.interfaceFiles);
            this.createInterfaceListWithArray(this.loadedInterfaces);
        }
    },
     
    loadScripts : function() {    
        var fileref = document.createElement('script')
        fileref.setAttribute("type", "text/javascript");
        fileref.setAttribute("src", "interfaces/" + interfaceManager.interfaceDefaults[control.ifCount]);
        document.getElementsByTagName('head')[0].appendChild(fileref);
            
        window.setTimeout(function() {
            if(control.ifCount < interfaceManager.interfaceDefaults.length) {
				//console.log(window.interfaceString);
                eval(window.interfaceString);
                // console.log("ARHAIRH" + window.interfaceString]);
                // console.log("loading " + loadedInterfaceName + " .....................................");                
                
                interfaceManager.loadedInterfaces[control.ifCount] = {'name':loadedInterfaceName, 'json':window.interfaceString};
                control.ifCount++;
                interfaceManager.loadScripts();
            }else{
                localStorage.interfaceFiles = JSON.stringify(interfaceManager.loadedInterfaces);
                interfaceManager.createInterfaceListWithArray(interfaceManager.loadedInterfaces);
            }
        }, 1000);
    },
    
    readFile : function(filename) {
		console.log("reading " + filename)
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src", "interfaces/" + filename);
        document.getElementsByTagName('head')[0].appendChild(fileref);
        
        setTimeout(function() {
            interfaceManager.saveInterface(window.interfaceString, false);
            control.ifCount++;
            if(control.ifCount <= interfaceManager.interfaceDefaults.length) {
                interfaceManager.readFile(interfaceManager.interfaceDefaults[control.ifCount]);
            }else{
                interfaceManager.createInterfaceListWithStoredInterfaces();
			}
        }, 100);
    },
	
	promptForInterfaceDownload : function() {
		var interfacesDiv = document.getElementById("Interfaces");
		var promptDiv = document.createElement("div");
		var input =	document.createElement("input");
		var inputHeader = document.createElement("h2");
        
		var cancelButton = document.createElement("button");
        var submitButton = document.createElement("button");
		
		inputHeader.innerHTML = "Enter Interface URL";
		inputHeader.setAttribute("id", "inputFieldHeader");
		inputHeader.setAttribute("style", "top:45px; color:#fff; font-size:1.5em");
		
		input.setAttribute("style", "top: 90px; height:50px; width:90%; font-size:1.25em");
		input.setAttribute("autocorrect", "off");
		input.value = "http://";
		//input.setAttribute("onchange", "interfaceManager.downrunCurrentInterfaceFromPrompt()");
		input.setAttribute("type", "url");
		input.setAttribute("id", "ipField");
        
		cancelButton.innerHTML = "Cancel";
		cancelButton.setAttribute("style", "margin-top: 1em; font-size:1.5em; width: 5em; height: 2em; background-color:black; color:#fff; border: 1px solid #fff");
		cancelButton.setAttribute("ontouchend", "document.getElementById('Interfaces').removeChild(document.getElementById('promptDiv'))");
        
        submitButton.innerHTML = "Submit";
		submitButton.setAttribute("style", "margin-left: 1em; margin-top: 1em; font-size:1.5em; width: 5em; height: 2em; background-color:#fff; color:#000; border: 1px solid #fff");
        submitButton.setAttribute("ontouchend", "interfaceManager.downloadInterfaceFromPrompt()");
		//submitButton.setAttribute("ontouchend", "document.getElementById('Interfaces').removeChild(document.getElementById('promptDiv'))");
		
		promptDiv.setAttribute("style","z-index:2; left:0px; top:0px; position:absolute; background-color:rgba(0,0,0,.8); width:100%; height:100%;");
		promptDiv.setAttribute("id", "promptDiv");
		promptDiv.appendChild(inputHeader);
		promptDiv.appendChild(input);
        promptDiv.appendChild(document.createElement("br"));
        //promptDiv.appendChild(shouldReloadBox);
        //promptDiv.appendChild(shouldReloadText);
        promptDiv.appendChild(document.createElement("br"));

		promptDiv.appendChild(cancelButton);
        promptDiv.appendChild(submitButton);
		
		interfacesDiv.appendChild(promptDiv);
	},
    
    	
	downloadInterfaceFromPrompt : function() {
		var ipAddress = document.getElementById('ipField').value;
        //var shouldReload = document.getElementById('shouldReloadBox').checked;
		interfaceManager.downloadInterface(ipAddress);
	},
	
	downloadInterface : function(ipAddress) { // EVENT --- CANNOT REFER TO THIS, MUST USE INTERFACE MANAGER
        console.log("downloading...");
		interfaceManager.myRequest = new XMLHttpRequest();    	
		var loadedInterfaceName = null;
        interfaceManager.myRequest.onreadystatechange = function() {
            console.log("downloading..." + interfaceManager.myRequest.readyState );
            if(interfaceManager.myRequest.readyState == 4) {
                console.log(interfaceManager.myRequest.responseText);
                eval(interfaceManager.myRequest.responseText);
                if(loadedInterfaceName != null) {
                    if(document.getElementById("promptDiv") != null) {
                        document.getElementById("Interfaces").removeChild(document.getElementById("promptDiv"));
                    }
                    interfaceManager.saveInterface(interfaceManager.myRequest.responseText, true, ipAddress);
                    interfaceManager.interfaceIP = ipAddress;
                    interfaceManager.runInterface(interfaceManager.myRequest.responseText);
                }else{
                    document.getElementById("inputFieldHeader").innerHTML = "Could not load. Please try another URL";
                    return;
                }
            }
        }
        interfaceManager.myRequest.ipAddress = ipAddress;        
		//interfaceManager.myRequest.withCredentials = "true";                
		interfaceManager.myRequest.open("GET", ipAddress, true);
        interfaceManager.myRequest.send(null);
	},
	
	
	highlight : function (listNumber) {
		this.selectedListItem = listNumber;
		var list = document.getElementById('interfaceList');
		for(var i = 0; i < list.childNodes.length; i++) {
			if(i != listNumber) {
				list.childNodes[i].style.backgroundColor = "#000";
			}else{
				list.childNodes[i].style.backgroundColor = "#333";
			}
		}
	},
    
    createInterfaceListWithStoredInterfaces : function() {
        $('#interfaceList').empty();
		
        interfaceManager.createInterfaceListWithArray(interfaceManager.loadedInterfaces);
		
        window.isLoadingInterfaces = false;
	},
    
	createInterfaceListWithArray : function(listArray) {
		var list = $("#interfaceList");
		var count = 0;

		for(var i = 0; i < listArray.length; i++) {
			var r = listArray[i];
			var item = document.createElement('li');
            
            function _touchend(_key, _count) { 
                return function(e) {
                    interfaceManager.highlight(_count);
                    interfaceManager.selectInterfaceFromList(_count);
                }
            }
            
            $(item).bind("tap", _touchend(r.name, count++));

            $(item).html(r.name);
                        
            $(item).css({
                        "border-bottom" : "1px solid #666", 
                        "font-weight"   : "normal"
                        });
            
            $(item).addClass('destinationListItem interfaceListItem');
						
   			$(list).append(item);
		}
        
		$(list).listview('refresh');
	},

	editInterfaceList : function() {
		var list = document.getElementById('interfaceList');
		
		if(list.childNodes.length > 0) {
			document.getElementById('interfaceEditBtn').innerHTML = "Done";
			document.getElementById('interfaceEditBtn').ontouchend = interfaceManager.endEditing;

			for(var i = 0; i < list.childNodes.length; i++) {
				var item = list.childNodes[i];
				var deleteButton = document.createElement("div");
				$(deleteButton).css({
                                    "float":                    "left",
                                    "margin-right":             "5px",
                                    "position":                 "relative",
                                    "top":                      "0px",
                                    "border":                   "#fff 2px solid",
                                    "-webkit-border-radius":    "10px",
                                    "width" :                   "15px",
                                    "height":                   "15px",
                                    "background-color":         "#f00",
                                    "color":                    "#fff",
                                    "font-weight" :             "bold",
                                    });
                
                function _touchend(interfaceNumber) { 
                    return function(e) {
                        interfaceManager.removeInterface(interfaceNumber);
                    }
                }
                
				$(deleteButton).html("<img style='position:relative; top:-.7em; left:-.65em;' src='images/dash.png'>");
				$(deleteButton).bind("touchend", _touchend(i), false);
				$(item).prepend(deleteButton);
				$(item).unbind("tap");		
			}
		}
	},
	
	endEditing : function() {
		var list = document.getElementById('interfaceList');

		document.getElementById('interfaceEditBtn').innerHTML = "Edit";
		document.getElementById('interfaceEditBtn').ontouchend = interfaceManager.editInterfaceList;
		for(var i = 0; i < list.childNodes.length; i++) {
			var item = list.childNodes[i];
			item.removeChild(item.childNodes[0]);
            
            function _touchend(interfaceNumber, itemHTML) { 
                return function(e) {
                    interfaceManager.highlight(interfaceNumber);
                    interfaceManager.selectInterfaceFromList(itemHTML);
                }
            }
            
			$(item).bind("tap", _touchend(i, item.innerHTML));
		}
	},
    
    refreshInterface : function() {
        interfaceManager.myRequest = new XMLHttpRequest();
        interfaceManager.myRequest.onreadystatechange = function() {
            // console.log("downloading stage " + interfaceManager.myRequest.readyState]);            
            if (interfaceManager.myRequest.readyState == 4) {
                interfaceManager.runInterface(interfaceManager.myRequest.responseText);
                for(var i = 0; i < interfaceManager.loadedInterfaces.length; i++) {
                    var interface = interfaceManager.loadedInterfaces[i];
                    if(interface.name == interfaceManager.currentInterfaceName) {
                        // console.log("SHOULD BE LOADED");
                        var newInterface = {
                            name:interfaceManager.currentInterfaceName,
                            json: interfaceManager.myRequest.responseText,
                            address: interfaceManager.interfaceIP
                        };
                        // console.log(newInterface.json]);
                        interfaceManager.loadedInterfaces.splice(i,1,newInterface);
                        
                        localStorage.interfaceFiles = JSON.stringify(interfaceManager.loadedInterfaces);

                        interfaceManager.runInterface(newInterface.json);
                        break;
                    }
                }
            }
        }
        interfaceManager.myRequest.open("GET", interfaceManager.interfaceIP, true);
        interfaceManager.myRequest.send(null);
    },
    
	saveInterface : function(interfaceJSON, shouldReloadList, ipAddress) {
        if (typeof ipAddress == "undefined") ipAddress = "";
        
		var loadedInterfaceName = null;
		
        eval(interfaceJSON);
		
        if (loadedInterfaceName != null) {
            interfaceManager.loadedInterfaces.push({
                name:    loadedInterfaceName,
                json:    interfaceJSON,
                address: ipAddress
            });
            
            localStorage.interfaceFiles = JSON.stringify(interfaceManager.loadedInterfaces);
            
            if (shouldReloadList) {
                interfaceManager.createInterfaceListWithStoredInterfaces();
            }
        }
	},
	
	pushInterfaceWithDestination : function(interfaceJSON, nameOfSender, newDestination) {
         if(typeof nameOfSender != "undefined") {
            if(confirm("An interface is being pushed to you by " + nameOfSender + ". Do you accept it?")) {
                var loadedInterfaceName = null;
                this.saveInterface(interfaceJSON, false);
                interfaceManager.runInterface(interfaceJSON);
                var segments = newDestination.split(":");
                
                control.destinationManager.addDestination(segments[0], segments[1], false, false);
                control.destinationManager.selectPushedDestination(segments[0], segments[1]);
            }
        }
    },

	pushInterface : function(interfaceJSON) {
		// TODO: change so it gets rid of the index.html at top of confirm window. Might require a new version of phonegap or else something tricky.
       
        if(confirm("An interface is being pushed to you. Do you accept it?")) {
            var loadedInterfaceName = null;
            interfaceManager.runInterface(interfaceJSON);
            this.saveInterface(interfaceJSON, false);

        }

	},
	
	removeInterface : function (itemNumber) {
        var listItem = $('#interfaceList > li:eq(' + itemNumber + ')');
        var arr = $(listItem).html().split("</div>");
        var newKey = arr[1];
       for(var i = 0; i < interfaceManager.loadedInterfaces.length; i++) {
           var _interface = interfaceManager.loadedInterfaces[i];
           //console.log("Key = " + newKey + " :: interface.name = " + interface.name]);
           if(_interface.name == newKey) {
               interfaceManager.loadedInterfaces.splice(i,1);
               listItem.remove();
               localStorage.interfaceFiles = JSON.stringify(interfaceManager.loadedInterfaces);
               //$('#interfaceList').listview('refresh');
               break;
           }
       }
	},
    
    runInterface : function(json) {
		control.unloadWidgets();
        control.oninit = null;
        constants = null;
        pages = null;

        oscManager.delegate = oscManager;
        midiManager.delegate = midiManager;

        eval(json);

        this.currentInterfaceName = loadedInterfaceName;
        this.currentInterfaceJSON = json;

		if(typeof interfaceOrientation != "undefined") {
			console.log(interfaceOrientation);
            Rotator.setRotation(interfaceOrientation);
        }

		if(interfaceOrientation == "portrait") {
            control.makePages(pages, screen.width, screen.height);
        }else{
            control.makePages(pages, screen.height, screen.width);
        }
		
        if(constants != null) {
            console.log(constants);
            control.loadConstants(constants);
        }

        control.loadWidgets();
        
        if(typeof control.oninit === "string") {
            eval(control.oninit);
        }else if(control.oninit != null) {
            control.oninit();
        }

        if(this.currentTab != document.getElementById("selectedInterface")) {
            control.shouldPrevent = true;
            control.changeTab(document.getElementById("selectedInterface"));
            $.mobile.changePage('#SelectedInterfacePage');
		}
    },
	
	selectInterfaceFromList : function(interfaceNumber) {
		//console.log("INTERFACE NUMBER = " + interfaceNumber);
        var r = interfaceManager.loadedInterfaces[interfaceNumber];
        //console.log(r);
        if (typeof r.address != "undefined")
            interfaceManager.interfaceIP = r.address;
        
        interfaceManager.runInterface(r.json);
	},
}


