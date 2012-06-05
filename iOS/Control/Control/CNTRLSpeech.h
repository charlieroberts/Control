//
//  CNTRLSpeech.h
//  Control
//
//  Created by charlie on 4/28/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <OpenEars/PocketsphinxController.h> // Please note that unlike in previous versions of OpenEars, we now link the headers through the framework.
#import <OpenEars/LanguageModelGenerator.h>
#import <OpenEars/OpenEarsEventsObserver.h> // We need to import this here in order to use the delegate.
#import "PGPlugin.h"

@class PocketsphinxController;
@class FliteController;

@interface CNTRLSpeech : PGPlugin<OpenEarsEventsObserverDelegate> {
	OpenEarsEventsObserver *openEarsEventsObserver;
	PocketsphinxController *pocketsphinxController;
    
    LanguageModelGenerator *languageModelGenerator;
	
	NSString *pathToDynamicallyGeneratedGrammar;
	NSString *pathToDynamicallyGeneratedDictionary;
}

- (void)stopListening:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options;
- (void)listen:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options;
- (void)setCommands:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options;

@property (nonatomic, assign) OpenEarsEventsObserver *openEarsEventsObserver;
@property (nonatomic, assign) PocketsphinxController *pocketsphinxController;

@property (nonatomic, assign) BOOL usingStartLanguageModel;

@property (nonatomic, retain) NSString *pathToDynamicallyGeneratedGrammar;
@property (nonatomic, retain) NSString *pathToDynamicallyGeneratedDictionary;

@end