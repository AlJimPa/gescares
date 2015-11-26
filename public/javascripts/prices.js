/** _form prices javascript
 * not sure if it should be used as closure, as it doesn't have internal data, 
 * though it does modify html
*/

function prices(pricesLength, defaultCurrency, pricingTable){
	//var _pricesLength = pricesLength;
	var _defaultCurrency = defaultCurrency;
	var priceRowNumber = pricesLength || 0;
	var pricingTable = document.getElementById('pricingTable');
	return {
		confirmDelete: confirmDelete,
		addPricingRow: addPricingRow
	};
	
	function confirmDelete(ancestorId, elementId){
		var ancestor = document.getElementById(ancestorId);
		var element = document.getElementById(elementId);
		if (confirm('¿Seguro que desea eliminar el precio?'))
			ancestor.removeChild(element);
	};

	//TODO - move this function to a common js file?
	function insertBodyCell(tableBodyRowDiv, child){
		var div = document.createElement('DIV');
		div.setAttribute('class', 'tableBodyRow');
		div.appendChild(child);
		tableBodyRowDiv.appendChild(div);
	}

	function addPricingRow(){
		//var pricingTable = document.getElementById('pricingTable');
		var tableBodyRowDiv = document.createElement('DIV');
		tableBodyRowDiv.id = 'pricingRow' + priceRowNumber;
		tableBodyRowDiv.setAttribute('class', 'tableBodyRow');
		pricingTable.appendChild(tableBodyRowDiv);
		var strPrice = 'dish[Prices][' + priceRowNumber + ']';
		/* //TODO hidden attribute for updates (contains DB id); null on new?
		*/
		//conceptInput
		var conceptInput = document.createElement('INPUT');
		conceptInput.setAttribute('type', 'text');
		conceptInput.setAttribute('name', strPrice + '[concept]');
		insertBodyCell(tableBodyRowDiv, conceptInput);
		//priceInput
		var priceInput = document.createElement('INPUT');
		priceInput.setAttribute('type', 'text');
		priceInput.setAttribute('name', strPrice + '[price]');
		insertBodyCell(tableBodyRowDiv, priceInput);
		//currencyInput
		var currencyInput = document.createElement('INPUT');
		currencyInput.setAttribute('type', 'text');
		currencyInput.setAttribute('name', strPrice + '[currency]');
		currencyInput.value = defaultCurrency;
		insertBodyCell(tableBodyRowDiv, currencyInput);
	/* //TODO add currency selection on next versions
		var currencyList = ['EUR', 'USD', 'CHD'];
		var currencySelect = document.createElement('SELECT');
		currencySelect.setAttribute('name', strPrice + '[currency]');
		for (var i = 0; i < currencyList.length; i++) {
			var option = document.createElement('OPTION');
			option.text = currencyList[i];
			currencySelect.appendChild(option);
		}
		insertBodyCell(tableBodyRowDiv, currencySelect);
	*/
		//deletePrizeButton
		var deletePriceButton = document.createElement('BUTTON');
		deletePriceButton.setAttribute('type', 'button');
		deletePriceButton.setAttribute('class', 'button');
		deletePriceButton.appendChild(document.createTextNode('Eliminar'));
		deletePriceButton.addEventListener('click', function(){
			confirmDelete('pricingTable', tableBodyRowDiv.id)
		});
		insertBodyCell(tableBodyRowDiv, deletePriceButton);
		//increase counter
		priceRowNumber++;
	};
};

