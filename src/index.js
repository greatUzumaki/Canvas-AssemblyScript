import loader from '@assemblyscript/loader';
import './style.css';

// Подключение модуля Wasm
loader.instantiate(fetch('./build/optimized.wasm')).then(({ exports }) => {
  // Функции Wasm
  const {
    Int32Array_ID,
    Int32Array_ID2,
    Float64Array_ID,
    InitWeight,
    Predict,
    Correct,
    toImage,
  } = exports;
  const { __newArray, __getArray, __pin, __unpin } = exports;

  // Константы и настройки
  let isMouseDown = false;
  let weights = []; // массив весов
  let pixels = []; // массив вектора (0 - пусто, 1 - закрашено)
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  let currentColor = '#000000'; // цвет линии
  const currentBg = 'white'; // цвет фона
  const currentSize = 2; // толщина линии
  const canvasSize = 150; // поле
  let neuronSum = 0; // сумма нейрона
  let sigmoidRes = 0; // ответ сигмоиды

  // Кнопки
  const correct_cross = document.getElementById('correct_cross');
  const correct_other = document.getElementById('correct_other');
  const predictBtn = document.getElementById('predict');
  const initBtn = document.getElementById('init');

  // Создать поле
  createCanvas();

  // Рисование
  canvas.addEventListener('mousedown', (event) => mousedown(canvas, event));
  canvas.addEventListener('mousemove', (event) => mousemove(canvas, event));
  canvas.addEventListener('mouseup', () => mouseup());

  // Ивенты
  document.getElementById('clear').addEventListener('click', createCanvas);

  document.getElementById('load').addEventListener('change', (e) => load(e));

  document
    .getElementById('dataset')
    .addEventListener('change', (e) => loadDataset(e));

  document
    .getElementById('save')
    .addEventListener('click', () => save(weights));

  document
    .getElementById('colorpicker')
    .addEventListener('change', function () {
      currentColor = this.value;
    });

  correct_cross.addEventListener('click', () => reTrain(true));
  correct_other.addEventListener('click', () => reTrain(false));
  predictBtn.addEventListener('click', () => PredictFunc(false));
  initBtn.addEventListener('click', initWeight);

  // вычисление сигмоиды
  function sigmoid(sum) {
    return 1 / (1 + Math.exp(-sum));
  }

  // производная сигмоиды
  function sigmoid_derivative(sigmoid) {
    return sigmoid * (1 - sigmoid);
  }

  // Угадать
  function PredictFunc(auto) {
    const data = ctx.getImageData(0, 0, canvasSize, canvasSize);
    const arr = Array.from(data.data);

    const pixelArr = __pin(__newArray(Int32Array_ID, arr));

    const vectors = __getArray(__pin(toImage(pixelArr, canvasSize)));
    pixels = vectors;

    const vectorsArr = __pin(__newArray(Int32Array_ID2, pixels));
    const weightsArr = __pin(__newArray(Float64Array_ID, weights));

    const res = Predict(weightsArr, vectorsArr);

    console.log('Сумма нейрона:');
    console.log(res);
    neuronSum = Number(res);

    // if (neuronSum >= 0) {
    //   !auto && alert('Это крестик');
    //   answer = 1;
    // } else {
    //   !auto && alert('Это круг');
    //   answer = 0;
    // }

    sigmoidRes = sigmoid(neuronSum);

    !auto && alert(`Это крест на ${(sigmoidRes * 100).toFixed(3)}%`);

    __unpin(pixelArr);
    __unpin(vectors);
    __unpin(vectorsArr);
    __unpin(weightsArr);
  }

  // Скоректировать веса
  function reTrain(cross) {
    const weightsArr = __pin(__newArray(Float64Array_ID, weights));
    const vectorsArr = __pin(__newArray(Int32Array_ID, pixels));

    let sigmoidDeriv = sigmoid_derivative(sigmoidRes);

    const newWeights = __getArray(
      __pin(
        Correct(weightsArr, vectorsArr, neuronSum, 0.05, cross, sigmoidDeriv)
      )
    );
    weights = newWeights;

    console.log('Переобучили');

    __unpin(weightsArr);
    __unpin(vectorsArr);
    __unpin(newWeights);
  }

  // Инициализация весов
  function initWeight() {
    const arr = __getArray(__pin(InitWeight(canvasSize)));

    console.log('Инициализированные веса:');
    console.log(arr);
    weights = arr;

    initBtn.disabled = true;

    __unpin(arr);
  }

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

  // Автообучение по датасету
  function autoTrain(fileName) {
    PredictFunc(true);

    if (fileName.includes('cross') && sigmoidRes < 0.95) reTrain(true);
    else if (fileName.includes('circle') && sigmoidRes > 0.1) reTrain(false);
  }

  // Перемешать массив
  function shuffle(arr = []) {
    let newArr = [];

    for (let i = arr.length - 1; i >= 0; i--) {
      let id = Math.floor(Math.random() * arr.length);
      newArr.push(arr[id]);
      arr.splice(id, 1);
    }

    return newArr;
  }

  // Загрузить датасет
  function loadDataset(e) {
    let files = e.target.files;
    files = Object.values(files);

    files = shuffle(files);

    files.forEach((file) => {
      const reader = new FileReader();
      let fileName = file.name;

      reader.onload = (e) => {
        let img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          autoTrain(fileName);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

    buttonControl(true);
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
  function save(content) {
    const a = document.createElement('a');

    const file = new Blob([content], { type: 'text/plain' });

    a.href = URL.createObjectURL(file);
    a.download = 'weights.txt';
    a.click();

    URL.revokeObjectURL(a.href);
  }

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
  function mouseup() {
    isMouseDown = false;
    buttonControl(true);
  }

  // Включение и отключение кнопок
  function buttonControl(enable) {
    if (enable) {
      correct_cross.disabled = false;
      correct_other.disabled = false;
      predictBtn.disabled = false;
    } else {
      correct_cross.disabled = true;
      correct_other.disabled = true;
      predictBtn.disabled = true;
    }
  }
});
