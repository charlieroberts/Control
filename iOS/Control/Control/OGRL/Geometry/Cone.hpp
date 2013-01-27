
#include "Vector.hpp"
#include "Matrix.hpp"

#include "Geom.hpp"
//#include "ModelView.hpp"


#include <vector>

//enum VertexFlags {
//  VertexFlagsNormals = 1 << 0,
//  VertexFlagsTexCoords = 1 << 1,
//};

#ifndef Cone_H
#define Cone_H

class Cone : public Geom {
  
public:
  Cone();
  Cone(vec3 translate, float scale);
  
  //from ModelView
  virtual void Transform();
  
  //from Mesh
  virtual void GenerateLineIndices();
  virtual void GenerateTriangleIndices();
  virtual int GetVertexCount() ;
  virtual int GetLineIndexCount() ;
  virtual int GetTriangleIndexCount() ;
  
  string String();
 
  void SetColor(vec3 color);
  vec3 GetColor(); 
  bool isReflective;

private:
  vec3 color;
  ivec2 divisions;
  vec2 upperBound;
  vec2 textureCount;
  ivec2 slices;
  vec2 ComputeDomain(float x, float y) ;
  void GenerateVertices() ;
  vec3 Evaluate(const vec2& domain) ;
  
};

#endif
