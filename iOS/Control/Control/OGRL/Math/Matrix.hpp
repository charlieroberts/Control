#pragma once
//#include "GLView.h"

#include "Vector.hpp"
//#include <iostream>

using namespace std;

#define radians(x) (x * M_PI / 180.0f)
#define degrees(x) (180.0 * x / M_PI)

template <typename T>
struct Matrix2 {
  Matrix2()
  {
    x.x = 1; x.y = 0;
    y.x = 0; y.y = 1;
  }
  Matrix2(const T* m)
  {
    x.x = m[0]; x.y = m[1];
    y.x = m[2]; y.y = m[3];
  }
  vec2 x;
  vec2 y;
};

template <typename T>
struct Matrix3 {
  Matrix3() {
    x.x = 1; x.y = 0; x.z = 0;
    y.x = 0; y.y = 1; y.z = 0;
    z.x = 0; z.y = 0; z.z = 1;
  }
  Matrix3(const T* m) {
    x.x = m[0]; x.y = m[1]; x.z = m[2];
    y.x = m[3]; y.y = m[4]; y.z = m[5];
    z.x = m[6]; z.y = m[7]; z.z = m[8];
  }
  
  Matrix3 Transposed() const {
    Matrix3 m;
    m.x.x = x.x; m.x.y = y.x; m.x.z = z.x;
    m.y.x = x.y; m.y.y = y.y; m.y.z = z.y;
    m.z.x = x.z; m.z.y = y.z; m.z.z = z.z;
    return m;
  }
  
  const T* Pointer() const {
    return &x.x;
  }
  vec3 x;
  vec3 y;
  vec3 z;
};

template <typename T>
struct Matrix4 {
  Matrix4() {
    x.x = 1; x.y = 0; x.z = 0; x.w = 0;
    y.x = 0; y.y = 1; y.z = 0; y.w = 0;
    z.x = 0; z.y = 0; z.z = 1; z.w = 0;
    w.x = 0; w.y = 0; w.z = 0; w.w = 1;
  }
  Matrix4(const Matrix4<T>& m) {
    x.x = m.x.x; x.y = m.x.y; x.z = m.x.z; x.w = m.x.w;
    y.x = m.y.x; y.y = m.y.y; y.z = m.y.z; y.w = m.y.w;
    z.x = m.z.x; z.y = m.z.y; z.z = m.z.z; z.w = m.z.w;
    w.x = m.w.x; w.y = m.w.y; w.z = m.w.z; w.w = m.w.w;
  }

  Matrix4(const Matrix3<T>& m) {
    x.x = m.x.x; x.y = m.x.y; x.z = m.x.z; x.w = 0;
    y.x = m.y.x; y.y = m.y.y; y.z = m.y.z; y.w = 0;
    z.x = m.z.x; z.y = m.z.y; z.z = m.z.z; z.w = 0;
    w.x = 0; w.y = 0; w.z = 0; w.w = 1;
  }
  Matrix4(const T* m) {
    x.x = m[0];  x.y = m[1];  x.z = m[2];  x.w = m[3];
    y.x = m[4];  y.y = m[5];  y.z = m[6];  y.w = m[7];
    z.x = m[8];  z.y = m[9];  z.z = m[10]; z.w = m[11];
    w.x = m[12]; w.y = m[13]; w.z = m[14]; w.w = m[15];
  }
 
  
  Matrix4 operator * (const Matrix4& b) const {
    Matrix4 m;
    m.x.x = x.x * b.x.x + x.y * b.y.x + x.z * b.z.x + x.w * b.w.x;
    m.x.y = x.x * b.x.y + x.y * b.y.y + x.z * b.z.y + x.w * b.w.y;
    m.x.z = x.x * b.x.z + x.y * b.y.z + x.z * b.z.z + x.w * b.w.z;
    m.x.w = x.x * b.x.w + x.y * b.y.w + x.z * b.z.w + x.w * b.w.w;
    m.y.x = y.x * b.x.x + y.y * b.y.x + y.z * b.z.x + y.w * b.w.x;
    m.y.y = y.x * b.x.y + y.y * b.y.y + y.z * b.z.y + y.w * b.w.y;
    m.y.z = y.x * b.x.z + y.y * b.y.z + y.z * b.z.z + y.w * b.w.z;
    m.y.w = y.x * b.x.w + y.y * b.y.w + y.z * b.z.w + y.w * b.w.w;
    m.z.x = z.x * b.x.x + z.y * b.y.x + z.z * b.z.x + z.w * b.w.x;
    m.z.y = z.x * b.x.y + z.y * b.y.y + z.z * b.z.y + z.w * b.w.y;
    m.z.z = z.x * b.x.z + z.y * b.y.z + z.z * b.z.z + z.w * b.w.z;
    m.z.w = z.x * b.x.w + z.y * b.y.w + z.z * b.z.w + z.w * b.w.w;
    m.w.x = w.x * b.x.x + w.y * b.y.x + w.z * b.z.x + w.w * b.w.x;
    m.w.y = w.x * b.x.y + w.y * b.y.y + w.z * b.z.y + w.w * b.w.y;
    m.w.z = w.x * b.x.z + w.y * b.y.z + w.z * b.z.z + w.w * b.w.z;
    m.w.w = w.x * b.x.w + w.y * b.y.w + w.z * b.z.w + w.w * b.w.w;
    return m;
  }
  
