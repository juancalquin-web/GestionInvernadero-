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
    

    Alpine.store('datos', {
        usuarios: copiar(datosOriginales.usuarios),
        lecturas: copiar(datosOriginales.lecturas),
        cultivos: copiar(datosOriginales.cultivos),
        sensores: copiar(datosOriginales.sensores),

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
        }
    });

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
        } else if (!/^[A-Za-z0-9_]+$/.test(nombre)) {
            errores.nombre = 'Usa solo letras, números y guion bajo (_). Ejemplo: Juan_Temperatura_2.';
        } else if (Alpine.store('datos').sensores.some((x) => x.nombre.toLowerCase() === nombre.toLowerCase())) {
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


    //Restauración de valores iniciales en los datos al cverrar sesión

    document.addEventListener('click', (e) => { //e de evento
        if(e.target.closest('button-logout')){
            sessionStorage.removeItem(claveSesion);
        }
    });
});