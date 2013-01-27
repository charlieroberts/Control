#include "TextureCamera.hpp"
#include "Utils.hpp"

//Rectangular Texture Camera
//produces a modelview matrix that can be used to reposition vertexes around a camera view

TextureCamera::TextureCamera() {
  initPosVec = vec3(0,0,0);
  initRotVec = vec3(0,0,0);
  initScaleVec = vec3(1,1,0);
  rotateAnchor = vec3(0.5,0.5,0.0);
  scaleAnchor = vec3(0.5,0.5,0.0);
  
  Reset();
}

TextureCamera::TextureCamera(vec3 _initPosVec, vec3 _initRotVec, vec3 _initScaleVec) {
  
  initPosVec = _initPosVec;
  initRotVec = _initRotVec;
  initScaleVec = _initScaleVec;
  rotateAnchor = vec3(0.5,0.5,0.0);
  scaleAnchor = vec3(0.5,0.5,0.0);
  
  Reset();
  
}
void TextureCamera::Transform() {
  
  if (IsTransformed()) {
    mat4 tm = mat4::Identity();
    mat4 rotBasis = MakeCameraBasis();
    
    tm = mat4::Translate(tm, vec3(-posVec.x, -posVec.y, -posVec.z));
    
    tm = mat4::Translate(tm, scaleAnchor);
    tm = mat4::Scale(tm, scale);
    tm = mat4::Translate(tm, -scaleAnchor);
    
    tm = mat4::Translate(tm, rotateAnchor);
    tm = mat4(rotBasis) * tm;
    tm = mat4::Translate(tm, -rotateAnchor);
    
    SetModelView(tm);
    SetIsTransformed(false);
  } 
}

/*
 
 //PANA
 //  //THIS seems to work for the Panoramic Video...
 //  mat4 transformedMatrix = mat4::Identity();
 //  //transformedMatrix *= mat4(m);
 //  transformedMatrix = mat4::Translate(transformedMatrix, vec3(-eyex, -eyey, -eyez));
 //
 //  transformedMatrix = mat4::Translate(transformedMatrix, vec3(0.5, 0.5, 0.5));
 //  transformedMatrix = mat4::Scale(transformedMatrix, vec3(sx,sy,sz));
 //  transformedMatrix = mat4::Translate(transformedMatrix, -vec3(0.5, 0.5, 0.5));
 //END Panoramic Video
 */

void TextureCamera::Reset() {
  //Camera::Reset();
  posVec = initPosVec;
  
  mat4 rot = mat4::Identity();
  rot = mat4::RotateX(rot, initRotVec.x);
  rot = mat4::RotateY(rot, initRotVec.y);
  rot = mat4::RotateZ(rot, initRotVec.z);
  
  rightVec = vec3(rot.x.x, rot.x.y, rot.x.z);
  upVec = vec3(rot.y.x, rot.y.y, rot.y.z);
  viewVec = vec3(rot.z.x, rot.z.y, rot.z.z);
  
  scale = initScaleVec;
  
  SetIsTransformed(true); 
  Transform();
}

