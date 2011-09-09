//
//  AudioInput.m
//  Control
//
//  Created by charlie on 7/26/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.
//

#import "AudioInput.h"

AudioComponentInstance inRemoteIOUnit;
AudioBuffer output;
AudioBufferList bufferList;

enum {
    VOLUME_MAX, VOLUME_RMS,
};

@implementation AudioInput
@synthesize mode;
static OSStatus inRenderProc (void *inRefCon,
							  AudioUnitRenderActionFlags *ioActionFlags,
							  const AudioTimeStamp *inTimeStamp,
							  UInt32 inBusNumber,
							  UInt32 inNumberFrames,
							  AudioBufferList *ioData) {
    AudioInput *me = (AudioInput *)inRefCon;
    
	OSStatus err = AudioUnitRender(inRemoteIOUnit, ioActionFlags, inTimeStamp, 1, inNumberFrames, ioData);
    
    SInt16* samples = (SInt16*)(ioData->mBuffers[0].mData); 
    
    float output = 0;
    
    if(me.mode == VOLUME_MAX) {
        SInt16 sampleMax = 0;
        for(int i = 0; i < inNumberFrames; i++) {
            if(abs(samples[i]) > sampleMax) sampleMax = abs(samples[i]);
            samples[i] = 0;
        }
        output = (float)sampleMax / 32768.0f;
    }else{
        SInt16 sampleSum = 0;
        for(int i = 0; i < inNumberFrames; i++) {
            sampleSum += samples[i] * samples[i];
            samples[i] = 0;
        }
        output = sqrtf(sampleSum / inNumberFrames);
    }
    
    NSString * jsCallBack;
    jsCallBack = [[NSString alloc] initWithFormat:@"audioInput._onVolumeUpdate(%f)", output];
    //NSLog(jsCallBack);
    
    [me.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:jsCallBack waitUntilDone:NO];
    [jsCallBack release];
    return err;
}


- (void)start:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options {
    if([[arguments objectAtIndex:0] isEqualToString:@"max"]) {
        mode = VOLUME_MAX;
    } else {
        mode = VOLUME_RMS;
    }
    AudioSessionInitialize(NULL, NULL, NULL, self);
    
    UInt32 audioCategory = kAudioSessionCategory_PlayAndRecord;
    AudioSessionSetProperty(kAudioSessionProperty_AudioCategory, sizeof(audioCategory), &audioCategory);
    float framesPerBuffer = 4096.f;
    
    Float32 preferredBufferSize = framesPerBuffer / 44100.f;
    AudioSessionSetProperty (kAudioSessionProperty_PreferredHardwareIOBufferDuration, sizeof(preferredBufferSize), &preferredBufferSize);
    
    AudioComponentDescription desc;
    desc.componentType = kAudioUnitType_Output;
    desc.componentSubType = kAudioUnitSubType_RemoteIO;
    desc.componentManufacturer = kAudioUnitManufacturer_Apple;
    desc.componentFlags = 0;
    desc.componentFlagsMask = 0;
    
    AudioComponent comp = AudioComponentFindNext(NULL, &desc);
    AudioComponentInstanceNew(comp, &inRemoteIOUnit);
    
    UInt32 one = 1;
    AudioUnitSetProperty(inRemoteIOUnit, kAudioOutputUnitProperty_EnableIO, kAudioUnitScope_Input, 1, &one, sizeof(one));
    
    AURenderCallbackStruct callbackStruct;
    callbackStruct.inputProc = inRenderProc;
    callbackStruct.inputProcRefCon = self;
    AudioUnitSetProperty(inRemoteIOUnit, kAudioUnitProperty_SetRenderCallback, kAudioUnitScope_Input, 0, &callbackStruct, sizeof(callbackStruct));
    
    AudioStreamBasicDescription audioFormat;
    audioFormat.mSampleRate			= 44100.00;
    audioFormat.mFormatID			= kAudioFormatLinearPCM;
    audioFormat.mFormatFlags		= kLinearPCMFormatFlagIsSignedInteger	| kAudioFormatFlagIsPacked;
    audioFormat.mFramesPerPacket	= 1;
    audioFormat.mChannelsPerFrame	= 1;
    audioFormat.mBitsPerChannel		= 16;
    audioFormat.mBytesPerPacket		= 2;
    audioFormat.mBytesPerFrame		= 2;
    
    AudioUnitSetProperty(inRemoteIOUnit, kAudioUnitProperty_StreamFormat, kAudioUnitScope_Input,  0, &audioFormat, sizeof(audioFormat));
    AudioUnitSetProperty(inRemoteIOUnit, kAudioUnitProperty_StreamFormat, kAudioUnitScope_Output, 1, &audioFormat, sizeof(audioFormat));
    
    AudioUnitInitialize(inRemoteIOUnit);
    AudioOutputUnitStart(inRemoteIOUnit);
}

- (void)stop:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options {
    AudioOutputUnitStop(inRemoteIOUnit);
}

- (void)setUpdateRate:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {}

