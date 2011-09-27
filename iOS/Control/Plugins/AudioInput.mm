//
//  AudioInput.m
//  Control
//
//  Created by charlie on 7/26/11.
//  Copyright 2011 __MyCompanyName__. All rights reserved.

#import "AudioInput.h"

AudioComponentInstance inRemoteIOUnit;
AudioBuffer output;
AudioBufferList bufferList;
AudioStreamBasicDescription streamFormat;    

pkmFFT *fft;
float *allocated_magnitude_buffer;
float *allocated_phase_buffer;
float *samplesAsFloats;


enum {
    VOLUME_MAX, VOLUME_RMS, PITCH_ZERO,
};

@implementation AudioInput
@synthesize mode, outputPitch;

float MagnitudeSquared(float x, float y) {
	return ((x*x) + (y*y));
}

//void ConvertInt16ToFloat(AudioInput * THIS, void *buf, float *outputBuf, size_t capacity) {
void ConvertInt16ToFloat(void *buf, float *outputBuf, size_t capacity) {
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
	outFormat.mSampleRate = 44100.f;
    
	const AudioStreamBasicDescription inFormat = streamFormat;
    
	UInt32 inSize = capacity*sizeof(SInt16);
	UInt32 outSize = capacity*sizeof(float);
	err = AudioConverterNew(&inFormat, &outFormat, &converter);
	err = AudioConverterConvertBuffer(converter, inSize, buf, &outSize, outputBuf);
}

static OSStatus inRenderProc (void *inRefCon,
							  AudioUnitRenderActionFlags *ioActionFlags,
							  const AudioTimeStamp *inTimeStamp,
							  UInt32 inBusNumber,
							  UInt32 inNumberFrames,
							  AudioBufferList *ioData) {
    AudioInput *me = (AudioInput *)inRefCon;
    
	OSStatus err = AudioUnitRender(inRemoteIOUnit, ioActionFlags, inTimeStamp, 1, inNumberFrames, ioData);
    
    SInt16* samples = (SInt16*)(ioData->mBuffers[0].mData); 
    //ConvertInt16ToFloat(samples, samplesAsFloats, inNumberFrames);
    
    SInt16 prevSample = 0;
    float zeroCrossings = 0;
    float freq = 0.0f;
    
    if(me.mode == PITCH_ZERO) {
        for(int i = 0; i < inNumberFrames; i++) {
            if((prevSample < 0 && samples[i] > 0) || (prevSample > 0 && samples[i] < 0)) {
                zeroCrossings++;
            }
            
            prevSample = samples[i];
        }
        
        freq = 44100.f / ((float)inNumberFrames / zeroCrossings);
    }
    
    //printf("zero crossings = %f, inNumberFrames = %ld, freq = %f\n", zeroCrossings, inNumberFrames, 44100.f / ((float)inNumberFrames / zeroCrossings));
    
    //fft->forward(0, samplesAsFloats, allocated_magnitude_buffer, allocated_phase_buffer);
    
    
//    short order= inNumberFrames;
//        
//    float * autoCorr = (float *)malloc(sizeof(float) * inNumberFrames);
//    float sum;
//    int i,j;
//        
//    for (i=0;i<order;i++) {
//        sum=0;
//        for (j=0;j<order-i;j++) {
//            sum+=samplesAsFloats[j] * samplesAsFloats[j+i];
//        }
//        autoCorr[i]=sum;
//    }
//    
//    float prev = 10000;
//    int min;
//    for(i = 1; i < order; i++) {
//        if(autoCorr[i] > prev) {
//            min = i - 1;
//            break;
//        }else{
//            prev = autoCorr[i];
//        }
//    }
//    
//    printf("autoCorr # = %d, val = %f, pitch = %f\n", min, autoCorr[min], 44100.f / (float)min);
//    free(autoCorr);
//    float dominantMag = 0.0f;
//    float dominantFreq = 0.0f;
//    int bin = 0;
//    float freqBinSize = 22050.f / (inNumberFrames / 2);
//    
//    for (int i = 0; i < inNumberFrames / 2; i++) {
//        float curMag = allocated_magnitude_buffer[i]; //MagnitudeSquared(allocated_phase_buffer[i], allocated_magnitude_buffer[i]);
//        if (curMag > dominantMag) {
//            dominantMag = curMag;
//            dominantFreq = dominantMag * freqBinSize;
//            bin = i;
//        }
//    }
    
    //printf("bin = %d, freq = %f\n", bin, dominantFreq);

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
    if(me.mode == PITCH_ZERO) {
        jsCallBack = [[NSString alloc] initWithFormat:@"audioInput._onPitchUpdate(%f);", freq];
    }else{
        jsCallBack = [[NSString alloc] initWithFormat:@"audioInput._onVolumeUpdate(%f);", output];
    }
    NSLog(jsCallBack);
    
    [me.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:jsCallBack waitUntilDone:NO];
    [jsCallBack release];
    return err;
}


- (void)start:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options {
    if([[arguments objectAtIndex:0] isEqualToString:@"max"]) {
        mode = VOLUME_MAX;
    } else if([[arguments objectAtIndex:0] isEqualToString:@"rms"]) {
        mode = VOLUME_RMS;
    } else {
        mode = PITCH_ZERO;
    }

    AudioSessionInitialize(NULL, NULL, NULL, self);
    
    UInt32 audioCategory = kAudioSessionCategory_PlayAndRecord;
    AudioSessionSetProperty(kAudioSessionProperty_AudioCategory, sizeof(audioCategory), &audioCategory);
    float framesPerBuffer = 8192.f;
    
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
    
    streamFormat = audioFormat;
    
    AudioUnitSetProperty(inRemoteIOUnit, kAudioUnitProperty_StreamFormat, kAudioUnitScope_Input,  0, &audioFormat, sizeof(audioFormat));
    AudioUnitSetProperty(inRemoteIOUnit, kAudioUnitProperty_StreamFormat, kAudioUnitScope_Output, 1, &audioFormat, sizeof(audioFormat));
    
    Float32 audioBufferSize;
    UInt32 size = sizeof (audioBufferSize);
    AudioSessionGetProperty(kAudioSessionProperty_CurrentHardwareIOBufferDuration, &size, &audioBufferSize);

    //[self realFFTSetup:audioBufferSize * 44100.f];
    
//    fft = new pkmFFT(audioBufferSize  * 44100.f);
//    
//    samplesAsFloats            =  (float *) malloc (sizeof(float) * audioBufferSize  * 44100.f);        // samples must be sent to fft as floats, we convert in callback
//    allocated_magnitude_buffer =  (float *) malloc (sizeof(float) * (audioBufferSize * 44100.f / 2));  // number of bins is always half the buffer size
//    allocated_phase_buffer     =  (float *) malloc (sizeof(float) * (audioBufferSize * 44100.f / 2));
    
    sampleRate = 44100.f;
    
    AudioUnitInitialize(inRemoteIOUnit);
    AudioOutputUnitStart(inRemoteIOUnit);
}

- (void)stop:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options {
    AudioOutputUnitStop(inRemoteIOUnit);
}

- (void)setUpdateRate:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options {}

- (void)dealloc {
    AudioOutputUnitStop(inRemoteIOUnit);

    [super dealloc];
}

@end
