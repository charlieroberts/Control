//
//  AudioInput.h
//  Control
//
//  Created by charlie on 7/26/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "PGPlugin.h"
#import <AudioToolbox/AudioToolbox.h>
#import "pkmFFT.h"

@interface AudioInput : PGPlugin {
    int mode;
    FFTSetup fftSetup;
	COMPLEX_SPLIT A;
	int log2n, n, nOver2;
	
	void *dataBuffer;
	float *outputBuffer;
	size_t bufferCapacity;	// In samples
	size_t index;	// In samples
    
	float sampleRate;
	float frequency;
    
    Float32 audioBufferSize;
    
    BOOL outputPitch;
    BOOL outputVolume;
    BOOL initialized;
    BOOL fftInitialized;
    
    int pitchMode;
    int volumeMode;
}

@property int pitchMode, volumeMode;
@property BOOL outputPitch, outputVolume;

- (void)start:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options;
- (void)stop:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options;
- (void)setUpdateRate:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

@end
