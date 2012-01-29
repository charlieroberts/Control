//
//  Gyro.m
//  PhoneGap
//
//  Created by thecharlie on 11/18/10.
//  Copyright 2010 One More Muse. All rights reserved.
//

// TODO : Run in a block using CMGyroHandler and CMGyroData -- is motionManager better?

#import "Gyro.h"


@implementation Gyro

- (void)setReferenceAttitude:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options {
	if (referenceAttitude != nil)
		[referenceAttitude release];
	
	NSLog(@"setting attitude");
	referenceAttitude = [motionManager.deviceMotion.attitude retain];
}

- (void)start:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options {
	
	if (motionManager == nil) {
		motionManager = [[CMMotionManager alloc] init];
	}
	motionManager.deviceMotionUpdateInterval = 0.015;
	shouldRun = YES;
	
	referenceAttitude = [motionManager.deviceMotion.attitude retain];

	opQ = [[NSOperationQueue currentQueue] retain];
	deviceMotionHandler = ^ (CMDeviceMotion *motion, NSError *error) {
		CMDeviceMotion *deviceMotion = motionManager.deviceMotion;
		CMRotationRate rr = deviceMotion.rotationRate;
		CMAttitude *attitude = deviceMotion.attitude;
		
		// If we have a reference attitude, multiply attitude by its inverse
		// After this call, attitude will contain the rotation from referenceAttitude
		// to the current orientation instead of from the fixed reference frame to the
		// current orientation
		if (referenceAttitude != nil) {
			[attitude multiplyByInverseOfAttitude:referenceAttitude];
		}
		//NSLog(@"yaw = %lf", attitude.yaw);
		//rotation = attitude.rotationMatrix;
		
		/*userAcceleration = deviceMotion.userAcceleration;
		 [userAccelerationLpf addAcceleration:userAcceleration withTimestamp:deviceMotion.timestamp];*/
		
		// The user acceleration we want to use is the one computed by userAccelerationLpf
		/*userAcceleration.x = userAccelerationLpf.x;
		 userAcceleration.y = userAccelerationLpf.y;
		 userAcceleration.z = userAccelerationLpf.z;
		*/
		NSString * jsCallBack;
		jsCallBack = [[NSString alloc] initWithFormat:@"gyro._onGyroUpdate({'xRotationRate':%f,'yRotationRate':%f,'zRotationRate':%f},{'pitch':%f,'roll':%f,'yaw':%f});", rr.x, rr.y, rr.z, attitude.pitch, attitude.roll, attitude.yaw];
		//NSLog(jsCallBack);
		
		[webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:jsCallBack waitUntilDone:NO];
		[jsCallBack release];
		
	};
	[motionManager startDeviceMotionUpdatesToQueue:opQ withHandler:deviceMotionHandler];
}

- (void)stop:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options {
	shouldRun = NO;
	[motionManager stopDeviceMotionUpdates];
}

- (void)setUpdateRate:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {
    //NSLog(@"refreshing gyro %f", [[arguments objectAtIndex:0] floatValue]);
    motionManager.deviceMotionUpdateInterval = 1.0f / [[arguments objectAtIndex:0] floatValue];
}

- (void) dealloc {
	[motionManager release];
	[opQ release];
	[referenceAttitude release];
	[super dealloc];
}
@end
