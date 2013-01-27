
#include "Cube.hpp"
#include "Renderer.hpp"
#include "Camera.hpp"


Cube::Cube() {
  printf("in Cube() constructor\n");
  useTexCoords = true;
  useColors = false;
  useNormals = false;
  
  //cout << "translate = " << GetTranslate().String() << "\n";
  
  //SetColor(vec3(1.0, 1.0, 0.0));
  
  GenerateVertices();
  GenerateLineIndices();
  GenerateTriangleIndices();
  
  isReflective =false;
  SetIsTransformed(true);
  //CalculateModelView();
}

Cube::Cube(vec3 _translate, float _scale) {
  useTexCoords = true;
  useColors = false;
  useNormals = false;
  
  printf("in Cube(vec3, float) constructor\n");
  SetTranslate(_translate);
  //cout << "translate = " << GetTranslate().String() << "\n";
  
  SetScale(_scale);
  
  //SetColor(vec3(1.0, 1.0, 0.0));
  
  GenerateVertices();
  GenerateLineIndices();
  GenerateTriangleIndices();
  
  isReflective =false;
  SetIsTransformed(true);
  //CalculateModelView();
}

int Cube::GetVertexCount()  {    
  return 8;
}

int Cube::GetLineIndexCount() {
  return 24; //12 line segments, each with 2 points 
}

int Cube::GetTriangleIndexCount() {
  return 36; //2 triangles on each of the 6 sides, each having 3 points 
}

void Cube::GenerateVertices() {

  float radius = 0.5; //GetScale(); //1.0;

  int floatsPerVertex = 3; //3 for vertex, 3 for normal, 2 for tc
  vertices.resize(GetVertexCount() * floatsPerVertex);
  float* cubeVertices = &vertices[0];
  
  int idx = 0;
  
  cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = radius;
  cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius;
  cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius;
  cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = radius;
  
  cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius;
  cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius;
  cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius;
  cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius;
   
}

void Cube::GenerateLineIndices() {
  
  lineIndices.resize(GetLineIndexCount());
  vector<unsigned short>::iterator index = lineIndices.begin();
  
  //top
  *index++ = 0;
  *index++ = 1;
  *index++ = 1;
  *index++ = 2;
  *index++ = 2;
  *index++ = 3; 
  *index++ = 3;
  *index++ = 0; 

  //bottom
  *index++ = 6;
  *index++ = 5;
  *index++ = 5;
  *index++ = 4;
  *index++ = 4;
  *index++ = 7; 
  *index++ = 7;
  *index++ = 6;
  
  //sides
  *index++ = 3;
  *index++ = 7;
  *index++ = 2;
  *index++ = 4;
  *index++ = 1;
  *index++ = 5; 
  *index++ = 0;
  *index++ = 6;
}

void Cube::GenerateTriangleIndices() {
  
  //right now only handling vertices, 
  //not texcoords or normals...
  
  triangleIndices.resize(GetTriangleIndexCount());
  vector<unsigned short>::iterator index = triangleIndices.begin();
  
  //top
  *index++ = 1;
  *index++ = 2;
  *index++ = 0;
  *index++ = 2;
  *index++ = 0;
  *index++ = 3;
  
  //bottom
  *index++ = 7;
  *index++ = 4;
  *index++ = 6;
  *index++ = 4;
  *index++ = 6;
  *index++ = 5;
  
  //left
  *index++ = 2;
  *index++ = 4;
  *index++ = 3;
  *index++ = 4;
  *index++ = 3;
  *index++ = 7;
  
  //right
  *index++ = 0;
  *index++ = 1;
  *index++ = 5;
  *index++ = 0;
  *index++ = 5;
  *index++ = 6;
  
  //back
  *index++ = 5;
  *index++ = 1;
  *index++ = 4;
  *index++ = 1;
  *index++ = 4;
  *index++ = 2;
  
  //front
  *index++ = 3;
  *index++ = 0;
  *index++ = 7;
  *index++ = 0;
  *index++ = 7;
  *index++ = 6;
}

