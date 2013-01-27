
//code adapted from http://www.musicalgeometry.com/

#import "CameraManager.h"



@implementation CameraManager

@synthesize captureSession;
@synthesize captureLatch;

- (Texture*) setUpCaptureThread {
  //[self setCaptureSession:[[AVCaptureSession alloc] init]];
  captureSession = [[AVCaptureSession alloc] init];

  captureSession.sessionPreset = AVCaptureSessionPreset640x480; 
  captureTexture = Texture::CreateEmptyTexture(640,480, GL_BGRA, GL_UNSIGNED_BYTE);
  
// captureSession.sessionPreset = AVCaptureSessionPresetLow; //Front&Back:192x144
//  captureTexture = Texture::CreateEmptyTexture(192,144, GL_BGRA, GL_UNSIGNED_BYTE);
  
  
  captureLatch = new Latch();  
  
  [self addVideoInput];
  
  
  return captureTexture;
}


- (AVCaptureDevice *)frontFacingCameraIfAvailable {
  //  look at all the video devices and get the first one that's on the front
  NSArray *videoDevices = [AVCaptureDevice devicesWithMediaType:AVMediaTypeVideo];
  AVCaptureDevice *captureDevice = nil;
  for (AVCaptureDevice *device in videoDevices) {
    //NSLog(@"name of deivce : %@ \n", device.localizedName); 
    
    if (device.position == AVCaptureDevicePositionFront) {
      captureDevice = device;
      break;
    }
  }
  
  //couldn't find one on the front, so just get the default video device.
  if (!captureDevice)
  {
    captureDevice = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
  }
  
  return captureDevice;
}

- (void)addVideoInput {
	AVCaptureDevice *videoDevice = [self frontFacingCameraIfAvailable]; 
	//AVCaptureDevice *videoDevice = [AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo];
	
  if (videoDevice) {
		NSError *error;
		AVCaptureDeviceInput *videoIn = [AVCaptureDeviceInput deviceInputWithDevice:videoDevice error:&error];
		if (!error) {
			if ([[self captureSession] canAddInput:videoIn])
				[[self captureSession] addInput:videoIn];
			else {
				NSLog(@"Couldn't add video input");
      }
		}
		else {
			NSLog(@"Couldn't create video input");
    }
	}
	else {
		NSLog(@"Couldn't create video capture device");
  }
  
   
  
  // Create a VideoDataOutput and add it to the session
  AVCaptureVideoDataOutput *output = [[AVCaptureVideoDataOutput alloc] init];
  
  [captureSession addOutput:output];
  
  // Configure your output.
  dispatch_queue_t queue = dispatch_queue_create("myQueue", NULL);
  [output setSampleBufferDelegate:self queue:queue];
  dispatch_release(queue);
  
  // Specify the pixel format
  output.videoSettings = 
  [NSDictionary dictionaryWithObject:
   [NSNumber numberWithInt:kCVPixelFormatType_32BGRA] 
                              forKey:(id)kCVPixelBufferPixelFormatTypeKey];
  
  
  // If you wish to cap the frame rate to a known value, such as 15 fps, set 
  // minFrameDuration.
  
  // Start the session running to start the flow of data
  [captureSession startRunning];
  
  // Assign session to an ivar.
  //[self setSession:captureSession];
}


// Delegate routine that is called when a sample buffer was written
- (void)captureOutput:(AVCaptureOutput *)captureOutput 
didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer 
       fromConnection:(AVCaptureConnection *)connection
{ 
  //NSLog(@"captureOutput: didOutputSampleBufferFromConnection");
  
  // Create a UIImage from the sample buffer data
  //UIImage *image = [self imageFromSampleBuffer:sampleBuffer];
  
  
 
  
  
  //if (!captureLatch->CheckLatch(0)) {
    //return;
  //}
  
 // printf("in CameraManager : about to captureOutput\n");
  [self performSelectorOnMainThread:@selector(processPixelBuffer:) withObject:(id)sampleBuffer waitUntilDone:NO]; //NO
  
  //captureLatch->ReleaseLatch();
 // printf("in CameraManager : done...\n");
  
 // [self processPixelBuffer:sampleBuffer];

  //< Add your code here that uses the image >
  //[self.imageView setImage:image];
  //[self.view setNeedsDisplay];
}





- (void)processPixelBuffer:(CMSampleBufferRef)pixelBuffer {
  
  
 // NSLog(@"%p captureTexture id = %d w/h = %d/%d\n", captureTexture, captureTexture->texID, captureTexture->width, captureTexture->height);
  
 
  
  CVImageBufferRef imageBuffer = CMSampleBufferGetImageBuffer(pixelBuffer);
  
  CVPixelBufferLockBaseAddress(imageBuffer, 0 ); 
    
  unsigned char* baseAddress = (unsigned char*)CVPixelBufferGetBaseAddress(imageBuffer);
  
  //printf("VAL at 256 = %d\n", baseAddress[256]);
  
  CMFormatDescriptionRef formatDesc = CMSampleBufferGetFormatDescription(pixelBuffer);
  CMVideoDimensions videoDimensions = CMVideoFormatDescriptionGetDimensions(formatDesc); 
  //printf("pw ph = %d %d\n", videoDimensions.width, videoDimensions.height);
  
  //[self overwritePartOfImageBuffer:imageBuffer baseAddress:baseAddress];
  
  captureTexture->Bind(GL_TEXTURE0);

  //if (avTexture.width == videoDimensions.width && avTexture.height == videoDimensions.height) {
  memcpy (captureTexture->data, baseAddress, videoDimensions.width * videoDimensions.height * 4);
  //captureTexture->data = baseAddress;
  
  glTexSubImage2D(captureTexture->kind, 0, 0, 0, captureTexture->width, captureTexture->height, GL_BGRA, GL_UNSIGNED_BYTE, baseAddress); 
  
  captureTexture->Unbind(GL_TEXTURE0);
  

  
  
  //}
  //glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, videoDimensions.width, videoDimensions.height, GL_BGRA, GL_UNSIGNED_BYTE, linebase); 
  
  //
  CVPixelBufferUnlockBaseAddress(imageBuffer, 0);
  
  
  //currentTime = CMTimeAdd(currentTime, frameLength);
  //printf("frameNumber = %d\n", frameNumber);
  //frameNumber++;
  
  //[captureLatch releaseLatch];
  
}


-(void)setSession:(AVCaptureSession *)session
{
  NSLog(@"setting session...");
  self.captureSession=session;
}

- (void)dealloc {
  
	[[self captureSession] stopRunning];
  
	//[previewLayer release], previewLayer = nil;
	[captureSession release], captureSession = nil;
  
	[super dealloc];
}

@end