Control.interface = {
	"name": "video test", 
	"orientation": "portrait",
	
	pages : [[
	{
		"name": "refresh", 
		"type": "Button", 
		"mode": "momentary", 			
		"bounds": [.8,.9,.1,.1],
		"stroke": "#0ff", 
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
		"name": "videoDisplay", 
		"type": "Video", 
		"bounds": [0, 0, .9, .9],
	},
	]],
};

// Control.Video.prototype.onUpdate = function(videoFrame) {	
// 	var newFrame = [];
// 	this.canvas.width = this.canvas.width;
// 	var myImage = this.canvasCtx.getImageData(0, 0, 144, 192);
// 	var myImageData = myImage.data;
// 	
// 	console.log("VIDEO LENGTH = " + videoFrame.length);
// 	
// 	for(var i = 0; i < videoFrame.length; i++) {
// 		var pixVal = Math.floor(videoFrame[i] * 255);
// 
// 		for(var j = 0; j < 4; j++) {
// 			myImageData[i * 4 + j] = pixVal;
// 		}
// 	}
// 	
// 	this.canvasCtx.putImageData(myImage, 0, 0);
// };