bool Cube::IsPointOnFace(vec2 pt) {
  if (pt.x >= -1 && pt.x < 1 && pt.y >= -1 && pt.y < 1) {
    return true;
  }
  return false;
}
  

/*
0 = GL_TEXTURE_CUBE_MAP_POSITIVE_X 
1 = GL_TEXTURE_CUBE_MAP_NEGATIVE_X 
2 = GL_TEXTURE_CUBE_MAP_POSITIVE_Y 
3 = GL_TEXTURE_CUBE_MAP_NEGATIVE_Y 
4 = GL_TEXTURE_CUBE_MAP_POSITIVE_Z 
5 = GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
*/
bool Cube::Intersect(Ray &r, int &face, vec3 &I, vec2 &TC) {

  vec3 N, p1, p2, p3;
  float u;
  
  p1 = r.origin;
  p2 = r.origin + r.direction;
  
  //check back plane
  N = vec3(0,0,1);
  p3 = vec3(0,0,-1);
  
  u = vec3::Dot(N, p3 - p1) / vec3::Dot(N, p2 - p1);
  //printf("u = %f\n", u);
  if (u >= 0.0 && u < 1.0) {
    I = p1 + (r.direction * u);
    if (IsPointOnFace(vec2(I.x, I.y))) {
      face = 5;
      TC = vec2(1.0 - (I.x + 1.0) * 0.5, (I.y + 1.0) * 0.5);
      return true;
    }
  }
  
  //check front plane
  N = vec3(0,0,-1);
  p3 = vec3(0,0,1);
  
  u = vec3::Dot(N, p3 - p1) / vec3::Dot(N, p2 - p1);
   if (u >= 0.0 && u < 1.0) {
    I = p1 + (r.direction * u);
     if (IsPointOnFace(vec2(I.x, I.y))) {
      face = 4;
      TC = vec2((I.x + 1.0) * 0.5, (I.y + 1.0) * 0.5);
      return true;
    }
  }
  
  //check left plane
  N = vec3(1,0,0);
  p3 = vec3(-1,0,0);
  
  u = vec3::Dot(N, p3 - p1) / vec3::Dot(N, p2 - p1);
  if (u >= 0.0 && u < 1.0) {
    I = p1 + (r.direction * u);
    if (IsPointOnFace(vec2(I.y, I.z))) {
      face = 1;
      TC = vec2( (I.z + 1.0) * 0.5, (I.y + 1.0) * 0.5 );
      return true;
    }
  }
  
  //check right plane
  N = vec3(-1,0,0);
  p3 = vec3(1,0,0);
  
  u = vec3::Dot(N, p3 - p1) / vec3::Dot(N, p2 - p1);
  if (u >= 0.0 && u < 1.0) {
    I = p1 + (r.direction * u);
    if (IsPointOnFace(vec2(I.y, I.z))) {
      face = 0;
      TC = vec2(1.0 - (I.z + 1.0) * 0.5, (I.y + 1.0) * 0.5);
      return true;      
    }
  }
  
  //check top plane
  N = vec3(0,-1,0);
  p3 = vec3(0,1,0);
  
  u = vec3::Dot(N, p3 - p1) / vec3::Dot(N, p2 - p1);
  if (u >= 0.0 && u < 1.0) {
    I = p1 + (r.direction * u);
    if (IsPointOnFace(vec2(I.x, I.z))) {
      face = 2;
      TC = vec2( 1.0 - (I.x + 1.0) * 0.5, (I.z + 1.0) * 0.5);
      return true;
    }
  }
  
  
  //check bottom plane
  N = vec3(0,1,0);
  p3 = vec3(0,-1,0);
  
  u = vec3::Dot(N, p3 - p1) / vec3::Dot(N, p2 - p1);
// printf("u = %f\n", u);
  if (u >= 0.0 && u < 1.0) {
    I = p1 + (r.direction * u);
    if (IsPointOnFace(vec2(I.x, I.z))) {
      face = 3;
      TC = vec2(1.0 - (I.x + 1.0) * 0.5, 1.0 - (I.z + 1.0) * 0.5);
      return true;
    }
  }
   
  return false;
}

