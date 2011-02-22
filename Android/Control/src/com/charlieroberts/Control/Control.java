
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
            super.setIntegerProperty("loadUrlTimeoutValue", 60000);
			getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FORCE_NOT_FULLSCREEN ); 
    		getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, 
			WindowManager.LayoutParams.FLAG_FULLSCREEN); 
            super.loadUrl("http://10.42.43.1:8000/www/index.html");
			//super.loadUrl("file:///android_asset/www/index.html");
			
        }
    }
    
