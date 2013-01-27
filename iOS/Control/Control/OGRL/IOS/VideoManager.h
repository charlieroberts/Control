
#import <Foundation/Foundation.h>
#import <AVFoundation/AVAsset.h>
#import <AVFoundation/AVFoundation.h>
#import "Texture.hpp"

@interface VideoManager : NSObject {

@public
  AVAsset* videoAsset;
  AVAssetReader* videoAssetReader;
  AVAssetTrack* videoTrack;
  AVAssetReaderTrackOutput* videoTrackOutput;
  CMSampleBufferRef pixelBuffer;
  CVImageBufferRef imageBuffer;
  double prevTime;
  double currTime;
  bool isLooping;
  bool isLocked;
  Texture* videoTexture;
  
}

- (Texture*) setUpVideoThread:(AVAsset*)_inAsset isLooping:(bool)_isLooping;
- (void) startVideoThread:(double)fireDate;
- (void) nextVideoFrame;
- (void) nextVideoFrameLock; //manually lock + unlock buffer (so you can image process, etc safely
- (void) nextVideoFrameUnlock;

//private
//- (void) playVideo;

@end
