/** dynamic select update - add and remove options */
function addOption(select, text){
	var option = document.createElement('option');
	option.text = text;
	option.value = text;
	select.add(option);
};

function removeOptions(select){
	var array = [];
	var i;
	for (i=0; i < select.length; i++){
		if (select[i].selected){
			array.push(select[i].index);
		}
	}
	for (i=array.length -1; i >= 0; i--){
		select.remove(array[i]);
	}
};