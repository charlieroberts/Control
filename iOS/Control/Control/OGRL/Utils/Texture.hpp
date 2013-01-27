
#include "Defines.h"

#ifdef IS_IOS 
  #include <OpenGLES/ES2/gl.h>
  #include <OpenGLES/ES2/glext.h>
#endif

#ifdef IS_COCOA
  #include <OpenGL/gl.h>
  #include <OpenGL/glext.h>
#endif

#include "Vector.hpp"
#include <string>

#ifndef TEXTURE_H
#define TEXTURE_H

using namespace std;

class Texture {
  
public:
  static Texture* CreateTextureFromImageFile(string filename);
  static Texture* CreateEmptyTexture(int _w, int _h);
  static Texture* CreateEmptyTexture(int _w, int _h, GLenum _format, GLenum _type);
  static Texture* CreateSolidTexture(ivec4 _color, int _w, int _h);
  static Texture* CreateSolidTexture(ivec4 _color, int _w, int _h, GLenum _format, GLenum _type);

  
  static Texture* CreateCubeMapFromImageFile(string filename);
    
  static Texture* CreateRgbNoiseTexture(int _w, int _h);
  static Texture* CreateColorNoiseTexture(int _w, int _h);
  static Texture* CreateCubeMapTest();
  //static Texture* Create3DTextureTest();
  
  Texture(int _w, int _h, GLenum _format, GLenum _type);
  Texture(GLubyte* data, int w, int h, GLenum _format, GLenum _type);
  Texture(GLubyte** cubeData, int w, int h, GLenum _format, GLenum _type);

  #ifdef IS_COCOA
  Texture(GLubyte* _data, int _w, int _h, int _d, GLenum _format, GLenum _type); 
  #endif  
  
  void Unbind(GLuint texNum);
  void Bind(GLuint texNum);
  void Unbind();
  void Bind();
  void SetWrapMode(GLuint wrapMode);
  void SetFilterModes(GLuint minFilter, GLuint maxFilter); //GL_NEAREST, GL_LINEAR, etc
  
  int GetIndexAt(int x, int y);
  ivec4 GetPixelAt(int x, int y);
  void SetPixelAt(int x, int y, ivec4 rgba);
  void SetRectAt(int x, int y, int w, int h, ivec4 rgba);


  GLubyte** cubeData;
  GLubyte* data;
  GLenum kind; //GL_TEXTURE_2D, GL_TEXTURE_3D, or GL_TEXTURE_CUBE_MAP 
  GLenum format; //e.g. GL_RGBA, GL_BGRA
  GLenum type; //e.g. GL_UNSIGNED_BYTE, GL_FLOAT
  int width;
  int height;
  int depth; //only for GL_TEXTURE_3D
  GLuint texID;
  GLuint wrapMode;
  GLuint minFilter;
  GLuint maxFilter;
  bool isBound;
  
  int GetWidth();
  static void flipBufferY(GLubyte* buffer, int _w, int _h);
private:
  void Create();
  void CreateCubeMap();
  
#ifdef IS_COCOA
  void Create3D();
#endif  
  
};

#endif