  Vector3<T> operator * (const Vector3<T>& b) const {
 //   vec4 v4 = multiplyMatrixByVector(A, vec4(v3.x, v3.y, v3.z, 1.0));
    
    Vector4<T> v;
    v.x = x.x * b.x + y.x * b.y + z.x * b.z + w.x * 1.0;
    v.y = x.y * b.x + y.y * b.y + z.y * b.z + w.y * 1.0;
    v.z = x.z * b.x + y.z * b.y + z.z * b.z + w.z * 1.0;
    v.w = x.w * b.x + y.w * b.y + z.w * b.z + w.w * 1.0;
    return vec3(v.x, v.y, v.z);

    
   // Vector4<T> v4 = this*vec4(b.x, b.y, b.z, 1.0);
   
    /*
    vec4 product;
    
    product.x = (A.x.x * vec.x) + (A.y.x * vec.y) + (A.z.x * vec.z) + (A.w.x * vec.w);
    product.y = (A.x.y * vec.x) + (A.y.y * vec.y) + (A.z.y * vec.z) + (A.w.y * vec.w);
    product.z = (A.x.z * vec.x) + (A.y.z * vec.y) + (A.z.z * vec.z) + (A.w.z * vec.w);
    product.w = (A.x.w * vec.x) + (A.y.w * vec.y) + (A.z.w * vec.z) + (A.w.w * vec.w);
    
    
    */
   // return vec3(v4.x, v4.y, v4.z);
  }
  
  Vector4<T> operator * (const Vector4<T>& b) const {
//    Vector4<T> v;
//    v.x = x.x * b.x + x.y * b.y + x.z * b.z + x.w * b.w;
//    v.y = y.x * b.x + y.y * b.y + y.z * b.z + y.w * b.w;
//    v.z = z.x * b.x + z.y * b.y + z.z * b.z + z.w * b.w;
//    v.w = w.x * b.x + w.y * b.y + w.z * b.z + w.w * b.w;
//    return v;
    
    Vector4<T> v;
    v.x = x.x * b.x + y.x * b.y + z.x * b.z + w.x * b.w;
    v.y = x.y * b.x + y.y * b.y + z.y * b.z + w.y * b.w;
    v.z = x.z * b.x + y.z * b.y + z.z * b.z + w.z * b.w;
    v.w = x.w * b.x + y.w * b.y + z.w * b.z + w.w * b.w;
    return v;
    
    /*
    vec4 product;
    
    product.x = (A.x.x * vec.x) + (A.y.x * vec.y) + (A.z.x * vec.z) + (A.w.x * vec.w);
    product.y = (A.x.y * vec.x) + (A.y.y * vec.y) + (A.z.y * vec.z) + (A.w.y * vec.w);
    product.z = (A.x.z * vec.x) + (A.y.z * vec.y) + (A.z.z * vec.z) + (A.w.z * vec.w);
    product.w = (A.x.w * vec.x) + (A.y.w * vec.y) + (A.z.w * vec.z) + (A.w.w * vec.w);
    
    return product;
     */
  }

