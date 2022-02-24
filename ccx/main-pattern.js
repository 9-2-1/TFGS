var __webpack_modules__ = ({
"./index.js": ((module, __unused_webpack_exports, __webpack_require__) => {
const { Extension, type, api } = __webpack_require__("clipcc-extension");
// --- CONTENT START ---
// --- TFGS BEGIN --- {

//} --- TFGS END ---

class TFGS_Extension extends Extension {

	onInit() {
		try{
			TFGS();
			TFGSON();
		}catch(e){
			alert(e.message);
		}
		/* api.addCategory({
			categoryId: '...',
			messageId: '...',
			color: '#RRGGBB'
		}); */

		/* api.addBlock({
			opcode: '...',
			type: type.BlockType.xxx,
			messageId: '...',
			categoryId: '...',
			function: ...,
			param: {
				xxx: {
					type: type.ParameterType.xxx,
					default: '...'
				}
			}
		}); */
	}

	onUninit(){
		try{
			TFGSOFF();
		}catch(e){
			alert(e.message);
		}
		// api.removeCategory('...');
	}
}
module.exports = TFGS_Extension;
// --- CONTENT END ---
}),
"clipcc-extension":((module) => {module.exports = self["ClipCCExtension"];})
});

var __webpack_module_cache__ = {};

function __webpack_require__(moduleId) {
	var cachedModule = __webpack_module_cache__[moduleId];
	if (cachedModule !== undefined) {
		return cachedModule.exports;
	}
	var module = __webpack_module_cache__[moduleId] = {
		exports: {}
	};
	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
	return module.exports;
}

var __webpack_exports__ = __webpack_require__("./index.js");
module.exports = __webpack_exports__;
