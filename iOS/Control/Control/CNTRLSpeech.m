//
//  CNTRLSpeech.m
//  Control
//
//  Created by charlie on 4/28/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CNTRLSpeech.h"

@implementation CNTRLSpeech

@synthesize openEarsEventsObserver, pocketsphinxController, usingStartLanguageModel, pathToDynamicallyGeneratedGrammar, pathToDynamicallyGeneratedDictionary;

- (void) dealloc {
    [languageModelGenerator release];
    [super dealloc];
}

- (void)start:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options {
    [self.openEarsEventsObserver setDelegate:self];
    
	languageModelGenerator = [[LanguageModelGenerator alloc] init]; 
    [self setCommands:arguments withDict:options];
}

- (void)setCommands:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options {    
    NSArray *languageArray = [options objectForKey:@"commands"];
	NSError *error = [languageModelGenerator generateLanguageModelFromArray:languageArray withFilesNamed:@"OpenEarsDynamicGrammar"];
    
    NSDictionary *dynamicLanguageGenerationResultsDictionary = nil;
    
    if([error code] != noErr) {
		NSLog(@"Dynamic language generator reported error %@", [error description]);	
	} else {
		dynamicLanguageGenerationResultsDictionary = [error userInfo];
        
		NSString *lmFile = [dynamicLanguageGenerationResultsDictionary objectForKey:@"LMFile"];
		NSString *dictionaryFile = [dynamicLanguageGenerationResultsDictionary objectForKey:@"DictionaryFile"];
		NSString *lmPath = [dynamicLanguageGenerationResultsDictionary objectForKey:@"LMPath"];
		NSString *dictionaryPath = [dynamicLanguageGenerationResultsDictionary objectForKey:@"DictionaryPath"];
		
		NSLog(@"Dynamic language generator completed successfully, you can find your new files %@\n and \n%@\n at the paths \n%@ \nand \n%@", lmFile,dictionaryFile,lmPath,dictionaryPath);	
		
		self.pathToDynamicallyGeneratedGrammar = lmPath;
		self.pathToDynamicallyGeneratedDictionary = dictionaryPath;
        
        self.pocketsphinxController.secondsOfSilenceToDetect = .25;
        [self.pocketsphinxController startListeningWithLanguageModelAtPath:self.pathToDynamicallyGeneratedGrammar dictionaryAtPath:self.pathToDynamicallyGeneratedDictionary languageModelIsJSGF:FALSE];
	}
}

- (void)listen:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options {
    [self.pocketsphinxController resumeRecognition];     
    [self.pocketsphinxController setProcessing:NO];
}

- (void)stopListening:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options {
    [self.pocketsphinxController suspendRecognition];
    [self.pocketsphinxController setProcessing:YES];
}

- (void) pocketsphinxDidReceiveHypothesis:(NSString *)hypothesis recognitionScore:(NSString *)recognitionScore utteranceID:(NSString *)utteranceID {
	NSLog(@"The received hypothesis is %@ with a score of %@ and an ID of %@", hypothesis, recognitionScore, utteranceID); // Log it.
    
    NSString * jsCallBack;
	jsCallBack = [[NSString alloc] initWithFormat:@"Control.speech.onUpdate('%@');", hypothesis];
	[self.webView stringByEvaluatingJavaScriptFromString:jsCallBack];
	[jsCallBack release];
}

// An optional delegate method of OpenEarsEventsObserver which informs that Pocketsphinx is now listening for speech.
- (void) pocketsphinxDidStartListening {
    NSLog(@"******************* DID START LISTENING ******************************");
    NSString * jsCallBack;
	jsCallBack = [[NSString alloc] initWithFormat:@"Control.speech.onStartListening();"];
	[self.webView stringByEvaluatingJavaScriptFromString:jsCallBack];
	[jsCallBack release];
}

// An optional delegate method of OpenEarsEventsObserver which informs that Pocketsphinx detected speech and is starting to process it.
- (void) pocketsphinxDidDetectFinishedSpeech {
    NSString * jsCallBack;
    NSLog(@"******************* DID HEAR SPEECH AND START PROCESSING ******************************");
    
	jsCallBack = [[NSString alloc] initWithFormat:@"Control.speech.onStartProcessing();"];
	[self.webView stringByEvaluatingJavaScriptFromString:jsCallBack];
	[jsCallBack release];
}

//- (void) pocketsphinxDidDetectFinishedSpeech; // Pocketsphinx detected a second of silence indicating the end of an utterance



// An optional delegate method of OpenEarsEventsObserver which informs that the unavailable audio input became available again.
//- (void) audioInputDidBecomeAvailable {
//    [self.pocketsphinxController startListeningWithLanguageModelAtPath:self.pathToGrammarToStartAppWith dictionaryAtPath:self.pathToDictionaryToStartAppWith languageModelIsJSGF:FALSE];
//}

- (void)stop:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options  {
    NSLog(@"STOP LISTENING");
	[self.pocketsphinxController stopListening];
}

- (PocketsphinxController *)pocketsphinxController { 
	if (pocketsphinxController == nil) {
		pocketsphinxController = [[PocketsphinxController alloc] init];
	}
	return pocketsphinxController;
}

- (OpenEarsEventsObserver *)openEarsEventsObserver {
	if (openEarsEventsObserver == nil) {
		openEarsEventsObserver = [[OpenEarsEventsObserver alloc] init];
	}
	return openEarsEventsObserver;
}
@end
