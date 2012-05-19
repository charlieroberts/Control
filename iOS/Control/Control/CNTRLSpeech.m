//
//  CNTRLSpeech.m
//  Control
//
//  Created by charlie on 4/28/12.
//  Copyright (c) 2012 __MyCompanyName__. All rights reserved.
//

#import "CNTRLSpeech.h"
#import <OpenEars/PocketsphinxController.h>
#import <OpenEars/LanguageModelGenerator.h>

@implementation CNTRLSpeech

@synthesize openEarsEventsObserver, pocketsphinxController, usingStartLanguageModel, pathToGrammarToStartAppWith, pathToDictionaryToStartAppWith,
pathToDynamicallyGeneratedGrammar, pathToDynamicallyGeneratedDictionary;

- (void)start:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options {
    [self.openEarsEventsObserver setDelegate:self];
    
    NSArray *languageArray = [options objectForKey:@"commands"];
    
	LanguageModelGenerator *languageModelGenerator = [[LanguageModelGenerator alloc] init]; 
    
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


- (void)stop:(NSMutableArray *)arguments withDict:(NSMutableDictionary *) options  {
    NSLog(@"stopping speech");
	[self.pocketsphinxController stopListening];
}

- (void) startDisplayingLevels { }
- (void) stopDisplayingLevels  { }

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
