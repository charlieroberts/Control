Get started with Eclipse
===

1. File > New > Project...
2. Android Project
3. Create from existing source
4. point to this folder
5. select highest build target (you should have 2.2 installed)
6. finish
7a. right click on libs/phonegap.jar and add to build path
7b. right click on libs/jmdns.jar and add to build path
8. If you get an error like "In Bonjour.java: The method serviceResolved(ServiceEvent) of type new ServiceListener(){} must override a superclass method", the Java version has to manually be set to 1.6 in the project preferences when importing the repo's project: 
   With Eclipse Galileo you go to Eclipse -> Preferences menu item, then select Java and Compiler in the dialog. Now it still may show compiler compliance level at 1.6, yet you still see this problem. So now select the link "Configure Project Specific Settings..." and in there you'll see the project is set to 1.5, now change this to 1.6.
9. Run as Android Project

Get started with the command line
===

1. create local.properties with the android command line tool

$ android update project -p . 

2. ensure an emulator or device is plugged in 

$ ant debug install && adb logcat


