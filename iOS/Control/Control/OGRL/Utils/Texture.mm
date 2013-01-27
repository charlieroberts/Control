#include "Texture.hpp"
#include "ResourceHandler.h"
#include "Noise.hpp"

Texture::Texture(int _w, int _h, GLenum _format, GLenum _type) {
  printf("in Texture::Texture(int _w, int _h, GLenum _format, GLenum _type)\n");
  width = _w;
  height = _h;
  format = _format; //GL_RGBA, GL_LUMINANCE, etc
  type = _type; //GL_UNSIGNED_BYTE, GL_FLOAT, etc
  kind = GL_TEXTURE_2D;
  
  wrapMode = GL_CLAMP_TO_EDGE;
  minFilter = GL_LINEAR;
  maxFilter = GL_LINEAR;
  
  data = (GLubyte*) malloc (_w*_h*4*sizeof(GLubyte));
  
  Create();
}

Texture::Texture(GLubyte* _data, int _w, int _h, GLenum _format, GLenum _type) {
  printf("in Texture::Texture(data, %d, %d ... )\n", _w, _h);
  data = _data;
  width = _w;
  height = _h;
  kind = GL_TEXTURE_2D;
  format = _format;
  type = _type;
  wrapMode = GL_CLAMP_TO_EDGE;
  minFilter = GL_LINEAR;
  maxFilter = GL_LINEAR;
  
  Create();
  //exit(0);
}


//Not available on iPhone
#ifdef IS_COCOA
Texture::Texture(GLubyte* _data, int _w, int _h, int _d, GLenum _format, GLenum _type) {
  data = _data;
  width = _w;
  height = _h;
  depth = _d;
  kind = GL_TEXTURE_3D;
  format = _format;
  type = _type;
  wrapMode = GL_CLAMP_TO_EDGE;
  minFilter = GL_LINEAR;
  maxFilter = GL_LINEAR;
  Create3D();
}
#endif

Texture::Texture(GLubyte** _cubeData, int _w, int _h, GLenum _format, GLenum _type) {
  cubeData = _cubeData;
  width = _w;
  height = _h;
  kind = GL_TEXTURE_CUBE_MAP;
  format = _format;
  type = _type;
  wrapMode = GL_CLAMP_TO_EDGE;
  minFilter = GL_LINEAR;
  maxFilter = GL_LINEAR;
  
  CreateCubeMap();
}


/*
Texture::Texture(int _w, int _h) {
  width = _w;
  height = _h;
  kind = GL_TEXTURE_2D;
  format = GL_RGBA;
  type = GL_UNSIGNED_BYTE;
  
  data = (GLubyte*) malloc (_w*_h*4*sizeof(GLubyte));
 
  Create();
}
*/

int Texture::GetWidth() {
  return width;
}



Texture* Texture::CreateSolidTexture(ivec4 _color, int _w, int _h, GLenum _format, GLenum _type) {
  
  GLubyte* _d;
  if (_format == GL_RGBA) {
    _d = Noise::CreateColorSolid(_color, _w, _h);
    
  } else if (_format == GL_BGRA) {
    _d = Noise::CreateColorSolid(ivec4(_color.z, _color.y, _color.x, _color.w), _w, _h);
  }
  
  return new Texture(_d, _w, _h, _format, _type);
}

Texture* Texture::CreateSolidTexture(ivec4 _color, int _w, int _h) {
  GLubyte* data = Noise::CreateColorSolid(_color, _w, _h);
  return new Texture(data, _w, _h, GL_RGBA, GL_UNSIGNED_BYTE);
}


Texture* Texture::CreateEmptyTexture(int _w, int _h, GLenum _format, GLenum _type) {
  printf("in Texture::CreateEmptyTexture\n");
  return new Texture(_w, _h, _format, _type);
}

Texture* Texture::CreateEmptyTexture(int _w, int _h) {
  return new Texture(_w, _h, GL_RGBA, GL_UNSIGNED_BYTE);
}

Texture* Texture::CreateRgbNoiseTexture(int _w, int _h) {
  GLubyte* data = Noise::CreateRgbNoise(_w, _h);
  return new Texture(data, _w, _h, GL_RGBA, GL_UNSIGNED_BYTE);
}

Texture* Texture::CreateColorNoiseTexture(int _w, int _h) {
  GLubyte* data = Noise::CreateColorNoise(_w, _h);
  return new Texture(data, _w, _h, GL_RGBA, GL_UNSIGNED_BYTE);
}

