//
//  CNTRLSpeech.h
//  Control
//
//  Created by charlie on 4/28/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
@class PocketsphinxController;
@class FliteController;
#import <OpenEars/OpenEarsEventsObserver.h> // We need to import this here in order to use the delegate.
#import "PGPlugin.h"

@interface CNTRLSpeech : PGPlugin<OpenEarsEventsObserverDelegate> {
	
	// These three are important OpenEars classes that ViewController demonstrates the use of. There is a fourth important class (LanguageModelGenerator) demonstrated
	// inside the ViewController implementation in the method viewDidLoad.
	
	OpenEarsEventsObserver *openEarsEventsObserver; // A class whose delegate methods which will allow us to stay informed of changes in the Flite and Pocketsphinx statuses.
	PocketsphinxController *pocketsphinxController; // The controller for Pocketsphinx (voice recognition).
    
	BOOL usingStartLanguageModel;
	
	// Strings which aren't required for OpenEars but which will help us show off the dynamic language features in this sample app.
	NSString *pathToGrammarToStartAppWith;
	NSString *pathToDictionaryToStartAppWith;
	
	NSString *pathToDynamicallyGeneratedGrammar;
	NSString *pathToDynamicallyGeneratedDictionary;
}

// Example for reading out the input audio levels without locking the UI using an NSTimer

- (void) startDisplayingLevels;
- (void) stopDisplayingLevels;

// These three are the important OpenEars objects that this class demonstrates the use of.

@property (nonatomic, assign) OpenEarsEventsObserver *openEarsEventsObserver;
@property (nonatomic, assign) PocketsphinxController *pocketsphinxController;

@property (nonatomic, assign) BOOL usingStartLanguageModel;

// Things which help us show off the dynamic language features.
@property (nonatomic, retain) NSString *pathToGrammarToStartAppWith;
@property (nonatomic, retain) NSString *pathToDictionaryToStartAppWith;
@property (nonatomic, retain) NSString *pathToDynamicallyGeneratedGrammar;
@property (nonatomic, retain) NSString *pathToDynamicallyGeneratedDictionary;

@end