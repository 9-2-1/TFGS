# TFGS

目前做了一个类似Scratch Addons的拓展管理器模板，可以启用或者禁用功能，设定功能的参数。

# 格式

功能文件放在`functions/`文件夹里。

`*.css`文件：定义给拓展用的样式表(无论拓展是否启用都会生效，因此请在需要用到的css类型名前加上前缀防止冲突。

`*.js`文件：定义功能内容，使用tfgsinfo变量

详情请看 `functions/README.txt`
