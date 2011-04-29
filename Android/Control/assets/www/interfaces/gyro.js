interfaceString = "loadedInterfaceName = \"Gyro, Accelerometer, Compass\";\
\
interfaceOrientation = \"portrait\";\
\
whRatio = 2 / 3;\
\
infoText = \"This page shows off features of the Gyroscope (iPhone 4 and newest iPod Touch only) and the Accelerometer (all iOS and Android devices). Core Motion is a framework created by Apple that applies signal processing to the Gyro and Accelerometer readings to give more stable indications of pitch and roll. It also provides a usable yaw (orientation) value which changes as you change directions holding the phone. Unlike the compass, this yaw value is not affected by tilting the device. Although not present in this interface, you can also use the gyro widget to measure raw rotational rate on 3-axis (iPhone 4 and newest iPod Touch only).<br><br>You can set the update rate of the accelerometer and the gyro using the sliders provided here. The Core Motion values are sent to /gyro, the Accelerometer values are sent to /accelerometer and the compass heading to /compass. For MIDI, the gyro goes to CC 0, 1 and 2, the accelerometer to CC 3, 4 and 5.\";\
\
pages = [[\
\
{\
    \"name\": \"compassHeading\",\
    \"type\": \"Slider\",\
    \"x\": 0,\
    \"y\": .75,\
    \"width\": .99,\
    \"height\": .075,\
    \"isLocal\": true,\
    \"min\": 0,\
    \"max\": 360,\
    \"startingValue\": 0,\
    \"ontouchstart\":\"\",\
    \"ontouchmove\":\"\",\
    \"ontouchend\":\"\",\
},\
{\
    \"name\": \"compassHeadingLabel\",\
    \"type\": \"Label\",\
    \"x\": .0,\
    \"y\": .81,\
    \"width\": 1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"Heading\",\
    \"align\": \"left\",\
},\
\
{\
    \"name\": \"gyroLabel\",\
    \"type\": \"Label\",\
    \"x\": 0,\
    \"y\": 0,\
    \"width\": 1,\
    \"height\": .05,\
    \"color\": \"#ffffff\",\
    \"align\": \"left\",\
    \"value\": \"CORE MOTION (ACCEL + GYRO)\",\
},\
\
{\
    \"name\": \"pitchLabel\",\
    \"type\": \"Label\",\
    \"x\": .0,\
    \"y\": .2,\
    \"width\": .33,\
    \"height\": .05,\
    \"color\": \"#ffffff\",\
    \"value\": \"pitch\",\
},\
{\
    \"name\": \"rollLabel\",\
    \"type\": \"Label\",\
    \"x\": .33,\
    \"y\": .2,\
    \"width\": .33,\
    \"height\": .05,\
    \"color\": \"#ffffff\",\
    \"value\": \"roll\",\
},\
{\
    \"name\": \"yawLabel\",\
    \"type\": \"Label\",\
    \"x\": .66,\
    \"y\": .2,\
    \"width\": .33,\
    \"height\": .05,\
    \"color\": \"#ffffff\",\
    \"value\": \"yaw\",\
},\
{\
    \"name\": \"gyroSliders\",\
    \"type\": \"MultiSlider\",\
    \"numberOfSliders\": 3,\
	\"min\":0,\
	\"max\":127,\
    \"x\": .0,\
    \"y\": .05,\
    \"width\": .99,\
    \"height\": .15,\
	\"isLocal\":true,\
	\"ontouchstart\":\"\",\
    \"ontouchmove\":\"\",\
    \"ontouchend\":\"\",\
},\
\
\
{\
    \"name\": \"accSliders\",\
    \"type\": \"MultiSlider\",\
    \"numberOfSliders\": 3,\
    \"x\": .0,\
    \"y\": .42,\
    \"min\":0,\
    \"max\":127,\
    \"midiNumber\":3,\
    \"isVertical\": true,\
    \"width\": .99,\
    \"height\": .15,\
    \"isLocal\":true,\
    \"ontouchstart\":\"\",\
    \"ontouchmove\":\"\",\
    \"ontouchend\":\"\",\
},\
\
{\
    \"name\": \"com\",\
    \"type\": \"Compass\",\
    \"min\":0,\
    \"max\":360,\
    \"updateRate\":10,\
    \"midiNumber\": 0,\
    \"isLocal\":false,\
    \"onvaluechange\": \"compassHeading.changeValue(self.value);\",\
    \"address\":\"/compass\",\
},\
\
{\
    \"name\": \"acc\",\
    \"type\": \"Accelerometer\",\
    \"min\":0,\
    \"max\":127,\
    \"updateRate\":10,\
    \"midiNumber\": 0,\
    \"isLocal\":false,\
    \"onvaluechange\": \"accSliders.setSequentialValues(self.x, self.y, self.z);\",\
    \"address\":\"/accelerometer\",\
},\
\
{\
    \"name\": \"accSpeedLabel\",\
    \"type\": \"Label\",\
    \"x\": .0,\
    \"y\": .675,\
    \"width\": 1,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"Update Rate : 10Hz\",\
    \"align\": \"left\",\
},\
\
{\
    \"name\": \"accelerometerSpeed\",\
    \"type\": \"Slider\",\
    \"x\": 0,\
    \"y\": .6,\
    \"width\": .99,\
    \"height\": .075,\
    \"isLocal\": true,\
    \"min\": 1,\
    \"max\": 100,\
    \"startingValue\": 10,\
    \"ontouchend\": \"accSpeedLabel.changeValue(\'Update Rate : \' + (Math.round(this.value*10) / 10) +\'Hz\'); acc.setUpdateRate(this.value); \",\
},\
\
{\
    \"name\": \"gyro\",\
    \"type\": \"Gyro\",\
    \"min\":0,\
    \"max\":127,\
    \"midiNumber\":3,\
    \"updateRate\":10,\
    \"isLocal\":false,\
    \"onvaluechange\": \"gyroSliders.setSequentialValues(this.pitch, this.roll, this.yaw);\",\
},\
\
{\
    \"name\": \"gyroSpeedLabel\",\
    \"type\": \"Label\",\
    \"x\": 0,\
    \"y\": .325,\
    \"width\": .8,\
    \"height\": .1,\
    \"color\": \"#ffffff\",\
    \"value\": \"Update Rate : 10Hz\",\
    \"align\": \"left\",\
},\
\
{\
    \"name\": \"gyroSpeed\",\
    \"type\": \"Slider\",\
    \"x\": .0,\
    \"y\": .275,\
    \"width\": .99,\
    \"height\": .075,\
    \"isLocal\": true,\
    \"min\": 1,\
    \"max\": 100,\
    \"startingValue\": 10,\
    \"ontouchend\": \"gyro.setUpdateRate(this.value); gyroSpeedLabel.changeValue(\'Update Rate : \' + (Math.round(this.value*10) / 10) +\'Hz\')\",\
},\
\
{\
    \"name\": \"accLabel\",\
    \"type\": \"Label\",\
    \"x\": 0,\
    \"y\": .375,\
    \"width\": .2,\
    \"height\": .05,\
    \"color\": \"#ffffff\",\
    \"align\": \"left\",\
    \"value\": \"ACCELEROMETER\",\
},\
{\
    \"name\": \"xAccLabel\",\
    \"type\": \"Label\",\
    \"x\": .0,\
    \"y\": .42,\
    \"width\": .33,\
    \"height\": .05,\
    \"color\": \"#ffffff\",\
    \"value\": \"xAcc\",\
},\
{\
    \"name\": \"yAccLabel\",\
    \"type\": \"Label\",\
    \"x\": .33,\
    \"y\": .42,\
    \"width\": .33,\
    \"height\": .05,\
    \"color\": \"#ffffff\",\
    \"value\": \"yAcc\",\
},\
{\
    \"name\": \"zAccLabel\",\
    \"type\": \"Label\",\
    \"x\": .66,\
    \"y\": .42,\
    \"width\": .33,\
    \"height\": .05,\
    \"color\": \"#ffffff\",\
    \"value\": \"zAcc\",\
},\
\
{\
    \"name\": \"tabButton\",\
    \"type\": \"Button\",\
    \"x\": .8,\
    \"y\": .85,\
    \"width\": .19,\
    \"height\": .15 * whRatio,\
    \"mode\": \"toggle\",\
    \"color\": \"#333333\",\
    \"stroke\": \"#aaaaaa\",\
    \"isLocal\": true,\
	\"ontouchstart\": \"if(this.value == this.max) { control.showToolbar(); } else { control.hideToolbar(); }\",\
},\
\
{\
    \"name\": \"tabButtonLabel\",\
    \"type\": \"Label\",\
    \"x\": .8,\
    \"y\": .85,\
    \"width\": .19,\
    \"height\": .15 * whRatio,\
    \"mode\": \"contact\",\
    \"isLocal\": true,\
    \"value\": \"menu\",\
},\
\
{\
    \"name\": \"infoButton\",\
    \"type\": \"Button\",\
    \"x\": .6,\
    \"y\": .85,\
    \"width\": .2,\
    \"height\": .15 * whRatio,\
    \"mode\": \"contact\",\
    \"color\": \"#333333\",\
    \"stroke\": \"#aaaaaa\",\
    \"midiType\": \"noteon\",\
    \"isLocal\": true,\
    \"ontouchstart\": \"control.changePage(1);\",\
},\
{\
    \"name\": \"infoButtonLabel\",\
    \"type\": \"Label\",\
    \"x\": .6,\
    \"y\": .85,\
    \"width\": .2,\
    \"height\": .15 * whRatio,\
    \"color\": \"#fff\",\
    \"value\": \"info\",\
},\
\
\
],\
\
[\
{\
    \"name\": \"infoText\",\
    \"type\": \"Label\",\
    \"x\": .1,\
    \"y\": .1,\
    \"width\": .8,\
    \"height\": .7,\
    \"value\": infoText,\
    \"verticalCenter\": false,\
    \"align\": \"left\",\
},\
{\
    \"name\": \"backButton\",\
    \"type\": \"Button\",\
    \"x\": .8,\
    \"y\": .9,\
    \"width\": .19,\
    \"height\": .09,\
    \"mode\": \"contact\",\
    \"color\": \"#333333\",\
    \"stroke\": \"#aaaaaa\",\
    \"isLocal\": true,\
    \"ontouchstart\": \"control.changePage(0);\",\
},\
{\
    \"name\": \"infoButtonLabel\",\
    \"type\": \"Label\",\
    \"x\": .8,\
    \"y\": .9,\
    \"width\": .19,\
    \"height\": .09,\
    \"color\": \"#fff\",\
    \"value\": \"back\",\
},\
],];";