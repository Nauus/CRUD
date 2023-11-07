document.addEventListener('DOMContentLoaded', () => {
    const resultsElement = document.getElementById('results');
    const alertErrorElement = document.getElementById('alert-error');
    const postNombreInput = document.getElementById('inputPostNombre');
    const postApellidoInput = document.getElementById('inputPostApellido');
    const putNombreInput = document.getElementById('inputPutNombre');
    const putApellidoInput = document.getElementById('inputPutApellido');
    const get1IdInput = document.getElementById('inputGet1Id');
    const btnPost = document.getElementById('btnPost');
    const btnPut = document.getElementById('btnPut');
    const btnDelete = document.getElementById('btnDelete');
    const inputPutId = document.getElementById('inputPutId');
    const inputDelete = document.getElementById('inputDelete');

    // Función para habilitar/deshabilitar botones según el contenido de los campos
    function actualizarEstadoBotones() {
        // Habilitar o deshabilitar el botón "Agregar" según los campos de agregar
        btnPost.disabled = postNombreInput.value.trim() === '' || postApellidoInput.value.trim() === '';
    
        // Habilitar el botón "Modificar" si ambos campos de modificar no están vacíos
        btnPut.disabled = inputPutId.value.trim() === '';
    
        // Habilitar el botón "Eliminar" si el campo de eliminar no está vacío
        btnDelete.disabled = inputDelete.value.trim() === '';
    }
    
    // Agregar eventos input a los campos de texto para actualizar el estado de los botones
    postNombreInput.addEventListener('input', actualizarEstadoBotones);
    postApellidoInput.addEventListener('input', actualizarEstadoBotones);
    
    inputDelete.addEventListener('input', actualizarEstadoBotones);
    inputPutId.addEventListener('input', actualizarEstadoBotones);
    
    // Agregar eventos input a los campos de modificar para actualizar el estado de los botones
    putNombreInput.addEventListener('input', actualizarEstadoBotones);
    putApellidoInput.addEventListener('input', actualizarEstadoBotones);
    
    // Ejecutar la función inicialmente para deshabilitar los botones
    actualizarEstadoBotones();
    
 function handleUpdateResponse(data) {
     putNombreInput.value = '';
     putApellidoInput.value = '';
     listarRegistros();
 }
 function handleDeleteResponse(data) {
    document.getElementById('inputDelete').value = '';
    listarRegistros();
}
function handleAddResponse(data) {
    if (data && data.id) {
        console.log('Registro agregado con éxito, ID:', data.id);
        // Limpia los campos de entrada
        postNombreInput.value = '';
        postApellidoInput.value = '';
        // Actualiza la lista de registros
        listarRegistros();
    } else {
        mostrarAlertaError('Hubo un problema al agregar el registro.');
    }
}
 function listarRegistros(id = '') {
    fetchRecords('GET', id, handleListResponse);
}

    function agregarRegistro() {
        const nombre = postNombreInput.value.trim();
        const apellido = postApellidoInput.value.trim();
    
        if (!nombre || !apellido) {
            mostrarAlertaError('Por favor, complete los campos Nombre y Apellido.');
            return;
        }
    
        // Obtener la lista actual de registros
        const registrosActuales = resultsElement.querySelectorAll('li');
    
        // Obtener el último ID y agregar 1 para generar un nuevo ID
        let nuevoID = 1;
        if (registrosActuales.length > 0) {
            const ultimoRegistro = registrosActuales[registrosActuales.length - 1];
            const idPartes = ultimoRegistro.textContent.match(/ID: (\d+)/);
            if (idPartes && idPartes[1]) {
                nuevoID = parseInt(idPartes[1]) + 1;
            }
        }
    
        const nuevoUsuario = {
            id: nuevoID,
            name: nombre,
            lastname: apellido
        };
    
        fetchRecords('POST', '', handleAddResponse, nuevoUsuario);
    }
    function borrarRegistro() {
        const id = document.getElementById('inputDelete').value.trim();
    
        if (!id || isNaN(id)) {
            mostrarAlertaError('Por favor, ingrese un ID válido para eliminar.');
            return;
        }
    
        // Utiliza la URL con el parámetro :id para la solicitud DELETE
        fetchRecords('DELETE', id, handleDeleteResponse);
    }

    function fetchRecords(method, id, callback, data = null) {
        let url = 'https://654a3887e182221f8d52c03e.mockapi.io/users';
    
        if (method === 'PUT' && id) {
            // Utiliza el ID proporcionado para construir la URL de actualización.
            url += `/${id}`;
        } else if (method === 'DELETE' && id) {
            // En el caso de DELETE, la URL debe ser la del recurso a eliminar.
            url += `/${id}`;
        } else if (method === 'GET' && id) {
            // En el caso de la búsqueda, agrega el id como un parámetro de consulta
            url += `?id=${id}`;
        }
    
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: data ? JSON.stringify(data) : null
        };
    
        fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Hubo un problema con la solicitud.');
                }
                return response.json();
            })
            .then(data => {
                callback(data);
            })
            .catch(error => {
                mostrarAlertaError(error.message);
            });
    }

    function handleListResponse(data) {
        resultsElement.innerHTML = '';
        if (Array.isArray(data)) {
            const idToSearch = document.getElementById('inputGet1Id').value.trim();
            if (idToSearch) {
                const exactMatches = data.filter(user => user.id === idToSearch);
                if (exactMatches.length === 0) {
                    mostrarAlertaError('No se encontraron registros con el ID especificado.');
                } else {
                    exactMatches.forEach(user => {
                        const listItem = document.createElement('li');
                        listItem.textContent = `ID: ${user.id}, Nombre: ${user.name}, Apellido: ${user.lastname}`;
                        resultsElement.appendChild(listItem);
                    });
                }
            } else {
                mostrarAlertaError('Por favor, ingrese un ID válido.');
            }
        } else {
            mostrarAlertaError('La respuesta del servidor no es válida.');
        }
    }
    
    function mostrarAlertaError(mensaje) {
        alertErrorElement.textContent = mensaje;
        alertErrorElement.classList.add('show');
        setTimeout(() => {
            alertErrorElement.classList.remove('show');
        }, 3000);
    }

    document.getElementById('btnGet1').addEventListener('click', () => {
        const id = get1IdInput.value.trim();
        if (!id) {
            mostrarAlertaError('Por favor, ingrese un ID válido para buscar.');
            return;
        }
        listarRegistros(id);
    });
    
    document.getElementById('btnPost').addEventListener('click', agregarRegistro);
    document.getElementById('btnDelete').addEventListener('click', borrarRegistro);


    document.getElementById('btnPut').addEventListener('click', () => {
        const putIdInput = document.getElementById('inputPutId');
        const userId = parseInt(putIdInput.value.trim());
        if (!userId || isNaN(userId)) {
            mostrarAlertaError('Por favor, ingrese un ID válido para modificar.');
            return;
        }
    
        // Obtener los registros de la API con el ID especificado y cargar los valores en el modal.
        fetchRecords('GET', userId, (data) => {
            if (Array.isArray(data) && data.length > 0) {
                // Si se encontraron resultados, abre el modal
                $('#modifyModal').modal('show');
    
                // Puedes mostrar los resultados en el modal, o hacer que el usuario seleccione uno si hay varios
                // Por ejemplo, podrías mostrar una lista de resultados en el modal y permitir al usuario elegir uno.
    
                // Otra opción es preseleccionar el primer resultado automáticamente.
                const user = data[0];
                document.getElementById('modalUserId').value = user.id;
                document.getElementById('modalNombre').value = user.name;
                document.getElementById('modalApellido').value = user.lastname;
            } else {
                mostrarAlertaError('No se encontraron registros con el ID especificado.');
                console.log(data);
            }
        });
    });
    
    // Asociar una función al botón "Guardar Cambios" del modal.
    document.getElementById('btnSaveChanges').addEventListener('click', () => {
        const userId = document.getElementById('modalUserId').value;
        const nuevoNombre = document.getElementById('modalNombre').value;
        const nuevoApellido = document.getElementById('modalApellido').value;
    
        // Verificar que se ingresen valores válidos para el nombre y el apellido.
        if (!nuevoNombre || !nuevoApellido) {
            mostrarAlertaError('Por favor, complete los campos Nombre y Apellido en el modal.');
            return;
        }
    
        // Crear el objeto de datos para la actualización.
        const datosActualizados = {
            id: userId,
            name: nuevoNombre,
            lastname: nuevoApellido
        };
    
        // Realizar una solicitud PUT para actualizar el registro en la API.
        fetchRecords('PUT', userId, (data) => {
            // Cerrar el modal.
            $('#modifyModal').modal('hide');
    
            // Limpiar los campos del modal.
            document.getElementById('modalUserId').value = '';
            document.getElementById('modalNombre').value = '';
            document.getElementById('modalApellido').value = '';
    
            // Actualizar la lista de registros para reflejar los cambios.
            listarRegistros();
        }, datosActualizados);
    });
});