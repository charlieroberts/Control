//TODO: this.widgets should hold ALL widgets, including constants. this.constants and this.pages can be used to keep them separated.

function Control() {
    var that = {
	    oninit 			: null,
		widgetCount 	: 0,
		widgets			: [],
		pages 			: [],
	    protocol 		: "OSC",
	    constants 		: [],
		currentPage 	: 0,
		deviceWidth 	: null,
		deviceHeight	: null,
		values 			: [],
		valuesString	: "",
		currentTab 		: null,
		tabBarHidden	: false,
		orientation 	: 0,
		acc 			: null,
		compass 		: null,
		gyro 			: null,
	    audioPitch 		: null,
	    audioVolume 	: null,
		shouldPrevent	: false,
		interfaceDiv 	: null,
		isAddingConstants : false,

		init : function() {
			this.currentTab = document.getElementById("Interfaces");
			this.interfaceDiv = document.getElementById("selectedInterface");
			this.changeTab(this.currentTab);
			
			this.sensors = [this.acc, this.compass, this.gyro, this.audioPitch, this.audioVolume];
   		},

		// called when interface is loaded. sets width and height based on orientation of interface.
		// adds event handlers that are turned off when on interface/destination/preferences/info tabs.
		makePages : function(_pages,width, height) {
			pages = _pages;
			this.deviceWidth = width;
			this.deviceHeight = height;
		    this.ctx = null;
			
			this.interfaceDiv.addEventListener('touchend', control.event, false);			
			this.interfaceDiv.addEventListener('touchstart', control.event, false);
			this.interfaceDiv.addEventListener('touchmove', control.event, false);
		},
		
		getWidgetWithName : function(widgetName) {
		    for(var i=0; i < this.widgets.length; i++) {
				var widget = this.widgets[i];
				if(widget.name == widgetName) {
		            return widget;
				}
			}
		},
		
		removeWidget : function(widgetID) {
			for(i in this.widgets) {
				widget = this.widgets[i];
				if(widget.id == widgetID) {
					this.widgets.splice(i,1);
					shouldRefresh = true;
					break;
				}
			}
		},
		
		// so that users can easily delete widgets via OSC where they don't have access to ID.
		// otherwise, removeWidget(widget.id) is much more efficient.
		removeWidgetWithName : function(widgetName) {
			for(var i=0; i < this.widgets.length; i++) {
				var widget = this.widgets[i];
				if(widget.name == widgetName) {
					this.widgets.splice(i,1);
					widget.unload();
					break;
				}
			}
		    for(var page = 0; page < control.pages.length; page++) {
				for(var j = 0; j < control.pages[page].length; j++) {
					var widget = control.pages[page][j];
					if(widget.name == widgetName) {
		                control.pages[page].splice(j,1);
		                widget = null;
					}
				}
			}
			for(var i = 0; i < control.constants.length; i++) {
				var widget = control.constants[i];
				if(typeof widget.name == widgetName) {
					control.constants.splice(i,1);
		            widget = null;
				}
			}
		},

		unloadWidgets : function() {
			this.widgets	= [];
			this.pages 		= [];
			this.constants 	= [];
            $("#selectedInterface").empty();		
			
			for(var i = 0; i < this.sensors.length; i++) {
				var sensor = this.sensors[i];
				if(sensor != null) {
					sensor.stop();
				}
			}
		},

		loadConstants : function(_constants) {
			this.isAddingConstants = true;
			if(_constants != null) {
				constants = _constants;
				this.constants = [];
                
				for(var i = 0; i < constants.length; i++) {
					var w = constants[i];
					var _w = window.control.makeWidget(w);
		            this.addConstantWidget(_w);
				}
			}
			this.isAddingConstants = false;
		},
		
		loadWidgets : function() {
			this.widgets = [];
			this.pages = [];
			
			var oldCurrentPage = this.currentPage;

			for(var pageNumber = 0; pageNumber < pages.length; pageNumber++) {
				this.addingPage = pageNumber;				
				this.pages.push([]);
		        var page = pages[pageNumber];
				for(var i=0; i < page.length; i++) {
					var w = page[i];
					var _w = this.makeWidget(w);

					this.widgets.push(_w);
					this.addWidget(_w, pageNumber);
				}
			}

			this.currentPage = oldCurrentPage;
		},
		
		makeWidget : function(w) {
			var _w;
			if(!this.isWidgetSensor(w)) {
				_w = window[w.name] = new window[w.type](this.interfaceDiv, w);
				if(_w.init != null) { 
					_w.init();
				}
			}else{
				_w = new window[w.type](w);
				switch(w.type) {
					case "ControlAccelerometer"	: control.acc = _w; 		break;
					case "ControlCompass"		: control.compass = _w; 	break;					
					case "ControlGyro"			: control.gyro = _w; 		break;
					case "AudioPitch"			: control.audioPitch  = _w; break;
					case "AudioVolume"			: control.audioVolume = _w; break;																
				}
		        _w.start();        
			}
			this.widgets.push(_w);			
			_w.widgetID = this.widgetCount++;	
			return _w;
		},
		
		isWidgetSensor : function(w) {
		    var _isWidgetSensor = false;
		    var sensors = [ "Accelerometer", "Compass", "Gyro", "AudioPitch", "AudioVolume" ];
		    for(var i in sensors) {
		        if(w.type == sensors[i]) { 
		            _isWidgetSensor = true;
		            break;
		        }
		    }
		    return _isWidgetSensor;
		},
		
		addConstantWidget : function(widget) {
		    this.constants.push(widget);

			if(widget.show != null) { widget.show(); }
			if(widget.draw != null) { widget.draw(); }
	
		    if(typeof widget.oninit === "string") {
		        eval(widget.oninit);
		    }else if (widget.oninit !== null ){
		        widget.oninit();
		    }
		},

		addWidget : function(widget, page) {
			//console.log("adding " + widget + " to page " + page);
			if(typeof this.pages[page] === "undefined") {		// make sure all previous pages are populated so users can flip through blank pages
				for(var i = 0; i <= page; i++) {
					if(typeof this.pages[i] === "undefined") {
						this.pages[i] = [];
					}
				}
			}
			this.pages[page].push(widget);
			if(page == control.currentPage) {
				if(widget.show != null) { widget.show(); }
				if(widget.draw != null) { widget.draw(); }
			}else{
				if(widget.hide != null) { widget.hide(); }
			}
		    if(typeof widget.oninit === "string") {
		        eval(widget.oninit);
		    }else if (widget.oninit !== null ){
		        widget.oninit();
		    }
		},
			
		getValues : function() { return control.valuesString; },

		clearValuesString : function() { control.valuesString = ""; },

		onRotation : function(event) { control.orientation = event.orientation; },

		event : function(event) {
			var page = control.currentPage;    

			for(var i = 0; i < control.pages[page].length; i++) {
				var widget = control.pages[page][i];
				widget.event(event);
			}
	
			for(var i = 0; i < control.constants.length; i++) {
				var widget = control.constants[i];
				widget.event(event);
			}
		},

		changeTab : function(tab) {
		    var oldTab = this.currentTab;
			this.currentPage = 0;

		    this.currentTab = tab;
    
			if(this.currentTab.id == "selectedInterface") {
				this.tabBarHidden = true;
				control.hideToolbar();
		    }else{
		      	if(this.tabBarHidden) {
		        	this.tabBarHidden = false;	  
		        	control.showToolbar();
		      	}
			  if(oldTab.id == "selectedInterface") {
					control.unloadWidgets();
				//if(device.platform == 'iPhone') 
		          //PhoneGap.exec("Device.setRotation", "portrait");
		          //Rotator.setRotation("portrait");
			  }
		    }
    
		    //TODO : make it work to change from landscape selected interface to portrait main menus	
		},

		changePage : function(newPage) {
			if(typeof newPage === 'string') {
				if(newPage === 'next') {
				  newPage = this.currentPage + 1;
				}else if(newPage === 'previous') {
				  newPage = this.currentPage - 1;
				}
			}
  
			if(newPage < this.pages.length && newPage >= 0) {
				for(var i = 0; i < this.pages[this.currentPage].length; i++) {
					var w = this.pages[this.currentPage][i];
					if(typeof w.hide != "undefined")
						w.hide();
				}

				this.currentPage = newPage;
				var page = this.pages[this.currentPage];
		
				for(var i = 0; i < page.length; i++) {
					var w = page[i];
					if(typeof w.show != "undefined") w.show();
					if(typeof w.draw != "undefined") w.draw();
				}
			}
		},
	
		showToolbar : function() {
			this.tabBarHidden = false;
			$(".ftr").css("visibility", "visible");
		},

		hideToolbar : function() {
			this.tabBarHidden = true;
			$(".ftr").css("visibility", "hidden");	
		},
	
	};
	
	return that;
};