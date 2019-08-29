# Music Homepage of Jacky.Q

### Version description

- 1.0.8 - 20190829
  - 优化样式
  - 添加中文语言包(beta版)
  - 将图片，json，音频文件转移到国内服务器，优化加载速度
  - 由于性能原因，取消使用用wave data，继续波形图片

- 1.0.7 - 20190827
  - 优化样式

- 1.0.6 beta - 20190809
  - fixed some bugs
  - 添加隐藏播放器按钮
  - 添加Tips view
  - 进一步优化样式

- 1.0.5 beta - 20190808
  - 用wave data计算出的图形替换波形图片, much cooler

- 1.0.4 beta - 20190802
  - 由于大部分设备性能原因, 在没有找到更好的方法更新BPM之前, 暂时取消节拍器section
  - 添加Friends页面

- 1.0.3 beta - 20190731
  - 当音频加载完成后, 取消继续加载buffer bar
  - 优化Sample播放形式
  - 使用了chuan新字体(
  - 优化进度条样式
  - 取消压缩mp3
  - 歌曲添加BPM信息
  - BPM可视化
  - 添加Album详情

- 1.0.2 beta - 20190726 (MJQ 🎂)
  - 添加Buffered View
  - 优化进度条和歌词更新算法

- 1.0.1 beta - 20190725
  - 播放音频可视化
  - 优化音频文件响度

- 1.0.0 beta - 20190724
  - 添加移动端歌词显示
  - 处理无其他可播放平台的
  - 优化对小屏幕的适配
  - 优化过渡动画

### Features will be added in the future

- ~~Friends 页面 - 主要介绍一些我合作过的艺人以及玩音乐的朋友们~~
- 将歌曲进行Single, EP, Album的分类
- Demo 页面, 主要发一些未完成的demo
- 单曲评论功能
- 歌曲点赞功能

### Known bugs

- [x] ~~iOS, Safari: 进度条拖拽后闪烁, 可能原因：拖拽结束后timer重复注册~~
- [x] ~~iOS 13, Safari: 浏览器进入后台之后, 再次打开网页计时器终止, 导致歌词和时间不更新, 暂停后再播放可解决~~
