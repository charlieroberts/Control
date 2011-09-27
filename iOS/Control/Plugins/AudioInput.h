//
//  AudioInput.h
//  Control
//
//  Created by charlie on 7/26/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "PhoneGapCommand.h"
#import <AudioToolbox/AudioToolbox.h>
#import "pkmFFT.h"

@interface AudioInput : PhoneGapCommand {
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
    
    BOOL outputPitch;
    
}

@property int mode;
@property BOOL outputPitch;

- (void)start:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options;
- (void)stop:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options;
- (void)setUpdateRate:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;

@end
