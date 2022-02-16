import loader from '@assemblyscript/loader';

loader.instantiate(fetch('./build/optimized.wasm'), {}).then(({ exports }) => {
  const { sum, Int32Array_ID, returnArr } = exports;
  const { __newArray, __getArray, __getArrayView, __pin, __unpin } = exports;

  const array = __pin(__newArray(Int32Array_ID, [1, 2, 3]));

  const result = returnArr(array);
  const getArrayRes = __getArray(result);

  console.log(getArrayRes);

  __unpin(array);
});
