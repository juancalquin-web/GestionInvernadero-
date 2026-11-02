(() => {
  const raiz = new URL('../', document.currentScript.src);

  const manifest = document.createElement('link');
  manifest.rel = 'manifest';
  manifest.href = new URL('manifest.json', raiz).href;
  document.head.appendChild(manifest);

  const colorTema = document.createElement('meta');
  colorTema.name = 'theme-color';
  colorTema.content = '#16834A';
  document.head.appendChild(colorTema);

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register(new URL('sw.js', raiz).href)
      .catch((err) => console.warn('No se pudo registrar el service worker:', err));
  }
  //en otras palabras, no funciona con fetch
})();

//--------------------------------------------------------------------------------------------------------------------------------------------------------------

document.addEventListener('alpine:init', () => {

    const claveSesion = "invernadero: sesion";

    const datosOriginales = {
        usuarios: [
        { id: 1, nombre: 'Juan Calquín', correo: 'juan.calquin@mail.udp.cl', clave: '1234', rol: 'usuario' },
        { id: 2, nombre: 'Paulina González', correo: 'paulina.gonzalez10@mail.udp.cl', clave: '1234', rol: 'usuario' },
        { id: 3, nombre: 'Diego Guzmán', correo: 'diego.guzman@mail.udp.cl', clave: '1234', rol: 'usuario' },
        { id: 4, nombre: 'Administrador', correo: 'admin@mail.udp.cl', clave: 'admin123', rol: 'admin' }
        ],

        cultivos: [
        { id: 1, usuarioId: 1, nombre: 'Cardenal', tipo: 'Flor', fecha: '2026-03-15', estacional: true },
        { id: 2, usuarioId: 1, nombre: 'Canelo', tipo: 'Árbol', fecha: '2026-01-10', estacional: false },
        { id: 3, usuarioId: 2, nombre: 'Tomate Cherry', tipo: 'Alimentario', fecha: '2026-05-20', estacional: true },
        { id: 4, usuarioId: 2, nombre: 'Nomeolvides', tipo: 'Flor', fecha: '2026-04-02', estacional: true },
        { id: 5, usuarioId: 2, nombre: 'Maitén', tipo: 'Árbol', fecha: '2025-11-25', estacional: false },
        { id: 6, usuarioId: 3, nombre: 'papa', tipo: 'Alimentario', fecha: '2026-06-08', estacional: true },
        { id: 7, usuarioId: 3, nombre: 'Quillay', tipo: 'Árbol', fecha: '2026-09-30', estacional: false }
        ],

        sensores: [
        { id: 1, usuarioId: 1, nombre: 'Juan_Humedad_Suelo_1', descripcion: 'Humedad del suelo en la zona 1', unidad: 'm^3/m^3', estado: 'Activo' },
        { id: 2, usuarioId: 1, nombre: 'Juan_Acidez_Suelo_1', descripcion: 'Acidez del suelo en la zona 1', unidad: 'pH', estado: 'Activo' },
        { id: 3, usuarioId: 1, nombre: 'Juan_Temperatura_1', descripcion: 'Temperatura del ambiente en la zona 1', unidad: '°C', estado: 'Activo' },
        { id: 4, usuarioId: 2, nombre: 'Paulina_Humedad_Suelo_1', descripcion: 'Humedad del suelo en la zona 1', unidad: 'm^3/m^3', estado: 'Activo' },
        { id: 5, usuarioId: 2, nombre: 'Paulina_Temperatura_1', descripcion: 'Temperatura del ambiente en la zona 1', unidad: '°C', estado: 'Activo' },
        { id: 6, usuarioId: 2, nombre: 'Paulina_Humedad_Ambiente_1', descripcion: 'Humedad del aire en la zona 1', unidad: '%HR', estado: 'Activo' },
        { id: 7, usuarioId: 2, nombre: 'Paulina_Acidez_Suelo_1', descripcion: 'Acidez del suelo en la zona 1', unidad: 'pH', estado: 'Desconectado' },
        { id: 8, usuarioId: 3, nombre: 'Diego_Humedad_Suelo_1', descripcion: 'Humedad del suelo en la zona 1', unidad: 'm^3/m^3', estado: 'Mantenimiento' },
        { id: 9, usuarioId: 3, nombre: 'Diego_Temperatura_1', descripcion: 'Temperatura del ambiente en la zona 1', unidad: '°C', estado: 'Activo' }
        ],

        lecturas: [
        { sensor: 'Juan_Temperatura_1', fecha: '2026-10-27', valor: 19.5 },
        { sensor: 'Juan_Temperatura_1', fecha: '2026-10-28', valor: 22.0 },
        { sensor: 'Juan_Temperatura_1', fecha: '2026-10-29', valor: 21.0 },
        { sensor: 'Juan_Acidez_Suelo_1', fecha: '2026-10-27', valor: 6.4 },
        { sensor: 'Juan_Acidez_Suelo_1', fecha: '2026-10-28', valor: 6.6 },
        { sensor: 'Juan_Acidez_Suelo_1', fecha: '2026-10-29', valor: 6.5 },
        { sensor: 'Juan_Humedad_Suelo_1', fecha: '2026-10-27', valor: 0.35 },
        { sensor: 'Juan_Humedad_Suelo_1', fecha: '2026-10-28', valor: 0.32 },
        { sensor: 'Juan_Humedad_Suelo_1', fecha: '2026-10-29', valor: 0.30 },
        { sensor: 'Paulina_Humedad_Ambiente_1', fecha: '2026-10-27', valor: 58 },
        { sensor: 'Paulina_Humedad_Ambiente_1', fecha: '2026-10-28', valor: 62 },
        { sensor: 'Paulina_Humedad_Ambiente_1', fecha: '2026-10-29', valor: 60 }
        ]
        };

    //Por lo visto, entre lo que busqué, como estamos usando alpine con CDN,
    //no se pueden leer los archivos json de forma local, por lo que se necesita una copia aquí
    //Ya en el servidor apache, no debería haber problemas, creo :/ 

    // Copia para no modificar los datos originales.
    const copiar = (lista) => JSON.parse(JSON.stringify(lista));

    //Posibles cambios en la sesión actual:
    let cambios = {};
    try{
        cambios = JSON.parse(sessionStorage.getItem(claveSesion)) || {};
    } catch (err) { //err de error
        cambios = {};
    }
    
    // Si no hay cambios guardados (null o indefinido), se usan los datos originales.
    let cultivos;
    if (cambios.cultivos != null) {
        cultivos = cambios.cultivos;
    } 
    else {
        cultivos = copiar(datosOriginales.cultivos);
    }

    let sensores;
    if (cambios.sensores != null) {
        sensores = cambios.sensores;
    } 
    else {
        sensores = copiar(datosOriginales.sensores);
    }

    Alpine.store('datos', {
        usuarios: copiar(datosOriginales.usuarios),
        lecturas: copiar(datosOriginales.lecturas),
        cultivos,
        sensores,

        //guardarSesion para guardar cambios de cultivos y sensores en la version de usuario en esa sesion en particular.
        guardarSesion(){
            sessionStorage.setItem(claveSesion, JSON.stringify({
                cultivos: this.cultivos, 
                sensores: this.sensores
            }));
        },

        //cerrarSesion borra los cambios cuando se cierra la sesion
        cerrarSesion() {
            sessionStorage.removeItem(claveSesion);
        },

        // Clase CSS e icono según el estado de un sensor (se usa en varias vistas).
        //como la entidad html no se puede leer como string para que aparezca el logo
        //se usa el unicode aquí.
        visualEstado(estado) {
            if (estado === 'Activo') {
                return { clase: 'success-mark', icono: '\u{1F7E2}' };
            } else if (estado === 'Mantenimiento') {
                return { clase: 'warning-mark', icono: '\u26A0\uFE0F' };
            } else {
                return { clase: 'danger-mark', icono: '\u{1F534}' };
            }
        },

        // Texto de la columna Estacional de los cultivos.
        textoEstacional(estacional) {
            if (estacional) {
                return 'Si';
            } 
            else {
                return 'No';
            }
        },


        // Siguiente id disponible de una lista.
        siguienteId(lista) {
        return lista.reduce((max, r) => Math.max(max, r.id), 0) + 1;
        },


        //cultivo, usuarioId es provisorio hasta tener sesión real.
        //aquí el estado es false en vez de otra cosa porque puede estar desactivado o en mantenimiento
        agregarCultivo({ nombre, tipo, fecha, estacional = false, usuarioId = 1 }) {
        const cultivo = {
            id: this.siguienteId(this.cultivos),
            usuarioId,
            nombre,
            tipo,
            fecha,
            estacional
        };
        this.cultivos.push(cultivo);
        return cultivo;
        },

        //sensor, usuarioId es provisorio hasta tener sesión real.
        agregarSensor({ nombre, descripcion, unidad, estado = 'Activo', usuarioId = 1 }) {
            const sensor = {
                id: this.siguienteId(this.sensores),
                usuarioId,
                nombre,
                descripcion,
                unidad,
                estado
            };
            this.sensores.push(sensor);
            return sensor;
        },

        // Actualiza un cultivo existente (temporal).
        actualizarCultivo(id, datos) {
            const cultivo = this.cultivos.find((c) => c.id === id);
            if (cultivo) {
                Object.assign(cultivo, datos);
                this.guardarSesion();
            }
            return cultivo;
        },

        // Elimina un cultivo (temporal).
        eliminarCultivo(id) {
            this.cultivos = this.cultivos.filter((c) => c.id !== id);
            this.guardarSesion();
        },

        // Actualiza un sensor existente (temporal).
        actualizarSensor(id, datos) {
            const sensor = this.sensores.find((s) => s.id === id);
            if (sensor) {
                Object.assign(sensor, datos);
                this.guardarSesion();
            }
            return sensor;
        },

        // Elimina un sensor (temporal).
        eliminarSensor(id) {
            this.sensores = this.sensores.filter((s) => s.id !== id);
            this.guardarSesion();
        },

        // Alta de usuario (temporal). La clave inicial es 1234 y el rol, usuario.
        agregarUsuario({ nombre, correo, clave = '1234', rol = 'usuario' }) {
            const usuario = {
                id: this.siguienteId(this.usuarios),
                nombre,
                correo,
                clave,
                rol
            };
            this.usuarios.push(usuario);
            this.guardarSesion();
            return usuario;
        },

        // Actualiza nombre y correo de un usuario (temporal). La clave y el rol no cambian.
        actualizarUsuario(id, datos) {
            const usuario = this.usuarios.find((u) => u.id === id);
            if (usuario) {
                Object.assign(usuario, datos);
                this.guardarSesion();
            }
            return usuario;
        },

        // Elimina un usuario y, en cascada, sus cultivos, sensores y las lecturas de esos sensores.
        eliminarUsuario(id) {
            const nombresSensores = this.sensores
                .filter((s) => s.usuarioId === id)
                .map((s) => s.nombre);

            this.usuarios = this.usuarios.filter((u) => u.id !== id);
            this.cultivos = this.cultivos.filter((c) => c.usuarioId !== id);
            this.sensores = this.sensores.filter((s) => s.usuarioId !== id);
            this.lecturas = this.lecturas.filter((l) => !nombresSensores.includes(l.sensor));
            this.guardarSesion();
        }
    });

    // Resumen del dashboard: todos los números se calculan desde el store.
    Alpine.data('resumen', () => ({
        contarSensores(estado) {
            return Alpine.store('datos').sensores.filter((s) => s.estado === estado).length; //s de sensor 
        },

        get cultivosRegistrados() {
            return Alpine.store('datos').cultivos.length;
        },

        get sensoresActivos() {
            return this.contarSensores('Activo');
        },

        get sensoresMantenimiento() {
            return this.contarSensores('Mantenimiento');
        },

        get sensoresDesconectados() {
            return this.contarSensores('Desconectado');
        },

        get datosRecolectados() {
            return Alpine.store('datos').lecturas.length;
        },

        // Sensores que no están activos se muestran como alertas. !!(O^O)
        get alertas() {
            return Alpine.store('datos').sensores.filter((s) => s.estado !== 'Activo');
        }
    }));

    // Métricas del panel de administración. Usan las mismas definiciones que el
    // dashboard del usuario (cultivos, sensores y lecturas), para que los conteos coincidan.
    Alpine.data('resumenAdmin', () => ({
        get totalUsuarios() {
            // Se cuentan solo los usuarios con rol "usuario" (el administrador no tiene invernadero).
            return Alpine.store('datos').usuarios.filter((u) => u.rol !== 'admin').length;
        },

        // Cada usuario con rol "usuario" tiene un invernadero. No he pensado qué hacer si quisieran más de uno O-o
        get cantidadInvernaderos() {
            return this.totalUsuarios;
        },

        get totalCultivos() {
            return Alpine.store('datos').cultivos.length;
        },

        get totalSensores() {
            return Alpine.store('datos').sensores.length;
        },

        get datosRecolectados() {
            return Alpine.store('datos').lecturas.length;
        }
    }));

    // Orden y filtro por tipo de los cultivos
    Alpine.data('filtroCultivos', () => ({
        filtroTipo: '',
        orden: 'fecha-asc',

        // Tipos ordenados alfabéticamente, para el selector.
        get tipos() {
        const tipos = Alpine.store('datos').cultivos.map((c) => c.tipo);
        return [...new Set(tipos)].sort((a, b) => a.localeCompare(b, 'es'));
        },

        // Cultivos filtrados por tipo y ordenados por fecha (sin modificar el store).
        get cultivosVisibles() {
        const lista = Alpine.store('datos').cultivos
            .filter((c) => this.filtroTipo === '' || c.tipo === this.filtroTipo);

            lista.sort((a, b) => {
                // Las fechas en formato AAAA-MM-DD se comparan bien como texto c:
                let resultado = 0;
                if (a.fecha < b.fecha) {
                resultado = -1;
                } 
                else if (a.fecha > b.fecha) {
                resultado = 1;
                }

                // Para orden descendente se invierte el resultado.
                if (this.orden === 'fecha-desc') {
                resultado = -resultado;
                }
                return resultado;
            });
        return lista;
        },

        limpiarFiltro() {
            this.filtroTipo = '';
        },

        // Edición de cultivos: el formulario se muestra bajo la tabla.
        cultivoEditandoId: null,
        formCultivo: { nombre: '', tipo: '', fecha: '', estacional: false },
        erroresCultivo: {},
        mensajeCultivo: '',

        iniciarEdicion(cultivo) {
            this.cultivoEditandoId = cultivo.id;
            this.formCultivo = {
                nombre: cultivo.nombre,
                tipo: cultivo.tipo,
                fecha: cultivo.fecha,
                estacional: cultivo.estacional
        };
        this.erroresCultivo = {};
        this.mensajeCultivo = '';
        },

        cancelarEdicion() {
        this.cultivoEditandoId = null;
        this.erroresCultivo = {};
        },

        validarEdicion() {
        const c = this.formCultivo;
        const errores = {};

        if (!c.nombre.trim()) {
            errores.nombre = 'Ingresa el nombre del cultivo.';
        }
        if (!c.tipo.trim()) {
            errores.tipo = 'Ingresa el tipo de cultivo (por ejemplo, Flor o Alimentario).';
        }
        if (!c.fecha) {
            errores.fecha = 'Selecciona la fecha de cultivo.';
        }

        this.erroresCultivo = errores;
        return Object.keys(errores).length === 0;
        },

        guardarEdicion() {
        this.mensajeCultivo = '';
        if (!this.validarEdicion()) {
            return;
        }
        const nombre = this.formCultivo.nombre.trim();
        Alpine.store('datos').actualizarCultivo(this.cultivoEditandoId, {
            nombre,
            tipo: this.formCultivo.tipo.trim(),
            fecha: this.formCultivo.fecha,
            estacional: this.formCultivo.estacional
        });
        this.mensajeCultivo = `Cultivo "${nombre}" actualizado.`;
        this.cancelarEdicion();
        },

        // Pide confirmación antes de borrar.
        eliminarCultivo(cultivo) {
            const confirmar = window.confirm(`¿Eliminar el cultivo "${cultivo.nombre}"? Esta acción no se puede deshacer.`);
            if (!confirmar) {
                return;
            }
            if (this.cultivoEditandoId === cultivo.id) {
                this.cancelarEdicion();
            }
            Alpine.store('datos').eliminarCultivo(cultivo.id);
            this.mensajeCultivo = `Cultivo "${cultivo.nombre}" eliminado.`;
        }
    }));

    // Edición y eliminación de sensores (simulada). El nombre no se
    // cambia porque las lecturas se relacionan con el sensor por ese nombre.
    Alpine.data('edicionSensores', () => ({
        sensorEditandoId: null,
        nombreSensor: '',
        formSensor: { descripcion: '', unidad: '', estado: 'Activo' },
        erroresSensor: {},
        mensajeSensor: '',

        iniciarEdicion(sensor) {
            this.sensorEditandoId = sensor.id;
            this.nombreSensor = sensor.nombre;
            this.formSensor = {
                descripcion: sensor.descripcion,
                unidad: sensor.unidad,
                estado: sensor.estado
            };
        this.erroresSensor = {};
        this.mensajeSensor = '';
        },

        cancelarEdicion() {
            this.sensorEditandoId = null;
            this.erroresSensor = {};
        },

        validarEdicion() {
            const s = this.formSensor;
            const errores = {};

            if (!s.descripcion.trim()) {
                errores.descripcion = 'Ingresa una descripción del sensor.';
            }
            if (!s.unidad.trim()) {
                errores.unidad = 'Ingresa la unidad que mide el sensor (por ejemplo, °C o pH).';
            }

            this.erroresSensor = errores;
            return Object.keys(errores).length === 0;
        },

        guardarEdicion() {
            this.mensajeSensor = '';
             if (!this.validarEdicion()) {
                return;
            }
            Alpine.store('datos').actualizarSensor(this.sensorEditandoId, {
                descripcion: this.formSensor.descripcion.trim(),
                unidad: this.formSensor.unidad.trim(),
                estado: this.formSensor.estado
            });
            this.mensajeSensor = `Sensor "${this.nombreSensor}" actualizado.`;
            this.cancelarEdicion();
        },

        // Pide confirmación antes de borrar.
        eliminarSensor(sensor) {
        const confirmar = window.confirm(`¿Eliminar el sensor "${sensor.nombre}"? Esta acción no se puede deshacer.`);
        if (!confirmar) {
            return;
        }
        if (this.sensorEditandoId === sensor.id) {
            this.cancelarEdicion();
        }
        Alpine.store('datos').eliminarSensor(sensor.id);
        this.mensajeSensor = `Sensor "${sensor.nombre}" eliminado.`;
        }
    }));
    //Comienzo a pensar que estamos haciendo algo que no nos pedían,
    //eso o es normal tener tantas líneas en un archivo js
    //...no, creo que es lo normal
    //el profe mostró algo similar el viernes pasado y era súper largo
    //Hace sueño =-=

    // Administración de usuarios: listado con conteos, eliminación con confirmación
    // y alta de usuario nuevo (todo simulado sobre el store).
    Alpine.data('adminUsuarios', () => ({
        mostrarForm: false,
        nuevo: { nombre: '', correo: '' },
        erroresUsuario: {},
        mensajeUsuario: '',

        // Edición de usuarios: el formulario se muestra bajo la tabla.
        editandoId: null,
        nombreEditando: '',
        formEditar: { nombre: '', correo: '' },
        erroresEditar: {},

        contarCultivos(usuarioId) {
            return Alpine.store('datos').cultivos.filter((c) => c.usuarioId === usuarioId).length;
        },

        contarSensores(usuarioId) {
            return Alpine.store('datos').sensores.filter((s) => s.usuarioId === usuarioId).length;
        },

        abrirFormulario() {
            this.cancelarEdicion();
            this.mostrarForm = true;
            this.mensajeUsuario = '';
        },

        cancelarAlta() {
            this.mostrarForm = false;
            this.nuevo = { nombre: '', correo: '' };
            this.erroresUsuario = {};
        },

        validarAlta() {
            const nombre = this.nuevo.nombre.trim();
            const correo = this.nuevo.correo.trim();
            const errores = {};

            if (!nombre) {
                errores.nombre = 'Ingresa el nombre del usuario.';
            }

            if (!correo) {
                errores.correo = 'Ingresa el correo electrónico del usuario.';
            } 
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
                errores.correo = 'El correo no tiene un formato válido.';
            } 
            else if (Alpine.store('datos').usuarios.some((u) => u.correo.toLowerCase() === correo.toLowerCase())) {
                errores.correo = 'Ya existe un usuario con ese correo.';
            }
            this.erroresUsuario = errores;
            return Object.keys(errores).length === 0;
        },

        crearUsuario() {
            this.mensajeUsuario = '';
            if (!this.validarAlta()) {
                return;
            }
            const nombre = this.nuevo.nombre.trim();
            const correo = this.nuevo.correo.trim();
            Alpine.store('datos').agregarUsuario({ nombre, correo });
                this.mensajeUsuario = `Usuario "${nombre}" creado. Su clave inicial es 1234.`;
                this.cancelarAlta();
        },

        iniciarEdicion(usuario) {
            this.cancelarAlta();
            this.editandoId = usuario.id;
            this.nombreEditando = usuario.nombre;
            this.formEditar = { nombre: usuario.nombre, correo: usuario.correo };
            this.erroresEditar = {};
            this.mensajeUsuario = '';
        },

        cancelarEdicion() {
            this.editandoId = null;
            this.erroresEditar = {};
        },

        validarEdicion() {
            const nombre = this.formEditar.nombre.trim();
            const correo = this.formEditar.correo.trim();
            const errores = {};

            if (!nombre) {
                errores.nombre = 'Ingresa el nombre del usuario.';
            }

            if (!correo) {
                errores.correo = 'Ingresa el correo electrónico del usuario.';
            } 
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
                errores.correo = 'El correo no tiene un formato válido.';
            } 
            else if (Alpine.store('datos').usuarios.some((u) => u.id !== this.editandoId && u.correo.toLowerCase() === correo.toLowerCase())) {
                errores.correo = 'Ya existe otro usuario con ese correo.';
            }

            this.erroresEditar = errores;
            return Object.keys(errores).length === 0;
        },

        guardarEdicion() {
            this.mensajeUsuario = '';
            if (!this.validarEdicion()) {
                return;
            }
            const nombre = this.formEditar.nombre.trim();
            const correo = this.formEditar.correo.trim();
            Alpine.store('datos').actualizarUsuario(this.editandoId, { nombre, correo });
                this.mensajeUsuario = `Usuario "${nombre}" actualizado.`;
                this.cancelarEdicion();
        },

        // Pide confirmación antes de borrar. El administrador no se puede eliminar.
        eliminarUsuario(usuario) {
            if (usuario.rol === 'admin') {
                this.mensajeUsuario = 'No se puede eliminar al administrador.';
                return;
            }
            const confirmar = window.confirm(`¿Eliminar al usuario "${usuario.nombre}"? También se borrarán sus cultivos y sensores. Esta acción no se puede deshacer.`);
            if (!confirmar) {
                return;
            }
            if (this.editandoId === usuario.id) {
                this.cancelarEdicion();
            }
            Alpine.store('datos').eliminarUsuario(usuario.id);
                this.mensajeUsuario = `Usuario "${usuario.nombre}" eliminado.`;
        }
    }));

    // Consulta global de cultivos y sensores de todos los usuarios, con filtro por usuario.
    //Cada filtro nuevo es sufrir :c
    Alpine.data('invernaderosGlobal', () => ({
        usuarioId: '',

        nombreUsuario(id) {
            const usuario = Alpine.store('datos').usuarios.find((u) => u.id === id);
            if (usuario) {
                return usuario.nombre;
            } 
            else {
                return '';
            }
        },

        // Lista unificada de cultivos y sensores, con propietario y estado para la tabla.
        get recursos() {
            const store = Alpine.store('datos');
            const lista = [];

            store.cultivos.forEach((c) => {
                lista.push({
                    clave: `c${c.id}`,
                    usuarioId: c.usuarioId,
                    propietario: this.nombreUsuario(c.usuarioId),
                    recurso: c.nombre,
                    tipo: `Cultivo (${c.tipo})`,
                    estado: '—',
                    clase: ''
                });
            });

            store.sensores.forEach((s) => {
                lista.push({
                    clave: `s${s.id}`,
                    usuarioId: s.usuarioId,
                    propietario: this.nombreUsuario(s.usuarioId),
                    recurso: s.nombre,
                    tipo: `Sensor (${s.unidad})`,
                    estado: s.estado,
                    clase: store.visualEstado(s.estado).clase
                });
            });

            return lista;
        },

        // Recursos del usuario elegido en el filtro (o todos si no hay filtro).
        get recursosVisibles() {
            if (this.usuarioId === '') {
                return this.recursos;
            } 
            else {
                const id = Number(this.usuarioId);
                return this.recursos.filter((r) => r.usuarioId === id); //r de recursos
            }
        }
    }));


    //-------------------------------------------------------------------------------------------------------------------------------------------------
    //Componente para el formulario de login.html
    //Busca el correo ingresado entre los usuarios registrados y redirige a la opágina de inicio que 
    //corresponda según su rol: admin->admin.html y usuario->dashboard.html
    Alpine.data('login', () => ({
        correo: '',
        clave: '',
        error: '',
        errores: {},

        //validar() --> valida que lo que se escribe esté correcto
        validar() {
            this.errores = {};
            const correo = this.correo.trim();

            if (!correo) {
                this.errores.correo = 'Ingresa tu correo electrónico.';
            } 
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
                this.errores.correo = 'El correo no tiene un formato válido.';
            }

            if (!this.clave) {
                this.errores.clave = 'Ingresa tu contraseña.';
            } 
            else if (this.clave.length < 4) {
                this.errores.clave = 'La contraseña debe tener al menos 4 caracteres.';
            }

            return Object.keys(this.errores).length === 0;
        },

        // Devuelve 'true' o 'false' para aria-invalid, según si el campo tiene error.
        ariaInvalido(campo) {
            if (this.errores[campo]) {
                return 'true';
            } 
            else {
                return 'false';
            }
        },

        ingresar() {
            this.error = '';
            if (!this.validar()) {
                return;
            }


            const correo = this.correo.trim().toLowerCase(); //para que si se escribe en mayúsculas igual funcione
            const usuario = Alpine.store('datos').usuarios.find(
                (u) => u.correo.toLowerCase() === correo && u.clave === this.clave //u de usuario
            );

            if(!usuario) {
                this.error = 'Correo o contraseña ingresado incorrecto.';
                return;
            }

            //Rutas para las vistas por rol.

            if(usuario.rol === 'admin'){
                window.location.href = 'Admin/admin.html';
            }
            else{
                window.location.href = 'Usuario/dashboard.html';
            }
        }
    }));

    // Componente para el formulario de cultivo y sensor.
    //Valida los campos y guarda el registro en el store.
    Alpine.data('crearRegistro', () => ({
        tipo: 'cultivo',
        exito: '',
        errores: {},
        cultivo: { nombre: '', tipo: '', fecha: '', estacional: false },
        sensor: { nombre: '', descripcion: '', unidad: '', estado: 'Activo' },

        // Al cambiar de formulario se limpian errores y mensajes anteriores.
        cambiarTipo() {
        this.errores = {};
        this.exito = '';
        },

        validarCultivo() {
        const c = this.cultivo; //c de cultivo
        const errores = {};

        if (!c.nombre.trim()) {
            errores.nombre = 'Ingresa el nombre del cultivo.';
        }
        if (!c.tipo.trim()) {
            errores.tipo = 'Ingresa el tipo de cultivo (por ejemplo, Flor o Alimentario).';
        }
        if (!c.fecha) {
            errores.fecha = 'Selecciona la fecha de cultivo.';
        }

        this.errores = errores;
        return Object.keys(errores).length === 0;
        },

        validarSensor() {
            const s = this.sensor; //s de sensor
            const nombre = s.nombre.trim();
            const errores = {};

            if (!nombre) {
                errores.nombre = 'Ingresa el nombre del sensor.';
            } 
            else if (!/^[A-Za-z0-9_]+$/.test(nombre)) {
                errores.nombre = 'Usa solo letras, números y guion bajo (_). Ejemplo: Juan_Temperatura_2.';
            } 
            else if (Alpine.store('datos').sensores.some((x) => x.nombre.toLowerCase() === nombre.toLowerCase())) {
                errores.nombre = 'Ya existe un sensor con ese nombre. Elige otro.';
            }
            if (!s.descripcion.trim()) {
                errores.descripcion = 'Ingresa una descripción del sensor.';
            }
            if (!s.unidad.trim()) {
                errores.unidad = 'Ingresa la unidad que mide el sensor (por ejemplo, °C o pH).';
            }

            this.errores = errores;
            return Object.keys(errores).length === 0;
            },

        enviarCultivo() {
            this.exito = '';
            if (!this.validarCultivo()) {
                return;
            }
            const nombre = this.cultivo.nombre.trim();
            Alpine.store('datos').agregarCultivo({
                nombre,
                tipo: this.cultivo.tipo.trim(),
                fecha: this.cultivo.fecha,
                estacional: this.cultivo.estacional
            });
            this.cultivo = { nombre: '', tipo: '', fecha: '', estacional: false };
            this.exito = `Cultivo "${nombre}" creado.`;
        },

        enviarSensor() {
            this.exito = '';
            if (!this.validarSensor()) {
                return;
            }
            const nombre = this.sensor.nombre.trim();
            Alpine.store('datos').agregarSensor({
                nombre,
                descripcion: this.sensor.descripcion.trim(),
                unidad: this.sensor.unidad.trim(),
                estado: this.sensor.estado
            });
            this.sensor = { nombre: '', descripcion: '', unidad: '', estado: 'Activo' };
            this.exito = `Sensor "${nombre}" creado.`;
        }
    }));

    //----------------------------------------------------------------------------------------------------------------------------------

    // Estadísticas: gráfico y tabla de lecturas por sensor, generados desde el store.
    Alpine.data('estadisticas', () => ({
        sensorNombre: '',
        limite: '10',

        init() {
            const primero = this.sensoresConLecturas[0];
            this.sensorNombre = primero ? primero.nombre : '';
        },

        // Sensores que tienen al menos una lectura.
        get sensoresConLecturas() {
            const store = Alpine.store('datos');
            const conLecturas = new Set(store.lecturas.map((l) => l.sensor));
            return store.sensores.filter((s) => conLecturas.has(s.nombre));
        },

        get sensorActual() {
            return this.sensoresConLecturas.find((s) => s.nombre === this.sensorNombre) || null;
        },

        get unidad() {
            return this.sensorActual ? this.sensorActual.unidad : '';
        },

        get tituloGrafico() {
            return this.sensorActual ? `Lecturas de ${this.sensorActual.nombre}` : 'Sin lecturas';
        },

        // Lecturas del sensor elegido, en orden cronológico, limitadas a las últimas N.
        get lecturasGrafico() {
            return Alpine.store('datos').lecturas
            .filter((l) => l.sensor === this.sensorNombre)
            .sort((a, b) => a.fecha.localeCompare(b.fecha))
            .slice(-Number(this.limite));
        },

        // Tabla: las más recientes primero.
        get lecturasTabla() {
            return [...this.lecturasGrafico].reverse();
        },

        // Convierte AAAA-MM-DD a DD-MM-AAAA.
        formatearFecha(fecha) {
            const [anio, mes, dia] = fecha.split('-');
            return `${dia}-${mes}-${anio}`;
            //pensar que esto antes era un ejercicio completo evaluado en progra
        },

        // "Escapa" texto antes de insertarlo como HTML ya que alpine no lee archivos SVG
        escapar(texto) {
            return String(texto)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        },

        // Coordenadas de cada punto dentro del viewBox 720 x 280.
        get puntos() {
            const datos = this.lecturasGrafico;
            if (datos.length === 0) {
                return [];
            }

            const valores = datos.map((l) => l.valor);
            let min = Math.min(...valores);
            let max = Math.max(...valores);
            if (min === max) {
                min -= 1;
                max += 1;
            }
            const margen = (max - min) * 0.1;
            min -= margen;
            max += margen;

            const xInicio = 60;
            const xFin = 700;
            const yBase = 235;
            const yTope = 40;

            return datos.map((l, i) => {
                let x;
                if (datos.length === 1) {
                    x = (xInicio + xFin) / 2;
                } 
                else {
                    x = xInicio + i * (xFin - xInicio) / (datos.length - 1);
                }
                const y = yBase - (l.valor - min) / (max - min) * (yBase - yTope);
                const fecha = this.formatearFecha(l.fecha);
                return {
                    x: x.toFixed(1),
                    y: y.toFixed(1),
                    valor: l.valor,
                    fecha,
                    etiqueta: fecha.slice(0, 5)
                };
            });
        },

        // SVG del gráfico (se inserta con x-html; todo el texto va escapado).
        get graficoHtml() {
            const puntos = this.puntos;
            if (puntos.length === 0) {
                return '<p class="muted">No hay lecturas para este sensor.</p>';
            }

            const polilinea = puntos.map((p) => `${p.x},${p.y}`).join(' ');
            const marcas = puntos.map((p) => `
            <g>
            <circle class="chart-point" cx="${p.x}" cy="${p.y}" r="5"><title>${this.escapar(p.fecha)}: ${this.escapar(p.valor)} ${this.escapar(this.unidad)}</title></circle>
            <text class="chart-label" x="${p.x}" y="260" text-anchor="middle">${this.escapar(p.etiqueta)}</text>
            </g>`).join('');

            // Marcas del eje vertical: mínimo, punto medio y máximo, en la unidad del sensor.
            const { min, max } = this.escala;
            const yDe = (v) => (235 - (v - min) / (max - min) * (235 - 40)).toFixed(1);
            const marcasY = [0, 0.5, 1].map((k) => {
                const v = min + k * (max - min);
                const texto = this.escapar(String(Number(v.toFixed(2))));
                return `
                <line class="chart-gridline" x1="60" y1="${yDe(v)}" x2="700" y2="${yDe(v)}"></line>
                <text class="chart-label" x="52" y="${yDe(v)}" dy="4" text-anchor="end">${texto}</text>`;
            }).join('');

            const unidad = this.escapar(this.unidad);
            let etiquetaUnidad = '';
            if (unidad) {
                etiquetaUnidad = ` (${unidad})`;
            }

            return `
            <svg viewBox="0 0 720 290" role="img" aria-labelledby="titulo-grafico descripcion-grafico">
            <desc id="descripcion-grafico">Gráfico de ${puntos.length} lecturas de ${this.escapar(this.sensorNombre)}, ordenadas cronológicamente.</desc>
            ${marcasY}
            <line class="chart-gridline" x1="60" y1="40" x2="60" y2="235"></line>
            <text class="chart-label" transform="rotate(-90 14 137)" x="14" y="137" text-anchor="middle">Valor${etiquetaUnidad}</text>
            <polyline class="chart-line" points="${polilinea}"></polyline>
            ${marcas}
            <text class="chart-label" x="380" y="284" text-anchor="middle">Fecha (DD-MM)</text>
            </svg>`;
            //horror puro, no habría puesto un gráfico de no ser por que nos lo piden
            //quizás si lo dejaba estático pasaba piola ;-;
        }
    }));

    //-----------------------------------------------------------------------------------------------------------------------------------------------------------------------

    //Restauración de valores iniciales en los datos al cverrar sesión

    document.addEventListener('click', (e) => { //e de evento
        if(e.target.closest('button-logout')){
            sessionStorage.removeItem(claveSesion);
        }
    });
});