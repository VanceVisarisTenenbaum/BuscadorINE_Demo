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
    removeCanvas();
    createCanvas();
    let ctx = getChart().getContext('2d');
    let datasets = list_of_data.map(
        (datos_series) => {
            let data = datos_series['Data'];
            let lab = datos_series['Nombre'];
            //const xData = data.map(point => point['Fecha']);
            const yData = data.map(point => point['Valor']);
            return {
                label: lab,
                data: yData
            }
        }
    )
    
    
    let X = list_of_data[0]['Data'].map(function(dato){
        let f = dato['Fecha'];
        let pos = f.indexOf('T');
        if (pos!=-1){return f.substring(0,pos);}
    });
    console.log(datasets);
    console.log(X);
    new Chart(ctx,{
        type:'line',
        data: {
            labels: X,
            datasets: datasets,
        },
        options: {
            scales: {
                x: {
                    type: 'category',
                    time:{}
                }
            }
        },
        plugins: {
            afterDatasetsDraw: function(chart) {
                const ctx = chart.ctx;
                const xAxis = chart.scales.x;

                // Estilo de las líneas
                ctx.save();
                let categoriasReferencia = [
                    {
                        'Value':new Date('1996-05-01'), //Dates are the beginning of the year
                        'Label':'PP: Aznar',
                        'color':'#176AA5'
                    },
                    {
                        'Value':new Date('2004-04-01'),
                        'Label':'PSOE: Zapatero',
                        'color':'#B80D16',
                    },
                    {
                        'Value':new Date('2011-12-01'),
                        'Label':'PP: Rajoy',
                        'color':'#176AA5'
                    },
                    {
                        'Value':new Date('2018-06-01'),
                        'Label':'PSOE: Sánchez',
                        'color':'#B80D16'
                    }
                ]
                // Dibujar líneas para cada categoría de referencia
                categoriasReferencia.forEach(categoriaReferencia => {
                    const x = xAxis.getPixelForValue(categoriaReferencia.Value);
                    ctx.beginPath();
                    ctx.moveTo(x, chart.scales.y.bottom); // Desde abajo del gráfico
                    ctx.lineTo(x, chart.scales.y.top); // Hasta arriba del gráfico
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = categoriaReferencia.color; // Usar el color de la categoría
                    ctx.stroke();
                    
                    // Opcional: dibujar etiqueta al lado de la línea
                    ctx.fillStyle = categoriaReferencia.color;
                    ctx.fillText(categoriaReferencia.Label, x + 5, chart.scales.y.top + 10);
                });

                ctx.restore();
            }
        }
    })
    return undefined;
}


export {plotXY,multiPlot};