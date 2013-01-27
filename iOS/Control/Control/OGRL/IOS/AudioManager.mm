//
//  AudioDeviceManager.mm
//
//  Created by Nicholas Collins on 24/04/2010.
//  Copyright 2010 Nicholas M Collins. All rights reserved.
//	http://www.cogs.susx.ac.uk/users/nc81/index.html

#import "AudioManager.h"
#include "Utils.hpp"
#include <AudioUnit/AudioUnit.h>
#include <AudioToolbox/AudioServices.h>

#include <stdio.h>
#include <stdlib.h>
#include <math.h>



@implementation AudioManager

AudioComponentInstance audioUnit;
AudioStreamBasicDescription audioFormat;
AudioBufferList* bufferList;
BOOL startedCallback;
BOOL noInterrupt; 



long g_debugnum= 0;  

//static unsigned long g_countertest = 0; 

/* Parameters on entry to this function are :-
 
 *inRefCon - used to store whatever you want, can use it to pass in a reference to an objectiveC class
 i do this below to get at the InMemoryAudioFile object, the line below :
 callbackStruct.inputProcRefCon = self;
 in the initialiseAudio method sets this to "self" (i.e. this instantiation of RemoteIOPlayer).
 This is a way to bridge between objectiveC and the straight C callback mechanism, another way
 would be to use an "evil" global variable by just specifying one in theis file and setting it
 to point to inMemoryAudiofile whenever it is set.
 
 *inTimeStamp - the sample time stamp, can use it to find out sample time (the sound card time), or the host time
 
 inBusnumber - the audio bus number, we are only using 1 so it is always 0 
 
 inNumberFrames - the number of frames we need to fill. In this example, because of the way audioformat is
 initialised below, a frame is a 32 bit number, comprised of two signed 16 bit samples.
 
 
 
 *ioData - holds information about the number of audio buffers we need to fill as well as the audio buffers themselves */
