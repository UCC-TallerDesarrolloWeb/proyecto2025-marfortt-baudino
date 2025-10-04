document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel) => document.querySelector(sel);

  /**
   * Valida un campo numérico según las consignas del README.
   * Muestra alerta si está mal y limpia el campo.
   * @method validarNumero
   * @param {HTMLInputElement} input - Campo del formulario
   * @returns {number|null} Número válido o null si no lo es
   */
  const validarNumero = (input) => {
    const valor = input.value.trim();
    if (valor === "" || isNaN(valor) || Number(valor) < 0) {
      alert(`El valor ingresado en "${input.placeholder || input.id}" no es válido.`);
      input.value = "";
      input.focus();
      return null;
    }
    return Number(valor);
  };

  // ================== ALMACENAMIENTO LOCAL ==================
  /**
   * Guarda los datos de maquinaria en localStorage
   * @method saveMachineryToStorage
   */
  const saveMachineryToStorage = () => {
    localStorage.setItem('agroGestion_machinery', JSON.stringify(machinery));
  };

  /**
   * Carga los datos de maquinaria desde localStorage
   * @method loadMachineryFromStorage
   */
  const loadMachineryFromStorage = () => {
    const stored = localStorage.getItem('agroGestion_machinery');
    if (stored) {
      machinery = JSON.parse(stored);
    }
  };

  /**
   * Guarda los datos de ganadería en localStorage
   * @method saveBreedsToStorage
   */
  const saveBreedsToStorage = () => {
    localStorage.setItem('agroGestion_breeds', JSON.stringify(breeds));
  };

  /**
   * Carga los datos de ganadería desde localStorage
   * @method loadBreedsFromStorage
   */
  const loadBreedsFromStorage = () => {
    const stored = localStorage.getItem('agroGestion_breeds');
    if (stored) {
      breeds = JSON.parse(stored);
    }
  };

  // ================== MAQUINARIA ==================
  let machinery = [];
  const machineryForm = $("#machinery-form");
  const machineryList = $("#machinery-list");
  const machineryEmpty = $("#machinery-empty");

  /**
   * Renderiza la lista de maquinaria cargada
   * @method renderMachinery
   */
  const renderMachinery = () => {
    machineryList.innerHTML = "";
    if (machinery.length === 0) {
      machineryEmpty.style.display = "block";
      return;
    }
    machineryEmpty.style.display = "none";
    machinery.forEach((m) => {
      const li = document.createElement("li");
      li.className = "item machinery-item";
      
      const photoHtml = m.photo ? 
        `<div class="machinery-photo">
          <img src="${m.photo}" alt="Foto de ${m.name}" class="machinery-image">
        </div>` : '';
      
      li.innerHTML = `
        ${photoHtml}
        <div class="machinery-info">
          <strong>${m.name}</strong> (${m.type}) - ${m.condition} - USD ${m.price}<br>
          <small>${m.notes || ""}</small><br>
          <button class="btn" data-action="eliminar">Eliminar</button>
        </div>
      `;
      li.addEventListener("click", (e) => {
        if (e.target.dataset.action === "eliminar") {
          machinery = machinery.filter((x) => x !== m);
          saveMachineryToStorage(); // Guardar en localStorage
          renderMachinery();
        }
      });
      machineryList.appendChild(li);
    });
  };

  machineryForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const price = validarNumero($("#m-price"));
    if (price === null) return;

    const photoInput = $("#m-photo");
    const photoFile = photoInput.files[0];

    // Crear el objeto de maquinaria
    const machineryItem = {
      name: $("#m-name").value,
      type: $("#m-type").value,
      condition: $("#m-condition").value,
      price: price,
      notes: $("#m-notes").value,
      photo: null // Se asignará después si hay foto
    };

    // Si hay una foto, convertirla a base64
    if (photoFile) {
      const reader = new FileReader();
      reader.onload = function(e) {
        machineryItem.photo = e.target.result;
        machinery.push(machineryItem);
        saveMachineryToStorage(); // Guardar en localStorage
        machineryForm.reset();
        renderMachinery();
      };
      reader.readAsDataURL(photoFile);
    } else {
      // Si no hay foto, agregar directamente
      machinery.push(machineryItem);
      saveMachineryToStorage(); // Guardar en localStorage
      machineryForm.reset();
      renderMachinery();
    }
  });

  // ================== GANADERÍA ==================
  let breeds = [];
  const breedForm = $("#breed-form");
  const breedsList = $("#breeds-list");
  const breedsEmpty = $("#breeds-empty");

  /**
   * Renderiza la lista de razas registradas
   * @method renderBreeds
   */
  const renderBreeds = () => {
    breedsList.innerHTML = "";
    if (breeds.length === 0) {
      breedsEmpty.style.display = "block";
      return;
    }
    breedsEmpty.style.display = "none";
    breeds.forEach((b) => {
      const li = document.createElement("li");
      li.className = "item";
      li.innerHTML = `
        <strong>${b.type}</strong> - ${b.name}: ${b.count}
        <button class="btn" data-action="inc">+1</button>
        <button class="btn" data-action="dec">-1</button>
        <button class="btn" data-action="del">Eliminar</button>
      `;
      li.addEventListener("click", (e) => {
        const act = e.target.dataset.action;
        if (act === "inc") b.count++;
        if (act === "dec") b.count = Math.max(0, b.count - 1);
        if (act === "del") breeds = breeds.filter((x) => x !== b);
        saveBreedsToStorage(); // Guardar en localStorage
        renderBreeds();
      });
      breedsList.appendChild(li);
    });
  };

  breedForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const count = validarNumero($("#b-initial"));
    if (count === null) return;

    breeds.push({
      type: $("#b-type").value,
      name: $("#b-name").value,
      count: count,
    });

    saveBreedsToStorage(); // Guardar en localStorage
    breedForm.reset();
    renderBreeds();
  });

  // ================== CALCULADORA ==================
  const calcForm = $("#calc-form");
  const calcResults = $("#calc-results");

  /**
   * Calcula y muestra los resultados de costos de siembra
   * @method calcularCostos
   */
  const calcularCostos = () => {
    const ha = validarNumero($("#hectareas"));
    const dosis = validarNumero($("#densidad"));
    const pSem = validarNumero($("#precio-semilla"));
    const fert = validarNumero($("#fertil"));
    const lab = validarNumero($("#labores"));
    const comb = validarNumero($("#combustible"));
    const otros = validarNumero($("#otros"));
    const rto = validarNumero($("#rendimiento"));
    const pGrano = validarNumero($("#precio-grano"));

    if ([ha, dosis, pSem, fert, lab, comb, otros, rto, pGrano].includes(null)) return;

    const costoSemillaHa = dosis * pSem;
    const costoHa = costoSemillaHa + fert + lab + comb + otros;
    const costoTotal = costoHa * ha;
    const ingresoTotal = rto * pGrano * ha;
    const utilidad = ingresoTotal - costoTotal;

    calcResults.innerHTML = `
      <p><strong>Costo total:</strong> USD ${costoTotal.toFixed(2)}</p>
      <p><strong>Ingreso esperado:</strong> USD ${ingresoTotal.toFixed(2)}</p>
      <p><strong>Utilidad estimada:</strong> USD ${utilidad.toFixed(2)}</p>
    `;
  };

  calcForm.addEventListener("submit", (e) => {
    e.preventDefault();
    calcularCostos();
  });

  // ================== INICIALIZACIÓN ==================
  /**
   * Inicializa la aplicación cargando datos guardados
   * @method init
   */
  const init = () => {
    // Cargar datos guardados
    loadMachineryFromStorage();
    loadBreedsFromStorage();
    
    // Renderizar las listas
    renderMachinery();
    renderBreeds();
  };

  // Inicializar la aplicación
  init();
});
