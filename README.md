# NexusPHP Auto Bonus Exchange (NexusPHP 自动魔力兑换)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个用于 NexusPHP 架构 PT 站点的 Tampermonkey 油猴脚本。它能够全自动扫描魔力值兑换页面，智能识别“最大”的上传量选项进行兑换，并包含完善的防坑与止损机制。

> **A smart Tampermonkey script for NexusPHP websites.** automatically scans and exchanges the maximum available upload credit using bonus points (magic points), with intelligent safety features.

## ✨ 功能特点 (Features)

* **⚡ 智能最大化 (Smart Maximize)**: 自动扫描页面上所有的兑换选项，自动换算单位 (TB/GB/MB)，优先兑换当前可用的**最大上传量**。
* **🛡️ 安全避坑 (Safety First)**: 内置黑名单机制，精准识别并跳过“慈善捐赠”、“送给他人”、“邀请码”等误导性选项，防止误操作。
* **📉 自动降分享率 (Auto Ratio Reduction)**: 当检测到因“分享率过高”导致无法购买上传量时，脚本会自动尝试购买**最大下载量**，以快速降低分享率（仅在站点提供下载量购买选项时执行）。
* **⛔ 自动止损 (Auto Stop)**:
    * 当魔力值/积分不足时（显示“需要更多...”），自动停止。
    * 当没有安全的兑换选项时，自动停止。
* **🌐 全语言兼容 (Multi-language)**: 完美支持简体中文、繁体中文、英文站点。

## 🚀 安装与使用 (Installation & Usage)

1.  安装浏览器扩展 [Tampermonkey](https://www.tampermonkey.net/)。
2.  **[点击这里安装脚本](#)** *(发布到 GreasyFork 后，请将此处链接替换为你的 GreasyFork 脚本地址)*。
3.  登录任意基于 NexusPHP 的 PT 站点。
4.  进入 **魔力值兑换页面** (通常 URL 包含 `mybonus.php`)。
5.  脚本将自动开始运行，你会在页面右上角看到运行状态提示框。

## ⚙️ 运行逻辑 (Logic Flow)

1.  **扫描 (Scan)**: 遍历页面所有选项，解析“上传”和“下载”的容量大小。
2.  **判断 (Decision)**:
    * ✅ **优先**: 尝试购买最大的上传量。
    * ⚠️ **分歧**: 如果上传按钮因“分享率过高”被禁用：
        * 脚本将寻找最大的“下载量”选项并购买。
        * 如果站点没有“下载量”商品，或者也买不起，脚本将停止。
    * ⛔ **停止**: 如果按钮显示“需要更多魔力值”，脚本立即停止。

## 🛠️ 开发与贡献 (Development)

欢迎提交 Issue 或 Pull Request 来改进这个脚本。

* 核心逻辑位于 `mybonus.php` 匹配规则下。
* 使用正则表达式进行多语言和单位匹配。

## 📄 许可证 (License)

本项目基于 [MIT License](LICENSE) 开源。

---

**免责声明 (Disclaimer)**:
本脚本仅供学习和辅助使用。使用自动化脚本可能违反某些站点的用户协议 (TOS)。请在使用前仔细阅读目标站点的规则。作者不对因使用本脚本导致的账号封禁或数据丢失承担任何责任。
