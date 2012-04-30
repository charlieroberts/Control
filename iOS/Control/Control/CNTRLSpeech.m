//
//  CNTRLSpeech.m
//  Control
//
//  Created by charlie on 4/28/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CNTRLSpeech.h"
#import <OpenEars/PocketsphinxController.h> // Please note that unlike in previous versions of OpenEars, we now link the headers through the framework.
#import <OpenEars/LanguageModelGenerator.h>

@implementation CNTRLSpeech

@synthesize openEarsEventsObserver, pocketsphinxController, usingStartLanguageModel, pathToGrammarToStartAppWith, pathToDictionaryToStartAppWith,
pathToDynamicallyGeneratedGrammar, pathToDynamicallyGeneratedDictionary;

- (void)start:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options {
    [self.openEarsEventsObserver setDelegate:self];
    
    NSArray *languageArray = [options objectForKey:@"commands"];

	LanguageModelGenerator *languageModelGenerator = [[LanguageModelGenerator alloc] init]; 
    
    // generateLanguageModelFromArray:withFilesNamed returns an NSError which will either have a value of noErr if everything went fine or a specific error if it didn't.
	NSError *error = [languageModelGenerator generateLanguageModelFromArray:languageArray withFilesNamed:@"OpenEarsDynamicGrammar"];
    
	NSDictionary *dynamicLanguageGenerationResultsDictionary = nil;
	if([error code] != noErr) {
		NSLog(@"Dynamic language generator reported error %@", [error description]);	
	} else {
		dynamicLanguageGenerationResultsDictionary = [error userInfo];
		
		// What follows demonstrates how to get the paths for your created dynamic language models out of that userInfo dictionary.
		NSString *lmFile = [dynamicLanguageGenerationResultsDictionary objectForKey:@"LMFile"];
		NSString *dictionaryFile = [dynamicLanguageGenerationResultsDictionary objectForKey:@"DictionaryFile"];
		NSString *lmPath = [dynamicLanguageGenerationResultsDictionary objectForKey:@"LMPath"];
		NSString *dictionaryPath = [dynamicLanguageGenerationResultsDictionary objectForKey:@"DictionaryPath"];
		
		NSLog(@"Dynamic language generator completed successfully, you can find your new files %@\n and \n%@\n at the paths \n%@ \nand \n%@", lmFile,dictionaryFile,lmPath,dictionaryPath);	
		
		// pathToDynamicallyGeneratedGrammar/Dictionary aren't OpenEars things, they are just the way I'm controlling being able to switch between the grammars in this sample app.
		self.pathToDynamicallyGeneratedGrammar = lmPath; // We'll set our new .languagemodel file to be the one to get switched to when the words "CHANGE MODEL" are recognized.
		self.pathToDynamicallyGeneratedDictionary = dictionaryPath; // We'll set our new dictionary to be the one to get switched to when the words "CHANGE MODEL" are recognized.
        
        [self.pocketsphinxController startListeningWithLanguageModelAtPath:self.pathToDynamicallyGeneratedGrammar dictionaryAtPath:self.pathToDynamicallyGeneratedDictionary languageModelIsJSGF:FALSE];
	}

}

- (void) pocketsphinxDidReceiveHypothesis:(NSString *)hypothesis recognitionScore:(NSString *)recognitionScore utteranceID:(NSString *)utteranceID {
	NSLog(@"The received hypothesis is %@ with a score of %@ and an ID of %@", hypothesis, recognitionScore, utteranceID); // Log it.
    
    NSString * jsCallBack;
	jsCallBack = [[NSString alloc] initWithFormat:@"Control.speech.onUpdate('%@');", hypothesis];
	[self.webView stringByEvaluatingJavaScriptFromString:jsCallBack];
	[jsCallBack release];
}

// An optional delegate method of OpenEarsEventsObserver which informs that the unavailable audio input became available again.
- (void) audioInputDidBecomeAvailable {
    [self.pocketsphinxController startListeningWithLanguageModelAtPath:self.pathToGrammarToStartAppWith dictionaryAtPath:self.pathToDictionaryToStartAppWith languageModelIsJSGF:FALSE];
}

- (void)stop:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options  {
	[self.pocketsphinxController stopListening];
}

- (void) startDisplayingLevels { }
- (void) stopDisplayingLevels  { }

// Lazily allocated PocketsphinxController.
- (PocketsphinxController *)pocketsphinxController { 
	if (pocketsphinxController == nil) {
		pocketsphinxController = [[PocketsphinxController alloc] init];
	}
	return pocketsphinxController;
}

// Lazily allocated OpenEarsEventsObserver.
- (OpenEarsEventsObserver *)openEarsEventsObserver {
	if (openEarsEventsObserver == nil) {
		openEarsEventsObserver = [[OpenEarsEventsObserver alloc] init];
	}
	return openEarsEventsObserver;
}
@end
