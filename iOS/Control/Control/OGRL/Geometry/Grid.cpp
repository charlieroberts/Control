
#include "Grid.hpp"
#include "Renderer.hpp"
#include "Camera.hpp"

Grid::Grid(vec3 _translate, float _w, float _h, int _cs, int _rs) {
  printf("in Rectangle(vec3, float) constructor\n");
  SetTranslate(_translate);
  width = _w;
  height = _h;
  rows = _rs;
  cols = _cs;
  
  colInc = (float)width / (float)cols;
  rowInc = (float)height / (float)rows;
  
  colTexInc = 1.0/(float)cols;
  rowTexInc = 1.0/(float)rows;
  
  
  GenerateVertices();
  GenerateLineIndices();
  GenerateTriangleIndices();
  
  SetIsTransformed(true);
  //CalculateModelView();
}

int Grid::GetVertexCount()  {    
  return 4 * cols * rows;
}

int Grid::GetLineIndexCount() {
  return 8 * cols * rows; //4 line segments, each with 2 points 
}

int Grid::GetTriangleIndexCount() {
  return 6 * cols * rows; //2 triangles, each having 3 points 
}



void Grid::GenerateVertices() {
  
  int floatsPerVertex = 5; //3 for vertex, 3 for normal, 2 for tc
  vertices.resize(GetVertexCount() * floatsPerVertex);
  float* rectVertices = &vertices[0];
  
  int idx = 0;
  
  
    for (int c = 0; c < cols; c++) {
     for (int r = 0; r < rows; r++) {
           
      rectVertices[idx++] = colInc * c; rectVertices[idx++] = rowInc * r; rectVertices[idx++] = 0.0;
      //rectVertices[idx++] = 0.0; rectVertices[idx++] = 0.0; rectVertices[idx++] = 1.0;
      //rectVertices[idx++] = 0.0; rectVertices[idx++] = 0.0;
      rectVertices[idx++] = colTexInc * c; rectVertices[idx++] = rowTexInc * (r);
      
      rectVertices[idx++] = colInc * c; rectVertices[idx++] = rowInc * (r+1); rectVertices[idx++] = 0.0;
      //rectVertices[idx++] = 0.0; rectVertices[idx++] = 0.0; rectVertices[idx++] = 1.0;
      //rectVertices[idx++] = 0.0; rectVertices[idx++] = 1.0;
      rectVertices[idx++] = colTexInc * c; rectVertices[idx++] = rowTexInc * (r+1);
      
      rectVertices[idx++] = colInc * (c+1); rectVertices[idx++] = rowInc * r; rectVertices[idx++] = 0.0;
      //rectVertices[idx++] = 0.0; rectVertices[idx++] = 0.0; rectVertices[idx++] = 1.0;
      //rectVertices[idx++] = 1.0; rectVertices[idx++] = 0.0;
      rectVertices[idx++] = colTexInc * (c + 1); rectVertices[idx++] = rowTexInc * (r);
      
      rectVertices[idx++] = colInc * (c+1); rectVertices[idx++] = rowInc * (r+1); rectVertices[idx++] = 0.0;
      //rectVertices[idx++] = 0.0; rectVertices[idx++] = 0.0; rectVertices[idx++] = 1.0;
      //rectVertices[idx++] = 1.0; rectVertices[idx++] = 1.0;
      rectVertices[idx++] = colTexInc * (c + 1); rectVertices[idx++] = rowTexInc * (r+1);
    }
  }
}

void Grid::GenerateLineIndices() {
  
  lineIndices.resize(GetLineIndexCount());
  vector<unsigned short>::iterator index = lineIndices.begin();
  
  int baseIdx = 0;
  for (int i = 0; i < cols * rows; i++) {
    
    *index++ = baseIdx + 0;
    *index++ = baseIdx + 1;
    *index++ = baseIdx + 1;
    *index++ = baseIdx + 2;
    *index++ = baseIdx + 2;
    *index++ = baseIdx + 3; 
    *index++ = baseIdx + 3;
    *index++ = baseIdx + 0;
    
    baseIdx += 4;
    
  }
  
}

void Grid::GenerateTriangleIndices() {
  
  triangleIndices.resize(GetTriangleIndexCount());
  vector<unsigned short>::iterator index = triangleIndices.begin();
  
  int baseIdx = 0;
  for (int i = 0; i < cols * rows; i++) {
//  for (int c = 0; c < cols; c++) {
//    for (int r = 0; r < rows; r++) {  
    
    *index++ = baseIdx + 0;
    *index++ = baseIdx + 1;
    *index++ = baseIdx + 2;
    *index++ = baseIdx + 2;
    *index++ = baseIdx + 1;
    *index++ = baseIdx + 3;
    
    baseIdx += 4;
  }
//  }
  
}



void Grid::Transform() {
  
  Camera* cam = Renderer::GetRenderer()->GetCamera();
  //Camera* cam = ApplicationHandler::GetApplicationHandler()->GetCamera();
  mat4 mv = mat4(cam->GetModelView()); 
  mv = mat4::Translate(mv, GetTranslate());
  //mv = mat4::Scale(mv, GetScale());
  //mv = mat4::Scale(mv, -1);
  SetModelView(mv);
  SetIsTransformed(false);
  
}




