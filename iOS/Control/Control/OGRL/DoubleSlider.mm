#include "DoubleSlider.h"
#include "Camera.hpp"


DoubleSlider::DoubleSlider(Container* _c) {
  container = _c;
  minVal = 0.25;
  maxVal = 0.75;  
  
  handleW = 0.95;
  handleH = 0.1;
  
  backgroundColor = NULL;
}

void DoubleSlider::SetHandleModelViews() {
  
  mvBk = mat4(GetModelView());
  mvBk = mat4::Translate(mvBk, 0.5,(maxVal + minVal)/2.0,0.0);
  mvBk = mat4::Scale(mvBk, handleW,maxVal-minVal,1.0);
  mvBk = mat4::Translate(mvBk, -0.5,-0.5,0.0);
  
  mvMin = mat4(GetModelView());
  mvMin = mat4::Translate(mvMin, 0.5,minVal,0.0);
  mvMin = mat4::Scale(mvMin, handleW,handleH,1.0);
  mvMin = mat4::Translate(mvMin, -0.5,-0.5,0.0);
  
  mvMax = mat4(GetModelView());
  mvMax = mat4::Translate(mvMax, 0.5,maxVal,0.0);
  mvMax = mat4::Scale(mvMax, handleW,handleH,1.0);
  mvMax = mat4::Translate(mvMax, -0.5,-0.5,0.0);  
}

void DoubleSlider::DrawElement(mat4 mv, Color* color) {
 
  Program* p = GetProgram("FlatShader");
    p->Bind(); {
      glUniformMatrix4fv(p->Uniform("Modelview"), 1, 0, mv.Pointer());
      glUniformMatrix4fv(p->Uniform("Projection"), 1, 0, root->projection.Pointer());
    
      glUniform4fv(p->Uniform("Color"), 1, color->AsFloat().Pointer());
      
      PassVertices(p, GL_TRIANGLES);
    } p->Unbind();
}

void DoubleSlider::Draw() {
  glEnable(GL_BLEND);
  glBlendFunc( GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA );
  
  //if (mvMin == NULL || mvMax == NULL) {
    SetHandleModelViews(); //really should just be done once (or when mouse moved)
  //}
  
  if (backgroundColor == NULL) {
    backgroundColor = new Color(ivec4(color->Red(), color->Green(), color->Blue(), 128));
  }
  
  DrawElement(mvBk, backgroundColor); 
  DrawElement(mvMin, color);
  DrawElement(mvMax, color);
}

void DoubleSlider::HandleTouchBegan(ivec2 mouse) {
  
  //printf("HERE in DoubleSlider::HandleTouchBegan\n");
  float y = mat4::Unproject(mouse.x, mouse.y, 0.0, modelview, root->projection, root->viewport).y;
  float halfH = handleH/2.0;
  
  if (y > minVal - halfH && y < minVal + halfH) {
    minValSelected = true;
    maxValSelected = false;
    offsetY = y - minVal;
  } else if (y > maxVal - halfH && y < maxVal + halfH) {
    minValSelected = false;
    maxValSelected = true;
    offsetY = y - maxVal;
  } else {
    minValSelected = false;
    maxValSelected = false;
    offsetY = 0;
  }
}

void DoubleSlider::HandleTouchMoved(ivec2 prevMouse, ivec2 mouse) {
 
  if (minValSelected) {    
    minVal = mat4::Unproject(mouse.x, mouse.y, 0.0, modelview, root->projection, root->viewport).y - offsetY;
  }
   
  else if(maxValSelected) {
    maxVal = mat4::Unproject(mouse.x, mouse.y, 0.0, modelview, root->projection, root->viewport).y - offsetY;
  }
  
  
  if (minVal > maxVal) {
    float tmp = minVal;
    minVal = maxVal;
    maxVal = tmp;
    maxValSelected = !maxValSelected; //true;
    minValSelected = !minValSelected; //false;
  }
 
  if (minVal < 0.0) { minVal = 0.0; }
  if (maxVal > 1.0) { maxVal = 1.0; }
  
      
  
  container->isUpdated = true;
  
  printf("min/max vals = %f/%f\n", minVal, maxVal);
}


void DoubleSlider::HandleTouchEnded(ivec2 mouse) {
  //printf("in DoubleSlider::HandleTouchEnded\n");
  minValSelected = false;
  maxValSelected = false;
}








