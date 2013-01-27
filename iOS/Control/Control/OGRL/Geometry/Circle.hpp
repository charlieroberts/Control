#include "Vector.hpp"
#include "Matrix.hpp"
#include "Geom.hpp"
#include <vector>


#ifndef OpenGLRenderLibraryNS_Circle_hpp
#define OpenGLRenderLibraryNS_Circle_hpp







class Circle : public Geom { 
  
public:
  Circle();
  Circle(vec3 translate, float width, float height);
  
  //from ModelView
  virtual void Transform();
  
  //from Mesh
  virtual void GenerateLineIndices();
  virtual void GenerateTriangleIndices();
  virtual int GetVertexCount() ;
  virtual int GetLineIndexCount() ;
  virtual int GetTriangleIndexCount() ;
  
  string String();
  int resolution;
  
private:
  
  void GenerateVertices() ;
  
};



#endif


