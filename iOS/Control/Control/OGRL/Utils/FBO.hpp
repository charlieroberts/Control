

#include "Texture.hpp"

#ifndef OpenGLRenderLibrary_FBO_h
#define OpenGLRenderLibrary_FBO_h


//@class Texture;


class FBO {
  
public:


GLuint width;
GLuint height;

 FBO(Texture* t);
 FBO(); //if you use this version you *must* call setTargetTexture manually!

GLuint fboID;
  

 void SetTargetTexture(Texture* t);

 void BindToTexture(Texture* t);
 void Bind();
 void Unbind();

 Texture* texture;
  
private:
  
};

#endif
