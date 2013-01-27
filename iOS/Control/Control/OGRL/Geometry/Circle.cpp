
#include "Circle.hpp"
#include "Renderer.hpp"
#include "Camera.hpp"



Circle::Circle() {
  
  useTexCoords = true;
  useColors = false;
  useNormals = false;
  
  resolution = 32;
  
  GenerateVertices();
  GenerateLineIndices();
  GenerateTriangleIndices();
  
  SetIsTransformed(true);  
}


Circle::Circle(vec3 _translate, float _w, float _h) {
  printf("in Circle(vec3, float) constructor\n");
  useTexCoords = true;
  useColors = false;
  useNormals = false;
  
  resolution = 32;
  
  SetTranslate(_translate);
  SetScale(vec3(_w, _h, 0.0));
  //width = _w;
  //height = _h;
  GenerateVertices();
  GenerateLineIndices();
  GenerateTriangleIndices();
  
  SetIsTransformed(true);
}



int Circle::GetVertexCount()  {    
  return resolution;
}

int Circle::GetLineIndexCount() {
  return GetVertexCount() * 2; //4 line segments, each with 2 points 
}

int Circle::GetTriangleIndexCount() {
  return GetVertexCount() * 3; //2 triangles, each having 3 points 
}


void Circle::GenerateVertices() {
  
  vertices.resize((GetVertexCount() + 1) * 3);
  texCoords.resize((GetVertexCount() + 1) * 3);
  
  float* rectVertices = &vertices[0];
  float* rectTexCoords = &texCoords[0];
  
  int v_idx = 0;
  int tc_idx = 0;
  
  float inc = (M_PI * 2.0)/(float)GetVertexCount();
  
  for (int i = 0; i < GetVertexCount(); i++) {
    
    float x = cos(i * inc);
    float y = sin(i * inc);
    float tx = (x + 1.0) * 0.5;
    float ty = (y + 1.0) * 0.5;
    
    rectVertices[v_idx++] = x; rectVertices[v_idx++] = y; rectVertices[v_idx++] = 0.0;
    rectTexCoords[tc_idx++] = tx; rectTexCoords[tc_idx++] = ty; rectTexCoords[tc_idx++] = 0.0;
  }
  
  //center pt
  rectVertices[v_idx++] = 0.0; rectVertices[v_idx++] = 0.0; rectVertices[v_idx++] = 0.0;
  rectTexCoords[tc_idx++] = 0.5; rectTexCoords[tc_idx++] = 0.5; rectTexCoords[tc_idx++] = 0.0;  
}

void Circle::GenerateLineIndices() {
  
  lineIndices.resize(GetLineIndexCount());
  vector<unsigned short>::iterator index = lineIndices.begin();
  
  for (int i = 0; i < GetVertexCount() - 1; i++) {
    *index++ = i;
    *index++ = i + 1;
  }
  *index++ = GetVertexCount() - 1;
  *index++ = 0;
   
}

void Circle::GenerateTriangleIndices() {
  
  triangleIndices.resize(GetTriangleIndexCount());
  vector<unsigned short>::iterator index = triangleIndices.begin();
  
  for (int i = 0; i < GetVertexCount() - 1; i++) {
    *index++ = GetVertexCount();
    *index++ = i;
    *index++ = i + 1;
  }
  *index++ = GetVertexCount();
  *index++ = GetVertexCount() - 1;
  *index++ = 0;
}



void Circle::Transform() {
  //if (IsTransformed()) {
  
  mat4 mv;
  
  if (parent != NULL) {
    mv = parent->GetModelView();
  } else {
    mv = mat4::Identity();
  }
  
  
  //translate
  mv = mat4::Translate(mv, GetTranslate());
  
  //scale
  mv = mat4::Translate(mv, scaleAnchor); 
  mv = mat4::Scale(mv, GetScale());
  mv = mat4::Translate(mv, -scaleAnchor);
  
  
  
  //rotate
  mv = mat4::Translate(mv, rotateAnchor);
  mv = mat4::RotateX(mv, GetRotate().x);
  mv = mat4::RotateY(mv, GetRotate().y);
  mv = mat4::RotateZ(mv, GetRotate().z);
  mv = mat4::Translate(mv, (-rotateAnchor));
  
  
  SetModelView(mv);
  SetIsTransformed(false);
  //}
}





