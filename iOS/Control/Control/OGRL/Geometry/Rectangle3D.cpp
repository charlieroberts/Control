
#include "Rectangle3D.hpp"
#include "Renderer.hpp"
#include "Camera.hpp"

Rectangle3D::Rectangle3D() {
  
  useTexCoords = true;
  useColors = false;
  useNormals = false;
  
  GenerateVertices();
  GenerateLineIndices();
  GenerateTriangleIndices();
  
  SetIsTransformed(true);  
}

Rectangle3D::Rectangle3D(vec3 _translate, float _w, float _h) {
  printf("in Rectangle3D(vec3, float) constructor\n");
  
  useTexCoords = true;
  useColors = false;
  useNormals = false;
  
  SetTranslate(_translate);
  SetScale(vec3(_w, _h, 0.0));
  
  GenerateVertices();
  GenerateLineIndices();
  GenerateTriangleIndices();
  
  SetIsTransformed(true);
}


int Rectangle3D::GetVertexCount()  {    
  return 4;
}

int Rectangle3D::GetLineIndexCount() {
  return 8; //4 line segments, each with 2 points 
}

int Rectangle3D::GetTriangleIndexCount() {
  return 6; //2 triangles, each having 3 points 
}



void Rectangle3D::GenerateVertices() {
  
  vertices.resize(GetVertexCount() * 3);
  texCoords.resize(GetVertexCount() * 3);
  
  float* rectVertices = &vertices[0];
  float* rectTexCoords = &texCoords[0];
  
  int v_idx = 0;
  int tc_idx = 0;
  
  float depthTC = 0.0;
//  float min = 0.0;
//  float max = 0.0;
  
  
//  rectVertices[v_idx++] = 0.0; rectVertices[v_idx++] = 0.0; rectVertices[v_idx++] = 0.0;
//  rectTexCoords[tc_idx++] = 0.5; rectTexCoords[tc_idx++] = 0.0; rectTexCoords[tc_idx++] = 0.0;
//  
//  rectVertices[v_idx++] = 0.0; rectVertices[v_idx++] = 1.0; rectVertices[v_idx++] = 0.0;
//  rectTexCoords[tc_idx++] = 0.5; rectTexCoords[tc_idx++] = 0.0; rectTexCoords[tc_idx++] = 1.0;
//  
//  rectVertices[v_idx++] = 1.0; rectVertices[v_idx++] = 0.0; rectVertices[v_idx++] = 0.0;
//  rectTexCoords[tc_idx++] = 0.5; rectTexCoords[tc_idx++] = 1.0; rectTexCoords[tc_idx++] = 0.0;
//  
//  rectVertices[v_idx++] = 1.0; rectVertices[v_idx++] = 1.0; rectVertices[v_idx++] = 0.0;
//  rectTexCoords[tc_idx++] = 0.5; rectTexCoords[tc_idx++] = 1.0; rectTexCoords[tc_idx++] = 1.0;
  
  rectVertices[v_idx++] = 0.0; rectVertices[v_idx++] = 0.0; rectVertices[v_idx++] = 0.0;
  rectTexCoords[tc_idx++] = 0.0; rectTexCoords[tc_idx++] = 1.0; rectTexCoords[tc_idx++] = depthTC;
  
  rectVertices[v_idx++] = 0.0; rectVertices[v_idx++] = 1.0; rectVertices[v_idx++] = 0.0;
  rectTexCoords[tc_idx++] = 0.0; rectTexCoords[tc_idx++] = 0.0; rectTexCoords[tc_idx++] = depthTC;
  
  rectVertices[v_idx++] = 1.0; rectVertices[v_idx++] = 0.0; rectVertices[v_idx++] = 0.0;
  rectTexCoords[tc_idx++] = 1.0; rectTexCoords[tc_idx++] = 1.0; rectTexCoords[tc_idx++] = depthTC;
  
  rectVertices[v_idx++] = 1.0; rectVertices[v_idx++] = 1.0; rectVertices[v_idx++] = 0.0;
  rectTexCoords[tc_idx++] = 1.0; rectTexCoords[tc_idx++] = 0.0; rectTexCoords[tc_idx++] = depthTC;
  
  
}

void Rectangle3D::GenerateLineIndices() {
  
  lineIndices.resize(GetLineIndexCount());
  vector<unsigned short>::iterator index = lineIndices.begin();
  
  *index++ = 0;
  *index++ = 1;
  *index++ = 1;
  *index++ = 2;
  *index++ = 2;
  *index++ = 3; 
  *index++ = 3;
  *index++ = 0; 
  
}

void Rectangle3D::GenerateTriangleIndices() {
  
  triangleIndices.resize(GetTriangleIndexCount());
  vector<unsigned short>::iterator index = triangleIndices.begin();
  
  *index++ = 0;
  *index++ = 1;
  *index++ = 2;
  *index++ = 2;
  *index++ = 1;
  *index++ = 3;  
}

void Rectangle3D::Transform() {
  
  mat4 mv = Renderer::GetRenderer()->GetCamera()->GetModelView();
  
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
}




