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

// Экспорт типа массива
export const Int32Array_ID = idof<Int32Array>();

export function returnArr(arr: Int32Array): Int32Array {
  return arr;
}

// Создание пустого массива
export function getClearArray(canvasSize: i32): Int32Array {
  const length = canvasSize * canvasSize;
  return new Int32Array(length).fill(0);
}

// Преобразование в вектор
export function toImage(data: Int32Array, canvasSize: i32): Int32Array {
  const input = getClearArray(canvasSize);

  // Получение rgba одного пикселя
  function getPixel(imgData: Int32Array, index: i32): Int32Array {
    let i = index * 4;
    let d = imgData;
    let arr = new Int32Array(4);

    for (let x = 0; x < arr.length; x++) {
      arr[x] = d[i + x];
    }

    return arr; // массив [R,G,B,A]
  }

  for (let x = 0, indexInput = 0; x < canvasSize; x++) {
    for (let y = 0; y < canvasSize; y++, indexInput++) {
      let rgba = getPixel(data, y * canvasSize + x);
      if (!rgba.every((e) => e === 255)) {
        input[indexInput] = 1;
      }
    }
  }

  return input;
}

// Инициализация весов
export function InitWeight(canvasSize: i32): Float64Array {
  const weights = new Float64Array(canvasSize * canvasSize);

  for (let i = 0, arrLen = weights.length; i < arrLen; i++) {
    weights[i] = Math.round((Math.random() * (0.31 + 0.31) - 0.31) * 10) / 10; // [-0.3; 0.3]
    if (weights[i] === -0) weights[i] = 0;
  }

  return weights;
}
