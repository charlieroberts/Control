//
//  CNTRLWindow.m
//  Control
//
//  Created by charlie on 6/4/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CNTRLWindow.h"

@implementation CNTRLWindow

- (id) initWithFrame:(CGRect)frame {
    id me = [super initWithFrame:frame];
    radii = [[NSMutableDictionary alloc] init];
    return me;
}

- (void) setWebView:(UIWebView *)_webView {
    webView = _webView;
}

- (void)sendEvent:(UIEvent *)event{
    for(UITouch *thisTouch in [event allTouches]) {
        float vf = 10.0;
        id valFloat = [thisTouch valueForKey:@"pathMajorRadius"];
        if(valFloat != nil) { 
            vf = [valFloat floatValue]; 
        }
        
        if(thisTouch.phase == UITouchPhaseBegan) {
            NSString *hash = [NSString stringWithFormat:@"%u", [thisTouch hash]];
            NSString *key = [NSString stringWithFormat:@"%d:%d", (int)([thisTouch locationInView:nil].x), (int)([thisTouch locationInView:nil].y)];
            NSDictionary *dict = [NSDictionary dictionaryWithObjectsAndKeys:hash, @"hash", FLOAT(vf), @"pressure", nil];
            
            //NSLog(@"CREATING KEY %@", key);
            
            [radii setObject:dict forKey:key];
            
            NSString * jsCallBack;
            jsCallBack = [[NSString alloc] initWithFormat:@"Control.pressures['%@'] = %f;", key, vf];
            //NSLog(jsCallBack);
            [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
            [jsCallBack release];
        }else if(thisTouch.phase == UITouchPhaseMoved) {
            NSString *hash = [NSString stringWithFormat:@"%u", [thisTouch hash]];
            NSString *key = [NSString stringWithFormat:@"%d:%d", (int)([thisTouch locationInView:nil].x), (int)([thisTouch locationInView:nil].y)];
            NSDictionary *dict = [NSDictionary dictionaryWithObjectsAndKeys:hash, @"hash", FLOAT(vf), @"pressure", nil];
            
            //NSLog(@"CREATING KEY %@", key);
            
            [radii setObject:dict forKey:key];
            
            NSString * jsCallBack;
            jsCallBack = [[NSString alloc] initWithFormat:@"Control.pressures['%@'] = %f;", key, vf];
            //NSLog(jsCallBack);
            [webView stringByEvaluatingJavaScriptFromString:jsCallBack];
        }
        //NSLog(@"x : %f, y : %f", [thisTouch locationInView:nil].x, [thisTouch locationInView:nil].y);
    }
    
    [super sendEvent:event];
}

- (void) dealloc {
    [radii release];
    [super dealloc];
}
@end
