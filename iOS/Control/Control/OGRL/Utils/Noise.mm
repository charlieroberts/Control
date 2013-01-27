
#include "Noise.hpp"
#include "Utils.hpp"


/*
GLubyte* Noise::CreateLookUpTableForBitReduction32() {
  
  
//   //makes a 64 by 64 grid
//   r1g1b1a1, r1g1b1a2, r1g1b1a4, r1g1b1a8, r1g1b1a16, r1g1b1a32, r1g1b1a64, r1g1b1a128, r1g1b2a1, r1g1b2a2 ... r1g1b128a128
//   r1g2b1a1, r1g2b1a2, r1g2b1a4, r1g2b1a8, r1g2b1a16, r1g2b1a32, r1g2b1a64, r1g2b1a128, r1g2b2a1, r1g2b2a2 ... r1g2b128a128
//   .
//   .
//   .
//   r2g1b1a1, r2g1b1a2, r2g1b1a4, r2g1b1a8, r2g1b1a16, r2g1b1a32, r2g1b1a64, r2g1b1a128, r2g1b2a1, r2g1b2a2 ... r2g1b128a128
//   .
//   .
//   .
//   r128g128b1a1, r128g128b1a2, r128g128b1a4, r128g128b1a8, r128g128b1a16, r128g128b1a32, r128g128b1a64, r128g128b1a128, r128g128b2a1, r128g128b2a2 ... r128g128b128a128
   
   

  GLubyte* data = (GLubyte*) malloc (64*64*4*sizeof(GLubyte));
  
  
  int rVal;
  int gVal;
  int bVal;
  int aVal;

  int idx = 0;
  
  
  for (int i = 0; i < 8; i++) {
    
    rVal = (int)pow(2.0, i);
    
    for (int j = 0; j < 8; j++) {
      
      gVal = (int)pow(2.0, j);
      
      for (int k = 0; k < 8; k++) {
        
        bVal = (int)pow(2.0, k);
        
        for (int l = 0; l < 8; l++) {
          
          aVal = (int)pow(2.0, l);
          
          data[idx] = rVal; 
          data[idx+1] = gVal;  
          data[idx+2] = bVal; 
          data[idx+3] = aVal;
          
          idx+=4;
        } 
      }
    }
  }
  return data;
}
*/
/*
GLubyte* Noise::CreateLookUpTableForBitReduction16() {
  

//  //makes an 8 by 8 grid
//  r1g1, r1g2, r1g4 ... r1g8
//  r2g1, r2g2, r2g4 ... r2g8
//  .
//  .
//  .
//  r8g1, r8g2, r8g4 ... r8g8

 GLubyte* data = (GLubyte*) malloc (8*8*4*sizeof(GLubyte));
  
  
  int rVal;
  int gVal;
  
  int idx = 0;
  
  
  for (int i = 0; i < 8; i++) {
    
    rVal = (int)pow(2.0, i);
    
    for (int j = 0; j < 8; j++) {
   
      gVal = (int)pow(2.0, j);
      
      data[idx] = rVal; 
      data[idx+1] = gVal;  
      data[idx+2] = 0; 
      data[idx+3] = 0;
      
      idx+=4;
    }  
  }
  return data;
}
*/


GLubyte* Noise::CreateColorSolid(ivec4 _color, int _w, int _h) {
  
  GLubyte* data = (GLubyte*) malloc (_w*_h*4*sizeof(GLubyte));
  
  for (int i = 0; i < _w * _h * 4; i+=4) {
    data[i] = _color.x;
    data[i+1] = _color.y; 
    data[i+2] = _color.z; 
    data[i+3] = _color.w;
  }  
  return data;
}


GLubyte* Noise::CreateColorNoise(int _w, int _h) {
  
  GLubyte* data = (GLubyte*) malloc (_w*_h*4*sizeof(GLubyte));
 
  for (int i = 0; i < _w * _h * 4; i+=4) {
    data[i] = Utils::RandomIntBetween(0,255); 
    data[i+1] = Utils::RandomIntBetween(0,255); 
    data[i+2] = Utils::RandomIntBetween(0,255); 
    data[i+3] = 255; //alpha;
  }  
  return data;
}

GLubyte* Noise::CreateRgbNoise(int _w, int _h) {
  
  GLubyte* data = (GLubyte*) malloc (_w*_h*4*sizeof(GLubyte));
  int num;
  for (int i = 0; i < _w * _h * 4; i+=4) {
    
    data[i] = 0; 
    data[i+1] = 0; 
    data[i+2] = 0; 
    data[i+3] = 255; //alpha;
    
    num = Utils::RandomIntBetween(0,2);
    
    if (num == 0) {
      data[i] = 255; 
    } else if (num == 1) {
      data[i+1] = 255; 
    } else {
      data[i+2] = 255; 
    }
  }
  
  return data;
  
}