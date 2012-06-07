Control.interface = {
	name : "list 7",
	orientation: "portrait",
	pages: [[
		{
			"name": "refresh", 
			"type": "Button", 	
			"mode": "momentary", 			
			"bounds": [.8,.9,.1,.1],
			"stroke": "#fff", 
			"label": "refresh", 
			"isLocal": true, 
			"ontouchstart": function() { Control.interfaceManager.refreshInterface(); }, 
		},
		{
			"name": "menu", 
			"type": "Button", 
			"mode": "momentary", 			
			"bounds": [.9,.9,.1,.1],
			"stroke": "#f0f", 
			"label": "menu",
			"isLocal": true, 
			"ontouchstart": function() { Control.toggleToolbar(); }, 
		},
		{
			name: "btn",
			type: "Button",
			bounds: [0,0,.5,.5],
		},
	]]
};