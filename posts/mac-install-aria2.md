---
layout: blog
title: macOS 上 aria2 的安装与配置：打造高效下载利器
date: 2026-04-03T04:12:00.000+08:00
---


# macOS 上 aria2 的安装与配置：打造高效下载利器

aria2 是一款轻量级、多协议、支持多线程的命令行下载工具，支持 HTTP/HTTPS、FTP、SFTP、BitTorrent 和 Metalink。在 macOS 上配合图形界面（如 AriaNg）使用，可以大幅提升下载体验。本文将详细介绍如何在 macOS 上安装、配置并后台运行 aria2。

---

## 1. 安装 aria2

推荐使用 [Homebrew](https://brew.sh) 安装，简单快捷：

```bash
brew install aria2
```

安装完成后，可以验证版本：

```bash
aria2c --version
```

---

## 2. 创建配置文件

aria2 的配置主要通过 `aria2.conf` 文件完成。我们将配置文件存放在用户目录下的 `~/.aria2/` 文件夹中。

```bash
mkdir -p ~/.aria2
touch ~/.aria2/aria2.conf
touch ~/.aria2/aria2.session   # 用于保存任务列表
```

### 基础配置示例

用文本编辑器打开 `~/.aria2/aria2.conf`，粘贴以下内容（根据需求修改路径和参数）：

```ini
## 文件保存相关 ##
# 默认下载目录（请替换为你的用户名）
dir=/Users/你的用户名/Downloads
# 启用断点续传
continue=true
# 保存任务列表到 session 文件
input-file=/Users/你的用户名/.aria2/aria2.session
save-session=/Users/你的用户名/.aria2/aria2.session
save-session-interval=60

## 下载连接相关 ##
# 最大同时下载任务数
max-concurrent-downloads=5
# 单服务器最大连接数
max-connection-per-server=16
# 单文件最小分片大小
min-split-size=10M
# 单文件最大线程数
split=10

## RPC 设置（用于 Web UI 控制）##
enable-rpc=true
rpc-listen-port=6800
rpc-listen-all=true
rpc-allow-origin-all=true
# 设置 RPC 密钥（推荐，防止未授权访问）
rpc-secret=your_secure_token_here

## BT 下载相关 ##
bt-enable-lpd=true
bt-max-peers=55
bt-require-crypto=true
follow-torrent=true
enable-dht=true
enable-dht6=false
dht-listen-port=6881-6999
peer-id-prefix=-TR2920-
user-agent=Transmission/2.92

## 日志 ##
log=/Users/你的用户名/.aria2/aria2.log
log-level=notice
```

> **注意**：请将 `你的用户名` 和 `your_secure_token_here` 替换为实际值。

---

## 3. 前台测试运行

在终端执行以下命令，检查配置是否生效：

```bash
aria2c --conf-path=~/.aria2/aria2.conf
```

如果看到 `Listening on port 6800 for RPC` 之类的输出，说明配置正确。按 `Ctrl+C` 停止。

---

## 4. 后台运行 aria2

在 macOS 上，`brew services start aria2` 可能会失败，提示 `has not implemented #plist`。这是因为 aria2 官方未提供 launchd 的 plist 文件。我们有两种替代方案。

### 方案一：使用 aria2 自带的守护模式（简单）

```bash
aria2c --conf-path=~/.aria2/aria2.conf -D
```

- `-D` 参数使进程进入后台运行，关闭终端也不会退出。
- 停止服务：`killall aria2c`

**优点**：一行命令。  
**缺点**：不会开机自启，意外退出不会自动重启。

### 方案二：手动创建 launchd 服务（推荐，支持开机自启）

launchd 是 macOS 原生的进程管理工具，可以实现开机自启和进程守护。

#### 4.1 创建 plist 文件

```bash
nano ~/Library/LaunchAgents/com.aria2.aria2c.plist
```

#### 4.2 填写以下内容

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.aria2.aria2c</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/aria2c</string>   <!-- Apple Silicon 路径 -->
        <!-- Intel Mac 使用 /usr/local/bin/aria2c -->
        <string>--conf-path=/Users/你的用户名/.aria2/aria2.conf</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/aria2.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/aria2.err</string>
</dict>
</plist>
```

> **注意**：  
> - 不要添加 `-D` 参数，launchd 本身就会后台运行进程。  
> - 路径请根据你的实际情况修改（可通过 `which aria2c` 查看）。

#### 4.3 加载并启动服务

```bash
launchctl load ~/Library/LaunchAgents/com.aria2.aria2c.plist
```

服务会立即启动，并会在每次登录时自动运行。

#### 4.4 管理命令

- **停止**：`launchctl unload ~/Library/LaunchAgents/com.aria2.aria2c.plist`
- **查看状态**：`launchctl list | grep aria2`
- **手动重启**：先 `unload` 再 `load`

---

## 5. 配合 Web UI 使用（AriaNg）

aria2 开启 RPC 服务后，可以通过图形界面管理下载任务。**AriaNg** 是目前最优秀的 Web 前端之一。

### 下载 AriaNg

访问 [AriaNg GitHub Releases](https://github.com/mayswind/AriaNg/releases)，下载最新版的 `AriaNg.zip`，解压后双击 `index.html` 即可运行（无需额外服务器）。

### 配置 AriaNg 连接 aria2

1. 打开 AriaNg 界面。
2. 点击左侧的 **AriaNg 设置**（扳手图标）。
3. 在 **RPC** 选项卡中设置：
   - **地址**：`http://localhost:6800/jsonrpc`
   - **协议**：`http`
   - **密钥**：填入你在 `aria2.conf` 中设置的 `rpc-secret`

保存后，AriaNg 会自动连接。如果状态显示“已连接”，就可以添加下载任务了。

> 提示：AriaNg 也可以部署到本地 Web 服务器，或者直接使用在线版本（但需要注意密钥传输安全）。

---

## 6. 常见问题与解决

### 6.1 `brew services start aria2` 报错

```
Error: Formula `aria2` has not implemented #plist, #service...
```

**原因**：aria2 没有自带服务定义文件。  
**解决**：使用本文第 4 节的 launchd 方案或 `-D` 参数。

### 6.2 RPC 连接失败

- 确认 aria2 进程正在运行：`ps aux | grep aria2c`
- 检查防火墙是否允许 6800 端口。
- 查看日志：`tail -f ~/.aria2/aria2.log`
- 确认 `rpc-secret` 填写正确。

### 6.3 下载速度慢

- 增加 `max-connection-per-server` 和 `split` 的值。
- 使用 `aria2c -x 16 -s 16` 临时测试（-x 16 表示 16 个连接）。
- 更换镜像源或使用 BT 种子时开启 DHT。

### 6.4 开机自启不生效（launchd）

- 检查 plist 文件路径是否正确。
- 确认 plist 文件没有语法错误：`plutil ~/Library/LaunchAgents/com.aria2.aria2c.plist`
- 查看系统日志：`log show --predicate 'subsystem == "com.apple.launchd"' --last 5m`

---

## 7. 总结

通过上述步骤，你已经在 macOS 上成功配置了 aria2，并实现了后台运行和开机自启。配合 AriaNg 图形界面，可以像使用迅雷一样方便地添加和管理下载任务。

aria2 的强大之处在于灵活和高性能，无论是下载普通文件、磁力链接还是 BT 种子，都能轻松应对。希望这篇博客能帮助你打造一个稳定、高效的下载环境。

**参考资料**

- [aria2 官方文档](https://aria2.github.io/)
- [AriaNg GitHub](https://github.com/mayswind/AriaNg)

---
