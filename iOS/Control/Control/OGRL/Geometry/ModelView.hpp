#include "Vector.hpp"
#include "Matrix.hpp"

#ifndef MODELVIEW_H
#define MODELVIEW_H
//#include "GLView.h"


//#include "Interfaces.hpp"


class ModelView {
  
  
public:
  
  ModelView();
  
  virtual void Transform();
  
  virtual mat4 GetModelView();
  void SetModelView(mat4 mv);
  
  void CenterAt(float _x, float _y);
  
  vec3 GetTranslate();
  void SetTranslate(float _x, float _y, float _z);
  void SetTranslate(float _x, float _y);
  void SetTranslate(vec3 _t);
  //ModelView* SetTranslate(vec3 _t);
  void Translate(vec3 _t);
  void Translate(float x, float y, float z);
  void Translate(float x, float y);
  void TranslateX(float x);
  void TranslateY(float y);
  void TranslateZ(float z);
  
  vec3 GetRotate();
  void SetRotate(float x, float y, float z);
  void SetRotate(vec3 _r);
  void SetRotateX(float _r); 
  void SetRotateY(float _r);
  void SetRotateZ(float _r); 
  void SetRotateAnchor(vec3 _ra);
  void Rotate(vec3 _r);
  void RotateX(float x);
  void RotateY(float y);
  void RotateZ(float z);
  void Rotate(float x, float y, float z);
  
  void Scale(vec3 _s);
  void Scale(float _x, float _y, float _z);
  void Scale(float _s);
  void ScaleX(float x);
  void ScaleY(float y);
  void ScaleZ(float z);
  void SetScale(vec3 _s);
  void SetScale(float _x, float _y);
  void SetScale(float _x, float _y, float _z);
  void SetScale(float _s);
  vec3 GetScale();
  void SetScaleAnchor(vec3 _sa);
  void SetScaleAnchor(float _x, float _y, float _z);
  void SetScaleAnchor(float _x, float _y);
  
  void CalculateModelView();
  bool IsTransformed();
  void SetIsTransformed(bool _iT);
  mat4 modelview;
protected:
  vec3 rotate;
  vec3 rotateAnchor;
  vec3 translate;
  vec3 scale; 
  vec3 scaleAnchor;
private:
  
  bool isTransformed;
  
};

#endif