  Matrix4& operator *= (const Matrix4& b) {
    Matrix4 m = *this * b;
    return (*this = m);
  }
  Matrix4 Transposed() const {
    Matrix4 m;
    m.x.x = x.x; m.x.y = y.x; m.x.z = z.x; m.x.w = w.x;
    m.y.x = x.y; m.y.y = y.y; m.y.z = z.y; m.y.w = w.y;
    m.z.x = x.z; m.z.y = y.z; m.z.z = z.z; m.z.w = w.z;
    m.w.x = x.w; m.w.y = y.w; m.w.z = z.w; m.w.w = w.w;
    return m;
  }
  
  void Print(string s) {
    cout << s << " \n";
    printf("\t%f %f %f %f\n", x.x, y.x, z.x, w.x);
    printf("\t%f %f %f %f\n", x.y, y.y, z.y, w.y);
    printf("\t%f %f %f %f\n", x.z, y.z, z.z, w.z);
    printf("\t%f %f %f %f\n\n", x.w, y.w, z.w, w.w);
  }
  
  void Print() {
    printf("%f %f %f %f\n", x.x, y.x, z.x, w.x);
    printf("%f %f %f %f\n", x.y, y.y, z.y, w.y);
    printf("%f %f %f %f\n", x.z, y.z, z.z, w.z);
    printf("%f %f %f %f\n\n", x.w, y.w, z.w, w.w);
  }
  
  Matrix3<T> ToMat3() const {
    Matrix3<T> m;
    m.x.x = x.x; m.y.x = y.x; m.z.x = z.x;
    m.x.y = x.y; m.y.y = y.y; m.z.y = z.y;
    m.x.z = x.z; m.y.z = y.z; m.z.z = z.z;
    return m;
  }
  
  const T* Pointer() const {
    return &x.x;
  }
  
  static Matrix4<T> Identity() {
    return Matrix4();
  }
  
  static Matrix4<T> Translate(vec3 vec) {
    return Translate(vec.x, vec.y, vec.z);
  }
    
  static Matrix4<T> Translate(T x, T y, T z) {
    Matrix4 m;
    m.w.x = x; m.w.y = y; m.w.z = z;
    return m;
  }
  
  static Matrix4<T> Translate(const Matrix4<T>& m, vec3 t) {
    return Translate(m, t.x, t.y, t.z);
  }
  
  static Matrix4<T> Translate(const Matrix4<T>& m, T x, T y, T z) {
    Matrix4 tm = Translate(x,y,z);
    return tm * m;
  }

  static Matrix4<T> TranslateX(const Matrix4<T>& m, T x) {
    Matrix4 tm = Translate(x,0,0);
    return tm * m;
  }

  static Matrix4<T> TranslateY(const Matrix4<T>& m, T y) {
    Matrix4 tm = Translate(0,y,0);
    return tm * m;
  }
  
  static Matrix4<T> TranslateZ(const Matrix4<T>& m, T z) {
    Matrix4 tm = Translate(0,0,z);
    return tm * m;
  }

  static Matrix4<T> Scale(const Matrix4<T>& m, float s) {
    return Scale(m, s, s, s);
  }
 
  static Matrix4<T> ScaleX(const Matrix4<T>& m, float x) {
    return Scale(m, x, 1, 1);
  }
  
  static Matrix4<T> ScaleY(const Matrix4<T>& m, float y) {
    return Scale(m, 1, y, 1);
  }
  static Matrix4<T> ScaleZ(const Matrix4<T>& m, float z) {
    return Scale(m, 1, 1, z);
  }
  
  static Matrix4<T> Scale(const Matrix4<T>& m, vec3 s) {
    return Scale(m, s.x, s.y, s.z);
  }
    
  static Matrix4<T> Scale(const Matrix4<T>& m, T x, T y, T z) {
    Matrix4 sm = Scale(x, y, z);
    Matrix4 um = m * sm;
    um.w.x = m.w.x;
    um.w.y = m.w.y;
    um.w.z = m.w.z;
    return um;
//    return m * sm;
  }
  
  static Matrix4<T> Scale(T sx, T sy, T sz) {
    Matrix4 m;
    m.x.x = sx; m.y.y = sy; m.z.z = sz; 
    return m;
  }

