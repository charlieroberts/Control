//
//  Compass.m
//  PhoneGap
//
//  Created by thecharlie on 10/21/10.
//  Copyright 2010 One More Muse. All rights reserved.
//

#import "Compass.h"


@implementation Compass

- (void)start:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options {
	locationManager = [[CLLocationManager alloc] init];
	locationManager.delegate = self;
	
	[locationManager startUpdatingHeading];
	_bIsRunning = YES;
}

- (void)stop:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options {
	_bIsRunning = NO;
	[locationManager stopUpdatingHeading];
}


- (BOOL)locationManagerShouldDisplayHeadingCalibration:(CLLocationManager *)manager { return NO; }

- (void)locationManager:(CLLocationManager *)manager didUpdateHeading:(CLHeading *)newHeading {
	NSString * jsCallBack;
	jsCallBack = [[NSString alloc] initWithFormat:@"compass._onCompassUpdate(%f);", [newHeading magneticHeading]];
	[webView stringByEvaluatingJavaScriptFromString:jsCallBack];
	[jsCallBack release];
}

- (void)dealloc {
	[locationManager release];
	[super dealloc];
}

@end
