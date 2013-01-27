
#include "Geom.hpp"

#ifndef CAMERA_OGRL_H
#define CAMERA_OGRL_H

class Vector;
class TextureCamera;
class Texture;

class Camera : public Geom {
  
public:
  static Camera* CreateOrthographicCamera(ivec4 _vp);
  static Camera* CreateOrthographicPixelCamera(ivec4 _vp);

  static Camera* CreatePerspectiveCamera(float _fovy, ivec4 _vp); //ranges between 0 -> 1 in both directions when depth = 0
  static Camera* CreatePerspectivePixelCamera(float _fovy, ivec4 _vp); //ranges bewteen 0->width and 0->height when depth = 0
  
  static TextureCamera* CreateTextureCamera();
  static TextureCamera* CreateTextureCamera(vec3 _initPosVec, vec3 _initRotVec, vec3 _initScaleVec);
  
  Camera(vec3 translate, float fovy, float aspect, float nearPlane, float farPlane, ivec4 _viewport); //perspective
  Camera(ivec4 _viewport); //ortho
  Camera(ivec4 _viewport, int l, int r, int b, int t); //ortho
  Camera();
  
  float fovy; //field of view angle, in	degrees, in the y	direction.
  float aspect; //the	aspect ratio that determines the field of view in the x direction. The aspect ratio is the ratio	of x (width) to	y (height).
  float nearPlane; //the	distance from the viewer to the	near clipping plane (always positive).
  float farPlane; //the	distance from the viewer to the	far clipping plane (always positive).
  mat4 projection;
  ivec4 viewport; //lowerLeft.x, lowerLeft.y, width, height
  
  virtual void Transform();
  virtual void Reset();
  
  
  
  void Render();
  void RenderChildren(Geom* g, bool cameraMoved); //if cameraMoved, then need to re-Transform everything
  
  
  //from Geom
  void Draw();
  bool AddGeom(Geom* _g);
  
  
  void SetViewport(ivec4 viewport);
  void SetAspectRatio(float _aspect);
  void Reshape(int width, int height);
  
  mat4 LookAt(float eyex, float eyey, float eyez,
              float centerx, float centery, float centerz,
              float upx, float upy, float upz);
  void rotateCamX(float angle);
  void rotateCamY(float angle);
  void rotateCamZ(float angle);
  void moveCam(vec3 distVec);
  void moveCamX( float dist );
  void moveCamY( float dist );
  void moveCamZ( float dist );
  void RenderCam();
  
  void Zoom(float dist);
  
  vec3 posVec;
  
  vec3 viewVec;
  vec3 rightVec;
  vec3 upVec;
  
  mat4 MakeCameraBasis();
  
  void SetGyroscopeMatrix(mat4 gm);
  mat4 GetGyroscopeMatrix();
  
  ivec2 Project(vec3 p);

  void DrawViewportTexture(Texture* t);
private:
  
  bool IsPerspective;
  mat4 gyroscopeMatrix;
  
  
};

#endif