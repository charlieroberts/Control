//
//  AudioManager.h
//
//  Created by Nicholas Collins on 24/04/2010.
//  Copyright 2010 Nicholas M Collins. All rights reserved.
//	http://www.cogs.susx.ac.uk/users/nc81/index.html

#import <Foundation/Foundation.h>
#import <AVFoundation/AVAsset.h>
#import <AVFoundation/AVFoundation.h>
#import "Texture.hpp"

@interface AudioManager : NSObject {

@public
	float tempbuf[8000];
	//float monobuf[4000]; 
	//float inputbuf[1024]; 
	//float outputbuf[1024]; 
	float * readbuffer_;	//for storing samples from music library file playback
	int * readposPtr_;
	int buffersize_; 
	int audioproblems; 
	int readflag_;
	float gain_; 
	
  
  AVAsset* audioAsset;
  AVAssetReader* audioAssetReader;
  AVAssetReaderAudioMixOutput* readaudiofile;
  NSAutoreleasePool* pool;
  NSDictionary* audioSetting;

  
  ///
  NSURL* outURL;
	NSURL* pcmURL;
	int datasize_; 
	float * data_;
	int writepos_;	
	int readpos_; 
	//AudioDeviceManager *audio; 
	int initialreadflag_; 
	int earlyfinish_; 
	int restartflag_; 
	int backgroundloadflag_; 
	int playingflag_; 
	int importingflag_; 
	int actuallyfinished; 
	
	//double secondsread_; 
	double duration_; 
  ///
  
}

//-(OSStatus)start;
//-(OSStatus)stop;

-(void)canRead;
-(void)cantRead;

-(void)setUpData:(float *)readbuffer pos:(int *)readpos size:(int) siz;
-(void)freeData;

-(void)closeDownAudioDevice;
-(OSStatus)setUpAudioDevice;

/// Audio
- (void)backgroundAudioCall;

- (void) loadAudioFile; //:(id)outURL;  
- (void) freeAudio; 
- (void) resetData;
- (void) setUpAudioThread:(AVAsset*)_inAsset;
- (void) startAudioThread:(double)fireDate;
- (void) restartAudio:(NSError*)error;


//- (void)startAudioThread:(AVAsset*)asset;
///

//void callbackInterruptionListener(void* inClientData, UInt32 inInterruption)//


@end
