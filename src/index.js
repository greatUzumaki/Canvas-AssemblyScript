import loader from '@assemblyscript/loader';
import './style.css';

// Подключение модуля Wasm
loader.instantiate(fetch('./build/optimized.wasm')).then(({ exports }) => {
  // Функции Wasm
  const {
    Int32Array_ID,
    Float64Array_ID,
    InitWeight,
    Predict,
    Correct,
    toImage,
  } = exports;
  const { __newArray, __getArray, __pin, __unpin } = exports;

  // Константы и настройки
  let isMouseDown = false;
  let weights = [];
  let pixels = [];
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  let currentColor = '#000000';
  const currentBg = 'white';
  const currentSize = 2;
  const canvasSize = 150; // поле
  let answer = null;
  let neuronSum = 0;

  // Кнопки
  const correct = document.getElementById('correct');
  const predictBtn = document.getElementById('predict');
  const initBtn = document.getElementById('init');

  const buttonControl = (enable) => {
    if (enable) {
      correct.disabled = false;
      predictBtn.disabled = false;
    } else {
      correct.disabled = true;
      predictBtn.disabled = true;
    }
  };

  // Создать поле
  createCanvas();

  // Ивенты
  document.getElementById('clear').addEventListener('click', createCanvas);

  document.getElementById('load').addEventListener('change', (e) => load(e));

  document
    .getElementById('save')
    .addEventListener('click', () => save(weights));

  document
    .getElementById('colorpicker')
    .addEventListener('change', function () {
      currentColor = this.value;
    });

  // Угадать
  const PredictFunc = () => {
    const data = ctx.getImageData(0, 0, canvasSize, canvasSize);
    const arr = Array.from(data.data);
    const pixelArr = __pin(__newArray(Int32Array_ID, arr));

    const vectors = __getArray(__pin(toImage(pixelArr, canvasSize)));
    pixels = vectors;

    const weightsArr = __pin(__newArray(Float64Array_ID, weights));

    const res = Predict(pixelArr, weightsArr, canvasSize);

    console.log('Сумма нейрона:');
    console.log(res);
    neuronSum = Number(res);

    if (neuronSum >= 0) {
      alert('Это крестик');
      answer = 1;
    } else {
      alert('Это круг');
      answer = 0;
    }

    __unpin(vectors);
    __unpin(pixelArr);
    __unpin(weightsArr);
  };

  const reTrain = () => {
    const weightsArr = __pin(__newArray(Float64Array_ID, weights));
    const vectorsArr = __pin(__newArray(Int32Array_ID, pixels));

    const newWeights = __getArray(
      __pin(Correct(weightsArr, vectorsArr, neuronSum))
    );
    weights = newWeights;

    __unpin(weightsArr);
    __unpin(vectorsArr);
    __unpin(newWeights);
  };

  // Инициализация весов
  const initWeight = () => {
    const arr = __getArray(__pin(InitWeight(canvasSize)));

    console.log('Инициализированные веса:');
    console.log(arr);
    weights = arr;

    initBtn.disabled = true;

    __unpin(arr);
  };

  correct.addEventListener('click', reTrain);
  predictBtn.addEventListener('click', PredictFunc);
  initBtn.addEventListener('click', initWeight);

  // Рисование
  canvas.addEventListener('mousedown', (event) => mousedown(canvas, event));
  canvas.addEventListener('mousemove', (event) => mousemove(canvas, event));
  canvas.addEventListener('mouseup', () => mouseup());

  // Создание поля
  function createCanvas() {
    canvas.id = 'canvas';
    canvas.width = parseInt(canvasSize);
    canvas.height = parseInt(canvasSize);
    canvas.style.zIndex = 8;
    canvas.style.border = '1px solid';
    ctx.fillStyle = currentBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let main = document.getElementById('main');
    main.appendChild(canvas);
    buttonControl(false);
  }

  // Загрузка весов
  function load(e) {
    const file = e.target.files[0];

    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function () {
      let res = reader.result;

      res = res.split(',');
      res = res.map((e) => Number(e));

      weights = res;

      console.log('Загруженные веса:');
      console.log(res);
    };

    reader.onerror = function () {
      console.log(reader.error);
    };
  }

  // Сохранение весов
  const save = (content) => {
    const a = document.createElement('a');

    const file = new Blob([content], { type: 'text/plain' });

    a.href = URL.createObjectURL(file);
    a.download = 'weights.txt';
    a.click();

    URL.revokeObjectURL(a.href);
  };

  // Позиция мыши
  function getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  }

  // Кнопка мыши зажата
  function mousedown(canvas, evt) {
    isMouseDown = true;
    let currentPosition = getMousePos(canvas, evt);
    ctx.moveTo(currentPosition.x, currentPosition.y);
    ctx.beginPath();
    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;
  }

  // Процесс рисования
  function mousemove(canvas, evt) {
    if (isMouseDown) {
      let currentPosition = getMousePos(canvas, evt);
      ctx.lineTo(currentPosition.x, currentPosition.y);
      ctx.stroke();
    }
  }

  // Кнопку мыши отпустили
  const mouseup = () => {
    isMouseDown = false;
    buttonControl(true);
  };
});
