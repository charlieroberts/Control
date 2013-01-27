//#include "GLView.h"

#include "Vector.hpp"
#include "Matrix.hpp"
#include "ModelView.hpp"
#include "Camera.hpp"


#ifndef TEXTURE_CAMERA_H
#define TEXTURE_CAMERA_H





class TextureCamera : public Camera {
  
  
public:
  TextureCamera(vec3 _initPosVec, vec3 _initRotVec, vec3 _initScaleVec);
  TextureCamera();
  void Transform();
  void Reset();
  
  vec3 initPosVec;
  vec3 initRotVec;
  vec3 initScaleVec;
  
private:
  
 
  
};

#endif