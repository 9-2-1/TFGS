tfgs.drag = {};

// TODO I remenber that the function I have seen in the source code of Scratch. Later I will grep it out.
function getEventXY() {
	if ("targetTouches" in event) {
		return {
			x: Math.round(event.targetTouches[0].clientX),
			y: Math.round(event.targetTouches[0].clientY)
		};
	}
	return {
		x: Math.round(event.clientX),
		y: Math.round(event.clientY)
	};
}

// Example
// let canceldrag = tfgs.drag.setdrag(div, {
// 	"onStart": function(event) {
// 		if (draggable) {
// 			return {
// 				offsetX,
// 				offsetY
// 			};
// 		} else {
// 			return null;
// 		}
// 	},
// 	"onDrag": function(x, y, event) {
// 		offsetX = x;
// 		offsetY = y
// 		// limits
// 		if (offsetX < 0)
// 			offsetX = 0;
// 		// ...
// 		updateElement();
// 	},
// 	"onEnd": function(mode, event) {
// 		if (mode === "click") {
// 			handleClick();
// 		}
// 	}
// });
// after you want to disable drag...
// canceldrag();

tfgs.drag.setdrag = function(elem, options) {
	//elem
	//options
	//  onStart [!] MUST return current position/offset or null to stop
	//  onMove
	//  onEnd
	let offsetX, offsetY;
	let mode, lastxy;
	let handleDragStart = function(event) {
		let beginPos = options.onStart(event);
		if (beginPos === null) {
			return;
		}
		let xy = getEventXY(event);
		lastxy = xy;
		offsetX = xy.x - beginPos.x;
		offsetY = xy.y - beginPos.y;
		mode = "click";

		window.addEventListener("mousemove", handleDragMove);
		window.addEventListener("mouseup", handleDragEnd);
		window.addEventListener("mouseleave", handleDragEnd);
		window.addEventListener("blur", handleDragEnd);
		elem.addEventListener("touchmove", handleDragMove);
		elem.addEventListener("touchend", handleDragEnd);

		event.preventDefault();
		event.cancelBubble = true;
		return false;
	};
	let handleDragMove = function(event) {
		let xy = getEventXY(event);
		if (lastxy.x !== xy.x || lastxy.y !== xy.y) {
			options.onMove(xy.x - offsetX, xy.y - offsetY, event);
			lastxy = xy;
			mode = "drag";
		}
	};
	let handleDragEnd = function(event) {
		options.onEnd(mode, event);

		window.removeEventListener("mousemove", handleDragMove);
		window.removeEventListener("mouseup", handleDragEnd);
		window.removeEventListener("mouseleave", handleDragEnd);
		window.removeEventListener("blur", handleDragEnd);
		elem.removeEventListener("touchmove", handleDragMove);
		elem.removeEventListener("touchend", handleDragEnd);
	};

	elem.addEventListener("mousedown", handleDragStart);
	elem.addEventListener("touchstart", handleDragStart);

	return function canceldrag() {
		elem.removeEventListener("mousedown", handleDragStart);
		elem.removeEventListener("touchstart", handleDragStart);
	};
};