//Not available on iPhone
/*
 
Texture* Texture::Create3DTextureTest() {
  int bin = 2;
  int w = pow(2,bin); // * 1;
  int h = pow(2,bin);
  int d = pow(2,2);
  
  w = 4;
  h = 4;
  d = 4;
  
  printf("d = %d\n", d);
  //exit(0);
  GLubyte* texturedata = (GLubyte*) malloc (w*h*d*4*sizeof(GLubyte));
  
  int inc = (int)((float)255/(float)(w*h));
  int idx = 0;
  for (int i = 0; i < d; i++) {
  
    int c_idx = 0;
    for (int x = 0; x < w*h*4; x+=4) {
    
      
      switch (i) {
        case 0:
          texturedata[idx] = 255;
          texturedata[idx+1] = c_idx;
          texturedata[idx+2] = c_idx;
          texturedata[idx+3] = 255;
          break;
        case 1:
          texturedata[idx] = c_idx;
          texturedata[idx+1] = 255;
          texturedata[idx+2] = c_idx;
          texturedata[idx+3] = 255;
          break;
        case 2:
          texturedata[idx] = c_idx;
          texturedata[idx+1] = c_idx;
          texturedata[idx+2] = 255;
          texturedata[idx+3] = 255;
          break;
        case 3:
        default:
          texturedata[idx] = 255;
          texturedata[idx+1] = 255;
          texturedata[idx+2] = c_idx;
          texturedata[idx+3] = 255;
          break;
          //printf("error in Texture::Create3DTextureTest, no data defined for this plane\n");
          //exit(0);
      }
      
      c_idx += inc;
              
      idx+=4;
    }
  }
  
  printf("idx = %d\n", idx);
  //exit(0);
  
  return new Texture(texturedata, w, h, d);

}
*/

/** 
 The _fname argument should be the base of the files. That is,
 if the cubemap textures are called "MyCube_0.png ... MyCube_5.png" then
 pass in the string "MyCube.png". The numbering scheme is as follows:
 
 0 = GL_TEXTURE_CUBE_MAP_POSITIVE_X 
 1 = GL_TEXTURE_CUBE_MAP_NEGATIVE_X 
 2 = GL_TEXTURE_CUBE_MAP_POSITIVE_Y 
 3 = GL_TEXTURE_CUBE_MAP_NEGATIVE_Y 
 4 = GL_TEXTURE_CUBE_MAP_POSITIVE_Z 
 5 = GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
 
 **/

Texture* Texture::CreateCubeMapTest() {
  
  int w = 2048;
  int h = 2048;
  
  GLubyte** testdata = (GLubyte**) malloc(6 * sizeof(GLubyte*));
  for (int i = 0; i < 6; i++) {
    GLubyte* texturedata = (GLubyte*) malloc (w*h*4*sizeof(GLubyte));
    for (int x = 0; x < w*h*4; x+=4) {
      switch (i) {
        case 0:
          texturedata[x] = 128;
          texturedata[x+1] = 0;
          texturedata[x+2] = 0;
          texturedata[x+3] = 255;
          break;
        case 1:
          texturedata[x] = 255;
          texturedata[x+1] = 0;
          texturedata[x+2] = 0;
          texturedata[x+3] = 255;
          break;
        case 2:
          texturedata[x] = 0;
          texturedata[x+1] = 255;
          texturedata[x+2] = 0;
          texturedata[x+3] = 255;
          break;
        case 3:
          texturedata[x] = 0;
          texturedata[x+1] = 0;
          texturedata[x+2] = 255;
          texturedata[x+3] = 255;
          break;
        case 4:
          texturedata[x] = 255;
          texturedata[x+1] =255;
          texturedata[x+2] = 255;
          texturedata[x+3] = 255;
          break;
        case 5:
          texturedata[x] = 0;
          texturedata[x+1] = 128;
          texturedata[x+2] = 128;
          texturedata[x+3] = 255;
          break;
      }
      
    }
    testdata[i] = texturedata;
  }
  
  return new Texture(testdata, w, h, GL_RGBA, GL_UNSIGNED_BYTE);
}

Texture* Texture::CreateCubeMapFromImageFile(string _fname) {
  return ResourceHandler::GetResourceHandler()->CreateCubeMapTextureFromImageFile(_fname);
}

Texture* Texture::CreateTextureFromImageFile(string _fname) {
  return ResourceHandler::GetResourceHandler()->CreateTextureFromImageFile(_fname);
}

