//
//  RIOInterface.h
//  SafeSound
//
//  Created by Demetri Miller on 10/22/1010
//  Copyright 2010 Demetri Miller. All rights reserved.
//

/*
 *	This class is a singleton providing globally accessible methods 
 *	and properties that may be needed by multiple classes.
 */

#import <Foundation/Foundation.h>
#import <AudioUnit/AudioUnit.h>
#import <AVFoundation/AVFoundation.h>
#import <AudioToolbox/AudioToolbox.h>
#import <Accelerate/Accelerate.h>
#include <stdlib.h>

@class ListenerViewController;

/**
 *	This is a singleton class that manages all the low level CoreAudio/RemoteIO
 *	elements. A singleton is used since we should never be instantiating more
 *  than one instance of this class per application lifecycle.
 */

#define kInputBus 1
#define kOutputBus 0
#define kBufferSize 512
#define kBufferCount 1
#define N 10


@interface RIOInterface : NSObject {
	UIViewController *selectedViewController;
	ListenerViewController *listener;
	
	AUGraph processingGraph;
	AudioUnit ioUnit;
	AudioBufferList* bufferList;
	AudioStreamBasicDescription streamFormat;
	
	FFTSetup fftSetup;
	COMPLEX_SPLIT A;
	int log2n, n, nOver2;
	
	void *dataBuffer;
	float *outputBuffer;
	size_t bufferCapacity;	// In samples
	size_t index;	// In samples

	float sampleRate;
	float frequency;
}

@property(nonatomic, assign) id<AVAudioPlayerDelegate> audioPlayerDelegate;
@property(nonatomic, assign) id<AVAudioSessionDelegate> audioSessionDelegate;
@property(nonatomic, assign) ListenerViewController *listener;

@property(assign) float sampleRate;
@property(assign) float frequency;

#pragma mark Lifecycle

#pragma mark Audio Session/Graph Setup
- (void)initializeAudioSession;
- (void)createAUProcessingGraph;
- (size_t)ASBDForSoundMode;

#pragma mark Playback Controls
- (void)startPlayback;
- (void)startPlaybackFromEncodedArray:(NSArray *)encodedArray;
- (void)stopPlayback;
- (void)printASBD:(AudioStreamBasicDescription)asbd;

#pragma mark Listener Controls
- (void)startListening:(ListenerViewController*)aListener;
- (void)stopListening;

#pragma mark Generic Audio Controls
- (void)initializeAndStartProcessingGraph;
- (void)stopProcessingGraph;

#pragma mark Singleton Methods
+ (RIOInterface *)sharedInstance;

@end