//
//  Gyro.m
//  PhoneGap
//
//  Created by thecharlie on 11/18/10.
//  Copyright 2010 One More Muse. All rights reserved.
//

#import "Gyro.h"


@implementation Gyro

- (PGPlugin *) initWithWebView:(UIWebView*)theWebView {	
	if(self = [super init]) {
		[self setWebView:theWebView];
	}
	return self;
}

- (void)setReferenceAttitude:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options {
	if (referenceAttitude != nil)
		[referenceAttitude release];
	
	NSLog(@"setting attitude");
	referenceAttitude = [motionManager.deviceMotion.attitude retain];
}

- (void)streamMagneticField:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options {
    
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
		
		/*userAcceleration = deviceMotion.userAcceleration;
		 [userAccelerationLpf addAcceleration:userAcceleration withTimestamp:deviceMotion.timestamp];*/

		NSString * jsCallBack;
		jsCallBack = [[NSString alloc] 
                      initWithFormat:@"Control.gyro.onUpdate({'xRotationRate':%f,'yRotationRate':%f,'zRotationRate':%f},{'pitch':%f,'roll':%f,'yaw':%f});",
                      rr.x, rr.y, rr.z, attitude.pitch, attitude.roll, attitude.yaw];
		
        //printf("%f\t%f\t%f\n", motion.magneticField.field.x, motion.magneticField.field.y, motion.magneticField.field.z);
        //CMMagneticFieldCalibrationAccuracy acc = motion.magneticField.accuracy;
        
        
		[self.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:jsCallBack waitUntilDone:NO];
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