static OSStatus playbackCallback(void *inRefCon, 
                                 AudioUnitRenderActionFlags *ioActionFlags, 
                                 const AudioTimeStamp *inTimeStamp, 
                                 UInt32 inBusNumber, 
                                 UInt32 inNumberFrames, 
                                 AudioBufferList *ioData) {  
	
	int i, j; 
	
	
  
	if(startedCallback && noInterrupt) {
		
		//get a copy of the objectiveC class "self" we need this to get the next sample to fill the buffer
		AudioManager *manager = (AudioManager *)inRefCon;
    
		float * tempbuf = manager->tempbuf; 
    //	float * monobuf =  manager->monobuf; 
		
		//loop through all the buffers that need to be filled
		for (i = 0 ; i < ioData->mNumberBuffers; i++){
			//get the buffer to be filled
			AudioBuffer buffer = ioData->mBuffers[i];
			//printf("which buf %d numberOfSamples %d channels %d countertest %d \n", i, buffer.mDataByteSize, buffer.mNumberChannels, g_countertest);
			
			//if needed we can get the number of bytes that will fill the buffer using
			// int numberOfSamples = ioData->mBuffers[i].mDataByteSize;
			
			//get the buffer and point to it as an UInt32 (as we will be filling it with 32 bit samples)
			//if we wanted we could grab it as a 16 bit and put in the samples for left and right seperately
			//but the loop below would be for(j = 0; j < inNumberFrames * 2; j++) as each frame is a 32 bit number
			//UInt32 *frameBuffer = buffer.mData;
			
			short signed int *frameBuffer = (short signed int *)buffer.mData;
			
			//safety first
			inNumberFrames= inNumberFrames<4000?inNumberFrames:4000; 
      //inNumberFrames= inNumberFrames; //<4000?inNumberFrames:4000; 
      
			//float * tempbuf= manager->readbuffer_;
			
			int flag = manager->readflag_; 
			
			if (flag==1) {
        
				
				int pos = (*manager->readposPtr_); 
				int size= manager->buffersize_; 
				float * source =  manager->readbuffer_; 
        
				float mult = manager->gain_*32000.0; //just alllow a little leeway for limiter errors 32767.0; 
				int j; 
				
        //loop through the buffer and fill the frames
        for (j = 0; j < 2*inNumberFrames; j++){
          // get NextPacket returns a 32 bit value, one frame.
          //frameBuffer[j] = [[remoteIOplayer inMemoryAudioFile] getNextPacket];
          //float value= 32767.0*sin((400*2*3.14159)*(j/44100.0)); 
          //float value= mult*tempbuf[j]; //sin((400*2*3.14159)*(g_countertest/44100.0)); 
					
          tempbuf[j] = source[pos]; //mult*(source[pos]); 
          
          pos = (pos+1)%size; 
          //frameBuffer[2*j] = 0.0; //value; 
          //frameBuffer[2*j+1] = 0.0; //value; 
          
          //++g_countertest; 
        }
				
				
        //(*(manager->readposPtr_)) += inNumberFrames;  
        
				(*(manager->readposPtr_)) = pos; 
				
				//converts to int
				for (int j = 0; j < 2*inNumberFrames; j++)
					frameBuffer[j] = mult*(tempbuf[j]);
        
				
				
			} else {
				
				for (int j = 0; j < inNumberFrames; j++){
					// get NextPacket returns a 32 bit value, one frame.
					//frameBuffer[j] = [[remoteIOplayer inMemoryAudioFile] getNextPacket];
					float value= 0.0; //32767.0*sin((400*2*3.14159)*(j/44100.0)); 
					//float value= mult*tempbuf[j]; //sin((400*2*3.14159)*(g_countertest/44100.0)); 
					
					frameBuffer[2*j] = value; 
					frameBuffer[2*j+1] = value; 
					
					//++g_countertest; 
				}
				
			}
			
		}
    
		
	} else {
		
		for (i = 0 ; i < ioData->mNumberBuffers; i++){
			AudioBuffer buffer = ioData->mBuffers[i];
      
			short signed int *frameBuffer = (short signed int *)buffer.mData;
      
			//loop through the buffer and fill the frames
			for (j = 0; j < inNumberFrames; j++){
        
				short signed int value= 0; //32767.0*0.0; 
				frameBuffer[2*j] = value;	
				frameBuffer[2*j+1] = value; 
				
				//++g_countertest; 
			}
			
		}
		
	}
	
	
  return noErr;
}




void callbackInterruptionListener(void* inClientData, UInt32 inInterruption)
{
	NSLog(@"audio interruption %ld", inInterruption);
	
	AudioManager *manager = (AudioManager *)inClientData;
	
	
	//kAudioSessionEndInterruption =0,  kAudioSessionBeginInterruption  = 1
	if(inInterruption) {
		noInterrupt = NO;
		
		[manager closeDownAudioDevice];
		
		startedCallback	= NO;
		
	}
	else {
		
		if (noInterrupt==NO) {
			
			[manager setUpAudioDevice]; //restart audio session
			
			noInterrupt = YES;
			
		}
		
	}
}



