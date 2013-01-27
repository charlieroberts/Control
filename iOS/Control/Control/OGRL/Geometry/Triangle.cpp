
#include "Triangle.hpp"
#include "Renderer.hpp"
#include "Camera.hpp"



Triangle::Triangle(vec3 _p0, vec3 _p1, vec3 _p2) {
  
  useTexCoords = false;
  useColors = false;
  useNormals = false;
  
  
  p0 = _p0;
  p1 = _p1;
  p2 = _p2;
  
  //width = 1.0;
  //height = 1.0;
  
  GenerateVertices();
  GenerateLineIndices();
  GenerateTriangleIndices();
  
  SetIsTransformed(true);  
}


int Triangle::GetVertexCount()  {    
  return 3;
}

int Triangle::GetLineIndexCount() {
  return 6; //3 line segments, each with 2 points 
}

int Triangle::GetTriangleIndexCount() {
  return 3; //1 triangles, each having 3 points 
}


void Triangle::GenerateVertices() {
  
  vertices.resize(GetVertexCount() * 3);
  texCoords.resize(GetVertexCount() * 3);
  
  float* rectVertices = &vertices[0];
  float* rectTexCoords = &texCoords[0];
  
  int v_idx = 0;
  int tc_idx = 0;

//  printf("in GenerateVertices... width = %f, height = %f\n", width, height);
  
  rectVertices[v_idx++] = p0.x; rectVertices[v_idx++] = p0.y; rectVertices[v_idx++] = p0.z;
  rectVertices[v_idx++] = p1.x; rectVertices[v_idx++] = p1.y; rectVertices[v_idx++] = p1.z;
  rectVertices[v_idx++] = p2.x; rectVertices[v_idx++] = p2.y; rectVertices[v_idx++] = p2.z;
  
  if (useTexCoords == true) {
    //temp
    rectTexCoords[tc_idx++] = 0.0; rectTexCoords[tc_idx++] = 0.0; rectTexCoords[tc_idx++] = 0.0;
    rectTexCoords[tc_idx++] = 1.0; rectTexCoords[tc_idx++] = 0.0; rectTexCoords[tc_idx++] = 0.0;
    rectTexCoords[tc_idx++] = 0.5; rectTexCoords[tc_idx++] = 0.5; rectTexCoords[tc_idx++] = 0.0;
  }
  
  
}

void Triangle::GenerateLineIndices() {
  
  lineIndices.resize(GetLineIndexCount());
  vector<unsigned short>::iterator index = lineIndices.begin();
  
  *index++ = 0;
  *index++ = 1;
  *index++ = 1;
  *index++ = 2;
  *index++ = 2;
  *index++ = 0; 
}

void Triangle::GenerateTriangleIndices() {
  
  triangleIndices.resize(GetTriangleIndexCount());
  vector<unsigned short>::iterator index = triangleIndices.begin();
  
  *index++ = 0;
  *index++ = 1;
  *index++ = 2;
 
}

bool Triangle::ContainsWindowPoint(ivec2 pt) {
  
  //point in triangle test
  /*
  Camera* camera = (Camera*) root; //Renderer::GetRenderer()->GetCamera();

  camera->viewport.Print("root camera vp = ");
  
  vec3 wp0 = mat4::Project(vec3(0,0,0), parent->modelview, camera->projection, camera->viewport);
  vec3 wp2 = mat4::Project(vec3(width,height,0), parent->modelview, camera->projection, camera->viewport);

  printf(" wp0.xy = %f/%f   wp2.xy = %f/%f\n", wp0.x, wp0.y, wp2.x, wp2.y);
  
  
  if (pt.x > wp0.x && pt.x < wp2.x && pt.y > wp0.y && pt.y < wp2.y) {
    return true;
  }
  */
  return false;
}




