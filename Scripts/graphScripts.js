function getChart(){
    return document.getElementById('Grafica');
}

function removeCanvas(){
    let chart = getChart();
    chart.remove();
    return undefined;
}

function createCanvas(){
    let chart = document.createElement('canvas');
    chart.id='Grafica';
    document.getElementById('canvasContainer').appendChild(chart);
    return undefined;
}

function getConfig(XData,YData,varName){
    return {
        'type':'line',
        'data': {
            'labels':XData,
            'datasets': [
                {
                    'label':varName,
                    'data':YData,
                    'backgroundColor': 'rgba(153, 0, 153, 0.2)', // Color de fondo
                    'borderColor': 'rgba(204, 0, 204, 1)', // Color de borde
                    'borderWidth': 1 // Ancho del borde
                }
            ]
        },
    }
}

function getConfigTime(XData,YData,varName){
    return {
        'type':'line',
        'data': {
            'labels':XData,
            'datasets': [
                {
                    'label':varName,
                    'data':YData,
                    'backgroundColor': 'rgba(153, 0, 153, 0.2)', // Color de fondo
                    'borderColor': 'rgba(204, 0, 204, 1)', // Color de borde
                    'borderWidth': 1 // Ancho del borde
                }
            ]
        },
        'options': {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'millisecond'
                    }
                }
            }
        }
    }
}

async function plotXY(x,y,varName,time=false){
    removeCanvas();
    createCanvas();
    let config;
    if (time){config = getConfigTime(x,y,varName);}
    else{config = getConfig(x,y,varName);}
    let ctx = getChart().getContext('2d');
    new Chart(ctx,config);
    return undefined;
}

async function multiPlot(list_of_data){
    let ctx = getChart().getContext('2d');
    let datasets = list_of_data.map(
        (datos_series) => {
            let data = datos_series['Data'];
            let lab = datos_series['Nombre'];
            const xData = data.map(point => point['Fecha']);
            const yData = data.map(point => point['Valor']);
            return {
                label: lab,
                data: yData
            }
        }
    )
    let X = list_of_data[0]['Data'].map(point=>point[0]);
    new Chart(ctx,{
        type:'line',
        data: {
            labels: X,
            datasets: datasets,
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'millisecond'
                    }
                }
            }
        }
    })
    return undefined;
}


export {plotXY,multiPlot};