  static Matrix4<T> Scale(T s) {
    return Scale(s, s, s);
  }

  static Matrix4<T> Rotate(const Matrix4<T>& pm, float degrees, vec3 vec) {
    
    Matrix4 m = Rotate(degrees, vec);
    return m * pm;
  }
    
  
  static Matrix4<T> RotateX(const Matrix4<T>& pm, float degrees) {
    
    if (degrees == 0.0) {
      return pm;
    }
    
    float radians = radians(degrees);
    float s = std::sin(radians);
    float c = std::cos(radians);
    
    Matrix4 m;
    
    m.y.y = c; 
    m.y.z = -s; 
    m.z.y = s; 
    m.z.z = c; 
    
    return m * pm;
  }
  
  static Matrix4<T> RotateY(const Matrix4<T>& pm, float degrees) {
    
    if (degrees == 0.0) {
      return pm;
    }
    
   // float radians = degrees * M_PI / 180.0f;
    float radians = radians(degrees);
    
    float s = std::sin(radians);
    float c = std::cos(radians);
    
    Matrix4 m;
  
    m.x.x = c; 
    m.x.z = s; 
    
    m.z.x = -s; 
    m.z.z = c; 
    
    return m * pm;
  }
  
  static Matrix4<T> RotateZ(const Matrix4<T>& pm, float degrees) {
    
    if (degrees == 0.0) {
      return pm;
    }
    
    double radians = radians(degrees);
    
    //float radians = degrees * M_PI / 180.0f;
    float s = std::sin(radians);
    float c = std::cos(radians);
    
    Matrix4 m;
    
    m.x.x = c; 
    m.x.y = -s; 
    
    m.y.x = s; 
    m.y.y = c; 
    
    return m * pm;
  }
  
  
  
  static Matrix4<T> Rotate(float degrees, vec3 vec) {
    
    //make sure normalized
    vec3 v = vec.Normalized();
    
    float x = v.x;
    float y = v.y;
    float z = v.z;
    
    float radians = radians(degrees);
    
    float s = sin(radians);
    float c = cos(radians);
    
    Matrix4 m;
    
    m.x.x = (x*x)*(1-c)+c; 
    m.x.y = x*y * (1-c)-z*s; 
    m.x.z = x*z*(1-c)+y*s; 
    
    m.y.x = y*x * (1-c)+z*s; 
    m.y.y = (y*y)*(1-c)+c; 
    m.y.z = y*z * (1-c)-x*s; 
    
    m.z.x = x*z * (1-c)-y*s; 
    m.z.y = y*z * (1-c)+x*s; 
    m.z.z = (z*z) * (1-c)+c; 
    
    return m;
  }
    