void audioRouteChangeListenerCallback(void * inClientData,AudioSessionPropertyID inPropertyID, UInt32 inPropertyValueSize,const void * inPropertyValue) {
	
  
	// ensure that this callback was invoked for a route change
  if (inPropertyID != kAudioSessionProperty_AudioRouteChange) return;
	
	// Determines the reason for the route change, to ensure that it is not
	//      because of a category change.
	CFDictionaryRef routeChangeDictionary = (CFDictionaryRef)inPropertyValue;
	
	CFNumberRef routeChangeReasonRef = (CFNumberRef)CFDictionaryGetValue(routeChangeDictionary,CFSTR(kAudioSession_AudioRouteChangeKey_Reason));
	
	SInt32 routeChangeReason;
	
	CFNumberGetValue (
                    routeChangeReasonRef,
                    kCFNumberSInt32Type,
                    &routeChangeReason
                    );
	
	//	if (routeChangeReason == kAudioSessionRouteChangeReason_OldDeviceUnavailable) 
	//	{
	//		
	//		//NSLog(@"Headset is unplugged.."); 
	//		
	//		
	//		
	//	}
	//	if (routeChangeReason == kAudioSessionRouteChangeReason_NewDeviceAvailable)
	//	{
	//		//NSLog(@"Headset is plugged in..");                                
	//	}
	
	AudioManager *manager = (AudioManager *)inClientData;
	
	
	if ((routeChangeReason == kAudioSessionRouteChangeReason_OldDeviceUnavailable) || (routeChangeReason == kAudioSessionRouteChangeReason_NewDeviceAvailable)) {
		
		
		startedCallback	= NO;
		[manager closeDownAudioDevice];
		
    [manager setUpAudioDevice]; //restart audio session
		//OSStatus err= [manager setUpAudioDevice]; //restart audio session
		
		//	if(err!=noErr) {
		//		
		//			//UIAlertView *anAlert = [[UIAlertView alloc] initWithTitle:@"Hit Home button to exit" message:@"Problem with audio setup; are you on an ipod touch without headphone microphone? Concat requires audio input, please set this up then restart app" delegate:manager cancelButtonTitle:nil otherButtonTitles:nil];
		//			//[anAlert show];
		//		
		//		}
		
	}
	
	
}


//for:
////2.2 and later
//kAudioSessionProperty_AudioInputAvailable
//kAudioSessionProperty_ServerDied
//void propertyListener(void* inClientData,AudioSessionPropertyID inID,UInt32 inDataSize,const void* inData)
//{
//	NSLog(@"propListener");
//}



-(void)canRead {
	readflag_ = true; 
	
}

-(void)cantRead {
  
	readflag_ = false; 
	
}


-(void)setUpData:(float *)readbuffer pos:(int *)readposPtr size:(int) siz {
	
	readbuffer_ = readbuffer; 
	readposPtr_ = readposPtr; 
	readflag_ = false; 
	buffersize_ = siz; 
	
	gain_ = 1.0; 
	
}

-(void)freeData {
	
  //	for(UInt32 i=0;i<bufferList->mNumberBuffers;i++) {
  //		free(bufferList->mBuffers[i].mData);
  //	}
  //	
  //	free(bufferList);
	
}




