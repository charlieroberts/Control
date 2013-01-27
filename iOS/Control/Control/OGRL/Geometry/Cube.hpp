
#include "Vector.hpp"
#include "Matrix.hpp"

#include "Mesh.hpp"
#include "ModelView.hpp"
//#include "Camera.hpp"
#include "Ray.hpp"
#include "Geom.hpp"
//#include "ApplicationHandler.hpp"

#include <vector>

#ifndef CUBE_H
#define CUBE_H

class Cube : public Geom {
  
public:
  Cube();
  Cube(vec3 translate, float scale);
  
  //from ModelView
  virtual void Transform();
  
  //from Mesh
  virtual void GenerateLineIndices();
  virtual void GenerateTriangleIndices();
  virtual int GetVertexCount() ;
  virtual int GetLineIndexCount() ;
  virtual int GetTriangleIndexCount() ;
  
  string String();
  
  bool Intersect(Ray &theRay, int &hit, vec3 &hitPt, vec2 &hitTexCoords);
  //int Intersect(const vec3 bounds[2], const Ray &r, float t0, float t1, vec3 &hitPt) const;
  
//  void SetColor(vec3 color);
//  vec3 GetColor();
  
  bool IsPointOnFace(vec2 pt);
  bool isReflective;
private:
  vec3 color;
  void GenerateVertices() ;

//  ivec2 divisions;
//  vec2 upperBound;
//  vec2 textureCount;
//  ivec2 slices;
//  vec2 ComputeDomain(float x, float y) ;
//  void GenerateVertices() ;
//  vec3 Evaluate(const vec2& domain) ;
  
};

#endif
