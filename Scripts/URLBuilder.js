
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

class URLBuilder{
    constructor(){
        this.__base_URL = 'https://servicios.ine.es/wstempus/js/';
        this.__available_languages = ['ES','EN'];
        this.__language = 'ES';
        //
        this.__date_param_regex = /\bdate\d*/g;
        this.__FK_param_regex = /\b(g\d+|p)\b/g;
        this.__FK_metadata_filter_regex = /(\btv\d*)/g
        //
        this.__print_final_url = false
    }

    set_language(language){
        if (!this.__available_languages.includes(language)){
            console.log('Not valid language');
        }
        this.__language = language;
    }

    change_state_print_url(){this.__print_final_url = !this.__print_final_url;}
    params_to_url(url,params){
        if (params === null) {
            return url;
        }
    
        if (Object.keys(params).length === 0) {
            return url;
        }
        
        let new_params = this.params_formatter(params);
        // Verifica si la URL ya tiene parámetros
        const joiner = url.includes('?') ? '&' : '?';
    
        const newUrl = url + joiner + new URLSearchParams(new_params).toString();
        return this.urlDateParamCorrection(newUrl);
    }
    params_formatter(params){
        let newParams = {};
    
        for (let [k, v] of Object.entries(params)) {
            if (this.__date_param_regex.test(k)) {
                if (v instanceof Date) {
                    newParams[k] = v.toISOString().slice(0, 10).replace(/-/g, ''); // Formato 'YYYYMMDD'
                } else {
                    const splittedDate = v.split(':');
                    if (splittedDate[1] === '') {
                        newParams[k] = formatDate(new Date(splittedDate[0])) + ':';
                    } else {
                        newParams[k] = formatDate(new Date(splittedDate[0])) + ':' + formatDate(new Date(splittedDate[1]));
                    }
                }
            } else {
                newParams[String(k)] = String(v);
            }
        }
    
        return newParams;
    }
    urlDateParamCorrection(url){
        let fixedUrl = url.replace(this.__date_param_regex, 'date'); // Reemplaza usando la expresión regular
        fixedUrl = fixedUrl.replace(this.__FK_metadata_filter_regex, 'tv');
        return fixedUrl
    }

    url_generator(args,kwargs){
        let argSep = '/'; // argSep = argSeparator
        let finalUrl = this.__base_URL + this.__language + argSep;

        let lastIndex = args.length - 1;
        args.forEach((arg, i) => {
            if (arg === null) {
                return; // Los argumentos posicionales nulos no se añaden a la URL
            }
            // this.__checkFunction(arg);
            // this.__checkInput(arg); // -------------- Olvidamos las comprobaciones por ahora
            if (i === lastIndex) {
                finalUrl += String(arg);
                return; // Aquí continuar es igual a romper y equivale al final del bucle
            }
            finalUrl += String(arg) + argSep;
        });

        // Eliminar el último / de la URL en caso de que los argumentos sean de la forma [algo, null]
        if (finalUrl.endsWith(argSep)) {
            finalUrl = finalUrl.slice(0, -1);
        }

        finalUrl = this.params_to_url(finalUrl, kwargs);

        if (this.__print_final_url) {
            console.log(finalUrl);
        }

        return finalUrl;
    }
}

export {URLBuilder}