// Below code is a cut down version (for output only) of the code written by
// Micheal "Code Fighter" Tyson (punch on Mike)
// See http://michael.tyson.id.au/2008/11/04/using-remoteio-audio-unit/ for details
-(OSStatus)setUpAudioDevice {
	OSStatus status;
	
	startedCallback = NO;
	noInterrupt = YES; 
  
	//NSLog(@"checkinit %d \n",checkinit);
	
	// Describe audio component
	AudioComponentDescription desc;
	desc.componentType = kAudioUnitType_Output;
	desc.componentSubType = kAudioUnitSubType_RemoteIO;
	desc.componentFlags = 0;
	desc.componentFlagsMask = 0;
	desc.componentManufacturer = kAudioUnitManufacturer_Apple;
	
	//Audio Session Services Reference 
	
	//http://www.iwillapps.com/wordpress/?p=196
	//setup AudioSession for safety (interruption handling):
	AudioSessionInitialize(NULL,NULL,callbackInterruptionListener,self);
	AudioSessionSetActive(true);
	
	//AudioSessionGetProperty(AudioSessionPropertyID inID,UInt32 *ioDataSize, void *outData);
	UInt32 sizeofdata;
  
	NSLog(@"Audio session details\n");
	
  //	UInt32 audioavailableflag; 
  //	
  //	//2.2 and later
  //	//kAudioSessionProperty_AudioInputAvailable
  //	
  //	//can check whether input plugged in
  //	sizeofdata= sizeof(audioavailableflag); 
  //	status= AudioSessionGetProperty(kAudioSessionProperty_AudioInputAvailable,&sizeofdata,&audioavailableflag);
  //	
  //	//no input capability
  //	if(audioavailableflag==0) {
  //		
  //		//will force system to show no audio input device message. 
  //		return 1; 
  //	}
  //	
	
	
  //	NSLog(@"Audio Input Available? %d \n",audioavailableflag);
  //	
	UInt32 numchannels; 
  //	sizeofdata= sizeof(numchannels); 
  //	//problematic: gives number of potential inputs, not number actually connected
  //	status= AudioSessionGetProperty(kAudioSessionProperty_CurrentHardwareInputNumberChannels,&sizeofdata,&numchannels);
  //	
  //	NSLog(@"Inputs %d \n",numchannels);
	
	sizeofdata= sizeof(numchannels); 
	status= AudioSessionGetProperty(kAudioSessionProperty_CurrentHardwareOutputNumberChannels,&sizeofdata,&numchannels);
	
	NSLog(@"Outputs %ld \n",numchannels);
	
	
	Float64 samplerate; 
	samplerate = 44100.0; //44100.0; //supports and changes to 22050.0 or 48000.0 too!; //44100.0; 
	status= AudioSessionSetProperty(kAudioSessionProperty_PreferredHardwareSampleRate,sizeof(samplerate),&samplerate);
	
	sizeofdata= sizeof(samplerate); 
	status= AudioSessionGetProperty(kAudioSessionProperty_CurrentHardwareSampleRate,&sizeofdata,&samplerate);
  
	NSLog(@"Device sample rate %f \n",samplerate);
	
	//set preferred hardward buffer size of 1024
	
	
	Float32 iobuffersize = 1024.0/44100.0; 
	status= AudioSessionSetProperty(kAudioSessionProperty_PreferredHardwareIOBufferDuration,sizeof(iobuffersize),&iobuffersize);
	
	
	sizeofdata= sizeof(iobuffersize); 
	status= AudioSessionGetProperty(kAudioSessionProperty_CurrentHardwareIOBufferDuration,&sizeofdata,&iobuffersize);
	
	NSLog(@"Hardware buffer size %f \n",iobuffersize);
	
	UInt32 audioCategory = kAudioSessionCategory_MediaPlayback; //for output audio //
	AudioSessionSetProperty(kAudioSessionProperty_AudioCategory,sizeof(audioCategory),&audioCategory);
	
  //	OSStatus err = noErr; //Actually do error handling, duh
  //	err = AudioSessionInitialize(CFRunLoopGetCurrent(), kCFRunLoopCommonModes, NULL /*Actually, specify your audio interruption funciton here*/, NULL);
  //	err = AudioSessionSetProperty(kAudioSessionProperty_AudioCategory, sizeof(kAudioSessionCategory_MediaPlayback), &(int) {kAudioSessionCategory_MediaPlayback});
	//status = AudioSessionSetProperty(kAudioSessionProperty_OverrideCategoryMixWithOthers, sizeof (UInt32), &(UInt32) {1});
  UInt32 bbb = 1;
  UInt32* vvv = &bbb;
  status = AudioSessionSetProperty(kAudioSessionProperty_OverrideCategoryMixWithOthers, sizeof (UInt32), vvv);
  //	err = AudioSessionSetActive(YES);
  //	
  
		
	
		
	//http://developer.apple.com/iphone/library/documentation/AudioToolbox/Reference/AudioSessionServicesReference/Reference/reference.html#//apple_ref/doc/constant_group/Audio_Session_Route_Change_Reasons
	//general feedback on states of device changing
	//AudioSessionAddPropertyListener(kAudioSessionProperty_AudioRouteChange,propertyListener,self);
  //	
	// Registers the audio route change listener callback function
	AudioSessionAddPropertyListener(kAudioSessionProperty_AudioRouteChange,audioRouteChangeListenerCallback,self);
	
	
	// Get component
	AudioComponent inputComponent = AudioComponentFindNext(NULL, &desc);
	
	// Get audio units
	status = AudioComponentInstanceNew(inputComponent, &audioUnit);
	
	if(status!= noErr) {
		NSLog(@"failure at AudioComponentInstanceNew\n"); 
		return status; 
	}; 
	
	UInt32 flag = 1;
	UInt32 kOutputBus = 0;
	
	// Enable IO for playback
	status = AudioUnitSetProperty(audioUnit, 
                                kAudioOutputUnitProperty_EnableIO, 
                                kAudioUnitScope_Output, 
                                kOutputBus,
                                &flag, 
                                sizeof(flag));
	
	
	if(status!= noErr) {
		NSLog(@"failure at AudioUnitSetProperty 2\n"); 
		return status; 
	}; 
	
	
	// Describe format
	audioFormat.mSampleRate			= 44100.00;
	audioFormat.mFormatID			= kAudioFormatLinearPCM;
	audioFormat.mFormatFlags		= kAudioFormatFlagIsSignedInteger | kAudioFormatFlagIsPacked;
	audioFormat.mFramesPerPacket	= 1;
	audioFormat.mChannelsPerFrame	= 2;
	audioFormat.mBitsPerChannel		= 16;
	audioFormat.mBytesPerPacket		= 4;
	audioFormat.mBytesPerFrame		= 4;
	
	//Apply format
	status = AudioUnitSetProperty(audioUnit, 
                                kAudioUnitProperty_StreamFormat, 
                                kAudioUnitScope_Input, 
                                kOutputBus, 
                                &audioFormat, 
                                sizeof(audioFormat));
	
	
	if(status!= noErr) {
		NSLog(@"failure at AudioUnitSetProperty 3\n"); 
		return status; 
	}; 
	
  
	// Set up the playback  callback
	AURenderCallbackStruct callbackStruct;
	callbackStruct.inputProc = playbackCallback;
	//set the reference to "self" this becomes *inRefCon in the playback callback
	callbackStruct.inputProcRefCon = self;
	
	status = AudioUnitSetProperty(audioUnit, 
                                kAudioUnitProperty_SetRenderCallback, 
                                kAudioUnitScope_Global, 
                                kOutputBus,
                                &callbackStruct, 
                                sizeof(callbackStruct));
	
	
	if(status!= noErr) {
		NSLog(@"failure at AudioUnitSetProperty 6\n"); 
		return status; 
	}; 
	
	status = AudioUnitInitialize(audioUnit);
	
	if(status != noErr) {
		NSLog(@"failure at AudioUnitSetProperty 8\n"); 
		return status; 
	}	
	
	status = AudioOutputUnitStart(audioUnit);
	
	if (status == noErr) {
		audioproblems = 0; 
		startedCallback = YES;
	}
	
	return status; 
	
}

