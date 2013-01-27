#pragma once
//#include "GLView.h"

#include <cmath>
#include <string>
#include <iostream>
#include <sstream>

using namespace std;

const float Pi = 4 * std::atan(1.0f);
const float TwoPi = 2 * Pi;

template <typename T>
struct Vector2 {
  Vector2() {}
  Vector2(T x, T y) : x(x), y(y) {}
  T Dot(const Vector2& v) const
  {
    return x * v.x + y * v.y;
  }
  Vector2 operator+(const Vector2& v) const
  {
    return Vector2(x + v.x, y + v.y);
  }
  Vector2 operator-(const Vector2& v) const
  {
    return Vector2(x - v.x, y - v.y);
  }
  Vector2 operator/(float s) const
  {
    return Vector2(x / s, y / s);
  }
  Vector2 operator*(float s) const
  {
    return Vector2(x * s, y * s);
  }
  void Normalize() {
    float s = 1.0f / Length();
    x *= s;
    y *= s;
  }
  
  string String() const {
    
    ostringstream ss;
    ss << "" << x << "/" << y;
    return ss.str();
    
  }
  
  
  void Print(string str) const {
    cout << str << " " << String() << "\n";
  }

  void Print() const {
    cout << String() << "\n";
  }

  
  Vector2 Normalized() const {
    Vector2 v = *this;
    v.Normalize();
    return v;
  }
  T LengthSquared() const
  {
    return x * x + y * y;
  }
  T Length() const
  {
    return sqrt(LengthSquared());
  }
  operator Vector2<float>() const
  {
    return Vector2<float>(x, y);
  }
  bool operator==(const Vector2& v) const
  {
    return x == v.x && y == v.y;
  }
  Vector2 Lerp(float t, const Vector2& v) const
  {
    return Vector2(x * (1 - t) + v.x * t,
                   y * (1 - t) + v.y * t);
  }
  template <typename P>
  P* Write(P* pData)
  {
    Vector2* pVector = (Vector2*) pData;
    *pVector++ = *this;
    return (P*) pVector;
  }
  T x;
  T y;
};

template <typename T>
struct Vector3 {
  Vector3() {}
  Vector3(T x, T y, T z) : x(x), y(y), z(z) {}
  void Normalize()
  {
    float s = 1.0f / std::sqrt(x * x + y * y + z * z);
    x *= s;
    y *= s;
    z *= s;
  }
  Vector3 Normalized() const {
    Vector3 v = *this;
    v.Normalize();
    return v;
  }
  
  Vector3 Cross(const Vector3& v) const {
    return Vector3(y * v.z - z * v.y,
                   z * v.x - x * v.z,
                   x * v.y - y * v.x);
  }
  
  float operator%(const Vector3& v) const {
    return Dot(v);
  }
  
  static float Dot(const Vector3& v1, const Vector3& v2) {
    return v1.Dot(v2);
  }
  
  static Vector3<T> Cross(const Vector3<T>& v1, const Vector3<T>& v2) {
    return v1.Cross(v2);
  }
  
  T Dot(const Vector3& v) const {
    return x * v.x + y * v.y + z * v.z;
  }
  
  
  
  Vector3 operator+(const Vector3& v) const {
    return Vector3(x + v.x, y + v.y,  z + v.z);
  }
  
  Vector3 operator+(const float v) const {
    return Vector3(x,y,z) + Vector3(v,v,v);
  }
  
  void operator+=(const Vector3& v)
  {
    x += v.x;
    y += v.y;
    z += v.z;
  }
  
  void operator-=(const Vector3& v) {
    x -= v.x;
    y -= v.y;
    z -= v.z;
  }
  
  void operator/=(T s) {
    x /= s;
    y /= s;
    z /= s;
  }
  
  void operator*=(T s) {
    x *= s;
    y *= s;
    z *= s;
  }
  
  Vector3 operator-(const Vector3& v) const {
    return Vector3(x - v.x, y - v.y,  z - v.z);
  }
  
  Vector3 operator-(const float v) const {
    return Vector3(x,y,z) - Vector3(v,v,v);
  }
  
  Vector3 operator-() const {
    //return Vector3(-x, -y, -z);
    return Vector3(x, y, z) * -1.0;
  }
  
  Vector3 operator*(T s) const {
    return Vector3(x * s, y * s, z * s);
  }
  
  Vector3 operator/(T s) const {
    //return Vector3(x / s, y / s, z / s);
    return Vector3(x, y, z) * (1.0/s);    
  }
  
  bool operator==(const Vector3& v) const
  {
    return x == v.x && y == v.y && z == v.z;
  }
  Vector3 Lerp(float t, const Vector3& v) const
  {
    return Vector3(x * (1 - t) + v.x * t,
                   y * (1 - t) + v.y * t,
                   z * (1 - t) + v.z * t);
  }
  
  
  static float Distance(const Vector3& v1, const Vector3& v2) {
    return sqrt( pow(v1.x - v2.x, 2) + pow(v1.y - v2.y, 2) + pow(v1.z - v2.z, 2)); 
  }

  
  T LengthSquared() const
  {
    return x * x + y * y + z * z;
  }
  T Length() const
  {
    return sqrt(LengthSquared());
  }

  string String() const {
    
    ostringstream ss;
    ss << "" << x << "/" << y << "/" << z;
    return ss.str();
    
  }
  
  void Print(string str) const {
    cout << str << " " << String() << "\n";
  }

  void Print() const {
    cout << String() << "\n";
  }
  
  const T* Pointer() const
  {
    return &x;
  }
  template <typename P>
  P* Write(P* pData)
  {
    Vector3<T>* pVector = (Vector3<T>*) pData;
    *pVector++ = *this;
    return (P*) pVector;
  }
  T x;
  T y;
  T z;
};

template <typename T>
struct Vector4 {
  Vector4() {}
  Vector4(T x, T y, T z, T w) : x(x), y(y), z(z), w(w) {}
  Vector4(T x) : x(x), y(x), z(x), w(x) {}
  Vector4(T x, T w) : x(x), y(x), z(x), w(w) {}
  
  T Dot(const Vector4& v) const
  {
    return x * v.x + y * v.y + z * v.z + w * v.w;
  }
  Vector4 Lerp(float t, const Vector4& v) const
  {
    return Vector4(x * (1 - t) + v.x * t,
                   y * (1 - t) + v.y * t,
                   z * (1 - t) + v.z * t,
                   w * (1 - t) + v.w * t);
  }
  
  
  Vector4 operator*(T s) const {
    return Vector4(x * s, y * s, z * s, w * s);
  }
  
  Vector4 operator/(T s) const {
    //return Vector3(x / s, y / s, z / s);
    return Vector4(x, y, z, w) * (1.0/s);    
  }
  
  static bool isEqual(const Vector4<T>& v1, const Vector4<T>& v2) {
    if (v1.x == v2.x && v1.y == v2.y && v1.z == v2.z && v1.w == v2.w) {
      return true;
    }
    return false;
  }

  const T* Pointer() const
  {
    return &x;
  }
  
  string String() const {
    
    ostringstream ss;
    ss << "" << x << "/" << y << "/" << z << "/" << w;
    return ss.str();
    
  }
  void Print(string str) const {
    cout << str << " " << String() << "\n";
  }

  void Print() const {
    cout << String() << "\n";
  }

  T x;
  T y;
  T z;
  T w;
};

typedef Vector2<bool> bvec2;

typedef Vector2<int> ivec2;
typedef Vector3<int> ivec3;
typedef Vector4<int> ivec4;

typedef Vector2<float> vec2;
typedef Vector3<float> vec3;
typedef Vector4<float> vec4;


