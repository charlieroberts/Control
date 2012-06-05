//
//  CNTRLWindow.h
//  Control
//
//  Created by charlie on 6/4/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface CNTRLWindow : UIWindow {
    NSMutableDictionary *radii;
    UIWebView *webView;
}

- (void) setWebView:(UIWebView *)_webView;
@end