  static Matrix4<T> Invert(const Matrix4<T>& m) {
    Matrix4 invOut;
    Matrix4 inv;
    
    inv.x.x = m.y.y * m.z.z * m.w.w - m.y.y * m.z.w * m.w.z - m.z.y * m.y.z * m.w.w + m.z.y * m.y.w * m.w.z + m.w.y * m.y.z * m.z.w - m.w.y * m.y.w * m.z.z;
    inv.y.x = -m.y.x * m.z.z * m.w.w + m.y.x * m.z.w * m.w.z + m.z.x * m.y.z * m.w.w - m.z.x * m.y.w * m.w.z - m.w.x * m.y.z * m.z.w + m.w.x * m.y.w * m.z.z;
    inv.z.x = m.y.x * m.z.y * m.w.w - m.y.x * m.z.w * m.w.y - m.z.x * m.y.y * m.w.w + m.z.x * m.y.w * m.w.y + m.w.x * m.y.y * m.z.w - m.w.x * m.y.w * m.z.y;
    inv.w.x = -m.y.x * m.z.y * m.w.z + m.y.x * m.z.z * m.w.y + m.z.x * m.y.y * m.w.z - m.z.x * m.y.z * m.w.y - m.w.x * m.y.y * m.z.z + m.w.x * m.y.z * m.z.y;
    inv.x.y = -m.x.y * m.z.z * m.w.w + m.x.y * m.z.w * m.w.z + m.z.y * m.x.z * m.w.w - m.z.y * m.x.w * m.w.z - m.w.y * m.x.z * m.z.w + m.w.y * m.x.w * m.z.z;
    inv.y.y = m.x.x * m.z.z * m.w.w - m.x.x * m.z.w * m.w.z - m.z.x * m.x.z * m.w.w + m.z.x * m.x.w * m.w.z + m.w.x * m.x.z * m.z.w - m.w.x * m.x.w * m.z.z;
    inv.z.y = -m.x.x * m.z.y * m.w.w + m.x.x * m.z.w * m.w.y + m.z.x * m.x.y * m.w.w - m.z.x * m.x.w * m.w.y - m.w.x * m.x.y * m.z.w + m.w.x * m.x.w * m.z.y;
    inv.w.y = m.x.x * m.z.y * m.w.z - m.x.x * m.z.z * m.w.y - m.z.x * m.x.y * m.w.z + m.z.x * m.x.z * m.w.y + m.w.x * m.x.y * m.z.z - m.w.x * m.x.z * m.z.y;
    inv.x.z = m.x.y * m.y.z * m.w.w - m.x.y * m.y.w * m.w.z - m.y.y * m.x.z * m.w.w + m.y.y * m.x.w * m.w.z + m.w.y * m.x.z * m.y.w - m.w.y * m.x.w * m.y.z;
    inv.y.z = -m.x.x * m.y.z * m.w.w + m.x.x * m.y.w * m.w.z + m.y.x * m.x.z * m.w.w - m.y.x * m.x.w * m.w.z - m.w.x * m.x.z * m.y.w + m.w.x * m.x.w * m.y.z;
    inv.z.z = m.x.x * m.y.y * m.w.w - m.x.x * m.y.w * m.w.y - m.y.x * m.x.y * m.w.w + m.y.x * m.x.w * m.w.y + m.w.x * m.x.y * m.y.w - m.w.x * m.x.w * m.y.y;
    inv.w.z = -m.x.x * m.y.y * m.w.z + m.x.x * m.y.z * m.w.y + m.y.x * m.x.y * m.w.z - m.y.x * m.x.z * m.w.y - m.w.x * m.x.y * m.y.z + m.w.x * m.x.z * m.y.y;
    inv.x.w = -m.x.y * m.y.z * m.z.w + m.x.y * m.y.w * m.z.z + m.y.y * m.x.z * m.z.w - m.y.y * m.x.w * m.z.z - m.z.y * m.x.z * m.y.w + m.z.y * m.x.w * m.y.z;
    inv.y.w = m.x.x * m.y.z * m.z.w - m.x.x * m.y.w * m.z.z - m.y.x * m.x.z * m.z.w + m.y.x * m.x.w * m.z.z + m.z.x * m.x.z * m.y.w - m.z.x * m.x.w * m.y.z;
    inv.z.w = -m.x.x * m.y.y * m.z.w + m.x.x * m.y.w * m.z.y + m.y.x * m.x.y * m.z.w - m.y.x * m.x.w * m.z.y - m.z.x * m.x.y * m.y.w + m.z.x * m.x.w * m.y.y;
    inv.w.w = m.x.x * m.y.y * m.z.z - m.x.x * m.y.z * m.z.y - m.y.x * m.x.y * m.z.z + m.y.x * m.x.z * m.z.y + m.z.x * m.x.y * m.y.z - m.z.x * m.x.z * m.y.y;
    
    float det = 1.0 / (m.x.x * inv.x.x + m.x.y * inv.y.x + m.x.z * inv.z.x + m.x.w * inv.w.x);
    
    invOut.x.x = inv.x.x * det;
    invOut.x.y = inv.x.y * det;
    invOut.x.z = inv.x.z * det;
    invOut.x.w = inv.x.w * det;
    invOut.y.x = inv.y.x * det;
    invOut.y.y = inv.y.y * det;
    invOut.y.z = inv.y.z * det;
    invOut.y.w = inv.y.w * det;
    invOut.z.x = inv.z.x * det;
    invOut.z.y = inv.z.y * det;
    invOut.z.z = inv.z.z * det;
    invOut.z.w = inv.z.w * det;
    invOut.w.x = inv.w.x * det;
    invOut.w.y = inv.w.y * det;
    invOut.w.z = inv.w.z * det;
    invOut.w.w = inv.w.w * det;
    
    return invOut;
  }
  
