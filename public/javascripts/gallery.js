function gallery(galleryDivTag, imagePreviewTag){
	var imageNumber = 0;
	var parent = document.getElementById(galleryDivTag);
	var imagePreview = document.getElementById(imagePreviewTag);
	
	return {
		initImages: initImages,
		addImage: addImage
	};
	
	function initImages(strImages){
		var images = JSON.parse(strImages);
		for (var i = 0; i < images.length; i++) {
			addImage(images[i]);
		}
	};

	//if divImage gets extended with elements having same than and previous elements, id's will be needed
	function addImageListeners(divImage, isInitialLoad){
		var imgThumbnail = divImage.getElementsByTagName('img')[0];
		var imgInput = divImage.getElementsByTagName('input')[0];
		var imgDeleteButton = divImage.getElementsByTagName('button')[0];
		imgInput.onchange = function(){
			imgThumbnail.src = imgInput.value;
		};
		imgThumbnail.onload = function(){
			imgThumbnail.style.display = 'inline';
			if (!isInitialLoad){
				this.click();
			}
		};
		imgThumbnail.onerror = function(){
			alert('URL incorrecta');
			imgThumbnail.style.display = 'none';
			imagePreview.style.display = 'none';
		};
		imgThumbnail.onclick = function(){
			var divImages = parent.getElementsByTagName('div');
			for (var tmp = 0; tmp < divImages.length; tmp++) {
				divImages[tmp].classList.remove('selected-element');
			};
			divImage.classList.add('selected-element');
			imagePreview.src = imgThumbnail.src;
			imagePreview.style.display = 'block';
		};
		imgDeleteButton.onclick = function(){
			parent.removeChild(divImage);
			imagePreview.style.display = 'none';
		};
	};
	
	function addImage(image){
		//divImage
		var divImage = document.createElement('DIV');
		divImage.setAttribute('class', 'bordered');
		parent.appendChild(divImage);
		//divImage/imageThumbnail
		var imageThumbnail = document.createElement('IMG');
		imageThumbnail.setAttribute('class', 'image-thumbnail');
		if (image === undefined){
			imageThumbnail.style.display = 'none';
		} else {
			imageThumbnail.setAttribute('src', image.source);
		}
		divImage.appendChild(imageThumbnail);
		//divImage/spanImageFields
		var spanImageFields = document.createElement('SPAN');
		spanImageFields.setAttribute('class', 'image-fields');
		divImage.appendChild(spanImageFields);
		//divImage/spanImageFields/(label|imageSourceInput)
		var divImageSource = document.createElement('DIV');
		spanImageFields.appendChild(divImageSource);
		var imageSourceLabel = document.createElement('LABEL');
		imageSourceLabel.textContent = 'URL de imágen';
		divImageSource.appendChild(imageSourceLabel);
		var imageSourceInput = document.createElement('INPUT');
		imageSourceInput.setAttribute('type', 'url');
		imageSourceInput.setAttribute('name', 'dish[Images][' + imageNumber + '][source]');
		if (image !== undefined){
			imageSourceInput.value = image.source;
		}
		divImageSource.appendChild(imageSourceInput);
		//divImage/spanImageFields/(label|imageLinkInput)
		var divImageLink = document.createElement('DIV');
		spanImageFields.appendChild(divImageLink);
		var imageLinkLabel = document.createElement('LABEL');
		imageLinkLabel.textContent = 'URL de enlace';
		divImageLink.appendChild(imageLinkLabel);
		var imageLinkInput = document.createElement('INPUT');
		imageLinkInput.setAttribute('type', 'url');
		imageLinkInput.setAttribute('name', 'dish[Images][' + imageNumber + '][link]');
		if (image !== undefined){
			imageLinkInput.value = image.link;
		}
		divImageLink.appendChild(imageLinkInput);
		//divImage/spanImageFields/(label|imageDescriptionInput)
		var divImageDescription = document.createElement('DIV');
		spanImageFields.appendChild(divImageDescription);
		var imageDescriptionLabel = document.createElement('LABEL');
		imageDescriptionLabel.textContent = 'Descripción';
		divImageDescription.appendChild(imageDescriptionLabel);
		var imageDescriptionInput = document.createElement('INPUT');
		imageDescriptionInput.setAttribute('type', 'text');
		imageDescriptionInput.setAttribute('name', 'dish[Images][' + imageNumber + '][description]');
		if (image !== undefined){
			imageDescriptionInput.value = image.description;
		}
		divImageDescription.appendChild(imageDescriptionInput);
		//divImage/imageDeleteButton
		var imgDeleteButton = document.createElement('BUTTON');
		imgDeleteButton.setAttribute('type', 'button');
		imgDeleteButton.setAttribute('class', 'button');
		imgDeleteButton.appendChild(document.createTextNode('Borrar'));
		divImage.appendChild(imgDeleteButton);
		//divImage/spanImageFields/id - using it as last item so event listener don't need element id's
		if (image !== undefined && image.id !== undefined){
			var idInput = document.createElement('INPUT');
			idInput.setAttribute('type', 'hidden');
			idInput.setAttribute('name', 'dish[Images][' + imageNumber + '][id]');
			idInput.value = image.id;
			spanImageFields.appendChild(idInput);
		}
		//event listeners
		addImageListeners(divImage, image !== undefined);
		imageNumber++;
	};

};

