/* TODO: Defaults should only load if app is updated, otherwise they should stay deleted. Maybe have a button in preferences that reloads them??? */

Control.interfaceManager = {
    init: function() {
        this.selectedListItem = 0;
        this.loadedInterfaces = [];

        this.currentInterfaceName = null;
        this.currentInterfaceJSON = null;

        this.interfaceIP = null;
        constants = null;

        this.interfaceDefaults = ["gyro.js", "djcut.js", "multibutton.js", "multiXY.js", "life.js", "iphoneLandscapeMixer.js", "sequencer.js", "monome.js" ];
		
        //delete localStorage.interfaceFiles;
        Control.ifCount = 0;
        if (typeof localStorage.interfaceFiles == "undefined") {
            this.loadedInterfaces = [];
            //var msg = "now loading default interfaces. this will only happen the first time the app is launched (possibly also after updates) and takes about 8 seconds";
            //navigator.notification.alert(msg, null, "loading");
            setTimeout(function() {
                Control.interfaceManager.loadScripts();
            }, 1000);
        } else {
            this.loadedInterfaces = JSON.parse(localStorage.interfaceFiles);
            this.createInterfaceListWithArray(this.loadedInterfaces);
        }
    },

    loadScripts: function() {
        Control.data = null;
        Control.functions = null;
        var fileref = document.createElement('script')
        fileref.setAttribute("type", "text/javascript");
        fileref.setAttribute("src", "interfaces/" + Control.interfaceManager.interfaceDefaults[Control.ifCount]);
        document.getElementsByTagName('head')[0].appendChild(fileref);

        window.setTimeout(function() {
            if (Control.ifCount < Control.interfaceManager.interfaceDefaults.length) {
                // HERE LIES RIDICULOUSLY OBNOXIOUS CODE TO PARSE EVALUATED JAVASCRIPT INTO A STRING.
                // BUT, IMPROBABLY, IT IS BETTER THAN THE WAY I USED TO HANDLE STOCK INTERFACES THAT CAME WITH CONTROL. - Charlie
                var _functions = "{";
                if (Control.functions != null) {
                    $.each(Control.functions, function(key, value) {
                        _functions += key + " : " + value + ",";
                    })
                }
                _functions += "}"
                _functions = _functions.replace(/[\n\t]/g, '');
                _functions = _functions.replace(/\s{2,}/g, '');

                if (Control.interface != null) {
					console.log("LOADING " + Control.interface.name);
	                var _interface = "{";
					
                    _interface += "name : \"" + Control.interface.name + "\",";
                    _interface += "orientation : \"" + Control.interface.orientation + "\",";
                    _interface += "pages : [";

                    for (var i = 0; i < Control.interface.pages.length; i++) { // for each page
                        var page = Control.interface.pages[i];
                        _interface += "[";
                        for (var j = 0; j < page.length; j++) { // for each object on a page
                            _interface += "{";
                            $.each(page[j], function(key, value) { // for each member of each object on a page
                                if (typeof value === "string") {
                                    value = "\"" + value + "\"";
                                } else if (typeof value === "object" && value instanceof Array) {
                                    var _value = "[";
                                    for (var k = 0; k < value.length; k++) { // for each member of an array that is a member of an object on the page
                                        _value += (typeof value[k] === "string") ? "\"" + value[k] + "\"" : value[k];
                                        _value += ",";
                                    }
                                    _value += "]";
                                    value = _value;
                                } else if (typeof value === "function") {
                                    value = value.toString();
                                }
                                _interface += key + " : " + value + ",";
                            }); // end member loop
                            _interface += "},";
                        } // end page loop
                        _interface += "]";
                        if (j != Control.interface.pages.length - 1) {
                            _interface += ",";
                        }
                    } // end pages loop
                    _interface += "],";

                    if (typeof Control.interface.constants !== "undefined") {
                        _interface += "constants : [";
                        for (var j = 0; j < Control.interface.constants.length; j++) { // for each object on a page
                            _interface += "{";
                            $.each(Control.interface.constants[j], function(key, value) { // for each member of each object on a page
                                if (typeof value === "string") {
                                    value = "\"" + value + "\"";
                                } else if (typeof value === "object" && value instanceof Array) {
                                    var _value = "[";
                                    for (var k = 0; k < value.length; k++) { // for each member of an array that is a member of an object on the page
                                        _value += (typeof value[k] === "string") ? "\"" + value[k] + "\"" : value[k];
                                        _value += ",";
                                    }
                                    _value += "]";
                                    value = _value;
                                } else if (typeof value === "function") {
                                    value = value.toString();
                                }
                                _interface += key + " : " + value + ",";
                            }); // end member loop
                            _interface += "},";
                        }
                        _interface += "],";
                    }
                    _interface += "}"; // end interface
                    _interface = _interface.replace(/[\n\t]/g, '');
                    _interface = _interface.replace(/\s{2,}/g, '');

                    var jsonString = "Control.data = ";
                    jsonString += (typeof Control.data === null) ? "{}" : JSON.stringify(Control.data);
                    jsonString += ";Control.functions = ";
                    jsonString += (typeof Control.functions === null) ? "{}" : _functions;
                    jsonString += ";Control.interface = " + _interface;

                    Control.interfaceManager.loadedInterfaces[Control.ifCount] = {
                        'name': Control.interface.name,
                        'json': jsonString
                    };
                    Control.ifCount++;
                    Control.interfaceManager.loadScripts();
                }
            }else{
                localStorage.interfaceFiles = JSON.stringify(Control.interfaceManager.loadedInterfaces);
                Control.interfaceManager.createInterfaceListWithArray(Control.interfaceManager.loadedInterfaces);
            }
        }, 500);
    },

    promptForInterfaceDownload: function() {
        var interfacesDiv = document.getElementById("Interfaces");
        var promptDiv = document.createElement("div");
        var input = document.createElement("input");
        var inputHeader = document.createElement("h2");

        var cancelButton = document.createElement("button");
        var submitButton = document.createElement("button");

        inputHeader.innerHTML = "Enter Interface URL";
        inputHeader.setAttribute("id", "inputFieldHeader");
        inputHeader.setAttribute("style", "top:45px; color:#fff; font-size:1.5em");

        input.setAttribute("style", "top: 90px; height:50px; width:90%; font-size:1.25em");
        input.setAttribute("autocorrect", "off");
        input.value = "http://";
        input.setAttribute("type", "url");
        input.setAttribute("id", "ipField");

        cancelButton.innerHTML = "Cancel";
        cancelButton.setAttribute("style", "margin-top: 1em; font-size:1.5em; width: 5em; height: 2em; background-color:black; color:#fff; border: 1px solid #fff");
        $(cancelButton).bind("touchend", function(e) {
            document.getElementById('Interfaces').removeChild(document.getElementById('promptDiv'));
            e.preventDefault();
        });

        submitButton.innerHTML = "Submit";
        submitButton.setAttribute("style", "margin-left: 1em; margin-top: 1em; font-size:1.5em; width: 5em; height: 2em; background-color:#fff; color:#000; border: 1px solid #fff");
        $(submitButton).bind("touchend", function(e) {
            Control.interfaceManager.downloadInterfaceFromPrompt();
            e.preventDefault();
        });

        promptDiv.setAttribute("style", "z-index:2; left:0px; top:0px; position:absolute; background-color:rgba(0,0,0,.8); width:100%; height:100%;");
        promptDiv.setAttribute("id", "promptDiv");
        promptDiv.appendChild(inputHeader);
        promptDiv.appendChild(input);
        promptDiv.appendChild(document.createElement("br"));
        promptDiv.appendChild(document.createElement("br"));

        promptDiv.appendChild(cancelButton);
        promptDiv.appendChild(submitButton);

        interfacesDiv.appendChild(promptDiv);
    },


    downloadInterfaceFromPrompt: function() {
        var ipAddress = document.getElementById('ipField').value;
        //var shouldReload = document.getElementById('shouldReloadBox').checked;
        Control.interfaceManager.downloadInterface(ipAddress);
    },

    downloadInterface: function(ipAddress) { // EVENT --- CANNOT REFER TO THIS, MUST USE INTERFACE MANAGER
        Control.interfaceManager.myRequest = new XMLHttpRequest();
        var loadedInterfaceName = null;
        Control.interfaceManager.myRequest.onreadystatechange = function() {
            //console.log("downloading..." + Control.interfaceManager.myRequest.readyState );
            if (Control.interfaceManager.myRequest.readyState == 4) {
                console.log(Control.interfaceManager.myRequest.responseText);
                console.log("before parsing");
                eval(Control.interfaceManager.myRequest.responseText);
                console.log("after parsing");
                //console.log(Control.interface);
                if (Control.interface.name != null) {
                    if (document.getElementById("promptDiv") != null) {
                        document.getElementById("Interfaces").removeChild(document.getElementById("promptDiv"));
                    }
                    Control.interfaceManager.saveInterface(Control.interfaceManager.myRequest.responseText, true, ipAddress);
                    Control.interfaceManager.interfaceIP = ipAddress;
                    Control.interfaceManager.runInterface(Control.interfaceManager.myRequest.responseText);
                } else {
                    document.getElementById("inputFieldHeader").innerHTML = "Could not load. Please try another URL or check your code for errors.";
                    return;
                }
            }
        }
        Control.interfaceManager.myRequest.ipAddress = ipAddress;
        //Control.interfaceManager.myRequest.withCredentials = "true";                
        Control.interfaceManager.myRequest.open("GET", ipAddress, true);
        Control.interfaceManager.myRequest.send(null);
    },

    highlight: function(listNumber) {
        this.selectedListItem = listNumber;
        var list = document.getElementById('interfaceList');
        for (var i = 0; i < list.childNodes.length; i++) {
            if (i != listNumber) {
                list.childNodes[i].style.backgroundColor = "#000";
            } else {
                list.childNodes[i].style.backgroundColor = "#333";
            }
        }
    },

    createInterfaceListWithStoredInterfaces: function() {
        $('#interfaceList').empty();

        Control.interfaceManager.createInterfaceListWithArray(Control.interfaceManager.loadedInterfaces);

        window.isLoadingInterfaces = false;
    },

    createInterfaceListWithArray: function(listArray) {
		console.log("CREATING LIST");
        var list = $("#interfaceList");
        var count = 0;

        for (var i = 0; i < listArray.length; i++) {
            var r = listArray[i];
            var item = document.createElement('li');

            function _touchend(_key, _count) {
                return function(e) {
                    Control.interfaceManager.highlight(_count);
                    Control.interfaceManager.selectInterfaceFromList(_count);
                }
            }

            $(item).bind("tap", _touchend(r.name, count++));

            $(item).html(r.name);

            $(item).css({
                "border-bottom": "1px solid #666",
                "font-weight": "normal"
            });

            $(item).addClass('destinationListItem interfaceListItem');

            $(list).append(item);
        }

        $(list).listview('refresh');
    },

    editInterfaceList: function() {
        var list = document.getElementById('interfaceList');

        if (list.childNodes.length > 0) {
            document.getElementById('interfaceEditBtn').innerHTML = "Done";
            document.getElementById('interfaceEditBtn').ontouchend = Control.interfaceManager.endEditing;

            for (var i = 0; i < list.childNodes.length; i++) {
                var item = list.childNodes[i];
                var deleteButton = document.createElement("div");
                $(deleteButton).css({
                    "float": "left",
                    "margin-right": "5px",
                    "position": "relative",
                    "top": "0px",
                    "border": "#fff 2px solid",
                    "-webkit-border-radius": "10px",
                    "width": "15px",
                    "height": "15px",
                    "background-color": "#f00",
                    "color": "#fff",
                    "font-weight": "bold",
                });

                function _touchend(interfaceNumber) {
                    return function(e) {
                        Control.interfaceManager.removeInterface(interfaceNumber);
                    }
                }

                $(deleteButton).html("<img style='position:relative; top:-.7em; left:-.65em;' src='images/dash.png'>");
                $(deleteButton).bind("touchend", _touchend(i), false);
                $(item).prepend(deleteButton);
                $(item).unbind("tap");
            }
        }
    },

    endEditing: function() {
        var list = document.getElementById('interfaceList');

        document.getElementById('interfaceEditBtn').innerHTML = "Edit";
        document.getElementById('interfaceEditBtn').ontouchend = Control.interfaceManager.editInterfaceList;
        for (var i = 0; i < list.childNodes.length; i++) {
            var item = list.childNodes[i];
            item.removeChild(item.childNodes[0]);

            function _touchend(interfaceNumber, itemHTML) {
                return function(e) {
                    Control.interfaceManager.highlight(interfaceNumber);
                    Control.interfaceManager.selectInterfaceFromList(itemHTML);
                }
            }

            $(item).bind("tap", _touchend(i, item.innerHTML));
        }
    },

    refreshInterface: function() {
        console.log("IP = " + Control.interfaceManager.interfaceIP);
        Control.interfaceManager.myRequest = new XMLHttpRequest();
        Control.interfaceManager.myRequest.onreadystatechange = function() {
            console.log("downloading stage " + Control.interfaceManager.myRequest.readyState);
            if (Control.interfaceManager.myRequest.readyState == 4) {
                //Control.interfaceManager.runInterface(Control.interfaceManager.myRequest.responseText);
                for (var i = 0; i < Control.interfaceManager.loadedInterfaces.length; i++) {
                    var interface = Control.interfaceManager.loadedInterfaces[i];
                    if (interface.name == Control.interfaceManager.currentInterfaceName) {
                        console.log("SHOULD BE REPLACING " + i + " : " + Control.interface.name);
                        var newInterface = {
                            name: Control.interface.name,
                            json: Control.interfaceManager.myRequest.responseText,
                            address: Control.interfaceManager.interfaceIP
                        };
                        console.log(Control.interfaceManager.myRequest.responseText);
                        Control.interfaceManager.loadedInterfaces.splice(i, 1, newInterface);

                        localStorage.interfaceFiles = JSON.stringify(Control.interfaceManager.loadedInterfaces);

                        Control.interfaceManager.runInterface(Control.interfaceManager.myRequest.responseText);

                        break;
                    }
                }
            }
        }
        console.log("getting from " + Control.interfaceManager.interfaceIP);
        Control.interfaceManager.myRequest.open("GET", Control.interfaceManager.interfaceIP, true);
        Control.interfaceManager.myRequest.send(null);
    },

    saveInterface: function(interfaceJSON, shouldReloadList, ipAddress) {
        if (typeof ipAddress === "undefined") ipAddress = "";

        //eval(interfaceJSON);
        console.log("SAVING INTERFACE " + Control.interface.name);

        if (Control.interface.name != null) {
            Control.interfaceManager.loadedInterfaces.push({
                name: Control.interface.name,
                json: interfaceJSON,
                address: ipAddress
            });

            localStorage.interfaceFiles = JSON.stringify(Control.interfaceManager.loadedInterfaces);

            if (shouldReloadList) {
                Control.interfaceManager.createInterfaceListWithStoredInterfaces();
            }
        }
    },

    pushInterfaceWithDestination: function(interfaceJSON, nameOfSender, newDestination) {
        if (typeof nameOfSender != "undefined") {
            if (confirm("An interface is being pushed to you by " + nameOfSender + ". Do you accept it?")) {
                var loadedInterfaceName = null;
                this.saveInterface(interfaceJSON, false);
                Control.interfaceManager.runInterface(interfaceJSON);
                var segments = newDestination.split(":");

                Control.destinationManager.addDestination(segments[0], segments[1], false, false);
                Control.destinationManager.selectPushedDestination(segments[0], segments[1]);
            }
        }
    },

    pushInterface: function(interfaceJSON) {
        // TODO: change so it gets rid of the index.html at top of confirm window. Might require a new version of phonegap or else something tricky.
        if (confirm("An interface is being pushed to you. Do you accept it?")) {
            var loadedInterfaceName = null;
            Control.interfaceManager.runInterface(interfaceJSON);
            this.saveInterface(interfaceJSON, false);

        }

    },

    removeInterface: function(itemNumber) {
        var listItem = $('#interfaceList > li:eq(' + itemNumber + ')');
        var arr = $(listItem).html().split("</div>");
        var newKey = arr[1];
        for (var i = 0; i < Control.interfaceManager.loadedInterfaces.length; i++) {
            var _interface = Control.interfaceManager.loadedInterfaces[i];
            //console.log("Key = " + newKey + " :: interface.name = " + interface.name]);
            if (_interface.name == newKey) {
                Control.interfaceManager.loadedInterfaces.splice(i, 1);
                listItem.remove();
                localStorage.interfaceFiles = JSON.stringify(Control.interfaceManager.loadedInterfaces);
                //$('#interfaceList').listview('refresh');
                break;
            }
        }
    },

    runInterface: function(js) {
        Control.unloadWidgets();
        constants = null;
        pages = null;
        
        Control.oscManager.delegate = Control.oscManager;
        Control.midiManager.delegate = Control.midiManager;
        
        if(Control.timeout !== null) {
            window.clearTimeout(Control.timeout);
            Control.timeout = null;
        }
        
        eval(js);
        console.log(js);

        this.currentInterfaceName = Control.interface.name;

        if (typeof Control.interface.orientation != "undefined") {
            Control.device.setRotation(Control.interface.orientation);
        }

        if (Control.interface.orientation == "portrait") {
            Control.makePages(Control.interface.pages, screen.width, screen.height);
        } else {
            Control.makePages(Control.interface.pages, screen.height, screen.width);
        }

        if (typeof Control.interface.onpreinit === "string") {
            eval(Control.interface.onpreinit);
        } else if (Control.interface.onpreinit != null) {
            Control.interface.onpreinit();
        }
		
        if (Control.interface.constants != null) {
            Control.loadConstants(Control.interface.constants);
        }

        Control.loadWidgets();

        if (typeof Control.interface.oninit === "string") {
            eval(Control.interface.oninit);
        } else if (Control.interface.oninit != null) {
            Control.interface.oninit();
        }

        if (this.currentTab != document.getElementById("selectedInterface")) {
            Control.shouldPrevent = true;
            Control.changeTab(document.getElementById("selectedInterface"));
            $.mobile.changePage('#SelectedInterfacePage');
        }
    },

    selectInterfaceFromList: function(interfaceNumber) {
        var r = Control.interfaceManager.loadedInterfaces[interfaceNumber];
        //console.log(r);
        if (typeof r.address != "undefined") {
            Control.interfaceManager.interfaceIP = r.address;
        }

        Control.interfaceManager.runInterface(r.json);
    },
};
