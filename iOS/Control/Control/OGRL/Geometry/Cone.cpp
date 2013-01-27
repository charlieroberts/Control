
#include "Cone.hpp"
#include "Renderer.hpp"
#include "Camera.hpp"

Cone::Cone() {
  
  useTexCoords = false;
  useColors = false;
  useNormals = false;
  
  divisions = ivec2(50,50);
  //divisions = ivec2(20,20);
  upperBound = vec2(TwoPi, 1);
  textureCount = vec2(1, 1);
  slices = divisions - ivec2(1, 1);
  
  GenerateVertices();
  GenerateLineIndices();
  GenerateTriangleIndices();
  
  SetIsTransformed(true);
}

Cone::Cone(vec3 _translate, float _scale) {
  printf("in Cone(vec3, float) constructor\n");
  SetTranslate(_translate);
  //cout << "translate = " << GetTranslate().String() << "\n";
  
  SetScale(_scale);
  
  SetColor(vec3(1.0, 1.0, 0.0));
  divisions = ivec2(50,50);
  //divisions = ivec2(20,20);
  
  //upperBound = vec2(Pi, TwoPi);
  upperBound = vec2(TwoPi, 1);
  textureCount = vec2(1, 1);
  slices = divisions - ivec2(1, 1);
  //slices = ivec2(100,100);
  
  GenerateVertices();
  GenerateLineIndices();
  GenerateTriangleIndices();

  isReflective =false;
  SetIsTransformed(true);
  //CalculateModelView();
}


void Cone::SetColor(vec3 _color) {
  color = _color;
}

vec3 Cone::GetColor() {
  return color; 
}

int Cone::GetVertexCount()  {    
  return divisions.x * divisions.y;
}

int Cone::GetLineIndexCount() 
{
  return 4 * slices.x * slices.x;
}

int Cone::GetTriangleIndexCount() 
{
  return 6 * slices.x * slices.y;
}

string Cone::String() {
  
  ostringstream ss;
  ss << "" << GetTranslate().String() << ", scale=" << GetScale().x;
  return ss.str();
  
}


vec2 Cone::ComputeDomain(float x, float y)  {
  return vec2(x * upperBound.x / slices.x, y * upperBound.y / slices.y);
}

vec3 Cone::Evaluate(const vec2& domain) {
  float u = domain.x, v = domain.y;
  
  float coneHeight = 1.0;
  float coneRadius = 0.5;
  
  float x = coneRadius * (1 - v) * cos(u);
  float y = coneHeight * (v - 0.5f);
  float z = coneRadius * (1 - v) * -sin(u);
  return vec3(x, y, z);
}

//void Cone::GenerateVertices(vector<float>& vertices, unsigned char flags) const
void Cone::GenerateVertices() {
  
  int floatsPerVertex = 3; //3 for vertex, 3 for normal, 2 for texCoord
  
  vertices.resize(GetVertexCount() * floatsPerVertex);
  float* attribute = &vertices[0];
  
  for (int j = 0; j < divisions.y; j++) {
    for (int i = 0; i < divisions.x; i++) {
      
      // Compute Position
      vec2 domain = ComputeDomain(i, j);
      vec3 range = Evaluate(domain);
      attribute = range.Write(attribute);
      
      /*
      // Compute Normal
      float s = i, t = j;
      
      // Nudge the point if the normal is indeterminate.
      if (i == 0) s += 0.01f;
      if (i == divisions.x - 1) s -= 0.01f;
      if (j == 0) t += 0.01f;
      if (j == divisions.y - 1) t -= 0.01f;
      
      // Compute the tangents and their cross product.
      vec3 p = Evaluate(ComputeDomain(s, t));
      vec3 u = Evaluate(ComputeDomain(s + 0.01f, t)) - p;
      vec3 v = Evaluate(ComputeDomain(s, t + 0.01f)) - p;
      vec3 normal = u.Cross(v).Normalized();
      //        if (InvertNormal(domain))
      //          normal = -normal;
      attribute = normal.Write(attribute);
      
      // Compute Texture Coordinates
//      float s2 = textureCount.x * i / slices.x;
//      float t2 = textureCount.y * j / slices.y;
//      attribute = vec2(s2, t2).Write(attribute);
      */
    }
  }
}

void Cone::GenerateLineIndices() {
  lineIndices.resize(GetLineIndexCount());
  vector<unsigned short>::iterator index = lineIndices.begin();
  for (int j = 0, vertex = 0; j < slices.y; j++) {
    for (int i = 0; i < slices.x; i++) {
      int next = (i + 1) % divisions.x;
      *index++ = vertex + i;
      *index++ = vertex + next;
      *index++ = vertex + i;
      *index++ = vertex + i + divisions.x;
    }
    vertex += divisions.x;
  }
}

void Cone::GenerateTriangleIndices() {
  triangleIndices.resize(GetTriangleIndexCount());
  vector<unsigned short>::iterator index = triangleIndices.begin();
  for (int j = 0, vertex = 0; j < slices.y; j++) {
    for (int i = 0; i < slices.x; i++) {
      int next = (i + 1) % divisions.x;
      *index++ = vertex + i;
      *index++ = vertex + next;
      *index++ = vertex + i + divisions.x;
      *index++ = vertex + next;
      *index++ = vertex + next + divisions.x;
      *index++ = vertex + i + divisions.x;
    }
    vertex += divisions.x;
  }
}


/*
void Cone::Transform() {
  
  Camera* cam = Renderer::GetRenderer()->GetCamera();
  mat4 mv = mat4(cam->GetModelView()); //mat4::Translate(cam.translate));
  mv = mat4::Translate(mv, GetTranslate());
  mv = mat4::Scale(mv, GetScale());
  SetModelView(mv);
  SetIsTransformed(false);
   
}
*/


void Cone::Transform() {
  //if (IsTransformed()) {
  mat4 mv = Renderer::GetRenderer()->GetCamera()->GetModelView();
  
  printf("isTransofrmed!\n");
  mv.Print();
  //exit(0);
  
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










