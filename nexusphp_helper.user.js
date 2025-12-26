// ==UserScript==
// @name         NexusPHP 自动魔力兑换
// @namespace    http://tampermonkey.net/
// @version      3.4
// @description  修复误判"慈善捐赠"为下载量的问题。智能识别最大值，魔力不足或无合适选项时自动停止。
// @author       KK
// @license      MIT
// @match        *://*/mybonus.php*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // === 配置区域 ===
    const INTERVAL = 10000; // 点击间隔，单位毫秒
    // ================

    // --- 正则表达式定义 ---
    const REGEX_UPLOAD = /上传|上傳|Upload/i;
    const REGEX_DOWNLOAD = /下载|下載|Download/i;
    const REGEX_NEED_MORE = /需要更多|Need more/i;
    const REGEX_HIGH_RATIO = /分享率|Share ratio|Ratio/i;

    // 【新增】排除关键词：如果行内包含这些词，绝对不是给自己买上传/下载
    // 包含：捐赠, 慈善, 赠送, 邀请, 甚至 "给他人"
    const REGEX_EXCLUDE = /捐赠|捐贈|赠送|贈送|Gift|Donate|Charity|Invite/i;
    // -------------------

    // 显示状态提示框
    function showStatus(msg, statusType = 'normal') {
        let statusBox = document.getElementById('magic-auto-status');
        if (!statusBox) {
            statusBox = document.createElement('div');
            statusBox.id = 'magic-auto-status';
            statusBox.style.cssText = 'position:fixed; top:10px; right:10px; padding:12px; z-index:9999; border-radius:5px; font-size:14px; font-weight:bold; border: 1px solid #444; color:white; font-family: sans-serif; box-shadow: 0 0 10px rgba(0,0,0,0.5); max-width: 350px;';
            document.body.appendChild(statusBox);
        }

        const colors = {
            'error': 'rgba(200, 0, 0, 0.95)',   // 红
            'warn':  'rgba(255, 140, 0, 0.95)', // 橙
            'normal':'rgba(46, 139, 87, 0.95)'  // 绿
        };
        statusBox.style.background = colors[statusType] || colors['normal'];
        statusBox.innerText = msg;
    }

    function parseSize(text) {
        const regex = /(\d+(\.\d+)?)\s*([TGM]i?B)/i;
        const match = text.match(regex);
        if (!match) return 0;
        let val = parseFloat(match[1]);
        let unit = match[3].toUpperCase().replace('I', '');
        if (unit === 'TB') val *= 1024;
        else if (unit === 'MB') val /= 1024;
        return val;
    }

    function scanOptions() {
        const options = document.querySelectorAll('input[name="option"]');
        let uploadList = [];
        let downloadList = [];

        options.forEach(input => {
            const row = input.closest('tr');
            if (!row) return;

            const btn = row.querySelector('input[type="submit"]');
            if (!btn) return;

            const rowText = row.innerText;
            
            // 【关键修复】如果这一行包含“捐赠/赠送/Charity”，直接跳过，不做处理
            if (REGEX_EXCLUDE.test(rowText)) {
                return; 
            }

            const size = parseSize(rowText);
            const item = { size: size, btn: btn, text: rowText, inputVal: input.value };

            if (REGEX_UPLOAD.test(rowText)) {
                uploadList.push(item);
            } else if (REGEX_DOWNLOAD.test(rowText)) {
                downloadList.push(item);
            }
        });

        uploadList.sort((a, b) => b.size - a.size);
        downloadList.sort((a, b) => b.size - a.size);

        return { uploadList, downloadList };
    }

    function startCountdown(btn, actionName, statusType = 'normal') {
        let countdown = INTERVAL / 1000;
        showStatus(`[${actionName}] 准备执行: ${countdown} 秒...`, statusType);
        const timer = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                showStatus(`[${actionName}] 准备执行: ${countdown} 秒...`, statusType);
            } else {
                clearInterval(timer);
                showStatus(`🚀 正在点击: ${actionName}...`, statusType);
                btn.click();
            }
        }, 1000);
    }

    function init() {
        console.log("NexusPHP Auto: 开始扫描 (已启用排除慈善/捐赠逻辑)...");
        const { uploadList, downloadList } = scanOptions();

        if (uploadList.length === 0) {
            // 如果连上传选项都没扫到，可能是页面结构完全变了
            showStatus('⚪ 未检测到有效的上传兑换选项', 'error');
            return;
        }

        const bestUpload = uploadList[0];
        const uploadBtn = bestUpload.btn;
        const isUploadDisabled = uploadBtn.disabled || uploadBtn.classList.contains('disabled');

        if (!isUploadDisabled) {
            startCountdown(uploadBtn, `购买上传 ${bestUpload.size.toFixed(0)}GB`, 'normal');
        } 
        else {
            const btnText = uploadBtn.value; 

            if (REGEX_NEED_MORE.test(btnText)) {
                showStatus(`🔴 点数不足 (${btnText})，脚本停止。`, 'error');
                return;
            } 
            else if (REGEX_HIGH_RATIO.test(btnText)) {
                console.log("NexusPHP Auto: 分享率过高，查找下载选项...");
                
                // 此时，由于我们已经排除了“慈善捐赠”，downloadList 应该是空的
                if (downloadList.length === 0) {
                    showStatus('🔴 分享率过高，且无有效的购买下载选项 -> 停止', 'error');
                    return; 
                }

                const bestDownload = downloadList[0];
                const downloadBtn = bestDownload.btn;
                const isDownloadDisabled = downloadBtn.disabled || downloadBtn.classList.contains('disabled');

                if (!isDownloadDisabled) {
                    startCountdown(downloadBtn, `分享率高 -> 买下载 ${bestDownload.size.toFixed(0)}GB`, 'warn');
                } else {
                    showStatus('🔴 分享率高，且最大下载选项不可点 -> 停止', 'error');
                }
            } 
            else {
                showStatus(`🔴 按钮禁用 (原因: ${btnText})`, 'error');
            }
        }
    }

    init();
})();
