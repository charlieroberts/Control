/*
 *  pkmFFT.h
 *
 *  Real FFT wraper for Apple's Accelerate Framework
 *
 *  Created by Parag K. Mital - http://pkmital.com 
 *  Contact: parag@pkmital.com
 *
 *  Copyright 2011 Parag K. Mital. All rights reserved.
 * 
 *	Permission is hereby granted, free of charge, to any person
 *	obtaining a copy of this software and associated documentation
 *	files (the "Software"), to deal in the Software without
 *	restriction, including without limitation the rights to use,
 *	copy, modify, merge, publish, distribute, sublicense, and/or sell
 *	copies of the Software, and to permit persons to whom the
 *	Software is furnished to do so, subject to the following
 *	conditions:
 *	
 *	The above copyright notice and this permission notice shall be
 *	included in all copies or substantial portions of the Software.
 *
 *	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,	
 *	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 *	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 *	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 *	HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 *	WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *	FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 *	OTHER DEALINGS IN THE SOFTWARE.
 *
 *  Additional resources: 
 *      http://developer.apple.com/library/ios/#documentation/Accelerate/Reference/vDSPRef/Reference/reference.html
 *      http://developer.apple.com/library/ios/#documentation/Performance/Conceptual/vDSP_Programming_Guide/SampleCode/SampleCode.html
 *      http://stackoverflow.com/questions/3398753/using-the-apple-fft-and-accelerate-framework
 *      http://stackoverflow.com/questions/1964955/audio-file-fft-in-an-os-x-environment
 *     
 *
 *  This code is a very simple interface for Accelerate's fft/ifft code.
 *  It was built out of hacking Maximilian (Mick Grierson and Chris Kiefer) and
 *  the above mentioned resources for performing a windowed FFT which could
 *  be used underneath of an STFT implementation
 *
 *  Usage:
 *
 *  // be sure to either use malloc or __attribute__ ((aligned (16))
 *  float *sample_data = (float *) malloc (sizeof(float) * 4096);
 *  float *allocated_magnitude_buffer =  (float *) malloc (sizeof(float) * 2048);
 *  float *allocated_phase_buffer =  (float *) malloc (sizeof(float) * 2048);
 *
 *  pkmFFT *fft;
 *  fft = new pkmFFT(4096);
 *  fft.forward(0, sample_data, allocated_magnitude_buffer, allocated_phase_buffer);
 *  fft.inverse(0, sample_data, allocated_magnitude_buffer, allocated_phase_buffer);
 *  delete fft;
 *
 */

#include <Accelerate/Accelerate.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>


class pkmFFT
{
public:

	pkmFFT(int size = 4096)
	{
		fftSize = size;					// sample size
		fftSizeOver2 = fftSize/2;		
		log2n = log2f(fftSize);			// bins
		log2nOver2 = log2n/2;
		
		in_real = (float *) malloc(fftSize * sizeof(float));
		out_real = (float *) malloc(fftSize * sizeof(float));		
		split_data.realp = (float *) malloc(fftSizeOver2 * sizeof(float));
		split_data.imagp = (float *) malloc(fftSizeOver2 * sizeof(float));
		
		windowSize = size;
		window = (float *) malloc(sizeof(float) * windowSize);
		memset(window, 0, sizeof(float) * windowSize);
		vDSP_hann_window(window, windowSize, vDSP_HANN_NORM);
		
		scale = 1.0f/(float)(4.0f*fftSize);
		
		// allocate the fft object once
		fftSetup = vDSP_create_fftsetup(log2n, FFT_RADIX2);
		if (fftSetup == NULL || in_real == NULL || out_real == NULL || 
			split_data.realp == NULL || split_data.imagp == NULL || window == NULL) 
		{
			printf("\nFFT_Setup failed to allocate enough memory.\n");
		}
	}
	~pkmFFT()
	{
		free(in_real);
		free(out_real);
		free(split_data.realp);
		free(split_data.imagp);
		free(window);
		
		vDSP_destroy_fftsetup(fftSetup);
	}
	
	void forward(int start, 
				 float *buffer, 
				 float *magnitude, 
				 float *phase)
	{	
		//multiply by window
		vDSP_vmul(buffer, 1, window, 1, in_real, 1, fftSize);
		
		//convert to split complex format with evens in real and odds in imag
		vDSP_ctoz((COMPLEX *) in_real, 2, &split_data, 1, fftSizeOver2);
		
		//calc fft
		vDSP_fft_zrip(fftSetup, &split_data, 1, log2n, FFT_FORWARD);
		
		split_data.imagp[0] = 0.0;
		
		for (i = 0; i < fftSizeOver2; i++) 
		{
			//compute power 
			float power = split_data.realp[i]*split_data.realp[i] + 
							split_data.imagp[i]*split_data.imagp[i];
			
			//compute magnitude and phase
			magnitude[i] = sqrtf(power);
			phase[i] = atan2f(split_data.imagp[i], split_data.realp[i]);
		}
	}
	
	void inverse(int start, 
				 float *buffer,
				 float *magnitude,
				 float *phase, 
				 bool dowindow = true)
	{
		float *real_p = split_data.realp, *imag_p = split_data.imagp;
		for (i = 0; i < fftSizeOver2; i++) {
			*real_p++ = magnitude[i] * cosf(phase[i]);
			*imag_p++ = magnitude[i] * sinf(phase[i]);
		}
		
		vDSP_fft_zrip(fftSetup, &split_data, 1, log2n, FFT_INVERSE);
		vDSP_ztoc(&split_data, 1, (COMPLEX*) out_real, 2, fftSizeOver2);
		
		vDSP_vsmul(out_real, 1, &scale, out_real, 1, fftSize);
		
		// multiply by window w/ overlap-add
		if (dowindow) {
			float *p = buffer + start;
			for (i = 0; i < fftSize; i++) {
				*p++ += out_real[i] * window[i];
			}
		}
	}
	
	
	int					fftSize, 
						fftSizeOver2,
						log2n,
						log2nOver2,
						windowSize,
						i;	
	
private:
	
				
	
	float				*in_real, 
						*out_real,
						*window;
	
	float				scale;
	
    FFTSetup			fftSetup;
    COMPLEX_SPLIT		split_data;
	
	
};
