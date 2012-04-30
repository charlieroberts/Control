//
//  Compass.h
//  PhoneGap
//
//  Created by thecharlie on 10/21/10.
//  Copyright 2010 One More Muse. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <CoreLocation/CoreLocation.h>

#import "PGPlugin.h"

@interface CNTRLMagnetometer : PGPlugin<CLLocationManagerDelegate> {
	CLLocationManager *locationManager;
	bool _bIsRunning;
}

- (void)start:(NSMutableArray*)arguments
	 withDict:(NSMutableDictionary*)options;


- (void)stop:(NSMutableArray*)arguments
	withDict:(NSMutableDictionary*)options;

@end