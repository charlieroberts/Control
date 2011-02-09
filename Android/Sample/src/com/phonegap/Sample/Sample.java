
    package com.phonegap.Sample;

    import android.app.Activity;
    import android.os.Bundle;
    import com.phonegap.*;
	import android.view.WindowManager;
    public class Sample extends DroidGap
    {
        @Override
        public void onCreate(Bundle savedInstanceState)
        {
            super.onCreate(savedInstanceState);
			getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FORCE_NOT_FULLSCREEN ); 
    		getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, 
			WindowManager.LayoutParams.FLAG_FULLSCREEN); 
            //super.loadUrl("http://192.168.1.7/~charlie/www/index.html");
			super.loadUrl("file:///android_asset/www/index.html");
        }
    }
    
