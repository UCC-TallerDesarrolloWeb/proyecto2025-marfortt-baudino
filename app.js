// ====== Utilidades ======
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
const currency = (n=0) => Number(n).toLocaleString('es-AR', {style:'currency', currency:'USD', maximumFractionDigits:2});
const ls = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

// ====== Tabs ======
$$('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    $$('.panel').forEach(p => p.classList.remove('active'));
    const target = btn.getAttribute('data-target');
    $(target).classList.add('active');
  });
});

// ====== Maquinaria ======
const MACH_KEY = 'ag360_machinery';
let machinery = ls.get(MACH_KEY, []);

const machineryForm = $('#machinery-form');
const machineryList = $('#machinery-list');
const machineryEmpty = $('#machinery-empty');
const statusFilter = $('#status-filter');
const searchMachinery = $('#search-machinery');

function renderMachinery(){
  machineryList.innerHTML = '';
  const q = (searchMachinery.value || '').toLowerCase();
  const f = statusFilter.value;
  const filtered = machinery.filter(m => {
    const matchesText = [m.name, m.type].join(' ').toLowerCase().includes(q);
    const matchesStatus = (f === 'todos') || (m.status === f);
    return matchesText && matchesStatus;
  });
  if(filtered.length === 0){ machineryEmpty.style.display='block'; return; }
  machineryEmpty.style.display='none';

  filtered.forEach((m, i) => {
    const li = document.createElement('li');
    li.className = 'item';
    li.innerHTML = `
      <div class="title">${m.name}</div>
      <div class="muted">${m.type} • ${m.condition}</div>
      <div>${currency(m.price)}</div>
      <div class="muted">${m.notes || ''}</div>
      <div><span class="badge ${m.status}">${m.status}</span></div>
      <div class="actions">
        <button class="btn" data-action="venta">Publicar en venta</button>
        <button class="btn" data-action="vendido">Marcar vendido</button>
        <button class="btn" data-action="comprado">Marcar comprado</button>
        <button class="btn" data-action="inventario">Mover a inventario</button>
        <button class="btn" data-action="eliminar">Eliminar</button>
      </div>
    `;
    li.addEventListener('click', (e) => {
      const action = e.target?.dataset?.action;
      if(!action) return;
      if(action === 'eliminar'){
        const idx = machinery.indexOf(m);
        machinery.splice(idx,1);
      }else{
        m.status = action;
      }
      ls.set(MACH_KEY, machinery);
      renderMachinery();
    });
    machineryList.appendChild(li);
  });
}

machineryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(machineryForm).entries());
  machinery.push({
    id: crypto.randomUUID(),
    name: data.name.trim(),
    type: data.type,
    condition: data.condition,
    price: Number(data.price||0),
    notes: data.notes?.trim() || '',
    status: 'inventario'
  });
  ls.set(MACH_KEY, machinery);
  machineryForm.reset();
  renderMachinery();
});

statusFilter.addEventListener('change', renderMachinery);
searchMachinery.addEventListener('input', renderMachinery);
$('#export-machinery').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(machinery, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'maquinaria_agrogestion360.json';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});

renderMachinery();

// ====== Ganadería ======
const BREED_KEY = 'ag360_breeds';
let breeds = ls.get(BREED_KEY, []);

const breedForm = $('#breed-form');
const breedsList = $('#breeds-list');
const breedsEmpty = $('#breeds-empty');
const totalAnimals = $('#total-animals');
const totalBreeds = $('#total-breeds');

function renderBreeds(){
  breedsList.innerHTML='';
  totalBreeds.textContent = breeds.length;
  const total = breeds.reduce((acc,b)=>acc + (b.count||0), 0);
  totalAnimals.textContent = total;
  if(breeds.length === 0){ breedsEmpty.style.display='block'; return; }
  breedsEmpty.style.display='none';

  breeds.forEach(b => {
    const li = document.createElement('li');
    li.className='item';
    li.innerHTML = `
      <div class="title">${b.name}</div>
      <div class="muted">Cantidad: <strong>${b.count}</strong></div>
      <div class="actions">
        <button class="btn" data-action="inc">+1</button>
        <button class="btn" data-action="dec">-1</button>
        <button class="btn" data-action="reset">Reset</button>
        <button class="btn" data-action="del">Eliminar</button>
      </div>
    `;
    li.addEventListener('click', (e) => {
      const action = e.target?.dataset?.action;
      if(!action) return;
      if(action === 'inc') b.count++;
      if(action === 'dec') b.count = Math.max(0, b.count-1);
      if(action === 'reset') b.count = 0;
      if(action === 'del') breeds = breeds.filter(x => x !== b);
      ls.set(BREED_KEY, breeds);
      renderBreeds();
    });
    breedsList.appendChild(li);
  });
}

breedForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#b-name').value.trim();
  const initial = Number($('#b-initial').value || 0);
  if(!name) return;
  breeds.push({ id: crypto.randomUUID(), name, count: initial });
  ls.set(BREED_KEY, breeds);
  breedForm.reset();
  renderBreeds();
});

renderBreeds();

// ====== Calculadora de Siembra ======
const calcForm = $('#calc-form');
const calcResults = $('#calc-results');

calcForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const ha = Number($('#hectareas').value || 0);
  const dosis = Number($('#densidad').value || 0);
  const pSem = Number($('#precio-semilla').value || 0);
  const fert = Number($('#fertil').value || 0);
  const lab = Number($('#labores').value || 0);
  const comb = Number($('#combustible').value || 0);
  const otros = Number($('#otros').value || 0);
  const rto = Number($('#rendimiento').value || 0);
  const pGrano = Number($('#precio-grano').value || 0);

  const costoSemillaHa = dosis * pSem;
  const costoHa = costoSemillaHa + fert + lab + comb + otros;
  const costoTotal = costoHa * ha;
  const ingresoTotal = rto * pGrano * ha;
  const utilidad = ingresoTotal - costoTotal;
  const breakevenPrecio = rto > 0 ? (costoHa / rto) : 0;
  const breakevenRto = pGrano > 0 ? (costoHa / pGrano) : 0;

  calcResults.innerHTML = `
    <div class="kpi">
      <div class="box"><strong>${currency(costoTotal)}</strong> Costo total</div>
      <div class="box"><strong>${currency(costoHa)}</strong> Costo por ha</div>
      <div class="box"><strong>${currency(ingresoTotal)}</strong> Ingreso esperado</div>
      <div class="box"><strong>${currency(utilidad)}</strong> Utilidad estimada</div>
    </div>
    <div class="kpi">
      <div class="box"><strong>${currency(breakevenPrecio)}</strong> Precio de equilibrio (USD/t)</div>
      <div class="box"><strong>${breakevenRto.toFixed(2)} t/ha</strong> Rendimiento de equilibrio</div>
    </div>
  `;
});

// ====== Bolsa de Valores (simulada) ======
const canvas = $('#chart');
const ctx = canvas.getContext('2d');
const priceInput = $('#price');
const symbolSel = $('#symbol');

let series = [];
function genSeries(start=450, n=60){
  series = [start];
  for(let i=1;i<n;i++){
    const last = series[i-1];
    const step = (Math.random()-0.5)*6; // variación suave
    series.push(Math.max(50, last + step));
  }
  priceInput.value = series.at(-1).toFixed(2);
  draw();
}

function draw(){
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  // ejes
  ctx.strokeStyle = '#213244'; ctx.lineWidth = 1;
  ctx.strokeRect(40, 16, w-56, h-40);

  const min = Math.min(...series), max = Math.max(...series);
  const scaleX = (w-56) / (series.length-1);
  const scaleY = (h-40) / (max-min || 1);

  // línea
  ctx.beginPath();
  ctx.strokeStyle = '#77e38e'; ctx.lineWidth = 2;
  series.forEach((v,i)=>{
    const x = 40 + i*scaleX;
    const y = 16 + (max - v)*scaleY;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();

  // barras (mini volumen simulado)
  ctx.fillStyle = '#36c0ff55';
  for(let i=0; i<series.length; i+=3){
    const barH = (Math.random()*0.4+0.1)*(h-40);
    const x = 40 + i*scaleX;
    ctx.fillRect(x, h-24-barH, 4, barH);
  }
}

setInterval(() => {
  // desplazamiento en tiempo real
  if(series.length > 0){
    const last = series.at(-1);
    const next = Math.max(50, last + (Math.random()-0.5)*4);
    series.push(next);
    if(series.length > 120) series.shift();
    priceInput.value = next.toFixed(2);
    draw();
  }
}, 2000);

genSeries(450, 80);
