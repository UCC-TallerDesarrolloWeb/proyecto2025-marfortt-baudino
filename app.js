document.addEventListener("DOMContentLoaded", () => {
  /**
   * Función selectora abreviada para document.querySelector
   * @method $
   * @param {string} sel - Selector CSS del elemento a buscar
   * @returns {HTMLElement} Elemento DOM encontrado
   */
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
   * Carga los datos de ganadería desde localStorage y los asigna al array breeds
   * @method loadBreedsFromStorage
   */
  const loadBreedsFromStorage = () => {
    const stored = localStorage.getItem('agroGestion_breeds');
    if (stored) {
      breeds = JSON.parse(stored);
    }
  };

  // ================== MODAL DE CONFIRMACIÓN ==================
  const modal = $("#confirmation-modal");
  const confirmationMessage = $("#confirmation-message");
  const confirmationDetails = $("#confirmation-details");
  const cancelBtn = $("#cancel-btn");
  const confirmBtn = $("#confirm-btn");
  let currentConfirmAction = null;

  /**
   * Muestra el modal de confirmación con mensaje personalizado
   * @method showConfirmationModal
   * @param {string} message - Mensaje principal
   * @param {string} details - Detalles del elemento a eliminar
   * @param {Function} onConfirm - Función a ejecutar si se confirma
   */
  const showConfirmationModal = (message, details, onConfirm) => {
    confirmationMessage.textContent = message;
    confirmationDetails.innerHTML = details;
    currentConfirmAction = onConfirm;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden'; // Prevenir scroll del fondo
  };

  /**
   * Oculta el modal de confirmación
   * @method hideConfirmationModal
   */
  const hideConfirmationModal = () => {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    currentConfirmAction = null;
  };

  // Event listeners para el modal
  cancelBtn.addEventListener('click', hideConfirmationModal);
  
  confirmBtn.addEventListener('click', () => {
    if (currentConfirmAction) {
      currentConfirmAction();
    }
    hideConfirmationModal();
  });

  // Cerrar modal al hacer clic en el overlay
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideConfirmationModal();
    }
  });

  // ================== MAQUINARIA ==================
  let machinery = [];
  const machineryForm = $("#machinery-form");
  const machineryList = $("#machinery-list");
  const machineryEmpty = $("#machinery-empty");

  /**
   * Renderiza la lista de maquinaria cargada en el DOM, incluyendo fotos y botones de eliminación
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
          const details = `
            <strong>🚜 ${m.name}</strong>
            <div style="margin-top: 8px; color: #666;">
              Tipo: ${m.type}<br>
              Estado: ${m.condition}<br>
              Precio: USD ${m.price.toLocaleString()}<br>
              ${m.notes ? `Notas: ${m.notes}` : ''}
            </div>
          `;
          
          showConfirmationModal(
            "¿Estás seguro de que quieres eliminar esta maquinaria?",
            details,
            () => {
              machinery = machinery.filter((x) => x !== m);
              saveMachineryToStorage();
              renderMachinery();
            }
          );
        }
      });
      machineryList.appendChild(li);
    });
  };

  /**
   * Maneja el envío del formulario de maquinaria, incluyendo carga de imágenes
   * @method handleMachinerySubmit
   * @param {Event} e - Evento de envío del formulario
   */
  const handleMachinerySubmit = (e) => {
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
  };

  machineryForm.addEventListener("submit", handleMachinerySubmit);

  // ================== GANADERÍA ==================
  let breeds = [];
  const breedForm = $("#breed-form");
  const breedsList = $("#breeds-list");
  const breedsEmpty = $("#breeds-empty");

  /**
   * Renderiza la lista de razas registradas en el DOM con botones de control
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
        if (act === "inc") {
          b.count++;
          saveBreedsToStorage();
          renderBreeds();
        } else if (act === "dec") {
          b.count = Math.max(0, b.count - 1);
          saveBreedsToStorage();
          renderBreeds();
        } else if (act === "del") {
          const details = `
            <strong>🐄 ${b.type} - ${b.name}</strong>
            <div style="margin-top: 8px; color: #666;">
              Cantidad actual: ${b.count} ${b.count === 1 ? 'animal' : 'animales'}
            </div>
          `;
          
          showConfirmationModal(
            "¿Estás seguro de que quieres eliminar esta raza completa?",
            details,
            () => {
              breeds = breeds.filter((x) => x !== b);
              saveBreedsToStorage();
              renderBreeds();
            }
          );
        }
      });
      breedsList.appendChild(li);
    });
  };

  /**
   * Maneja el envío del formulario de ganadería para agregar nuevas razas
   * @method handleBreedSubmit
   * @param {Event} e - Evento de envío del formulario
   */
  const handleBreedSubmit = (e) => {
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
  };

  breedForm.addEventListener("submit", handleBreedSubmit);

  // ================== CALCULADORA ==================
  const calcForm = $("#calc-form");
  const calcResults = $("#calc-results");

  /**
   * Calcula y muestra los resultados de costos de siembra, incluyendo utilidad estimada
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

  /**
   * Maneja el envío del formulario de calculadora de costos
   * @method handleCalcSubmit
   * @param {Event} e - Evento de envío del formulario
   */
  const handleCalcSubmit = (e) => {
    e.preventDefault();
    calcularCostos();
  };

  calcForm.addEventListener("submit", handleCalcSubmit);

  // ================== INICIALIZACIÓN ==================
  /**
   * Inicializa la aplicación cargando datos guardados desde localStorage y renderizando las listas
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

  // ================== AUTENTICACIÓN ==================
  const logoutBtn = $("#logout-btn");
  const userInfo = $("#user-info");

  /**
   * Muestra la información del usuario logueado en el header
   * @method displayUserInfo
   */
  const displayUserInfo = () => {
    const session = localStorage.getItem('agroGestion_session');
    if (session) {
      const sessionData = JSON.parse(session);
      const userEmail = sessionData.email;
      userInfo.innerHTML = `👤 ${userEmail}`;
    }
  };

  /**
   * Maneja el cierre de sesión del usuario
   * @method handleLogout
   * @param {Event} e - Evento de clic
   */
  const handleLogout = (e) => {
    e.preventDefault();
    
    const session = localStorage.getItem('agroGestion_session');
    const sessionData = session ? JSON.parse(session) : null;
    const userEmail = sessionData ? sessionData.email : 'Usuario';
    
    const details = `
      <strong>👤 ${userEmail}</strong>
      <div style="margin-top: 8px; color: #666;">
        Se cerrará tu sesión actual y volverás a la página de inicio
      </div>
    `;
    
    showConfirmationModal(
      "¿Estás seguro de que quieres cerrar sesión?",
      details,
      () => {
        localStorage.removeItem('agroGestion_session');
        window.location.href = 'home.html';
      }
    );
  };

  // Agregar event listener para cerrar sesión
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  // Inicializar la aplicación
  init();
  displayUserInfo();
});