-(void)closeDownAudioDevice{
	
	//OSStatus status = AudioOutputUnitStop(audioUnit);
	AudioOutputUnitStop(audioUnit);
  
	if(startedCallback) {
    startedCallback	= NO;
	}
  
	AudioUnitUninitialize(audioUnit);
	AudioSessionSetActive(false);
}



- (void) resetData {
  //4 seconds worth of interleaved stereo data? for now...
	//datasize_ = 44100*8; 
	datasize_ = 44100*1; 
	data_ = new float[datasize_]; 
	writepos_ = 0; 
	readpos_ = 0;
	initialreadflag_ = false; 
	restartflag_ = 0; 
	backgroundloadflag_ = 0; 
	earlyfinish_ = 0; 
	playingflag_=0; 
	
	//safety
	importingflag_ = 0; 
  
	[self setUpData:data_ pos:&readpos_ size:datasize_]; //allocate buffers
}


-(void) freeAudio {
	
	//stop audio if necessary
	if(playingflag_==1) {
		
		[self cantRead]; 
		
		[self closeDownAudioDevice]; 
		
		playingflag_=0; 
	}
	
	//stop background loading thread
	if(backgroundloadflag_ == 1)
		earlyfinish_ = 1; 
	
	while(backgroundloadflag_==1)
	{
		usleep(5000); //wait for file thread to finish
	}
}


