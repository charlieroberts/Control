/**
 * PhoneGap plugin handling OSC communication in Control
 */
package com.charlieroberts.Control;

import java.io.File;
import java.util.*;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;
import android.view.WindowManager;
import com.phonegap.*;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.api.PluginResult.Status;

import java.io.StringWriter;
import java.io.PrintWriter;

import android.app.Activity.*;
import android.content.pm.ActivityInfo;

import android.os.Bundle;

public class DeviceFeatures extends Plugin {
    boolean isPortrait = true;
	
	@Override
	public PluginResult execute(String action, JSONArray data, String callbackId) {
	    //Log.d("OSCManager", "executing something " + action);	
    	PluginResult result = null;
        try {
	        if (action.equals("setOrientation")) {
    	        String orientation;
            	orientation = data.getString(0);

        		//System.out.println("Rotating device");
        		if (action.equals("setOrientation") || action.equals("setOrientation2")) {
        		    System.out.println("ROTATION STARTING " + orientation + " ********************************************");
        		    if(orientation.equals("landscape")) {
            		    this.ctx.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
            		} else {
            		    this.ctx.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
            		}
		        
    		        if(action.equals("setOrientation")) {
                        String jsString = "javascript:window.interfaceManager.rotationSet("+ webView.getWidth() + "," + webView.getHeight() + ");";
                        //System.out.println(jsString);
                        webView.loadUrl(jsString);
                        //System.out.println("after sending to js");
                    }
        	    }
            }else if(action.equals("print")){
                try{
                    System.out.println(data.getString(0));
                }catch (Exception e) {
                    System.out.println("failed to print");
                }
            }
        }catch (Exception e) {
            System.out.println("couldn't get orientation from javascript runtime");
        }
		return result;
	}
}
