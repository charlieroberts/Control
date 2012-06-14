package com.charlieroberts.Control;

import android.os.Bundle;
import com.phonegap.*;
import android.view.WindowManager;
import android.webkit.*;
import android.content.Context;

// import de.sciss.net.*;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.io.StringWriter;
import java.io.PrintWriter;

import android.util.Log;

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
		 
         //super.appView.getSettings().setCacheMode(android.webkit.WebSettings.LOAD_NO_CACHE); // Turn off cacheing of interfaces so that they can be refreshed / reloaded
        
         super.loadUrl("file:///android_asset/www/index.html");
         // super.loadUrl("http://192.168.1.101/~charlie/www/index.html");
         super.appView.getSettings().setSupportZoom(false);
         super.appView.getSettings().setDomStorageEnabled(true);
	     super.appView.getSettings().setJavaScriptEnabled(true);
		 super.appView.getSettings().setRenderPriority(WebSettings.RenderPriority.HIGH);
		 
         super.appView.getSettings().setBuiltInZoomControls(false); //Enable Multitouch if supported by ROM
		 
         //super.appView.setWebChromeClient(new EclairClient2(this));
         
         // TODO: the line below seems to create better multitouch, but it also makes some errant calls every once in a while...
         // touch events are generated at random somehow. But I think the behavior is better with it on than with it off.
         // when off, multiple touchdown events only work if there is a drag in between them for whatever reason. 
 
		 
         // handler.postDelayed(new Runnable() {
         //    public void run() {
         //        setUp();
         //    }
         // }, 1000);
        
    }
    
    // private void setUp() {
    //      /* wifi setup to enable multicast packet processing (for mdns) */
    //      android.net.wifi.WifiManager wifi = (android.net.wifi.WifiManager)getSystemService(android.content.Context.WIFI_SERVICE);
    // 	     lock = wifi.createMulticastLock("HeeereDnssdLock");
    //      lock.setReferenceCounted(true);
    //      lock.acquire();
    //   }
 
// this overrides the EclarClient class in DroidGap.java (part of the phonegap.jar to give more memory to the web database. This is needed for storing interface files.    
    // public class EclairClient2 extends GapClient {
    // 
    // 	private String TAG = "PhoneGapLog";
    // 	private long MAX_QUOTA = 10000 * 1024 * 1024;
    // 
    // 	/**
    // 	 * Constructor.
    // 	 * 
    // 	 * @param ctx
    // 	 */
    // 	public EclairClient2(Context ctx) {
    // 		super(ctx);
    // 	}
    // 
    // 	/**
    // 	 * Handle database quota exceeded notification.
    // 	 *
    // 	 * @param url
    // 	 * @param databaseIdentifier
    // 	 * @param currentQuota
    // 	 * @param estimatedSize
    // 	 * @param totalUsedQuota
    // 	 * @param quotaUpdater
    // 	 */
    // 	@Override
    // 	public void onExceededDatabaseQuota(String url, String databaseIdentifier, long currentQuota, long estimatedSize,
    // 			long totalUsedQuota, WebStorage.QuotaUpdater quotaUpdater)
    // 	{
    // 		Log.d(TAG, "event raised onExceededDatabaseQuota estimatedSize: " + Long.toString(estimatedSize) + " currentQuota: " + Long.toString(currentQuota) + " totalUsedQuota: " + Long.toString(totalUsedQuota));
    // 
    // 		if( estimatedSize < MAX_QUOTA)
    // 		{	                                        
    // 			//increase for 1Mb
    // 			long newQuota = estimatedSize;		    		
    // 			Log.d(TAG, "calling quotaUpdater.updateQuota newQuota: " + Long.toString(newQuota) );
    // 			quotaUpdater.updateQuota(MAX_QUOTA);
    // 		}
    // 		else
    // 		{
    // 			// Set the quota to whatever it is and force an error
    // 			// TODO: get docs on how to handle this properly
    // 			quotaUpdater.updateQuota(currentQuota);
    // 		}		    	
    // 	}
    // }		
}

