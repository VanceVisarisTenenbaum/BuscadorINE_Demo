
async function get_data(url) {
    // Espera 50 milisegundos antes de hacer la petición
    console.log(url);
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

/*
function get_data(url) {
    console.log(url);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            fetch(url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => resolve(data)) // Resuelve la promesa con los datos
                .catch(error => reject(error)); // Rechaza la promesa con el error
        }, 50);
    });
}
*/

export {get_data}