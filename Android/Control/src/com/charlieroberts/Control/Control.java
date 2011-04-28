
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
   @Override
      public void onCreate(Bundle savedInstanceState)
      {
         super.onCreate(savedInstanceState);
         super.setIntegerProperty("loadUrlTimeoutValue", 600000);
         getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FORCE_NOT_FULLSCREEN ); 
         getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN); 

         //super.loadUrl("http://192.168.1.6/~charlie/www/index.html");
         super.loadUrl("file:///android_asset/www/index.html");

         final Object        sync = new Object();
         final OSCClient     c;
         final OSCBundle     bndl1, bndl2;
         final Integer       nodeID;

         try {
            //start client, binding to any available port
            c = OSCClient.newUsing(OSCClient.UDP);
            c.setTarget( new InetSocketAddress( "192.168.1.117", 10001 ));
            // open channel and (in the case of TCP) connect, then start listening for replies
            c.start();
            c.dumpOSC( OSCChannel.kDumpBoth, System.err );
            System.err.println("SENDING OSC");

            c.send( new OSCMessage( "/test", new Object[] { "from Control!", new Integer( 42 )}));
         }
         catch( IOException e ) {
            System.err.println("CRAP NetUtil osc sending isn't working!!!");

            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            System.err.println( sw.toString());
         }

      }
}

