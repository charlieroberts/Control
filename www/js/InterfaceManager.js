/* TODO: Defaults should only load if app is updated, otherwise they should stay deleted. Maybe have a button in preferences that reloads them??? */

function InterfaceManager() {
    var that = {
        init : function() {
            this.selectedListItem = 0;
            this.loadedInterfaces = [];

            this.currentInterfaceName = null;
            this.currentInterfaceJSON = null;
            
            this.interfaceIP = null;
            constants = null;
            
            this.interfaceDefaults = [];
            //     "multiXY.js",
            //     "iphoneLandscapeMixer.js",
            //     "djcut.js",
            //     "life.js",
            //     "monome.js",
            //     "multibutton.js",
            //     "sequencer.js",
            //     "gyro.js",
            // ];

            control.ifCount = 0;
            if(typeof localStorage.interfaceFiles == "undefined") {
                this.loadedInterfaces = [];
                //console.log("INIT LOADING SCRIPTS");
                //var msg = "now loading default interfaces. this will only happen the first time the app is launched (possibly also after updates) and takes about 8 seconds";
                //navigator.notification.alert(msg, null, "loading");
                setTimeout(function() {control.interfaceManager.loadScripts();}, 1000);
            }else{
                //console.log("NOT RELOADING");
                this.loadedInterfaces = JSON.parse(localStorage.interfaceFiles);
                this.createInterfaceListWithArray(this.loadedInterfaces);
            }
        },
         
        loadScripts : function() {    
            var fileref = document.createElement('script')
            fileref.setAttribute("type", "text/javascript");
            fileref.setAttribute("src", "interfaces/" + control.interfaceManager.interfaceDefaults[control.ifCount]);
            document.getElementsByTagName('head')[0].appendChild(fileref);
                
            window.setTimeout(function() {
                if(control.ifCount < control.interfaceManager.interfaceDefaults.length) {
                    //console.log(window.interfaceString);
                    eval(window.interfaceString);
                    // console.log("ARHAIRH" + window.interfaceString]);
                    // console.log("loading " + loadedInterfaceName + " .....................................");                
                    
                    control.interfaceManager.loadedInterfaces[control.ifCount] = {'name':loadedInterfaceName, 'json':window.interfaceString};
                    control.ifCount++;
                    control.interfaceManager.loadScripts();
                }else{
                    localStorage.interfaceFiles = JSON.stringify(control.interfaceManager.loadedInterfaces);
                    control.interfaceManager.createInterfaceListWithArray(control.interfaceManager.loadedInterfaces);
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
                control.interfaceManager.saveInterface(window.interfaceString, false);
                control.ifCount++;
                if(control.ifCount <= control.interfaceManager.interfaceDefaults.length) {
                    control.interfaceManager.readFile(control.interfaceManager.interfaceDefaults[control.ifCount]);
                }else{
                    control.interfaceManager.createInterfaceListWithStoredInterfaces();
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
            //input.setAttribute("onchange", "control.interfaceManager.downrunCurrentInterfaceFromPrompt()");
            input.setAttribute("type", "url");
            input.setAttribute("id", "ipField");
            
            cancelButton.innerHTML = "Cancel";
            cancelButton.setAttribute("style", "margin-top: 1em; font-size:1.5em; width: 5em; height: 2em; background-color:black; color:#fff; border: 1px solid #fff");
            cancelButton.setAttribute("ontouchend", "document.getElementById('Interfaces').removeChild(document.getElementById('promptDiv'))");
            
            submitButton.innerHTML = "Submit";
            submitButton.setAttribute("style", "margin-left: 1em; margin-top: 1em; font-size:1.5em; width: 5em; height: 2em; background-color:#fff; color:#000; border: 1px solid #fff");
            submitButton.setAttribute("ontouchend", "control.interfaceManager.downloadInterfaceFromPrompt()");
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
            control.interfaceManager.downloadInterface(ipAddress);
        },
        
        // downloadInterface : function(ipAddress) { // EVENT --- CANNOT REFER TO THIS, MUST USE INTERFACE MANAGER
        //     console.log("downloading...");
        //     control.interfaceManager.myRequest = new XMLHttpRequest();    	
        //     var loadedInterfaceName = null;
        //     control.interfaceManager.myRequest.onreadystatechange = function() {
        //         console.log("downloading..." + control.interfaceManager.myRequest.readyState );
        //         if(control.interfaceManager.myRequest.readyState == 4) {
        //             console.log(control.interfaceManager.myRequest.responseText);
        //             eval(control.interfaceManager.myRequest.responseText);
        //             if(loadedInterfaceName != null) {
        //                 if(document.getElementById("promptDiv") != null) {
        //                     document.getElementById("Interfaces").removeChild(document.getElementById("promptDiv"));
        //                 }
        //                 control.interfaceManager.saveInterface(control.interfaceManager.myRequest.responseText, true, ipAddress);
        //                 control.interfaceManager.interfaceIP = ipAddress;
        //                 control.interfaceManager.runInterface(control.interfaceManager.myRequest.responseText);
        //             }else{
        //                 document.getElementById("inputFieldHeader").innerHTML = "Could not load. Please try another URL";
        //                 return;
        //             }
        //         }
        //     }
        //     control.interfaceManager.myRequest.ipAddress = ipAddress;        
        //     //control.interfaceManager.myRequest.withCredentials = "true";                
        //     control.interfaceManager.myRequest.open("GET", ipAddress, true);
        //     control.interfaceManager.myRequest.send(null);
        // },
		
        downloadInterface : function(ipAddress) { // EVENT --- CANNOT REFER TO THIS, MUST USE INTERFACE MANAGER
            console.log("downloading...");
            control.interfaceManager.myRequest = new XMLHttpRequest();    	
            var loadedInterfaceName = null;
            control.interfaceManager.myRequest.onreadystatechange = function() {
                console.log("downloading..." + control.interfaceManager.myRequest.readyState );
                if(control.interfaceManager.myRequest.readyState == 4) {
                    console.log(control.interfaceManager.myRequest.responseText);
                    //eval(control.interfaceManager.myRequest.responseText);
                    console.log("before parsing");
					eval("control.interface = " + control.interfaceManager.myRequest.responseText);
                    console.log("after parsing");
					console.log(control.interface);
                    if(control.interface.name != null) {
                        if(document.getElementById("promptDiv") != null) {
                            document.getElementById("Interfaces").removeChild(document.getElementById("promptDiv"));
                        }
                        //control.interfaceManager.saveInterface(control.interfaceManager.myRequest.responseText, true, ipAddress);
                        control.interfaceManager.interfaceIP = ipAddress;
                        control.interfaceManager.runInterface(control.interface);
                    }else{
                        document.getElementById("inputFieldHeader").innerHTML = "Could not load. Please try another URL";
                        return;
                    }
                }
            }
            control.interfaceManager.myRequest.ipAddress = ipAddress;        
            //control.interfaceManager.myRequest.withCredentials = "true";                
            control.interfaceManager.myRequest.open("GET", ipAddress, true);
            control.interfaceManager.myRequest.send(null);
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
            
            control.interfaceManager.createInterfaceListWithArray(control.interfaceManager.loadedInterfaces);
            
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
                        control.interfaceManager.highlight(_count);
                        control.interfaceManager.selectInterfaceFromList(_count);
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
                document.getElementById('interfaceEditBtn').ontouchend = control.interfaceManager.endEditing;

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
                            control.interfaceManager.removeInterface(interfaceNumber);
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
            document.getElementById('interfaceEditBtn').ontouchend = control.interfaceManager.editInterfaceList;
            for(var i = 0; i < list.childNodes.length; i++) {
                var item = list.childNodes[i];
                item.removeChild(item.childNodes[0]);
                
                function _touchend(interfaceNumber, itemHTML) { 
                    return function(e) {
                        control.interfaceManager.highlight(interfaceNumber);
                        control.interfaceManager.selectInterfaceFromList(itemHTML);
                    }
                }
                
                $(item).bind("tap", _touchend(i, item.innerHTML));
            }
        },
        
        refreshInterface : function() {
            control.interfaceManager.myRequest = new XMLHttpRequest();
            control.interfaceManager.myRequest.onreadystatechange = function() {
                // console.log("downloading stage " + control.interfaceManager.myRequest.readyState]);            
                if (control.interfaceManager.myRequest.readyState == 4) {
                    control.interfaceManager.runInterface(control.interfaceManager.myRequest.responseText);
                    for(var i = 0; i < control.interfaceManager.loadedInterfaces.length; i++) {
                        var interface = control.interfaceManager.loadedInterfaces[i];
                        if(interface.name == control.interfaceManager.currentInterfaceName) {
                            // console.log("SHOULD BE LOADED");
                            var newInterface = {
                                name:control.interfaceManager.currentInterfaceName,
                                json: control.interfaceManager.myRequest.responseText,
                                address: control.interfaceManager.interfaceIP
                            };
                            // console.log(newInterface.json]);
                            control.interfaceManager.loadedInterfaces.splice(i,1,newInterface);
                            
                            localStorage.interfaceFiles = JSON.stringify(control.interfaceManager.loadedInterfaces);

                            control.interfaceManager.runInterface(newInterface.json);
                            break;
                        }
                    }
                }
            }
            control.interfaceManager.myRequest.open("GET", control.interfaceManager.interfaceIP, true);
            control.interfaceManager.myRequest.send(null);
        },
        
        saveInterface : function(interfaceJSON, shouldReloadList, ipAddress) {
            if (typeof ipAddress == "undefined") ipAddress = "";
            
            var loadedInterfaceName = null;
            
            eval(interfaceJSON);
            
            if (loadedInterfaceName != null) {
                control.interfaceManager.loadedInterfaces.push({
                    name:    loadedInterfaceName,
                    json:    interfaceJSON,
                    address: ipAddress
                });
                
                localStorage.interfaceFiles = JSON.stringify(control.interfaceManager.loadedInterfaces);
                
                if (shouldReloadList) {
                    control.interfaceManager.createInterfaceListWithStoredInterfaces();
                }
            }
        },
        
        pushInterfaceWithDestination : function(interfaceJSON, nameOfSender, newDestination) {
             if(typeof nameOfSender != "undefined") {
                if(confirm("An interface is being pushed to you by " + nameOfSender + ". Do you accept it?")) {
                    var loadedInterfaceName = null;
                    this.saveInterface(interfaceJSON, false);
                    control.interfaceManager.runInterface(interfaceJSON);
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
                control.interfaceManager.runInterface(interfaceJSON);
                this.saveInterface(interfaceJSON, false);

            }

        },
        
        removeInterface : function (itemNumber) {
            var listItem = $('#interfaceList > li:eq(' + itemNumber + ')');
            var arr = $(listItem).html().split("</div>");
            var newKey = arr[1];
           for(var i = 0; i < control.interfaceManager.loadedInterfaces.length; i++) {
               var _interface = control.interfaceManager.loadedInterfaces[i];
               //console.log("Key = " + newKey + " :: interface.name = " + interface.name]);
               if(_interface.name == newKey) {
                   control.interfaceManager.loadedInterfaces.splice(i,1);
                   listItem.remove();
                   localStorage.interfaceFiles = JSON.stringify(control.interfaceManager.loadedInterfaces);
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

            control.oscManager.delegate = control.oscManager;
            midiManager.delegate = midiManager;

            eval(json);

            this.currentInterfaceName = loadedInterfaceName;
            this.currentInterfaceJSON = json;

            if(typeof interfaceOrientation != "undefined") {
                Rotator.setRotation(interfaceOrientation);
            }

            if(interfaceOrientation == "portrait") {
                control.makePages(pages, screen.width, screen.height);
            }else{
                control.makePages(pages, screen.height, screen.width);
            }
            
            if(constants != null) {
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
            var r = control.interfaceManager.loadedInterfaces[interfaceNumber];
            //console.log(r);
            if (typeof r.address != "undefined")
                control.interfaceManager.interfaceIP = r.address;
            
            control.interfaceManager.runInterface(r.json);
        },
    };
    
    return that;
}