void Texture::CreateCubeMap() {
  
  glGenTextures(1, &texID); 
  glBindTexture(kind, texID);
  
 
  
//    for (int i = 0; i < 64; i++) {
//      printf("data = %u\n", cubeData[1][i]);
//    }
  
  glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, format, width, height, 0, format, type, (GLvoid*)cubeData[0]);
  glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_X, 0, format, width, height, 0, format, type, (GLvoid*)cubeData[1]);
  glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, format, width, height, 0, format, type, (GLvoid*)cubeData[2]);
  glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Y, 0, format, width, height, 0, format, type, (GLvoid*)cubeData[3]);
  glTexImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_Z, 0, format, width, height, 0, format, type, (GLvoid*)cubeData[4]);
  glTexImage2D(GL_TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, format, width, height, 0, format, type, (GLvoid*)cubeData[5]);
  
  //need mipmaps?
  
  glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_S, wrapMode);
  glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_WRAP_T, wrapMode);
 // glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR); 
  glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MIN_FILTER, minFilter); 
  glTexParameteri(GL_TEXTURE_CUBE_MAP, GL_TEXTURE_MAG_FILTER, maxFilter);
 // glGenerateMipmap(GL_TEXTURE_CUBE_MAP);
  
  printf("creating a cubemap texture at texID %d\n", texID);
  
  glBindTexture(kind, 0);
  
  printf("successfully unbound the cubemap...\n");
}

void Texture::Create() {
  glEnable(kind);
  printf("kind = %d\n", kind);
  
  glGenTextures(1, &texID);
  printf("texID = %d\n", texID);
  glBindTexture(kind, texID);
  
  glTexParameteri(kind, GL_TEXTURE_MIN_FILTER, minFilter); 
  glTexParameteri(kind, GL_TEXTURE_MAG_FILTER, maxFilter);
  
  //repeat seems to be illegal in opengl es 2.0 (at least for NPOT)
  glTexParameteri(kind, GL_TEXTURE_WRAP_S, wrapMode);
  glTexParameteri(kind, GL_TEXTURE_WRAP_T, wrapMode);

  glTexImage2D(kind, 0, GL_RGBA, width, height, 0, format, type, data); //this works!
  //glTexImage2D(kind, 0, format, width, height, 0, format, type, data);

  printf("creating a texture at texID %d\n", texID);
  
  glBindTexture(kind, 0);
 
  //you might need this...? not sure why though... think about it
  //free ( data );
  
}

//Not available on iPhone
#ifdef IS_COCOA
void Texture::Create3D() {
  glEnable(kind);
  
  glGenTextures(1, &texID);
  //printf("texID = %d\n", texID[0]);
  Bind();
  
  SetFilterModes(GL_LINEAR, GL_LINEAR);
    
  //GLuint wrapType = GL_CLAMP_TO_BORDER; //will return black pixels if not in range!
  
  SetWrapMode(GL_CLAMP_TO_EDGE);
  
//  glTexParameteri(kind, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
//  glTexParameteri(kind, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
//  glTexParameteri(kind, GL_TEXTURE_WRAP_R, GL_CLAMP_TO_EDGE);
  
  glTexImage3D(kind, 0, GL_RGBA, width, height, depth, 0, GL_RGBA, GL_UNSIGNED_BYTE, data);
  
  printf("creating a texture at texID %d\n", texID);
  // free ( data );
  
  Unbind();
}
#endif

void Texture::Unbind() {  
  glBindTexture(kind, 0);
  isBound = false;
}

void Texture::Unbind(GLuint slot) {
  glActiveTexture(slot); //i.e GL_TEXTURE0, etc
  //printf("unbinding %d from active texture %d\n", texID[0], texNum);
  
  glBindTexture(kind, 0);
  isBound = false;
}

void Texture::Bind() {  
  glBindTexture(kind, texID);
  isBound = true;
}

void Texture::Bind(GLuint slot) {  
  //glEnable(GL_TEXTURE_2D);
  glActiveTexture(slot); //i.e GL_TEXTURE0, etc
  glBindTexture(kind, texID);
  isBound = true;
}

void Texture::SetFilterModes(GLuint _minFilter, GLuint _maxFilter) {
  minFilter = _minFilter;
  maxFilter = _maxFilter;
  
  bool needToUnbind = false;
  if (!isBound) {
    glBindTexture(kind, texID);
  }
  
  glTexParameteri(kind, GL_TEXTURE_MIN_FILTER, minFilter); 
  glTexParameteri(kind, GL_TEXTURE_MAG_FILTER, maxFilter);
  
  if (needToUnbind) {
    glBindTexture(kind, 0);
  }
}

