//
//  ControlAppDelegate.m
//  Control
//
//  Created by charlie on 2/7/11.
//  Copyright __MyCompanyName__ 2011. All rights reserved.
//

#import "ControlAppDelegate.h"
#import "PhoneGapViewController.h"
#import "Bonjour.h"
@implementation ControlAppDelegate

- (id) init {	
    return [super init];
}

- (void)applicationDidFinishLaunching:(UIApplication *)application
{	
	application.applicationSupportsShakeToEdit = NO;
	[ super applicationDidFinishLaunching:application ];
}

-(id) getCommandInstance:(NSString*)className
{
	/** You can catch your own commands here, if you wanted to extend the gap: protocol, or add your
	 *  own app specific protocol to it. -jm
	 **/
	return [super getCommandInstance:className];
}


- (void)webViewDidFinishLoad:(UIWebView *)theWebView  {
	webView =(UIWebView *) theWebView;
	webView.dataDetectorTypes = UIDataDetectorTypeNone;
	[UIApplication sharedApplication].applicationSupportsShakeToEdit = NO;        
	webView.delegate = self;
	webView.multipleTouchEnabled = YES;
	 
	[[UIApplication sharedApplication] setNetworkActivityIndicatorVisible:NO];
	[window bringSubviewToFront:viewController.view];
	[self performSelector:@selector(showWebView) withObject:nil afterDelay:.25]; 
	return [ super webViewDidFinishLoad:theWebView ];
}

- (void)showWebView {
	[webView setHidden:NO];
	imageView.hidden = YES;
	activityView.hidden = YES;	
}

- (void)webViewDidStartLoad:(UIWebView *)theWebView {
	return [ super webViewDidStartLoad:theWebView ];
}

/**
 * Fail Loading With Error
 * Error - If the webpage failed to load display an error with the reson.
 */
- (void)webView:(UIWebView *)theWebView didFailLoadWithError:(NSError *)error 
{
	return [ super webView:theWebView didFailLoadWithError:error ];
}

/**
 * Start Loading Request
 * This is where most of the magic happens... We take the request(s) and process the response.
 * From here we can re direct links and other protocalls to different internal methods.
 */
- (BOOL)webView:(UIWebView *)theWebView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
{
	return [ super webView:theWebView shouldStartLoadWithRequest:request navigationType:navigationType ];
}


- (BOOL) execute:(InvokedUrlCommand*)command
{
	return [ super execute:command ];
}

- (void)applicationWillResignActive:(UIApplication *)application
{
    /*
     Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
     Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
     */
}

- (void)applicationDidEnterBackground:(UIApplication *)application
{
    /*
     Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later. 
     If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
     */
}

- (void)applicationWillEnterForeground:(UIApplication *)application
{
    /*
     Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
     */
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    Bonjour *b = [self.commandObjects objectForKey:@"Bonjour"];
    [b getMyIP:nil withDict:nil];    
    [b publishService:nil withDict:nil];
}

- (void)dealloc
{
	[ super dealloc ];
}

@end
