
#import "VideoManager.h"
#include "Utils.hpp"

//#include <stdio.h>
//#include <stdlib.h>
//#include <math.h>

@implementation VideoManager

//private
- (void) playVideo {
  
  NSError *error = nil;
  videoAssetReader = [AVAssetReader assetReaderWithAsset:videoAsset error:&error];
  [videoAssetReader retain];
  if (error) {
    NSLog(@"%@",[error localizedDescription]);
  }
  
  NSArray* tracksArray = [videoAsset tracksWithMediaType:AVMediaTypeVideo];
  videoTrack = [tracksArray objectAtIndex:0];
  videoTrackOutput = [AVAssetReaderTrackOutput assetReaderTrackOutputWithTrack:videoTrack outputSettings:[NSDictionary dictionaryWithObject:[NSNumber numberWithInt:kCVPixelFormatType_32BGRA] forKey:(id)kCVPixelBufferPixelFormatTypeKey]];
  
  //printf(" track frame rate = %f\n",videoTrack.nominalFrameRate);
  //exit(0);
  
  [videoAssetReader addOutput:videoTrackOutput];
  [videoAssetReader startReading];
}

//public 
- (Texture*) setUpVideoThread:(AVAsset*)_inAsset isLooping:(bool)_isLooping {
  
  videoAsset = _inAsset;
  isLooping = _isLooping;
  isLocked = false;
  
  [self playVideo];  
  
  CGSize videoSize = videoTrack.naturalSize;
  videoTexture = Texture::CreateEmptyTexture(videoSize.width, videoSize.height, GL_BGRA, GL_UNSIGNED_BYTE);
  //printf("VIDEO size = %f %f\n", size.width, size.height);
  return videoTexture;
}

- (void) startVideoThread:(double)fireDate{
  
  prevTime = [[NSDate date] timeIntervalSinceReferenceDate];
  currTime = prevTime;
  
  NSTimer *t = [[NSTimer alloc] initWithFireDate: [NSDate dateWithTimeIntervalSinceReferenceDate:fireDate]
                                        interval: 1.0/videoTrack.nominalFrameRate
                                          target: self
                                        selector:@selector(nextVideoFrame)
                                        userInfo:nil repeats:YES];
  
  NSRunLoop *runner = [NSRunLoop currentRunLoop];
  [runner addTimer:t forMode: NSDefaultRunLoopMode];
  [t release];
  
  //uncomment this if you want to show the first frame right away
  //[self nextVideoFrame];
}


- (void) nextVideoFrame {
  
  currTime = [[NSDate date] timeIntervalSinceReferenceDate];
  //printf("frametime = %f\n", (currTime - prevTime));
  prevTime = currTime;
  
  if ([videoAssetReader status]==AVAssetReaderStatusReading) {
    
    isLocked = true;
    
    videoTexture->Bind(GL_TEXTURE0);
    
    
    pixelBuffer = [videoTrackOutput copyNextSampleBuffer];
    imageBuffer = CMSampleBufferGetImageBuffer(pixelBuffer);
    CVPixelBufferLockBaseAddress(imageBuffer, 0); 
    
    unsigned char *linebase = (unsigned char*)CVPixelBufferGetBaseAddress(imageBuffer);
    CMFormatDescriptionRef formatDesc = CMSampleBufferGetFormatDescription(pixelBuffer);
    CMVideoDimensions videoDimensions = CMVideoFormatDescriptionGetDimensions(formatDesc);
    
    //Texture::flipBufferY(linebase, videoDimensions.width, videoDimensions.height);
   //    printf("reading...w/h = %d/%d \n", videoDimensions.width, videoDimensions.height );
    printf("in nextVideoFrame : pointer = %p, byte at idx 256 = %d\n", videoTexture, linebase[257]);
    videoTexture->data = linebase;
    glTexSubImage2D(videoTexture->kind, 0, 0, 0, videoDimensions.width, videoDimensions.height, GL_BGRA, GL_UNSIGNED_BYTE, linebase); 
    //printf("pointer = %p, byte at idx 256 = %d\n", videoTexture, videoTexture->data[257]);
    
    CVPixelBufferUnlockBaseAddress(imageBuffer, 0);
    CVPixelBufferRelease(imageBuffer);
    
    free(pixelBuffer);
    
    videoTexture->Unbind(GL_TEXTURE0);
    
    isLocked = false;
    
  } else if ([videoAssetReader status] == AVAssetReaderStatusCompleted) {
    [videoAssetReader cancelReading];
    
    if (isLooping) {
      [self playVideo];
    }
  }
}


- (void) nextVideoFrameUnlock {

  if (isLocked == true) {
  CVPixelBufferUnlockBaseAddress(imageBuffer, 0);
  CVPixelBufferRelease(imageBuffer);
  
  free(pixelBuffer);
  
  videoTexture->Unbind(GL_TEXTURE0);
    isLocked = false; 
  }
}

- (void) nextVideoFrameLock {
  
  currTime = [[NSDate date] timeIntervalSinceReferenceDate];
  //printf("frametime = %f\n", (currTime - prevTime));
  prevTime = currTime;
  
  if ([videoAssetReader status]==AVAssetReaderStatusReading) {
    isLocked = true;
    
    videoTexture->Bind(GL_TEXTURE0);
    
    pixelBuffer = [videoTrackOutput copyNextSampleBuffer];
    imageBuffer = CMSampleBufferGetImageBuffer(pixelBuffer);
    CVPixelBufferLockBaseAddress(imageBuffer, 0); 
    unsigned char *linebase = (unsigned char*)CVPixelBufferGetBaseAddress(imageBuffer);
    CMFormatDescriptionRef formatDesc = CMSampleBufferGetFormatDescription(pixelBuffer);
    CMVideoDimensions videoDimensions = CMVideoFormatDescriptionGetDimensions(formatDesc);
    
    //Texture::flipBufferY(linebase, videoDimensions.width, videoDimensions.height);
    //    printf("reading...w/h = %d/%d \n", videoDimensions.width, videoDimensions.height );
   //  printf("in nextVideoFrameLocked : pointer = %p, byte at idx 256 = %d\n", videoTexture, linebase[257]);
    videoTexture->data = linebase;
    glTexSubImage2D(videoTexture->kind, 0, 0, 0, videoDimensions.width, videoDimensions.height, GL_BGRA, GL_UNSIGNED_BYTE, linebase); 
    //printf("pointer = %p, byte at idx 256 = %d\n", videoTexture, videoTexture->data[257]);
    
   
    
  } else if ([videoAssetReader status] == AVAssetReaderStatusCompleted) {
    [videoAssetReader cancelReading];
    
    if (isLooping) {
      [self playVideo];
    }
  }
}



@end
