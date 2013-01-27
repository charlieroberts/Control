//
//  CNTRLVideo.h
//  Control
//
//  Created by charlie on 4/28/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreMedia/CoreMedia.h>
#import <AVFoundation/AVFoundation.h>
#import <AVFoundation/AVCaptureOutput.h>
#import "PGPlugin.h"

@interface CNTRLVideo : PGPlugin<AVCaptureVideoDataOutputSampleBufferDelegate> {
	AVCaptureSession *captureSession;
	AVCaptureVideoPreviewLayer *previewLayer;
	AVCaptureConnection *videoConnection;
    
    BOOL shouldShowModifiedVideo;
    NSTimer *timer;
}

- (void) addVideoInput;
- (void) addVideoDataOutput;
- (void) video;

@property (retain) AVCaptureVideoPreviewLayer *previewLayer;
@property (retain) AVCaptureSession *captureSession;
@property (retain) UIImageView *imageView;
@property (nonatomic) BOOL shouldShowModifiedVideo;


@end
