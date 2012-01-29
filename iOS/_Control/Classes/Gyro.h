//
//  Gyro.h
//  PhoneGap
//
//  Created by thecharlie on 11/18/10.
//  Copyright 2010 One More Muse. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "PhoneGapCommand.h"
#import <CoreMotion/CoreMotion.h>

//#import "matrix.h"
//#import "AccelerometerFilter.h"

@interface Gyro : PhoneGapCommand {
	BOOL shouldRun;
	CMMotionManager *motionManager;
	CMAttitude *referenceAttitude;
	NSOperationQueue *opQ;
	CMDeviceMotionHandler deviceMotionHandler;
}

- (void)setReferenceAttitude:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options;
- (void)start:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options;
- (void)stop:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options;
- (void)setUpdateRate:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
@end
