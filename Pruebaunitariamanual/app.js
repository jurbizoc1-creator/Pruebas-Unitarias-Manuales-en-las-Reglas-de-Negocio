/* =========================================================
   1. LOGICA DE NEGOCIO A AISLAR Y PROBAR
   Esta función NO depende del arreglo `estudiantes`, ni del
   formulario, ni de nada del CRUD. Solo recibe un texto y
   devuelve true/false, o lanza un error si algo está mal.
   ========================================================= */

const DOMINIO_VALIDO = "@miumg.edu.gt";

function validarCorreoInstitucional(correo) {
  if (typeof correo !== "string" || correo.trim() === "") {
    throw new Error("El correo no puede estar vacío");
  }

  // Regex simple de formato de correo: algo@algo.algo
  const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!formatoCorreo.test(correo)) {
    throw new Error("El correo no tiene un formato válido");
  }

  const dominioValido = correo.trim().toLowerCase().endsWith(DOMINIO_VALIDO);

  if (!dominioValido) {
    throw new Error(`El correo debe pertenecer al dominio ${DOMINIO_VALIDO}`);
  }

  return true;
}


/* =========================================================
   2. PRUEBA UNITARIA MANUAL (try-catch + aserciones)
   Corre varios casos contra validarCorreoInstitucional()
   y compara "esperado" vs "obtenido", igual que se pide
   en la tarea.
   ========================================================= */

function ejecutarPruebaValidacion() {
  const casos = [
    {
      descripcion: "Correo institucional válido (CASO EXITOSO)",
      entrada: "juan.lopez@miumg.edu.gt",
      esperado: true,
    },
    {
      descripcion: "Correo con formato inválido (CASO DE FALLO)",
      entrada: "juan.lopez@@miumg",
      esperado: false,
    },
    {
      descripcion: "Formato válido pero dominio externo (CASO DE FALLO)",
      entrada: "juan.lopez@gmail.com",
      esperado: false,
    },
  ];

  console.log("==================================================");
  console.log(" PRUEBA UNITARIA MANUAL - VALIDACION DE CORREO");
  console.log(" (Aislada: no toca el arreglo de estudiantes ni el CRUD)");
  console.log("==================================================");

  const resultados = casos.map((caso, indice) => {
    let obtenido = false;
    let error = null;

    try {
      obtenido = validarCorreoInstitucional(caso.entrada);
    } catch (e) {
      // Si la función lanza un error, lo atrapamos aquí.
      // Para nuestros casos de fallo, ESTO es justamente lo esperado:
      // el correo fue rechazado, así que obtenido = false.
      obtenido = false;
      error = e.message;
    }

    const exitosa = obtenido === caso.esperado;

    console.log(`\nCASO ${indice + 1} - ${caso.descripcion}`);
    console.log(`Entrada:   "${caso.entrada}"`);
    console.log(`Esperado:  ${caso.esperado}`);
    console.log(`Obtenido:  ${obtenido}`);
    if (error) console.log(`Excepción atrapada: ${error}`);
    console.log(exitosa ? "RESULTADO: PRUEBA EXITOSA" : "RESULTADO: PRUEBA FALLIDA");

    return {
      numero: indice + 1,
      descripcion: caso.descripcion,
      entrada: caso.entrada,
      esperado: caso.esperado,
      obtenido,
      error,
      exitosa,
    };
  });

  console.log("==================================================");
  console.log(" FIN DE LA PRUEBA");
  console.log("==================================================");

  return resultados;
}

function renderResultadosPrueba(resultados) {
  const contenedor = document.getElementById("resultados-prueba");
  contenedor.innerHTML = "";

  resultados.forEach((r) => {
    const div = document.createElement("div");
    div.className = `test-case ${r.exitosa ? "case-pass" : "case-fail"}`;

    div.innerHTML = `
      <div class="case-header">
        <span class="case-number">Caso ${r.numero}</span>
        <span class="case-verdict">${r.exitosa ? "PRUEBA EXITOSA" : "PRUEBA FALLIDA"}</span>
      </div>
      <p class="case-description">${r.descripcion}</p>
      <dl class="case-details">
        <dt>Entrada</dt><dd>"${r.entrada}"</dd>
        <dt>Esperado</dt><dd>${r.esperado}</dd>
        <dt>Obtenido</dt><dd>${r.obtenido}</dd>
      </dl>
      ${r.error ? `<p class="case-error">Excepción atrapada: ${r.error}</p>` : ""}
    `;

    contenedor.appendChild(div);
  });
}


/* =========================================================
   3. CRUD DE ESTUDIANTES (en memoria, para esta tarea)
   ========================================================= */

let estudiantes = [];
let siguienteId = 1;

function renderTablaEstudiantes() {
  const tbody = document.getElementById("tabla-estudiantes");
  const vacio = document.getElementById("tabla-vacia");
  tbody.innerHTML = "";

  vacio.style.display = estudiantes.length === 0 ? "block" : "none";

  estudiantes.forEach((e) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${e.nombre}</td>
      <td>${e.correo}</td>
      <td>${e.carrera}</td>
      <td>${e.promedio}</td>
      <td class="actions">
        <button class="link-btn" onclick="editarEstudiante(${e.id})">Editar</button>
        <button class="link-btn" onclick="eliminarEstudiante(${e.id})">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function editarEstudiante(id) {
  const estudiante = estudiantes.find((e) => e.id === id);
  if (!estudiante) return;

  document.getElementById("estudiante-id").value = estudiante.id;
  document.getElementById("nombre").value = estudiante.nombre;
  document.getElementById("correo").value = estudiante.correo;
  document.getElementById("carrera").value = estudiante.carrera;
  document.getElementById("promedio").value = estudiante.promedio;

  document.getElementById("btn-guardar").textContent = "Actualizar";
  document.getElementById("btn-cancelar").style.display = "inline-block";
}

function eliminarEstudiante(id) {
  estudiantes = estudiantes.filter((e) => e.id !== id);
  renderTablaEstudiantes();
}

function limpiarFormulario() {
  document.getElementById("form-estudiante").reset();
  document.getElementById("estudiante-id").value = "";
  document.getElementById("correo-error").textContent = "";
  document.getElementById("btn-guardar").textContent = "Guardar";
  document.getElementById("btn-cancelar").style.display = "none";
}


/* =========================================================
   4. CONEXIÓN CON EL FORMULARIO (usa la validación aislada)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-estudiante");
  const errorCorreo = document.getElementById("correo-error");

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    errorCorreo.textContent = "";

    const id = document.getElementById("estudiante-id").value;
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const carrera = document.getElementById("carrera").value.trim();
    const promedio = parseFloat(document.getElementById("promedio").value);

    try {
      validarCorreoInstitucional(correo);
    } catch (e) {
      errorCorreo.textContent = e.message;
      return;
    }

    if (id) {
      const estudiante = estudiantes.find((e) => e.id === parseInt(id));
      estudiante.nombre = nombre;
      estudiante.correo = correo;
      estudiante.carrera = carrera;
      estudiante.promedio = promedio;
    } else {
      estudiantes.push({ id: siguienteId++, nombre, correo, carrera, promedio });
    }

    renderTablaEstudiantes();
    limpiarFormulario();
  });

  document.getElementById("btn-cancelar").addEventListener("click", limpiarFormulario);

  document.getElementById("btn-ejecutar-prueba").addEventListener("click", () => {
    const resultados = ejecutarPruebaValidacion();
    renderResultadosPrueba(resultados);
  });

  renderTablaEstudiantes();
});
