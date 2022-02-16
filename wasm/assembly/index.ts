// The entry file of your WebAssembly module.

export function add(a: i32, b: i32): i32 {
  return a + b;
}

export function sum(arr: Int32Array): i32 {
  let sum = 0;
  for (let i = 0, k = arr.length; i < k; ++i) {
    sum += unchecked(arr[i]);
  }
  return sum;
}
export const Int32Array_ID = idof<Int32Array>();

export function returnArr(arr: Int32Array): Int32Array {
  return arr;
}
