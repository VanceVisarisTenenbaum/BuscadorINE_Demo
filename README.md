# Buscador INE

Página sencilla, que realiza peticiones a la API del INE.

Operaciones estadísticas. Es el punto de inicio y la selección de la operación carga las tablas y variables asociadas.

Para obtener las series basta con seleccionar la tabla. En ese caso carga todas las series asociadas a la tabla seleccionada.

También se puede seleccionar los pares Variable-Valor, en cuyo caso, devuelve las series que tengan los valores seleccionados para cada variable.

La selección de serie generará la gráfica o serie temporal y un texto debajo en formato csv que se puede copiar. Se puede filtrar por fecha, si no devuelve los 300 últimos disponibles, en caso de haberlos, si no, devuelve todos los disponibles.