/*
//code taken from "An Efﬁcient and Robust Ray–Box Intersection Algorithm" 
//by Amy Williams, Steve Barrus, R. Keith Morley, Peter Shirley
//The 2 bound points = the minimum and maximum corner points of the box. 
//E.g., for a box centered at 0,0,0 with sides of length 2
//the min point is (-1,-1,-1) and the max is (1,1,1).
//if there is a hit, then hitPt contains the intersection.
//we actually want to use this to get a cube map texture pt, so there is more to do...
bool Cube::Intersect(const vec3 bounds[2], const Ray &r, float t0, float t1, vec3 &hitPt) const {
  float tmin, tmax, tymin, tymax, tzmin, tzmax;
  
  float divx = 1 / r.direction.x;
  if (divx >= 0) {
    tmin = (bounds[0].x - r.origin.x) * divx;
    tmax = (bounds[1].x - r.origin.x) * divx;
  }
  else {
    tmin = (bounds[1].x - r.origin.x) * divx;
    tmax = (bounds[0].x - r.origin.x) * divx;
  }
  
  float divy = 1 / r.direction.y;
  if (divy >= 0) {
    tmin = (bounds[0].y - r.origin.y) * divy;
    tmax = (bounds[1].y - r.origin.y) * divy;
  }
  else {
    tmin = (bounds[1].y - r.origin.y) * divy;
    tmax = (bounds[0].y - r.origin.y) * divy;
  }
 
  
  
  if ( (tmin > tymax) || (tymin > tmax) ) {
     printf("ray missed BOX!\n");
    return false;
  }
  
  if (tymin > tmin)
    tmin = tymin;
  if (tymax < tmax)
    tmax = tymax;
  
  float divz = 1 / r.direction.z;
  if (divz >= 0) {
    tmin = (bounds[0].z - r.origin.z) * divz;
    tmax = (bounds[1].z - r.origin.z) * divz;
  }
  else {
    tmin = (bounds[1].z - r.origin.z) * divz;
    tmax = (bounds[0].z - r.origin.z) * divz;
  }

  if ( (tmin > tzmax) || (tzmin > tmax) ) {
    return false;
  }
  if (tzmin > tmin) {
    tmin = tzmin;
  }
  if (tzmax < tmax) {
    tmax = tzmax;
  }
  
  bool hit = (tmin < t1) && (tmax > t0);
  
  if (hit) {
   printf("tmin / tmax = %f %f\n", tmin, tmax);
   
    vec3 hitPtMax = r.origin + (r.direction * tmax); 
    hitPtMax.Print();
    vec3 hitPtMin = r.origin + (r.direction * tmin); 
    hitPtMin.Print();
    
    if (tmin < 0.0) {
      //we must be inside the box, so use tmax
      vec3 hitPtMax = r.origin + (r.direction * tmax); 
      hitPtMax.Print();
      hitPt = hitPtMax;
      return true;
    } else {
      vec3 hitPtMin = r.origin + (r.direction * tmin); 
      hitPtMin.Print();
      hitPt = hitPtMin;
      return true;
    }   
      
  }
 
  return false;
  
}
*/

void Cube::Transform() {
  
  Camera* cam = Renderer::GetRenderer()->GetCamera();
//  printf("address of camera mv = %p\n", &modelview);
  mat4 mv = mat4(cam->GetModelView()); //mat4::Translate(cam.translate));
  //printf("address of mv = %p\n", &mv);
  mv = mat4::Translate(mv, GetTranslate());

  //  printf("prescale...\n");
 // mv.Print();

  mv = mat4::Scale(mv, GetScale());
  mv.Print();
  SetModelView(mv);
  SetIsTransformed(false);
  
}





