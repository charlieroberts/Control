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
    NSLog(jsCallBack);
    
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

- (void)dealloc {
    AudioOutputUnitStop(inRemoteIOUnit);

    [super dealloc];
}

@end