  static vec3 WindowCoordsToDeviceCoords(vec3 pixels, ivec4 viewport) {
    float x, y, z;
    
    x = ((pixels.x - viewport.x)) / viewport.z;
    y = (( (viewport.w - pixels.y) - viewport.y)) / viewport.w;
    z = pixels.z;
    
    return vec3(x, y, z);
  }
  
  static vec4 DeviceCoordsToClipCoords(vec3 deviceCoords) {
    vec3 v = deviceCoords * 2 - 1;
    return vec4(v.x, v.y, v.z, 1.0);
  }
  
  static vec4 ClipCoordsToEyeCoords(vec4 clipVec, Matrix4 projection) {
    return multiplyMatrixByVector(Invert(projection), clipVec);
  }
  
  static vec4 EyeCoordsToObjectCoords(vec4 eyeVec, Matrix4 modelview) {
    return multiplyMatrixByVector(Invert(modelview), eyeVec);
  }
  
  static vec3 multiplyMatrixByVector(Matrix4 A, vec3 v3) {
    vec4 v4 = multiplyMatrixByVector(A, vec4(v3.x, v3.y, v3.z, 1.0));
    return vec3(v4.x, v4.y, v4.z);
  }
  
  static vec4 multiplyMatrixByVector(Matrix4 A, vec4 vec)
  {
    vec4 product;
    
    product.x = (A.x.x * vec.x) + (A.y.x * vec.y) + (A.z.x * vec.z) + (A.w.x * vec.w);
    product.y = (A.x.y * vec.x) + (A.y.y * vec.y) + (A.z.y * vec.z) + (A.w.y * vec.w);
    product.z = (A.x.z * vec.x) + (A.y.z * vec.y) + (A.z.z * vec.z) + (A.w.z * vec.w);
    product.w = (A.x.w * vec.x) + (A.y.w * vec.y) + (A.z.w * vec.z) + (A.w.w * vec.w);
    
    return product;
  }
  
  static vec3 NormalizeHomogeneousVector(vec4 vec) {
    return vec3( vec.x / vec.w, vec.y / vec.w, vec.z / vec.w);
  }
  
  static vec4 ObjectCoordsToEyeCoords(vec3 objVec, Matrix4 modelview) {
    return multiplyMatrixByVector(modelview, vec4(objVec.x, objVec.y, objVec.z, 1.0));
  }
  
  static vec4 EyeCoordsToClipCoords(vec4 eyeVec, Matrix4 projection) {
    return multiplyMatrixByVector(projection, eyeVec);
  }
  
  static vec3 ClipCoordsToDeviceCoords(vec4 clipVec) {
    return NormalizeHomogeneousVector(clipVec);
  }
  
  static vec3 DeviceCoordsToWindowCoords(vec3 deviceVec, ivec4 viewport)
  {
    
    //(x_ndc + 1)*width/2
    return vec3 (
      viewport.x + (((deviceVec.x + 1) * (viewport.z)) / 2),
      viewport.y + (((deviceVec.y + 1) * (viewport.w)) / 2),
      (deviceVec.z + 1.0) / 2.0
    );
  }
 
  
 /** 
  Example:
  float ObjDepth = mat4::GetDepth(myObj->translate, myCamera->modelview, myCamera->projection, myCamera->viewport);
  The modelview should the be the modelview of the PARENT of the object. (Which is the camera in our case).
 **/
 static float GetDepth(vec3 objectPt, Matrix4 modelview, Matrix4 projection, ivec4 viewport) {
      return Project(objectPt, modelview, projection, viewport).z;
 }
  
  
 /**
  Projects 3D object coordinates into 2D xy mouse coordinates, and also returns a z depth value.
  Example:
  vec3 mouse = mat4::Project(myObj->translate, myCamera->modelview, myCamera->projection, myCamera->viewport);
  The modelview should the be the modelview of the PARENT of the object. (Which is the camera in our case).
 **/
 static vec3 Project(vec3 objectPt, Matrix4 modelview, Matrix4 projection, ivec4 viewport) {
    vec4 eyeVec = ObjectCoordsToEyeCoords(objectPt, modelview);
    vec4 clipVec = EyeCoordsToClipCoords(eyeVec, projection);
    vec3 deviceVec = ClipCoordsToDeviceCoords(clipVec);
    vec3 windowVec = DeviceCoordsToWindowCoords(deviceVec, viewport);

    return windowVec;
  }
  
