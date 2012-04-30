//
//  Gyro.h
//  PhoneGap
//
//  Created by thecharlie on 11/18/10.
//  Copyright 2010 One More Muse. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "PGPlugin.h"
#import <CoreMotion/CoreMotion.h>

//#import "matrix.h"
//#import "AccelerometerFilter.h"

@interface Gyro : PGPlugin {
	BOOL shouldRun;
	CMMotionManager *motionManager;
	CMAttitude *referenceAttitude;
	NSOperationQueue *opQ;
	CMDeviceMotionHandler deviceMotionHandler;
    BOOL shouldSendMagneticField;
    BOOL shouldSendRotationRate;
    BOOL shouldSendOrientation;
}

- (void)setReferenceAttitude:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options;
- (void)start:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options;
- (void)stop:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options;
- (void)setUpdateRate:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
@end
