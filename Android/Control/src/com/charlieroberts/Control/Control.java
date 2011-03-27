
package com.charlieroberts.Control;

import android.os.Bundle;
import com.phonegap.*;
import android.view.WindowManager;

public class Control extends DroidGap
{
   @Override
      public void onCreate(Bundle savedInstanceState)
      {
         super.onCreate(savedInstanceState);
         super.setIntegerProperty("loadUrlTimeoutValue", 600000);
         getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FORCE_NOT_FULLSCREEN ); 
<<<<<<< HEAD
         getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN); 

         //super.loadUrl("http://192.168.1.6/~charlie/www/index.html");
         super.loadUrl("file:///android_asset/www/index.html");
=======
         getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, 
               WindowManager.LayoutParams.FLAG_FULLSCREEN); 
         super.loadUrl("http://10.42.43.1:8000/www/index.html");
         //super.loadUrl("file:///android_asset/www/index.html");
>>>>>>> db932aaed29b56d172d7f7bbc481491ca4678f9a
      }
}

