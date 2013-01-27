#include "ModelView.hpp"

ModelView::ModelView() {
  translate = vec3(0.0,0.0,0.0);
  rotate = vec3(0.0,0.0,0.0);
  rotateAnchor = vec3(0.0,0.0,0.0);
  scale = vec3(1.0, 1.0, 1.0);
  scaleAnchor = vec3(0.0,0.0,0.0);
}

vec3 ModelView::GetTranslate() {
  return translate;
}
void ModelView::Translate(float x, float y, float z) {
  Translate(vec3(x,y,z));
}
void ModelView::Translate(float x, float y) {
  Translate(vec3(x,y,0.0));
}
void ModelView::TranslateX(float x) {
  Translate(vec3(x,0.0,0.0));
}
void ModelView::TranslateY(float y) {
  Translate(vec3(0.0,y,0.0));
}
void ModelView::TranslateZ(float z) {
  Translate(vec3(0.0,0.0,z));
}

void ModelView::Translate(vec3 _t) {
  SetTranslate(vec3(translate.x + _t.x, translate.y + _t.y, translate.z + _t.z)); 
}


void ModelView::CenterAt(float _x, float _y) {
  SetTranslate(vec3(_x, _y, 0.0)); 
  SetScaleAnchor(0.5,0.5);
}


void ModelView::SetTranslate(float _x, float _y) {
  SetTranslate(vec3(_x, _y, 0.0));  
}

void ModelView::SetTranslate(float _x, float _y, float _z) {
  SetTranslate(vec3(_x, _y, _z));  
}

void ModelView::SetTranslate(vec3 _t) {
//ModelView* ModelView::SetTranslate(vec3 _t) {
  translate = _t;
  SetIsTransformed(true);
  //return this;
}


vec3 ModelView::GetRotate() {
  return rotate;
}
void ModelView::RotateX(float x) {
  Rotate(vec3(x,0,0));
}
void ModelView::RotateY(float y) {
  Rotate(vec3(0,y,0));
}
void ModelView::RotateZ(float z) {
  Rotate(vec3(0,0,z));
}

void ModelView::Rotate(float x, float y, float z) {
  Rotate(vec3(x,y,z));
}
void ModelView::Rotate(vec3 _r) {
  SetRotate(rotate + _r); 
}

void ModelView::SetRotate(float x, float y, float z) {
  SetRotate(vec3(x,y,z)); 
}

void ModelView::SetRotateX(float _r) {
  SetRotate(vec3(_r, rotate.y, rotate.z));
}
void ModelView::SetRotateY(float _r) {
  SetRotate(vec3(rotate.x, _r, rotate.z));
}
void ModelView::SetRotateZ(float _r) {
  SetRotate(vec3(rotate.x, rotate.y, _r));
}

void ModelView::SetRotate(vec3 _r) {
  rotate = vec3(_r);
  SetIsTransformed(true);
}

void ModelView::SetRotateAnchor(vec3 _ra) {
  rotateAnchor = _ra;
  SetIsTransformed(true);
}


void ModelView::SetScaleAnchor(float _x, float _y) {
  SetScaleAnchor(vec3(_x,_y,0.0));
}

void ModelView::SetScaleAnchor(float _x, float _y, float _z) {
  SetScaleAnchor(vec3(_x,_y,_z));
}

void ModelView::SetScaleAnchor(vec3 _sa) {
  scaleAnchor = _sa;
  SetIsTransformed(true);
}





vec3 ModelView::GetScale() {
  return scale;
}
void ModelView::Scale(float _s) {
  Scale(vec3(_s, _s, _s));
}
void ModelView::Scale(float _x, float _y, float _z) {
  Scale(vec3(_x, _y, _z));
}
void ModelView::Scale(vec3 _s) {
  SetScale(scale + _s);
}
void ModelView::ScaleX(float x) {
  Scale(vec3(x,0,0));
}
void ModelView::ScaleY(float y) {
  Scale(vec3(0,y,0));
}
void ModelView::ScaleZ(float z) {
  Scale(vec3(0,0,z));
}

void ModelView::SetScale(float _s) {
  SetScale(vec3(_s, _s, _s));
}
void ModelView::SetScale(float _x, float _y) {
  SetScale(vec3(_x, _y, 1.0));  
}
void ModelView::SetScale(float _x, float _y, float _z) {
  SetScale(vec3(_x, _y, _z));  
}
void ModelView::SetScale(vec3 _s) {
  scale = _s;
  SetIsTransformed(true);
}





void ModelView::SetIsTransformed(bool _iT) {
  isTransformed = _iT;
}

bool ModelView::IsTransformed() {
  return isTransformed; 
}

mat4 ModelView::GetModelView() {
  //modelview.Print();
  
  return modelview;
}

void ModelView::SetModelView(mat4 _mv) {
  modelview = _mv;
 // modelview.Print();
}



void ModelView::Transform() {
  printf("ModelView::Transform not defined\n");
}
