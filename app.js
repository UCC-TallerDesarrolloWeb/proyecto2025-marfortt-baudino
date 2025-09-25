
document.addEventListener("DOMContentLoaded", () => {
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  // Navegación entre tabs
  $$(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      $$(".panel").forEach(p => p.classList.remove("active"));
      $(btn.dataset.target).classList.add("active");
    });
  });

  // ===== Maquinaria =====
  let machinery = [];
  const machineryForm = $("#machinery-form");
  const machineryList = $("#machinery-list");
  const machineryEmpty = $("#machinery-empty");

  const renderMachinery = () => {
    machineryList.innerHTML = "";
    if (machinery.length === 0) { machineryEmpty.style.display = "block"; return; }
    machineryEmpty.style.display = "none";
    machinery.forEach(m => {
      const li = document.createElement("li");
      li.className = "item";
      li.innerHTML = `
        <strong>${m.name}</strong> (${m.type}) - ${m.condition} - USD ${m.price}<br>
        <small>${m.notes || ""}</small><br>
        <div class="actions">
          <button class="btn" data-action="nuevo">Nuevo</button>
          <button class="btn" data-action="usado">Usado</button>
          <button class="btn" data-action="reparacion">En reparación</button>
          <button class="btn" data-action="venta">Venta</button>
          <button class="btn" data-action="vendido">Vendido</button>
          <button class="btn" data-action="eliminar">Eliminar</button>
        </div>
      `;
      li.addEventListener("click", e => {
        const act = e.target.dataset.action;
        if (!act) return;
        if (act === "eliminar") machinery = machinery.filter(x => x !== m);
        else m.condition = act;
        renderMachinery();
      });
      machineryList.appendChild(li);
    });
  };

  machineryForm.addEventListener("submit", e => {
    e.preventDefault();
    machinery.push({
      id: crypto.randomUUID(),
      name: $("#m-name").value,
      type: $("#m-type").value,
      condition: $("#m-condition").value,
      price: $("#m-price").value,
      notes: $("#m-notes").value
    });
    machineryForm.reset();
    renderMachinery();
  });

  // ===== Ganadería =====
  let breeds = [];
  const breedForm = $("#breed-form");
  const breedsList = $("#breeds-list");
  const breedsEmpty = $("#breeds-empty");

  const renderBreeds = () => {
    breedsList.innerHTML = "";
    if (breeds.length === 0) { breedsEmpty.style.display = "block"; return; }
    breedsEmpty.style.display = "none";
    breeds.forEach(b => {
      const li = document.createElement("li");
      li.className = "item";
      li.innerHTML = `
        <strong>${b.type}</strong> - ${b.name}: ${b.count}
        <div class="actions">
          <button class="btn" data-action="inc">+1</button>
          <button class="btn" data-action="dec">-1</button>
          <button class="btn" data-action="reset">Reset</button>
          <button class="btn" data-action="del">Eliminar</button>
        </div>
      `;
      li.addEventListener("click", e => {
        const act = e.target.dataset.action;
        if (!act) return;
        if (act === "inc") b.count++;
        if (act === "dec") b.count = Math.max(0, b.count - 1);
        if (act === "reset") b.count = 0;
        if (act === "del") breeds = breeds.filter(x => x !== b);
        renderBreeds();
      });
      breedsList.appendChild(li);
    });
  };

  breedForm.addEventListener("submit", e => {
    e.preventDefault();
    breeds.push({
      id: crypto.randomUUID(),
      type: $("#b-type").value,
      name: $("#b-name").value,
      count: Number($("#b-initial").value)
    });
    breedForm.reset();
    renderBreeds();
  });

  // ===== Calculadora =====
  const calcForm = $("#calc-form");
  const calcResults = $("#calc-results");

  calcForm.addEventListener("submit", e => {
    e.preventDefault();
    const ha = +$("#hectareas").value;
    const dosis = +$("#densidad").value;
    const pSem = +$("#precio-semilla").value;
    const fert = +$("#fertil").value;
    const lab = +$("#labores").value;
    const comb = +$("#combustible").value;
    const otros = +$("#otros").value;
    const rto = +$("#rendimiento").value;
    const pGrano = +$("#precio-grano").value;

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
  });
});
