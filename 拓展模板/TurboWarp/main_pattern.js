
// 在前面粘贴 TFGS.js 的内容

var _enableTFGS = true;

class TFGSExtension {
    getInfo() {
        TFGS();
        TFGSON();
        return {
            id: 'TFGS',
            name: 'TFGS',

            blocks: [
                {
                    opcode: 'turnon',
                    blockType: Scratch.BlockType.BUTTON,
                    text: '打开 TFGS'
                },
                {
                    opcode: 'turnoff',
                    blockType: Scratch.BlockType.BUTTON,
                    text: '关闭 TFGS'
                }
            ]
        };
    }

    turnon() {
        if (!_enableTFGS) {
            try {
                TFGSON();
                _enableTFGS = true;
                alert("TFGS 已打开")
            } catch (err) {
                alert("错误: " + err.message);
            }
        }
    }
    turnoff() {
        if (!_enableTFGS) {
            try {
                TFGSOFF();
                _enableTFGS = false;
                alert("TFGS 已关闭")
            } catch (err) {
                alert("错误: " + err.message);
            }
        }
    }
}

Scratch.extensions.register(new TFGSExtension());