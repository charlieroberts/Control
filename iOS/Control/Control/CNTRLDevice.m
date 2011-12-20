/*
 *  Device.m 
 *  Used to display Device centric details handset.
 *
 *  Created by Nitobi on 12/12/08.
 *  Copyright 2008 Nitobi. All rights reserved.
 */

#import "CNTRLDevice.h"
#import "PhoneGapDelegate.h"
#import "PhoneGapViewController.h"
@implementation CNTRLDevice

/**
 * returns a dictionary with various device settings
 * ANY CHANGES HERE MUST ALSO BE MADE TO THE DEVICE OBJECT IN phonegap-min.js OR THEY WILL NOT BE REFLECTED	
 *  - gap (version)
 *  - Device platform
 *  - Device version
 *  - Device name (e.g. user-defined name of the phone)
 *  - Device uuid
 *** ADDED *** - Device screen dimensions
 */
//- (NSDictionary*) deviceProperties:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options
//{
//	UIDevice *device = [UIDevice currentDevice];
//    NSMutableDictionary *devProps = [NSMutableDictionary dictionaryWithCapacity:4];
//	[devProps setObject:[device model] forKey:@"platform"];
//    [devProps setObject:[device systemVersion] forKey:@"version"];
//    [devProps setObject:[device uniqueIdentifier] forKey:@"uuid"];
//    [devProps setObject:[device name] forKey:@"name"];
//    [devProps setObject:@"0.8.0" forKey:@"gap"];
//	
//	PhoneGapDelegate *del = (PhoneGapDelegate *)[[UIApplication sharedApplication] delegate];
//	[devProps setObject:[NSString stringWithFormat:@"%f", del.window.frame.size.width] forKey:@"width"];
//	[devProps setObject:[NSString stringWithFormat:@"%f",del.window.frame.size.height] forKey:@"height"];	
//	
//    NSDictionary *devReturn = [NSDictionary dictionaryWithDictionary:devProps];
//    return devReturn;
//}

//- (NSDictionary*) deviceProperties
//{
//	UIDevice *device = [UIDevice currentDevice];
//    NSMutableDictionary *devProps = [NSMutableDictionary dictionaryWithCapacity:4];
//	[devProps setObject:[device model] forKey:@"platform"];
//    [devProps setObject:[device systemVersion] forKey:@"version"];
//    [devProps setObject:[device uniqueIdentifier] forKey:@"uuid"];
//    [devProps setObject:[device name] forKey:@"name"];
//    [devProps setObject:@"0.8.0" forKey:@"gap"];
//	
//	PhoneGapDelegate *del = (PhoneGapDelegate *)[[UIApplication sharedApplication] delegate];
//	[devProps setObject:[NSString stringWithFormat:@"%f", del.window.frame.size.width] forKey:@"width"];
//	[devProps setObject:[NSString stringWithFormat:@"%f",del.window.frame.size.height] forKey:@"height"];	
//	
//    NSDictionary *devReturn = [NSDictionary dictionaryWithDictionary:devProps];
//    return devReturn;
//}

- (void) autolockToggle:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
	[UIApplication sharedApplication].idleTimerDisabled = [[arguments objectAtIndex:0] boolValue];
}

- (void) setRotation:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
	PhoneGapDelegate *del = (PhoneGapDelegate *)[[UIApplication sharedApplication] delegate];

	[(PhoneGapViewController *)del.viewController setRotateOrientation:[arguments objectAtIndex:1]];
	UIWindow *window = [[UIApplication sharedApplication] keyWindow];
	UIView *view = [window.subviews objectAtIndex:2]; // Image View (can I kill this?), Activity indicator view, view controller view.
	[view removeFromSuperview];
	[window addSubview:view];
}


@end
