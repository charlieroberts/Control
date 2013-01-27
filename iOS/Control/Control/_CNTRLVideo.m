//
//  CNTRLVideo.m
//  Control
//
//  Created by charlie on 4/28/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CNTRLVideo.h"

@implementation CNTRLVideo
@synthesize captureSession, previewLayer, imageView, shouldShowModifiedVideo;

- (PGPlugin *) initWithWebView:(UIWebView*)theWebView {	
	if(self = [super init]) {
		[self setWebView:theWebView];
	}
	//me = self;
    NSLog(@"STARTING");
	return self;
}

- (void)start:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options {
    NSLog(@"start for real");
    //timer = [[NSTimer alloc] initWithFireDate:[NSDate date] interval:1 target:self selector:@selector(video) userInfo:nil repeats:YES];
    //timer = [NSTimer scheduledTimerWithTimeInterval:1 target:self selector:@selector(video) userInfo:nil repeats:YES];
    self.captureSession = [[AVCaptureSession alloc] init];
    self.captureSession.sessionPreset = AVCaptureSessionPresetLow;
    
    [self addVideoInput];
	[self addVideoDataOutput];
	
    
	[self.captureSession startRunning];
}

- (void)stop: (NSMutableArray *)arguments withDict:(NSMutableDictionary *) options { }

- (void)processPixelBuffer: (CVImageBufferRef)pixelBuffer {
    NSAutoreleasePool * pool = [[NSAutoreleasePool alloc] init];
	NSLog(@"PROCESSING");
    CVPixelBufferLockBaseAddress( pixelBuffer, 0 );
	
	int bufferHeight = CVPixelBufferGetHeight(pixelBuffer);
	int bufferWidth  = CVPixelBufferGetWidth(pixelBuffer);
    
	unsigned char *rowBase = (unsigned char *)CVPixelBufferGetBaseAddress(pixelBuffer);
    NSLog(@"height %d, width %d", bufferHeight, bufferWidth);
    NSMutableArray *img = [NSMutableArray array];
    for(int i = 0; i < bufferHeight; i++) { 
        for(int j = 0; j < bufferWidth; j++) {
            unsigned char *pixel = rowBase + (i * bufferWidth) + j; //rowBase + (row * bytesPerRow) + (column * BYTES_PER_PIXEL);
            for(int k = 0; k < 4; k++) {
                [img addObject:[NSNumber numberWithChar:pixel[k]]];
            }
        }
    }
    NSLog(@"2");
    CVPixelBufferUnlockBaseAddress(pixelBuffer,0);
    NSLog(@"3");
    NSMutableString *imgString = [NSMutableString stringWithString:[img description]];
    NSLog(@"3.5");
    [imgString replaceCharactersInRange:NSMakeRange(0,1) withString:@"["];
    [imgString replaceCharactersInRange:NSMakeRange([imgString length] - 1 , 1) withString:@"]"];
    //[imgString replaceOccurrencesOfString:@"(" withString:@"[" options:nil range:NSMakeRange(0, [imgString length])];
    //[imgString replaceOccurrencesOfString:@")" withString:@"]" options:nil range:NSMakeRange(0, [imgString length])];
      NSLog(@"4");
    NSString * jsCallBack;
    jsCallBack = [[NSString alloc] initWithFormat:@"Control.video.onUpdate(%@);", imgString];
    //[imageView performSelectorOnMainThread:@selector(setImage:) withObject:image waitUntilDone:YES];
    [self.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:jsCallBack waitUntilDone:NO];
    NSLog(@"DONE");
    [pool drain];
}

#pragma mark - SampleBufferDelegate

- (void)captureOutput:(AVCaptureOutput *)captureOutput didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer fromConnection:(AVCaptureConnection *)connection {
	
	CVImageBufferRef pixelBuffer = CMSampleBufferGetImageBuffer( sampleBuffer );
	
	[self processPixelBuffer:pixelBuffer];
}


#pragma mark - Capture Session Configuration

- (void) addVideoInput {
	NSLog(@"VIDEO INPUT");
	AVCaptureDevice *videoDevice = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];	
	if ( videoDevice ) {
		
		NSError *error;
		AVCaptureDeviceInput *videoIn = [AVCaptureDeviceInput deviceInputWithDevice:videoDevice error:&error];
		if ( !error ) {
			if ([self.captureSession canAddInput:videoIn])
				[self.captureSession addInput:videoIn];
			else
				NSLog(@"Couldn't add video input");		
		}
		else
			NSLog(@"Couldn't create video input");
	}
	else
		NSLog(@"Couldn't create video capture device");
}


- (void) addVideoDataOutput {
    	NSLog(@"VIDEO OUTPUT");
	AVCaptureVideoDataOutput *videoOut = [[AVCaptureVideoDataOutput alloc] init];
	[videoOut setAlwaysDiscardsLateVideoFrames:YES];
	[videoOut setVideoSettings:[NSDictionary dictionaryWithObject:[NSNumber numberWithInt:kCVPixelFormatType_32BGRA] forKey:(id)kCVPixelBufferPixelFormatTypeKey]]; // BGRA is necessary for manual preview
	
    dispatch_queue_t my_queue = dispatch_queue_create("com.example.subsystem.taskXYZ", NULL);
	[videoOut setSampleBufferDelegate:self queue:my_queue];
    
	if ([self.captureSession canAddOutput:videoOut])
		[self.captureSession addOutput:videoOut];
	else
		NSLog(@"Couldn't add video output");
    
	[videoOut release];
}


- (void)video {
    NSAutoreleasePool * pool = [[NSAutoreleasePool alloc] init];

    NSMutableArray *img = [NSMutableArray array];
    for(int i = 0; i < 100; i++) { 
        for(int j = 0; j < 100; j++) {
            [img addObject:[NSNumber numberWithFloat:(float)random()/RAND_MAX]];
        }
    }
    
    NSMutableString *imgString = [NSMutableString stringWithString:[img description]];
    [imgString replaceOccurrencesOfString:@"(" withString:@"[" options:nil range:NSMakeRange(0, [imgString length])];
    [imgString replaceOccurrencesOfString:@")" withString:@"]" options:nil range:NSMakeRange(0, [imgString length])];
    
    NSString * jsCallBack;
	jsCallBack = [[NSString alloc] initWithFormat:@"Control.video.onUpdate(%@);", imgString];
	[self.webView stringByEvaluatingJavaScriptFromString:jsCallBack];
    
    [pool drain];
}

- (void) dealloc {
    [self.captureSession stopRunning];
    [self.captureSession release];
    [super dealloc];
}

@end

