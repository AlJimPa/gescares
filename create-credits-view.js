var fs = require('fs');
var creditsFileName = 'views/credits.ejs';

//fs.exists is deprecated; current node version only allow fs.statSync
function fileExists(fileName){
	try{
		fs.statSync(fileName);
		return true;
	} catch (error){
		//ENOENT - file does not exists, continue
		if (error.code === 'ENOENT')
			return false;
		else {
			console.log(error);
			throw new Error(error);
		}
	}
};
//delete current file, if it exists
if (fileExists(creditsFileName))
	fs.unlinkSync(creditsFileName);
//create file and add static data
var creditsStream = fs.createWriteStream(creditsFileName, {flags: 'a'});
var data = '';
data += '<h2>Créditos</h2>' + '\n';
data += '<div>Autor: Alberto Jiménez Palomas. <a href="licenses/gescares.txt" target="_blank">Licencia MIT</a></div>' + '\n';
data += '<h3>Herramientas utilizadas</h3>' + '\n';
data += '<div>' + '\n';
data += '	<a href="https://nodejs.org/" target="_blank">node.js</a>' + '\n';
data += '	<a href="licenses/node.txt" target="_blank">Licencia</a>' + '\n';
data += '</div>' + '\n';
//prepare dynamic data
	//data += '	Otros' + '\n';
var modules = fs.readdirSync('node_modules');
for (var i = 0; i < modules.length; i++){
	//extract data from package.json
	var moduleData = {};
	var packageFile = fs.readFileSync('node_modules/' + modules[i] + '/package.json', 'UTF-8');
	var package = JSON.parse(packageFile);
	if (package.license !== undefined)
		moduleData.license = package.license;
	if (package.homepage !== undefined)
		moduleData.homepage = package.homepage;
	//copy license if it exists to public license dir
	if (fileExists('node_modules/' + modules[i] + '/LICENSE')){
		moduleData.licenseFile = 'licenses/' + modules[i] + '.txt';
		var readStream = fs.createReadStream('node_modules/' + modules[i] + '/LICENSE');
		var writeStream = fs.createWriteStream('public/' + moduleData.licenseFile);
		readStream.pipe(writeStream);
	}
	//create div with name, link and license references
	data += '<div>' + '\n';
	if (moduleData.homepage !== undefined){
		data += '<a href="' + moduleData.homepage + '" target="_blank">'
			 + modules[i] + '</a>\n';
	} else {
		data += modules[i];
	}
	if (moduleData.licenseFile || moduleData.license){
		var licenseText = 'Licencia';
		if (moduleData.license !== undefined)
			licenseText += ' ' + moduleData.license;
		if (moduleData.licenseFile !== undefined)
			licenseText = '<a href="' + moduleData.licenseFile 
				+ '" target="_blank">' + licenseText + '</a>';
		data += licenseText + '\n';
	}
	data += '</div>' + '\n';
}
//finish static data'
data += '<div>' + '\n';
data += '	<a href="https://www.npmjs.com/package/log" target="_blank">log - derivado</a>' + '\n';
data += '	<a href="licenses/log.txt" target="_blank">Licencia MIT</a>' + '\n';
data += '</div>' + '\n';
//write file
creditsStream.write(data);