/*
 float radius = 1.0;
 int sides    = 6;
 int trianglesPerSide  = 2;
 int pointsPerTriangle = 3;
 int xyz = 3;
 int st  = 2;
 cubeVertices = (GLfloat*) malloc((sides * trianglesPerSide * pointsPerTriangle * (xyz+st)) * sizeof(GLfloat));
 
 int idx = 0;
 //top
 cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = radius;
 cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; 
 
 cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius;
 cubeVertices[idx++] = radius; cubeVertices[idx++] = 0.0; 
 
 cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius;
 cubeVertices[idx++] = 0.0; cubeVertices[idx++] = 0.0; 
 
 cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = radius;
 cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; 
 
 cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius;
 cubeVertices[idx++] = 0.0; cubeVertices[idx++] = 0.0; 
 
 cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = radius;
 cubeVertices[idx++] = 0.0; cubeVertices[idx++] = radius; 
 
 
 //bottom
 cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius;
 cubeVertices[idx++] = 0.0; cubeVertices[idx++] = 0.0; 
 
 cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius;
 cubeVertices[idx++] = radius; cubeVertices[idx++] = 0.0; 
 
 cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius;
 cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; 
 
 cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius;
 cubeVertices[idx++] = 0.0; cubeVertices[idx++] = radius; 
 
 cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius;
 cubeVertices[idx++] = 0.0; cubeVertices[idx++] = 0.0; 
 
 cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius;
 cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; 
 
 
 //left
 cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = radius;
 cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; 
 
 cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius;
 cubeVertices[idx++] = radius; cubeVertices[idx++] = 0.0; 
 
 cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius;
 cubeVertices[idx++] = 0.0; cubeVertices[idx++] = 0.0; 
 
 cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = radius;
 cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; 
 
 cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius;
 cubeVertices[idx++] = 0.0; cubeVertices[idx++] = 0.0; 
 
 cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius;
 cubeVertices[idx++] = 0.0; cubeVertices[idx++] = radius; 
 
 //right
 cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius;
 cubeVertices[idx++] = 0.0; cubeVertices[idx++] = 0.0; 
 
 cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius;
 cubeVertices[idx++] = radius; cubeVertices[idx++] = 0.0; 
 
 cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = radius;
 cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; 
 
 cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = radius;
 cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; 
 
 cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius;
 cubeVertices[idx++] = 0.0; cubeVertices[idx++] = radius; 
 
 cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius;
 cubeVertices[idx++] = 0.0; cubeVertices[idx++] = 0.0; 
 
 
 
 //front
 cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius;
 cubeVertices[idx++] = radius; cubeVertices[idx++] = 0.0; 
 
 cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = radius;
 cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; 
 
 cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = radius;
 cubeVertices[idx++] = 0.0; cubeVertices[idx++] = radius; 
 
 cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = radius;
 cubeVertices[idx++] = 0.0; cubeVertices[idx++] = radius; 
 
 cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius;
 cubeVertices[idx++] = 0.0; cubeVertices[idx++] = 0.0; 
 
 cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius;
 cubeVertices[idx++] = radius; cubeVertices[idx++] = 0.0; 
 
 
 
 //back
 cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius;
 cubeVertices[idx++] = radius; cubeVertices[idx++] = 0.0; 
 
 cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius;
 cubeVertices[idx++] = 0.0; cubeVertices[idx++] = 0.0; 
 
 cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius;
 cubeVertices[idx++] = 0.0; cubeVertices[idx++] = radius; 
 
 cubeVertices[idx++] = -radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius;
 cubeVertices[idx++] = 0.0; cubeVertices[idx++] = radius; 
 
 cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius;
 cubeVertices[idx++] = radius; cubeVertices[idx++] = radius; 
 
 cubeVertices[idx++] = radius; cubeVertices[idx++] = -radius; cubeVertices[idx++] = -radius;
 cubeVertices[idx++] = radius; cubeVertices[idx++] = 0.0; 
 */