void Texture::SetWrapMode(GLuint _wrapMode) {
  wrapMode = _wrapMode;
  bool needToUnbind = false;
  if (!isBound) {
    glBindTexture(kind, texID);
  }
  glTexParameteri(kind, GL_TEXTURE_WRAP_S, wrapMode);
  glTexParameteri(kind, GL_TEXTURE_WRAP_T, wrapMode);
  
  /*
  if (kind == GL_TEXTURE_3D) {
    glTexParameteri(kind, GL_TEXTURE_WRAP_R, wrapMode);
  }
  */
  
  if (needToUnbind) {
    glBindTexture(kind, 0);
  }
}


void Texture::flipBufferY(GLubyte* buffer, int _w, int _h) {
  // gl renders “upside down” so swap top to bottom into new array.
  GLuint top;
  GLuint bottom;
  for(int y = 0; y < _h / 2; y++) {
    for(int x = 0; x < _w; x++) {
      //Swap top and bottom bytes
      top = buffer[y * _w + x];
      bottom = buffer[(_h - 1 - y) * _w + x];
      buffer[(_h - 1 - y) * _w + x] = top;
      buffer[y * _w + x] = bottom;
    }
  }
}


//assuming an 32-unsigned byte pixel for now...
int Texture::GetIndexAt(int x, int y) {
  return (y * width * 4) + (x * 4);
}

//returns an RGBA for now...
ivec4 Texture::GetPixelAt(int x, int y) { 
  int idx = GetIndexAt(x,y);
  
  if (data != NULL) {
    if (format == GL_RGBA) {
      return ivec4(data[idx+0], data[idx+1], data[idx+2], data[idx+3]); 
    } else if (format == GL_BGRA) {
      return ivec4(data[idx+2], data[idx+1], data[idx+0], data[idx+3]); 
    }
  } 
  
  return ivec4(0,0,0,0);
}

//assuming you are passing in an RGBA for now...
void Texture::SetPixelAt(int x, int y, ivec4 rgba) { 
  int idx = GetIndexAt(x,y);
  
  if (format == GL_RGBA) {
    data[idx + 0] = rgba.x;
    data[idx + 1] = rgba.y;
    data[idx + 2] = rgba.z;
    data[idx + 3] = rgba.w;
  } else if (format == GL_BGRA) {
    data[idx + 0] = rgba.z;
    data[idx + 1] = rgba.y;
    data[idx + 2] = rgba.x;
    data[idx + 3] = rgba.w;
  }
  
  glEnable(kind);
  glBindTexture(kind, texID);
  
  glTexSubImage2D(kind, 0, x, y, 1, 1, format, GL_UNSIGNED_BYTE, &data[idx]); 
  
  glBindTexture(kind, 0);
}


void Texture::SetRectAt(int x, int y, int w, int h, ivec4 rgba) { 
  
  if (x + w < 0 || x >= width || y + h < 0 || y >= height || w <= 0 || h <= 0) {
    return;
  }
    
  if (x < 0) {
    w = x + w;
    x = 0;
  }
  if (x + w > width) {
    w = width - x;
  }
  
  if (y < 0) {
    h = y + h;
    y = 0;
  }
  if (y + h > height) {
    h = height - y;
  }
  
  
  
  
  GLubyte* c = Noise::CreateColorSolid(rgba, w, h); //need to handles both RGBA and BGRA (just RGBA here)
  
  for (int ii = 0; ii < h; ii++) {
    for (int i = 0; i < w; i++) {
      
      int t_idx = GetIndexAt(x + i, y + ii);
      int c_idx = (ii * w * 4) + (i * 4);
      //printf("t_idx = %d, c_idx = %d \n", t_idx, c_idx);
      
      data[t_idx + 0] = c[c_idx + 0]; 
      data[t_idx + 1] = c[c_idx + 1]; 
      data[t_idx + 2] = c[c_idx + 2]; 
      data[t_idx + 3] = c[c_idx + 3]; 
    }
  }
  
  glEnable(kind);
  glBindTexture(kind, texID);
  
  glTexSubImage2D(kind, 0, x, y, w, h, format, GL_UNSIGNED_BYTE, c); 
  
  glBindTexture(kind, 0);
  
  delete(c);
}




