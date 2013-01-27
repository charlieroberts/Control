
#include "Vector.hpp"
#include "Matrix.hpp"
#include "Geom.hpp"
#include <vector>

#ifndef RECTANGLE_H
#define RECTANGLE_H


class Rectangle : public Geom { 
  
public:
  Rectangle();
  Rectangle(vec3 translate, float width, float height);

  float GetWidth();
  float GetHeight();
  void SetWidth(float _w);
  void SetHeight(float _h);
  void SetSize(float _w, float _h);
  //string String();
  
  //from Geom
  virtual bool ContainsWindowPoint(ivec2 windowPt);
 // virtual void Draw();
  
  //from ModelView
  virtual void Transform();
  
  //from Mesh
  virtual void GenerateLineIndices();
  virtual void GenerateTriangleIndices();
  virtual int GetVertexCount() ;
  virtual int GetLineIndexCount() ;
  virtual int GetTriangleIndexCount() ;
  
protected:
  float width;
  float height;

  
private:

    void GenerateVertices() ;
  
};



#endif
