# 🔊 快速音频设置指南

## 为什么听不到声音？

游戏现在使用 **Web Audio API** 自动生成音效，所以：
- ✅ **切割音效**：会自动播放（嗖的一声）
- ✅ **完美音效**：会自动播放（叮的一声）
- ⚠️ **背景音乐**：需要您添加 MP3 文件

## 快速获取免费音频

### 方法1：推荐网站（无需注册）

#### 🎵 背景音乐
访问：https://pixabay.com/music/
1. 搜索 "happy game music" 或 "upbeat background"
2. 下载任意喜欢的音乐
3. 重命名为 `background.mp3`
4. 放入 `assets/sounds/` 目录

推荐曲目：
- "Happy Ukulele" - 轻快愉悦
- "Pixel Adventure" - 游戏风格
- "Funny Bit" - 搞笑风格

#### 🔪 切割音效（可选）
访问：https://pixabay.com/sound-effects/
1. 搜索 "swish" 或 "slice"
2. 下载喜欢的音效
3. 重命名为 `slice.mp3`

#### ⭐ 完美音效（可选）
1. 搜索 "ding" 或 "success"
2. 下载喜欢的音效
3. 重命名为 `perfect.mp3`

### 方法2：使用在线工具生成

访问：https://www.beepbox.co/
1. 创建简单的8位音乐
2. 导出为 MP3
3. 重命名并放入目录

### 方法3：从YouTube下载（需遵守版权）

使用在线工具如 https://ytmp3.nu/
1. 找到免费音乐频道（如 NoCopyrightSounds）
2. 下载无版权音乐
3. 转换为 MP3 格式

## 文件放置位置

```
fruit-slice-game/
└── assets/
    └── sounds/
        ├── background.mp3  ← 背景音乐（可选）
        ├── slice.mp3      ← 切割音效（可选，已有Web Audio备用）
        └── perfect.mp3    ← 完美音效（可选，已有Web Audio备用）
```

## 为什么现在有音效？

游戏已升级：
- 如果有 MP3 文件 → 播放文件
- 如果没有文件 → 使用 Web Audio API 生成音效
- 所以切割时一定会有声音！

## 浏览器音频权限

有些浏览器需要用户交互才能播放音频：
1. ✅ 点击"开始游戏"后音频会激活
2. ✅ 切割时会听到"嗖"的声音
3. ⚠️ 如果还是没声音，检查：
   - 浏览器音量是否打开
   - 系统音量是否打开
   - 浏览器是否静音（查看标签页图标）

## 测试音效

1. 打开游戏
2. 点击右上角的音效按钮（🔊）确认已开启
3. 点击"开始游戏"
4. 画线切割水果
5. 应该听到"嗖"的声音

## 完整音频体验

要获得最佳体验：
1. 添加 `background.mp3` - 享受背景音乐
2. （可选）添加 `slice.mp3` 和 `perfect.mp3` 自定义音效

但即使不添加任何文件，游戏也会有音效！

## 推荐音频参数

- **格式**：MP3（最佳兼容性）
- **码率**：128-192 kbps
- **采样率**：44.1 kHz
- **声道**：立体声

## 快速下载链接（免费资源）

1. **Pixabay 音乐**: https://pixabay.com/music/
2. **Freesound**: https://freesound.org/
3. **YouTube Audio Library**: https://studio.youtube.com/channel/UC.../music

所有这些网站都提供免费、无版权的音频资源！

---

**提示**：Web Audio API 生成的音效已经很不错了！如果您只是想快速开始玩，不添加任何文件也完全可以。
