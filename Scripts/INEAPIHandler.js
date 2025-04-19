import {URLBuilder} from './URLBuilder.js'
import * as RH from './RequestsHandler.js'

class INEAPIHandler{

    constructor(){
        this.URLBuilder = new URLBuilder();
        this.RequestsHandler = null;
    }

    get_data_process(funct_input,params_dict){
        let url = this.URLBuilder.url_generator(funct_input,params_dict)
        return RH.get_data(url)
    }

    get_operations(op_id=null,detail_level=0){
        let f;
        if (op_id===null){f='OPERACIONES_DISPONIBLES';}
        else {f='OPERACION';}
        let data = this.get_data_process([f],{'det':detail_level});
        return data;
    }

    get_variables(op_id=null,variable_id=null){
        let f;
        if (variable_id===null){
            if (op_id===null){f='VARIABLES';}
            else {f='VARIABLES_OPERACION';}
        }
        else {f='VARIABLE';}
        let data = this.get_data_process([f,op_id,variable_id],{});
        return data;
    }

    get_values(var_id=null,op_id=null,detail_level=0){
        let f;
        if (var_id===null){console.log('var_id cant be empty');}
        if (op_id===null){f='VALORES_VARIABLE';}
        else {f='VALORES_VARIABLEOPERACION';}

        let data = this.get_data_process([f,var_id,op_id],{'det':detail_level});
        return data;
    }

    get_tables(
        op_id=null,
        tab_id=null,
        group_id=null,
        detail_level=0,
        geographical_level=0,
        tipology='',
    ){
        let data;
        let f;
        if (op_id!=null){
            f='TABLAS_OPERACION';
            data = this.get_data_process(
                [f,op_id],
                {
                    'det':detail_level,
                    'geo':geographical_level,
                    'tip':tipology
                }
            );
        }
        else if (tab_id!=null){
            if (group_id === null){
                f = 'GRUPOS_TABLA';
                data = this.get_data_process([f,tab_id],{});
            }
            else {
                f = 'VALORES_GRUPOSTABLA';
                data = this.get_data_process([f,tab_id,group_id],{'det':detail_level});
            }
        }
        else {console.log('One input must be provided');}
        return data;
    }
    metadata_param_filtering_builder(var_value_dict=null,format='series'){
        if (var_value_dict === null){return {};}
        
        let key_base;
        if (format==='series'){key_base='tv';}
        else if (format==='metadata'){key_base='g';}

        let params_dict = {};
        let counter = 1;
        Object.entries(var_value_dict).forEach(([k, v], i) => {
            if (k==='publicacion'){
                params_dict['p']=String(v);
                return;
            }
            else {
                if (Array.isArray(v)) { // Verifica si v es un array
                    for (const val of v) {
                        params_dict[`${key_base}${counter}`] = `${k}:${val}`;
                        counter++;
                    }
                }
            }
        })
        return params_dict;
    }

    get_series(
        serie_id=null,
        op_id=null,
        tab_id=null,
        serie_data='metadata',
        operation_data='series',
        detail_level=0,
        tipology='',
        page=1,
        metadata_filtering={}
    ){
        let f;
        let params;
        let metadata_params;
        if (serie_id!=null){
            op_id=null;
            tab_id=null;
            if (serie_data==='metadata'){f='SERIE';
                params={'det':detail_level,'tip':tipology};}
            else if (serie_data==='values'){f='VALORES_SERIE';
                params={'det':detail_level};}
        }
        else if (op_id!=null){
            tab_id=null;
            if (operation_data==='series'){f='SERIES_OPERACION';
                params={'det':detail_level,'tip':tipology,'page':page}
            }
            else if (operation_data==='metadata'){
                f = 'SERIE_METADATAOPERACION';
                params = {'det':detail_level,'tip':tipology};
                metadata_params = this.metadata_param_filtering_builder(
                    metadata_filtering,
                    'metadata'
                )
                Object.assign(params, metadata_params);
            }
        }
        else if (tab_id!=null){
            f='SERIES_TABLA';
            params = {'det':detail_level,'tip':tipology};
            metadata_params = this.metadata_param_filtering_builder(
                metadata_filtering,
                'metadata'
            )
            Object.assign(params, metadata_params);
        }
        let data = this.get_data_process([f,serie_id,op_id,tab_id],params);
        return data;
    }

    get_publications(op_id=null,pub_id=null,detail_level=0){
        let f;
        if (op_id === null && pub_id === null){f='PUBLICACIONES';}
        else if (op_id != null && pub_id === null){f='PUBLICACIONES_OPERACION';}
        else if (op_id != null && pub_id != null){f='PUBLICACIONFECHA_PUBLICACION';}
        let data = this.get_data_process([f,op_id,pub_id],{'det':detail_level});
        return data;
    }

    date_count_selection_params_builder(start_date=null,end_date=null,count=null){
        let params_dict={};
        if (start_date!=null && end_date!=null){
            params_dict['date']=`${start_date}:${end_date}`;
        }
        else if (count!=null){
            params_dict['nult']=count;
        }
        return params_dict;
    }

    get_data(
        serie_id=null,
        tab_id=null,
        op_id=null,
        detail_level=0,
        tipology='',
        count=null,
        start_date=null,
        end_date=null,
        metadata_filtering={}
    ){
        let f;
        let params;
        let metadata_params;
        if (serie_id!=null){
            tab_id=null;
            op_id=null;
            f = 'DATOS_SERIE';
            params = {'det':detail_level,'tip':tipology};
        }
        else if (tab_id!=null) {
            op_id=null;
            f='DATOS_TABLA';
            params = {'det':detail_level,'tip':tipology};
        }
        else if (op_id!=null){
            f='DATOS_METADATAOPERACION';
            params = {'det':detail_level,'tip':tipology};
            metadata_params = this.metadata_param_filtering_builder(metadata_filtering,'metadata');
            Object.assign(params,metadata_params);
        }
        let data_count_params = this.date_count_selection_params_builder(start_date,end_date,count);
        Object.assign(params,data_count_params);
        let data = this.get_data_process([f,serie_id,tab_id,op_id],params);
        return data;
    }

    get_units(unit_id=null){
        let f;
        if (unit_id!=null){f='UNIDAD';}
        else {f='UNIDADES';}

        let data = this.get_data_process([f,unit_id],{});
        return data;
    }

    get_scales(scale_id=null){
        let f;
        if (scale_id!=null){f='ESCALA';}
        else {f='ESCALAS';}
        let data = this.get_data_process([f,scale_id],{});
        return data;
    }

    get_periods(period_id=null){
        let f;
        if (period_id!=null){f='PERIODO';}
        let data = this.get_data_process([f,period_id],{});
        return data;
    }

    get_periodicities(periodicity_id=null){
        let f;
        if (periodicity_id===null){f='PERIODICIDADES';}
        else {f='PERIODICIDAD';}
        let data = this.get_data_process([f,periodicity_id],{});
        return data;
    }

    get_classifications(classification_id=null){
        let f;
        if (classification_id===null){f='CLASIFICACIONES';}
        else {f='CLASIFICACIONES'}
        let data = this.get_data_process([f,null],{});
        return data;
    }
}

export {INEAPIHandler}