  //static vec3 Project(vec3 objectPt, Matrix4 modelview, Matrix4 projection, ivec4 viewport) {
    
  
  /**
   Unprojects 2D mouse coordinates into 3D object coordinates.
   Example:
   vec3 ObjIn3DCoords = mat4::Unproject(mouseX, mouseY, myObjDepth, myCamera->modelview, myCamera->projection, myCamera->viewport);
  
   You can get the object depth via the GetDepth method.
   The modelview should the be the modelview of the PARENT of the object. (Which is the camera in our case).
  **/
  static vec3 Unproject(float x, float y, float depth, Matrix4 modelview, Matrix4 projection, ivec4 viewport) {
    vec3 pixelPt = vec3(x,y,depth);
    vec3 deviceVec = WindowCoordsToDeviceCoords(pixelPt, viewport);
    vec4 clipVec = DeviceCoordsToClipCoords(deviceVec);
    vec4 eyeVec = ClipCoordsToEyeCoords(clipVec, projection);
    vec4 objectVec = EyeCoordsToObjectCoords(eyeVec, modelview);
    vec3 normalizedObjectVec = NormalizeHomogeneousVector(objectVec);
    return normalizedObjectVec;
  }
  
  //make orthographic projection from width + height,
  //similar to glOrtho(l,r,b,t,n,f);, where l = 0, r = w, b = 0, t = h, n = -1, f = 1
  static Matrix4<T> Ortho(float w, float h) {
    return Ortho(0,w,0,h);
  }
   
  //0->1 0->1
  static Matrix4<T> Ortho(float left, float right, float bottom, float top) {
    float nearval = -1.0;
    float farval = 1.0;
    
    float m[16];
    
    #define M(row,col)  m[col*4+row]
    M(0,0) = 2.0F / (right-left);
    M(0,1) = 0.0F;
    M(0,2) = 0.0F;
    M(0,3) = -(right+left) / (right-left);
    
    M(1,0) = 0.0F;
    M(1,1) = 2.0F / (top-bottom);
    M(1,2) = 0.0F;
    M(1,3) = -(top+bottom) / (top-bottom);
    
    M(2,0) = 0.0F;
    M(2,1) = 0.0F;
    M(2,2) = -2.0F / (farval-nearval);
    M(2,3) = -(farval+nearval) / (farval-nearval);
    
    M(3,0) = 0.0F;
    M(3,1) = 0.0F;
    M(3,2) = 0.0F;
    M(3,3) = 1.0F;
    #undef M

    Matrix4 ortho = Matrix4(m);
    //ortho = ortho.Transposed();
    ortho.Print("ortho matrix: ");
    return ortho;
  }
  
  static Matrix4<T> Perspective(T fovyInDegrees, T aspectRatio, T znear, T zfar) {
    float ymax = znear * tanf(fovyInDegrees * M_PI / 360.0);
    float xmax = ymax * aspectRatio;
    return Frustum(-xmax, xmax, -ymax, ymax, znear, zfar);
  }
  
  static Matrix4<T> Frustum(T left, T right, T bottom, T top, T near, T far) {
    T a = 2 * near / (right - left);
    T b = 2 * near / (top - bottom);
    T c = (right + left) / (right - left);
    T d = (top + bottom) / (top - bottom);
    T e = - (far + near) / (far - near);
    T f = -2 * far * near / (far - near);
    Matrix4 m;
    m.x.x = a; m.x.y = 0; m.x.z = 0; m.x.w = 0;
    m.y.x = 0; m.y.y = b; m.y.z = 0; m.y.w = 0;
    m.z.x = c; m.z.y = d; m.z.z = e; m.z.w = -1;
    m.w.x = 0; m.w.y = 0; m.w.z = f; m.w.w = 0;
    return m;
  }
  
  vec4 x;
  vec4 y;
  vec4 z;
  vec4 w;
};

typedef Matrix2<float> mat2;
typedef Matrix3<float> mat3;
typedef Matrix4<float> mat4;
typedef Matrix4<double> mat4d;