-(void) setUpAudioThread:(AVAsset*)_inAsset {
  [self resetData];
  audioAsset = _inAsset;
  
	[self cantRead];
	writepos_ = 0; 
	readpos_ = 0;
	initialreadflag_ = false; 
	
	for (int i=0; i<datasize_; ++i)
		data_[0]= 0.0; //zero out contents of buffer
  
	//initialise the audio player
	[self setUpAudioDevice]; 
  
	playingflag_ =1; 
	backgroundloadflag_ = 1; 
  
  //AVAsset* asset = CURRENT_ASSET; //[AVURLAsset URLAssetWithURL:outURL options:options]; //Nil
	NSError* error = nil;
	//AVAssetReader* audioAssetReader= [AVAssetReader assetReaderWithAsset:(AVAsset *)asset error:&error];
  audioAssetReader= [AVAssetReader assetReaderWithAsset:(AVAsset *)audioAsset error:&error];
  
	[audioAssetReader retain];
  
  if (error==nil) {
		
    pool = [[NSAutoreleasePool alloc] init]; // Top-level pool required here, according to iphone forum posts
		
		//NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init]; // Top-level pool required here, according to iphone forum posts
		
		//get sound file track - assuming only one track for now 
    NSArray* array = [audioAsset tracksWithMediaType:AVMediaTypeAudio];
    
   	//http://objective-audio.jp/2010/09/avassetreaderavassetwriter.html		
		
    // NSDictionary *audioSetting = [NSDictionary dictionaryWithObjectsAndKeys:
    audioSetting = [NSDictionary dictionaryWithObjectsAndKeys:
                    [NSNumber numberWithFloat:44100.0],AVSampleRateKey,
                    [NSNumber numberWithInt:2],AVNumberOfChannelsKey,	//how many channels has original? 
                    [NSNumber numberWithInt:32],AVLinearPCMBitDepthKey, //was 16
                    [NSNumber numberWithInt:kAudioFormatLinearPCM], AVFormatIDKey,
                    [NSNumber numberWithBool:YES], AVLinearPCMIsFloatKey,  //was NO
                    [NSNumber numberWithBool:0], AVLinearPCMIsBigEndianKey,
                    [NSNumber numberWithBool:NO], AVLinearPCMIsNonInterleaved,
                    [NSData data], AVChannelLayoutKey, nil];	
		
		readaudiofile = [AVAssetReaderAudioMixOutput assetReaderAudioMixOutputWithAudioTracks:array audioSettings:audioSetting];
		//AVAssetReaderAudioMixOutput * readaudiofile = [AVAssetReaderAudioMixOutput assetReaderAudioMixOutputWithAudioTracks:array audioSettings:audioSetting];
		
		[readaudiofile retain];  
		
		[audioAssetReader addOutput:(AVAssetReaderOutput *)readaudiofile]; 
		[audioAssetReader startReading];
    
    
		importingflag_=0;
		
  }
}

-(void) cleanUpAudioThread {
  //any cleanup? 
  //for later, to tell main thread done...?
  //performSelectorOnMainThread
  
  [audioAssetReader cancelReading]; 
  
  [readaudiofile release]; 
  [audioAssetReader release]; 
  
  [pool drain]; 
  
  backgroundloadflag_ = 0; 
}

