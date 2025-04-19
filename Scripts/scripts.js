import {INEAPIHandler} from './INEAPIHandler.js';
import {plotXY,multiPlot} from './graphScripts.js';
const INE = new INEAPIHandler();


function set_text_value_select(list_of_dict,select_id,is_serie=false){
    
    let IdCol='Id';
    if (is_serie){IdCol='COD'}
    //dict must be of shape {'Nombre','Id'}
    let select = document.getElementById(select_id);
    let html = '';
    list_of_dict.slice().sort((a,b)=>{
        if (a.Nombre < b.Nombre) return -1;
        if (a.Nombre > b.Nombre) return 1;
        return 0;
    }).forEach(function(el){
        let text = `<option value="${el[IdCol]}">${el['Nombre']}</option>\n`;
        html += text;
    })
    select.innerHTML=html;
    return undefined;
}



async function set_operations(){
    let ops = await INE.get_operations();
    //console.log(ops);
    ops.unshift({'Id':-1,'Nombre':''});
    set_text_value_select(ops,'SelectOperaciones');
    return undefined;
}
//set_operations();


async function set_tables(op_id){
    if (op_id===null){return undefined;}
    if (op_id===undefined){return undefined;}
    let tabs = await INE.get_tables(op_id);
    //console.log(tabs);
    tabs.unshift({'Id':-1,'Nombre':''});
    set_text_value_select(tabs,'SelectTablas')
    return undefined;
}

async function set_vars(op_id){
    if (op_id===null){return undefined;}
    if (op_id===undefined){return undefined;}
    let vars = await INE.get_variables(op_id);
    //console.log(vars);
    vars.unshift({'Id':-1,'Nombre':''});
    for (let i=1;i<=5;i++){
        set_text_value_select(vars,`Var${i}`);
    }
}

async function set_vals(var_id,row_num){
    let op_id = document.getElementById('SelectOperaciones').value;
    let vals = await INE.get_values(var_id,op_id);
    vals.unshift({'Id':-1,'Nombre':''});
    set_text_value_select(vals,`Val${row_num}`)
}


async function set_series_by_tab(tab_id){
    let ser = await INE.get_series(null,null,tab_id);
    //console.log(ser);
    ser.unshift({'Id':-1,'Nombre':''});
    set_text_value_select(ser,'SelectSeries',true);
}

async function set_series_by_val(){
    let metadata = {};
    let op = document.getElementById('SelectOperaciones').value;
    for (let i=1;i<=5;i++){
        let var_id = document.getElementById(`Var${i}`).value;
        let val_id = document.getElementById(`Val${i}`).value;
        if (var_id==-1){continue;}
        if (val_id==-1){continue;}
        metadata[String(var_id)]=[String(val_id)];
    }
    let ser;
    //console.log(metadata);
    if (Object.entries(metadata).length === 0){ser=[];}
    else {
        ser = await INE.get_series(
            null,
            op,
            null,
            'metadata',
            'metadata',
            0,
            '',
            0,
            metadata
        );
    }
    ser.unshift({'Id':-1,'Nombre':''});
    set_text_value_select(ser,'SelectSeries',true);
}


async function get_data_csv(ser_id,start_date=null,end_date=null,v2=false,add_title=false){
    if (ser_id==-1){return undefined;}
    let data = await INE.get_data(
        ser_id,
        null,
        null,
        0,
        'A',
        500,
        start_date,
        end_date
    );
    let data_vals = data['Data'];
    let label = data['Nombre'];
    let csv;
    if (add_title){csv="Fecha,Valor,Label\n";}
    else {csv="";}
    let x_list = [];
    let y_list = [];
    for (let i = 0; i < data_vals.length; i++) {
        let x = data_vals[i]['Fecha'];
        let y = data_vals[i]['Valor'];

        x_list.push(x);
        y_list.push(y);
        csv += `${x},${y},${label}\n`; // Añadir cada fila
    }
    if (v2){
        return [csv,data]
    }
    return [csv,[x_list,y_list],label];
}

async function write_csv_to_text_and_plot(ser_id,sd,ed){
    let data = await get_data_csv(ser_id,sd,ed);
    let csv_text = data[0];
    let xy = data[1];
    let x = xy[0];
    let y = xy[1];
    let label = data[2];
    plotXY(x,y,label,false);
    document.getElementById('csvOutput').textContent = csv_text;
}

async function write_csv_to_text_and_plot_multi(list_of_ser,sd,ed){
    //let data = list_of_ser.map(async function(ser_id){await get_data_csv(ser_id,sd,ed,true)});
    let data = await Promise.all(list_of_ser.map(function(ser_id,index) {
        let add_title;
        if (index===0){add_title=true;}
        else {add_title=false;}
        return get_data_csv(ser_id, sd, ed, true,add_title);
    }));    
    //console.log(data);
    let csv_text = ""
    let list_of_data = []

    data.forEach(function(t){
        csv_text += t[0];
        list_of_data.push(t[1]);
        return undefined;
    })
    /*
    data here is a list of
    [
        [
            csv,
            data
        ]
    ]
    */
    //console.log(csv_text);
    //console.log(list_of_data);
    multiPlot(list_of_data);
    document.getElementById('csvOutput').textContent = csv_text;
}



function add_event_listener_op(){
    let sel = document.getElementById('SelectOperaciones');
    sel.addEventListener('change',async function(){
        let op_id = sel.value;
        await set_tables(op_id);
        await set_vars(op_id);
    })
    return undefined;
}

function add_event_listener_vars(){
    for (let i=1;i<=5;i++){
        let vari = document.getElementById(`Var${i}`);
        vari.addEventListener('change',async function(){
            await set_vals(vari.value,i);
        }
        )
    }
}

function add_event_listener_vals(){
    for (let i=1;i<=5;i++){
        let val = document.getElementById(`Val${i}`);
        val.addEventListener('change',async function(){
            await set_series_by_val();
        })
    }
}

function add_event_listener_tab(){
    let sel = document.getElementById('SelectTablas');
    sel.addEventListener('change',async function(){
        let tab_id= sel.value;
        await set_series_by_tab(tab_id);
    })
    return undefined;
}

function add_event_listener_ser(){
    let sel = document.getElementById('SelectSeries');
    sel.addEventListener('change',async function(){
        //let ser_id= sel.value;
        var seleccionadas = Array.from(sel.selectedOptions).map(option => option.value);
        let sd = document.getElementById('StartDateInput').value;
        let ed = document.getElementById('EndDateInput').value;
        console.log(sd,ed,'**-*-*****--*');
        if (sd===''){sd=null;}
        if (ed===''){ed=null;}
        //await write_csv_to_text_and_plot(ser_id,sd,ed);
        await write_csv_to_text_and_plot_multi(seleccionadas,sd,ed);
    })
    return undefined;
}


set_operations();
add_event_listener_op();
add_event_listener_vars();
add_event_listener_tab();
add_event_listener_vals();
add_event_listener_ser();
