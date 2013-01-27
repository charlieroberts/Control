#import <CoreMedia/CoreMedia.h>
#import <AVFoundation/AVFoundation.h>

#import "Texture.hpp"
#import "Latch.hpp"

@interface CameraManager : UIViewController <AVCaptureVideoDataOutputSampleBufferDelegate> {
  Texture* captureTexture;
  //Latch* captureLatch;

}

@property Latch* captureLatch;
@property (retain) AVCaptureSession *captureSession;

- (Texture*) setUpCaptureThread;
- (void) processPixelBuffer:(CMSampleBufferRef)pixelBuffer;
- (AVCaptureDevice *)frontFacingCameraIfAvailable;

- (void)addVideoInput;


@end