OSStatus RenderFFTCallback (void					*inRefCon, 
                            AudioUnitRenderActionFlags 	*ioActionFlags, 
                            const AudioTimeStamp			*inTimeStamp, 
                            UInt32 						inBusNumber, 
                            UInt32 						inNumberFrames, 
                            AudioBufferList				*ioData)
{
	AudioInput* THIS = (AudioInput *)inRefCon;
	COMPLEX_SPLIT A = THIS->A;
	void *dataBuffer = THIS->dataBuffer;
	float *outputBuffer = THIS->outputBuffer;
	FFTSetup fftSetup = THIS->fftSetup;
    
	uint32_t log2n = THIS->log2n;
	uint32_t n = THIS->n;
	uint32_t nOver2 = THIS->nOver2;
	uint32_t stride = 1;
	int bufferCapacity = THIS->bufferCapacity;
	SInt16 index = THIS->index;
    
	AudioUnit rioUnit = THIS->ioUnit;
	OSStatus renderErr;
	UInt32 bus1 = 1;
    
	renderErr = AudioUnitRender(rioUnit, ioActionFlags, 
								inTimeStamp, bus1, inNumberFrames, THIS->bufferList);
	if (renderErr < 0) {
		return renderErr;
	}
    
	// Fill the buffer with our sampled data. If we fill our buffer, run the
	// fft.
	int read = bufferCapacity - index;
	if (read > inNumberFrames) {
		memcpy((SInt16 *)dataBuffer + index, THIS->bufferList->mBuffers[0].mData, inNumberFrames*sizeof(SInt16));
		THIS->index += inNumberFrames;
	} else {
		// If we enter this conditional, our buffer will be filled and we should 
		// perform the FFT.
		memcpy((SInt16 *)dataBuffer + index, THIS->bufferList->mBuffers[0].mData, read*sizeof(SInt16));
        
		// Reset the index.
		THIS->index = 0;
        
		/*************** FFT ***************/		
		// We want to deal with only floating point values here.
		ConvertInt16ToFloat(THIS, dataBuffer, outputBuffer, bufferCapacity);
        
		/** 
		 Look at the real signal as an interleaved complex vector by casting it.
		 Then call the transformation function vDSP_ctoz to get a split complex 
		 vector, which for a real signal, divides into an even-odd configuration.
		 */
		vDSP_ctoz((COMPLEX*)outputBuffer, 2, &A, 1, nOver2);
        
		// Carry out a Forward FFT transform.
		vDSP_fft_zrip(fftSetup, &A, stride, log2n, FFT_FORWARD);
        
		// The output signal is now in a split real form. Use the vDSP_ztoc to get
		// a split real vector.
		vDSP_ztoc(&A, 1, (COMPLEX *)outputBuffer, 2, nOver2);
        
		// Determine the dominant frequency by taking the magnitude squared and 
		// saving the bin which it resides in.
		float dominantFrequency = 0;
		int bin = -1;
		for (int i=0; i<n; i+=2) {
			float curFreq = MagnitudeSquared(outputBuffer[i], outputBuffer[i+1]);
			if (curFreq > dominantFrequency) {
				dominantFrequency = curFreq;
				bin = (i+1)/2;
			}
		}
		memset(outputBuffer, 0, n*sizeof(SInt16));
        
		// Update the UI with our newly acquired frequency value.
		[THIS->listener frequencyChangedWithValue:bin*(THIS->sampleRate/bufferCapacity)];
		printf("Dominant frequency: %f   bin: %d \n", bin*(THIS->sampleRate/bufferCapacity), bin);
	}
    
    
	return noErr;
}

float MagnitudeSquared(float x, float y) {
	return ((x*x) + (y*y));
}

void ConvertInt16ToFloat(RIOInterface* THIS, void *buf, float *outputBuf, size_t capacity) {
	AudioConverterRef converter;
	OSStatus err;
    
	size_t bytesPerSample = sizeof(float);
	AudioStreamBasicDescription outFormat = {0};
	outFormat.mFormatID = kAudioFormatLinearPCM;
	outFormat.mFormatFlags = kAudioFormatFlagIsFloat | kAudioFormatFlagIsPacked;
	outFormat.mBitsPerChannel = 8 * bytesPerSample;
	outFormat.mFramesPerPacket = 1;
	outFormat.mChannelsPerFrame = 1;	
	outFormat.mBytesPerPacket = bytesPerSample * outFormat.mFramesPerPacket;
	outFormat.mBytesPerFrame = bytesPerSample * outFormat.mChannelsPerFrame;		
	outFormat.mSampleRate = THIS->sampleRate;
    
	const AudioStreamBasicDescription inFormat = THIS->streamFormat;
    
	UInt32 inSize = capacity*sizeof(SInt16);
	UInt32 outSize = capacity*sizeof(float);
	err = AudioConverterNew(&inFormat, &outFormat, &converter);
	err = AudioConverterConvertBuffer(converter, inSize, buf, &outSize, outputBuf);
}

/* Setup our FFT */
- (void)realFFTSetup {
	UInt32 maxFrames = 2048;
	dataBuffer = (void*)malloc(maxFrames * sizeof(SInt16));
	outputBuffer = (float*)malloc(maxFrames *sizeof(float));
	log2n = log2f(maxFrames);
	n = 1 << log2n;
	assert(n == maxFrames);
	nOver2 = maxFrames/2;
	bufferCapacity = maxFrames;
	index = 0;
	A.realp = (float *)malloc(nOver2 * sizeof(float));
	A.imagp = (float *)malloc(nOver2 * sizeof(float));
	fftSetup = vDSP_create_fftsetup(log2n, FFT_RADIX2);
}

- (void)dealloc {
    AudioOutputUnitStop(inRemoteIOUnit);

    [super dealloc];
}

@end
