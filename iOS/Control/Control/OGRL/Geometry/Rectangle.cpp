
#include "Rectangle.hpp"
#include "Renderer.hpp"
#include "Camera.hpp"



Rectangle::Rectangle() {
  
  useTexCoords = false;
  useColors = false;
  useNormals = false;
  
  width = 1.0;
  height = 1.0;
  
  GenerateVertices();
  GenerateLineIndices();
  GenerateTriangleIndices();
  
  SetIsTransformed(true);  
}


Rectangle::Rectangle(vec3 _translate, float _sx, float _sy) {
  printf("in Rectangle(vec3, float) constructor\n");
  useTexCoords = true;
  useColors = false;
  useNormals = false;
  
  SetTranslate(_translate);
  SetScale(vec3(_sx, _sy, 0.0));
  width = 1.0;
  height = 1.0;
  GenerateVertices();
  GenerateLineIndices();
  GenerateTriangleIndices();
  
  SetIsTransformed(true);
}


void Rectangle::SetSize(float _w, float _h) {
  width = _w;
  height = _h;
  GenerateVertices();
}


void Rectangle::SetWidth(float _w) {
  SetSize(_w, height);
}

void Rectangle::SetHeight(float _h) {
  SetSize(width, _h);
}

float Rectangle::GetWidth(void) {
  return width;
}

float Rectangle::GetHeight(void) {
  return height;
}

int Rectangle::GetVertexCount()  {    
  return 4;
}

int Rectangle::GetLineIndexCount() {
  return 8; //4 line segments, each with 2 points 
}

int Rectangle::GetTriangleIndexCount() {
  return 6; //2 triangles, each having 3 points 
}


void Rectangle::GenerateVertices() {
  
  vertices.resize(GetVertexCount() * 3);
  texCoords.resize(GetVertexCount() * 3);
  
  float* rectVertices = &vertices[0];
  float* rectTexCoords = &texCoords[0];
  
  int v_idx = 0;
  int tc_idx = 0;
  
  
  //  printf("in GenerateVertices... width = %f, height = %f\n", width, height);
  
  rectVertices[v_idx++] = 0.0; rectVertices[v_idx++] = 0.0; rectVertices[v_idx++] = 0.0;
  rectTexCoords[tc_idx++] = 0.0; rectTexCoords[tc_idx++] = 1.0; rectTexCoords[tc_idx++] = 0.0;
  
  rectVertices[v_idx++] = 0.0; rectVertices[v_idx++] = height; rectVertices[v_idx++] = 0.0;
  rectTexCoords[tc_idx++] = 0.0; rectTexCoords[tc_idx++] = 0.0; rectTexCoords[tc_idx++] = 0.0;
  
  rectVertices[v_idx++] = width; rectVertices[v_idx++] = 0.0; rectVertices[v_idx++] = 0.0;
  rectTexCoords[tc_idx++] = 1.0; rectTexCoords[tc_idx++] = 1.0; rectTexCoords[tc_idx++] = 0.0;
  
  rectVertices[v_idx++] = width; rectVertices[v_idx++] = height; rectVertices[v_idx++] = 0.0;
  rectTexCoords[tc_idx++] = 1.0; rectTexCoords[tc_idx++] = 0.0; rectTexCoords[tc_idx++] = 0.0;
  
}

void Rectangle::GenerateLineIndices() {
  
  lineIndices.resize(GetLineIndexCount());
  vector<unsigned short>::iterator index = lineIndices.begin();
  
  *index++ = 0;
  *index++ = 2;
  *index++ = 2;
  *index++ = 3;
  *index++ = 3;
  *index++ = 1; 
  *index++ = 1;
  *index++ = 0; 
}

void Rectangle::GenerateTriangleIndices() {
  
  triangleIndices.resize(GetTriangleIndexCount());
  vector<unsigned short>::iterator index = triangleIndices.begin();
  
  *index++ = 0;
  *index++ = 1;
  *index++ = 2;
  *index++ = 2;
  *index++ = 1;
  *index++ = 3;  
}

bool Rectangle::ContainsWindowPoint(ivec2 pt) {
  
  Camera* camera = root; //Renderer::GetRenderer()->GetCamera();
  //Camera* camera = (Camera*) root; //Renderer::GetRenderer()->GetCamera();
  
  camera->viewport.Print("root camera vp = ");
  
//  vec3 wp0 = mat4::Project(vec3(0,0,0), parent->modelview, camera->projection, camera->viewport);
//  vec3 wp2 = mat4::Project(vec3(width,height,0), parent->modelview, camera->projection, camera->viewport);
    vec3 wp0 = mat4::Project(vec3(0,0,0), modelview, camera->projection, camera->viewport);
    vec3 wp2 = mat4::Project(vec3(width,height,0), modelview, camera->projection, camera->viewport);
  
  //printf(" mouse=%d/%d wp0.xy = %f/%f   wp2.xy = %f/%f\n", pt.x, pt.y, wp0.x, wp0.y, wp2.x, wp2.y);
  
  if (pt.x > wp0.x && pt.x < wp2.x && pt.y > wp0.y && pt.y < wp2.y) {
    return true;
  }
  
  return false;
}


/*
void Rectangle::Draw() {

  
}
*/


void Rectangle::Transform() {
  //if (IsTransformed()) {
  
  mat4 mv;
  
  if (parent != NULL) {
    mv = parent->GetModelView();
  } else {
    mv = mat4::Identity();
  }
  //mat4 mv = Renderer::GetRenderer()->GetCamera()->GetModelView();
  
  //printf("isTransformed!\n");
  //mv.Print();
  
  
  //translate
  mv = mat4::Translate(mv, GetTranslate());
  
  //scale
//  mv = mat4::Translate(mv, scaleAnchor); //rects are positioned at 0,0 already (i.e., not centered around it)
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





