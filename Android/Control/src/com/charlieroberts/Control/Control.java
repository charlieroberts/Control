
package com.charlieroberts.Control;

import android.os.Bundle;
import com.phonegap.*;
import android.view.WindowManager;

import de.sciss.net.*;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.io.StringWriter;
import java.io.PrintWriter;

public class Control extends DroidGap
{
    android.net.wifi.WifiManager.MulticastLock lock;
    android.os.Handler handler = new android.os.Handler();
	
   @Override
      public void onCreate(Bundle savedInstanceState)
      {
         super.onCreate(savedInstanceState);
         super.setIntegerProperty("loadUrlTimeoutValue", 600000);
         getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FORCE_NOT_FULLSCREEN ); 
         getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN); 

         //super.loadUrl("http://192.168.1.5/~charlie/www/index.html");\
         super.loadUrl("file:///android_asset/www/index.html");
         
         handler.postDelayed(new Runnable() {
            public void run() {
                setUp();
            }
         }, 1000);
    }
    
    private void setUp() {
         /* wifi setup to enable multicast packet processing (for mdns) */
         android.net.wifi.WifiManager wifi = (android.net.wifi.WifiManager)getSystemService(android.content.Context.WIFI_SERVICE);
	     lock = wifi.createMulticastLock("HeeereDnssdLock");
         lock.setReferenceCounted(true);
         lock.acquire();
      }
}