- (void)startAudioThread:(double)fireDate{
  
  NSTimer *t = [[NSTimer alloc] initWithFireDate:[NSDate dateWithTimeIntervalSinceReferenceDate:fireDate]
                                        interval: 0.0
                                          target: self
                                        selector:@selector(backgroundAudioCall)
                                        userInfo:nil repeats:NO];
  
  NSRunLoop *runner = [NSRunLoop currentRunLoop];
  [runner addTimer:t forMode: NSDefaultRunLoopMode];
  [t release];
}

- (void)backgroundAudioCall {
  [self performSelectorInBackground:@selector(loadAudioFile) withObject:nil];
}

- (void)loadAudioFile {
	NSError* error = nil;
  
  actuallyfinished= 0; 
	
	// Iteratively read data from the input file and write to output
  for(;;) {
    
    if(earlyfinish_==1) {
      
      earlyfinish_=0; 
      
      break; 
    }
    
    if (restartflag_==1) {
      [self restartAudio:error];
    }
    
    int readtest = readpos_; 
    
    //test where readpos_ is; while within 2 seconds (half of buffer) must continue to fill up
    int diff = readtest<=writepos_?(writepos_- readtest):(writepos_+datasize_ - readtest); 
    
    
    if ((diff < (datasize_/2)) && (actuallyfinished==0)) {
      
      CMSampleBufferRef ref = [readaudiofile copyNextSampleBuffer];
      
      if(ref!=NULL) {
        CMItemCount countsamp= CMSampleBufferGetNumSamples(ref); 	
        UInt32 frameCount = countsamp; 
        
        CMBlockBufferRef blockBuffer;
        AudioBufferList audioBufferList;
        
        //allocates new buffer memory
        CMSampleBufferGetAudioBufferListWithRetainedBlockBuffer(ref, NULL, &audioBufferList, sizeof(audioBufferList),NULL, NULL, 0, &blockBuffer);
        
        float * buffer = (float * ) audioBufferList.mBuffers[0].mData; 
        
        //int bytesize = audioBufferList.mBuffers[0].mNumberChannels;
        //int numchannels = audioBufferList.mBuffers[0].mDataByteSize;
        //int numbuffers = audioBufferList.mNumberBuffers; 
        
        for (int j=0; j<2*frameCount; ++j) {
          data_[writepos_] = buffer[j]; 
          writepos_ = (writepos_ + 1)%datasize_; 
        }
        
        CFRelease(ref);
        CFRelease(blockBuffer);
        
        // If no frames were returned, conversion is finished
        if(0 == frameCount) {
          actuallyfinished=1; 
          //in case user presses restart button! 
          //break;
        }
        
      } else {
        actuallyfinished=1;
        [self restartAudio:error];
        //exit(0);
      }
      
    }	else {
      if (!initialreadflag_) 	{
        initialreadflag_ = true; 
        [self canRead];
      } else {
        usleep(100); //1000 = 1 msec 
      }
    }
  }
  
  
  [self cleanUpAudioThread];
  return; 
}


- (void) restartAudio:(NSError*)error {
  //gain_ -= 0.1;
  printf("in restartflag_==1\n");
  [self cantRead];
  
  initialreadflag_ = false; 
  
  [audioAssetReader cancelReading]; 
  [readaudiofile release]; 
  [audioAssetReader release]; 
  
  audioAssetReader = [AVAssetReader assetReaderWithAsset:(AVAsset *)audioAsset error:&error];
  [audioAssetReader retain];
  
  NSArray* array = [audioAsset tracksWithMediaType:AVMediaTypeAudio];
  
  readaudiofile = [AVAssetReaderAudioMixOutput assetReaderAudioMixOutputWithAudioTracks:array audioSettings:audioSetting];
  
  [readaudiofile retain];  
  
  [audioAssetReader addOutput:(AVAssetReaderOutput *)readaudiofile]; 
  [audioAssetReader startReading]; 	
  
  restartflag_ = 0; 
  actuallyfinished= 0; 
  
  //secondsread_ = 0.0; 
  
  //thread safety
  writepos_ = (readpos_ + 1024)%datasize_;
}


@end
