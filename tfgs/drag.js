tfgs.drag = {};

// 下面这个来自scratch的源代码
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

// drag.js的使用例子：
// // 保存移除回调函数的函数
// let canceldrag = tfgs.drag.setdrag(div, {
// 	"onStart": function(event) {
// 		if (draggable) {
// 			// 如果可以拖动，一定要返回当前的被拖动对象位置
// 			// 用来计算下次拖动的相对位置
// 			return {
// 				offsetX,
// 				offsetY
// 			};
// 		} else {
// 			// 否则返回null取消
// 			return null;
// 		}
// 	},
// 	"onDrag": function(x, y, event) {
// 		// x, y: 根据onStart的返回值计算出的位置，event是触发事件(可以获得原事件的鼠标位置等)
// 		offsetX = x;
// 		offsetY = y
// 		// 接着就可以实现拖动范围限制等内容
// 		if (offsetX < 0)
// 			offsetX = 0;
// 		// 移动元素等
// 		updateElement();
// 	},
// 	"onEnd": function(mode, event) {
// 		// mode 有两种选择：click表示没有拖动，只点击，还有move代表拖动了
// 		if (mode === "click") {
// 			handleClick();
// 		}
// 	}
// });
// // 如果你想要移除回调函数，可以运行之前返回的
// canceldrag();

tfgs.drag.setdrag = function(elem, options) {
	//elem
	//options
	//  onStart [!] 如果可以拖动，一定要返回当前的被拖动对象位置，否则返回null取消
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
		elem.addEventListener("mousemove", handleDragMove);
		window.addEventListener("mouseup", handleDragEnd);
		elem.addEventListener("mouseup", handleDragEnd);
		window.addEventListener("mouseleave", handleDragEnd);
		window.addEventListener("blur", handleDragEnd);
		elem.addEventListener("touchmove", handleDragMove);
		elem.addEventListener("touchend", handleDragEnd);

		event.preventDefault();
		event.stopPropagation();
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
		event.preventDefault();
		event.stopPropagation();
		event.cancelBubble = true;
		return false;
	};
	let handleDragEnd = function(event) {
		options.onEnd(mode, event);

		window.removeEventListener("mousemove", handleDragMove);
		elem.removeEventListener("mousemove", handleDragMove);
		window.removeEventListener("mouseup", handleDragEnd);
		elem.removeEventListener("mouseup", handleDragEnd);
		window.removeEventListener("mouseleave", handleDragEnd);
		window.removeEventListener("blur", handleDragEnd);
		elem.removeEventListener("touchmove", handleDragMove);
		elem.removeEventListener("touchend", handleDragEnd);

		event.preventDefault();
		event.stopPropagation();
		event.cancelBubble = true;
		return false;
	};

	elem.addEventListener("mousedown", handleDragStart);
	elem.addEventListener("touchstart", handleDragStart);

	return function canceldrag() {
		elem.removeEventListener("mousedown", handleDragStart);
		elem.removeEventListener("touchstart", handleDragStart);
	};
};
