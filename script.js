// 🚀 智能图片压缩工具 - 前端逻辑

class ImageCompressorApp {
  constructor() {
    this.files = [];
    this.currentFileId = 0;
    this.isProcessing = false;
    this.startTime = null;

    this.initializeElements();
    this.attachEventListeners();
    this.loadSettings();
  }

  initializeElements() {
    // 上传相关
    this.uploadArea = document.getElementById('uploadArea');
    this.fileInput = document.getElementById('fileInput');

    // 设置相关
    this.widthInput = document.getElementById('widthInput');
    this.heightInput = document.getElementById('heightInput');
    this.keepRatioCheckbox = document.getElementById('keepRatio');
    this.qualitySlider = document.getElementById('qualitySlider');
    this.qualityValue = document.getElementById('qualityValue');
    this.formatSelect = document.getElementById('formatSelect');
    this.preserveAnimationCheckbox = document.getElementById('preserveAnimation');
    this.keepOriginalNameCheckbox = document.getElementById('keepOriginalName');

    // 按钮
    this.compressBtn = document.getElementById('compressBtn');
    this.clearBtn = document.getElementById('clearBtn');
    this.downloadAllBtn = document.getElementById('downloadAllBtn');
    this.settingsBtn = document.getElementById('settingsBtn');

    // 悬浮设置面板
    this.settingsOverlay = document.getElementById('settingsOverlay');
    this.closeSettingsBtn = document.getElementById('closeSettingsBtn');

    // 文件列表
    this.filesList = document.getElementById('filesList');
    this.filesCount = document.getElementById('filesCount');
    this.totalSize = document.getElementById('totalSize');

    // 统计
    this.statsSection = document.getElementById('statsSection');
    this.totalCompressionRatio = document.getElementById('totalCompressionRatio');
    this.spaceSaved = document.getElementById('spaceSaved');
    this.processingTime = document.getElementById('processingTime');
    this.successCount = document.getElementById('successCount');

    // 加载覆盖层
    this.loadingOverlay = document.getElementById('loadingOverlay');
    this.loadingText = document.getElementById('loadingText');
    this.progressFill = document.getElementById('progressFill');
    this.progressText = document.getElementById('progressText');
  }

  attachEventListeners() {
    // 文件上传
    this.uploadArea.addEventListener('click', () => {
      this.fileInput.click();
    });

    this.fileInput.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
    });

    // 拖拽上传
    this.uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.uploadArea.classList.add('drag-over');
    });

    this.uploadArea.addEventListener('dragleave', () => {
      this.uploadArea.classList.remove('drag-over');
    });

    this.uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      this.uploadArea.classList.remove('drag-over');
      this.handleFiles(e.dataTransfer.files);
    });

    // 设置变化
    this.qualitySlider.addEventListener('input', () => {
      this.qualityValue.textContent = this.qualitySlider.value;
      this.saveSettings();
    });

    this.widthInput.addEventListener('input', () => {
      if (this.keepRatioCheckbox.checked && this.currentAspectRatio) {
        const width = parseInt(this.widthInput.value);
        if (width) {
          this.heightInput.value = Math.round(width / this.currentAspectRatio);
        }
      }
      this.saveSettings();
    });

    this.heightInput.addEventListener('input', () => {
      if (this.keepRatioCheckbox.checked && this.currentAspectRatio) {
        const height = parseInt(this.heightInput.value);
        if (height) {
          this.widthInput.value = Math.round(height * this.currentAspectRatio);
        }
      }
      this.saveSettings();
    });

    // 其他设置
    [this.formatSelect, this.preserveAnimationCheckbox, this.keepOriginalNameCheckbox, this.keepRatioCheckbox].forEach(
      (element) => {
        element.addEventListener('change', () => this.saveSettings());
      }
    );

    // 按钮事件
    this.compressBtn.addEventListener('click', () => this.startCompression());
    this.clearBtn.addEventListener('click', () => this.clearFiles());
    this.downloadAllBtn.addEventListener('click', () => this.downloadAll());
    this.settingsBtn.addEventListener('click', () => this.showSettings());

    // 悬浮设置面板事件
    this.closeSettingsBtn.addEventListener('click', () => this.hideSettings());
    this.settingsOverlay.addEventListener('click', (e) => {
      if (e.target === this.settingsOverlay) {
        this.hideSettings();
      }
    });

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'o':
            e.preventDefault();
            this.fileInput.click();
            break;
          case 'Enter':
            if (!this.isProcessing && this.files.length > 0) {
              e.preventDefault();
              this.startCompression();
            }
            break;
        }
      }
    });
  }

  handleFiles(fileList) {
    const files = Array.from(fileList);
    const imageFiles = files.filter(
      (file) => file.type.startsWith('image/') || /\.(jpe?g|png|gif|webp|bmp|tiff?)$/i.test(file.name)
    );

    if (imageFiles.length === 0) {
      this.showNotification('请选择有效的图片文件', 'warning');
      return;
    }

    imageFiles.forEach((file) => {
      const fileObj = {
        id: ++this.currentFileId,
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'waiting',
        progress: 0,
        originalSize: file.size,
        compressedSize: 0,
        compressionRatio: 0,
        outputName: this.generateOutputName(file.name),
        isAnimated: this.detectAnimation(file),
        preview: null,
        result: null,
      };

      this.files.push(fileObj);
      this.createPreview(fileObj);
    });

    this.updateUI();
    this.showNotification(`添加了 ${imageFiles.length} 个文件`, 'success');
  }

  generateOutputName(originalName) {
    if (this.keepOriginalNameCheckbox.checked) {
      // 保持原始名称，只改变扩展名
      const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
      const format = this.formatSelect.value;

      if (format === 'auto') {
        // 自动选择：静态图片用webp，动图保持原格式
        return originalName;
      }

      return `${nameWithoutExt}.${format === 'jpg' ? 'jpg' : format}`;
    } else {
      // 生成新名称
      const timestamp = Date.now();
      const format = this.formatSelect.value === 'auto' ? 'webp' : this.formatSelect.value;
      return `compressed_${timestamp}.${format}`;
    }
  }

  detectAnimation(file) {
    const name = file.name.toLowerCase();
    return name.endsWith('.gif') || (name.endsWith('.webp') && this.preserveAnimationCheckbox.checked);
  }

  async createPreview(fileObj) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          fileObj.originalWidth = img.width;
          fileObj.originalHeight = img.height;
          fileObj.preview = e.target.result;

          // 设置默认宽高比
          if (this.files.length === 1) {
            this.currentAspectRatio = img.width / img.height;
          }

          this.renderFileItem(fileObj);
          resolve();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(fileObj.file);
    });
  }

  renderFileItem(fileObj) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item fade-in';
    fileItem.setAttribute('data-id', fileObj.id);

    const sizeText = this.formatFileSize(fileObj.size);
    const dimensionsText =
      fileObj.originalWidth && fileObj.originalHeight
        ? `${fileObj.originalWidth} × ${fileObj.originalHeight}`
        : '处理中...';

    fileItem.innerHTML = `
            <img src="${fileObj.preview || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="%23f3f4f6"/><text x="30" y="35" text-anchor="middle" font-size="24">📷</text></svg>'}"
                 alt="${fileObj.name}"
                 class="file-preview">
            <div class="file-info">
                <div class="file-name">${fileObj.name}</div>
                <div class="file-details">
                    <span>📏 ${dimensionsText}</span>
                    <span>💾 ${sizeText}</span>
                    <span>${fileObj.isAnimated ? '🎬 动画' : '🖼️静态'}</span>
                </div>
                <div class="file-progress" style="display: none;">
                    <div class="file-progress-bar" style="width: ${fileObj.progress}%"></div>
                </div>
            </div>
            <div class="file-status">
                <div class="status-badge status-${fileObj.status}">
                    ${this.getStatusText(fileObj.status)}
                </div>
                <button class="btn btn-small btn-secondary" onclick="app.removeFile(${fileObj.id})">
                    🗑️
                </button>
            </div>
        `;

    this.filesList.appendChild(fileItem);
  }

  getStatusText(status) {
    const statusMap = {
      waiting: '等待中',
      processing: '处理中',
      completed: '已完成',
      error: '失败',
    };
    return statusMap[status] || status;
  }

  removeFile(fileId) {
    this.files = this.files.filter((f) => f.id !== fileId);
    const fileElement = document.querySelector(`[data-id="${fileId}"]`);
    if (fileElement) {
      fileElement.remove();
    }
    this.updateUI();
  }

  clearFiles() {
    if (this.isProcessing) {
      if (!confirm('正在处理中，确定要清空文件列表吗？')) {
        return;
      }
    }

    this.files = [];
    this.filesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📷</div>
                <p>暂无文件，请上传图片开始压缩</p>
            </div>
        `;
    this.updateUI();
    this.hideStats();
  }

  updateUI() {
    const fileCount = this.files.length;
    const totalSize = this.files.reduce((sum, file) => sum + file.originalSize, 0);
    const completedCount = this.files.filter((f) => f.status === 'completed').length;

    this.filesCount.textContent = `${fileCount} 个文件`;
    this.totalSize.textContent = `总大小: ${this.formatFileSize(totalSize)}`;

    // 更新按钮状态
    this.compressBtn.disabled = fileCount === 0 || this.isProcessing;
    this.compressBtn.innerHTML = this.isProcessing ? '⏳ 处理中...' : `🚀 开始压缩 (${fileCount})`;

    this.downloadAllBtn.disabled = completedCount === 0;
    this.downloadAllBtn.innerHTML = `📦 下载全部 (${completedCount})`;

    // 如果没有文件，隐藏统计
    if (fileCount === 0) {
      this.hideStats();
    }
  }

  async startCompression() {
    if (this.files.length === 0 || this.isProcessing) return;

    this.isProcessing = true;
    this.startTime = Date.now();
    this.showLoading('开始处理图片...');

    const settings = this.getCompressionSettings();
    let processedCount = 0;
    let successCount = 0;

    // 更新UI
    this.updateUI();

    for (const fileObj of this.files) {
      if (fileObj.status === 'completed') {
        processedCount++;
        continue;
      }

      try {
        await this.compressFile(fileObj, settings);
        successCount++;
      } catch (error) {
        console.error('压缩失败:', error);
        this.updateFileStatus(fileObj.id, 'error', 0);
      }

      processedCount++;
      const progress = (processedCount / this.files.length) * 100;
      this.updateProgress(progress, `处理中 ${processedCount}/${this.files.length}`);
    }

    this.isProcessing = false;
    this.hideLoading();
    this.updateUI();
    this.showStats();

    if (successCount > 0) {
      this.showNotification(`成功压缩 ${successCount} 个文件！`, 'success');
    }
  }

  async compressFile(fileObj, settings) {
    this.updateFileStatus(fileObj.id, 'processing', 0);

    // 准备FormData
    const formData = new FormData();
    formData.append('file', fileObj.file);
    formData.append(
      'settings',
      JSON.stringify({
        ...settings,
        outputName: fileObj.outputName,
        isAnimated: fileObj.isAnimated,
      })
    );

    try {
      const response = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // 获取处理结果
      const blob = await response.blob();
      const result = {
        blob: blob,
        size: blob.size,
        url: URL.createObjectURL(blob),
      };

      // 更新文件对象
      fileObj.result = result;
      fileObj.compressedSize = result.size;
      fileObj.compressionRatio = (((fileObj.originalSize - result.size) / fileObj.originalSize) * 100).toFixed(1);

      this.updateFileStatus(fileObj.id, 'completed', 100);
      this.updateFileResult(fileObj);
    } catch (error) {
      console.error('压缩文件时出错:', error);
      throw error;
    }
  }

  updateFileStatus(fileId, status, progress) {
    const fileObj = this.files.find((f) => f.id === fileId);
    if (fileObj) {
      fileObj.status = status;
      fileObj.progress = progress;
    }

    const fileElement = document.querySelector(`[data-id="${fileId}"]`);
    if (fileElement) {
      const statusBadge = fileElement.querySelector('.status-badge');
      const progressBar = fileElement.querySelector('.file-progress-bar');
      const progressContainer = fileElement.querySelector('.file-progress');

      if (statusBadge) {
        statusBadge.className = `status-badge status-${status}`;
        statusBadge.textContent = this.getStatusText(status);
      }

      if (progressContainer && progressBar) {
        if (status === 'processing') {
          progressContainer.style.display = 'block';
          progressBar.style.width = `${progress}%`;
        } else {
          progressContainer.style.display = 'none';
        }
      }
    }
  }

  updateFileResult(fileObj) {
    const fileElement = document.querySelector(`[data-id="${fileObj.id}"]`);
    if (!fileElement) return;

    const fileInfo = fileElement.querySelector('.file-info');
    const compressionInfo = document.createElement('div');
    compressionInfo.className = 'compression-info';

    compressionInfo.innerHTML = `
            <span>📈 压缩率: ${fileObj.compressionRatio}%</span>
            <span>💾 ${this.formatFileSize(fileObj.originalSize)} → ${this.formatFileSize(fileObj.compressedSize)}</span>
        `;

    // 添加下载按钮
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn btn-small btn-success';
    downloadBtn.innerHTML = '📥 下载';
    downloadBtn.onclick = () => this.downloadFile(fileObj);

    const statusArea = fileElement.querySelector('.file-status');
    statusArea.insertBefore(downloadBtn, statusArea.lastElementChild);

    fileInfo.appendChild(compressionInfo);
  }

  downloadFile(fileObj) {
    if (!fileObj.result) return;

    const link = document.createElement('a');
    link.href = fileObj.result.url;
    link.download = fileObj.outputName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async downloadAll() {
    const completedFiles = this.files.filter((f) => f.status === 'completed' && f.result);

    if (completedFiles.length === 0) {
      this.showNotification('没有可下载的文件', 'warning');
      return;
    }

    if (completedFiles.length === 1) {
      this.downloadFile(completedFiles[0]);
      return;
    }

    // 创建ZIP文件（如果有多个文件）
    this.showNotification('准备打包下载...', 'info');

    // 简化版本：逐个下载
    for (const fileObj of completedFiles) {
      await new Promise((resolve) => {
        setTimeout(() => {
          this.downloadFile(fileObj);
          resolve();
        }, 500); // 延迟避免浏览器阻止多重下载
      });
    }
  }

  getCompressionSettings() {
    return {
      width: this.widthInput.value ? parseInt(this.widthInput.value) : null,
      height: this.heightInput.value ? parseInt(this.heightInput.value) : null,
      quality: parseInt(this.qualitySlider.value),
      format: this.formatSelect.value,
      preserveAnimation: this.preserveAnimationCheckbox.checked,
      keepOriginalName: this.keepOriginalNameCheckbox.checked,
      keepRatio: this.keepRatioCheckbox.checked,
    };
  }

  showLoading(text) {
    this.loadingText.textContent = text;
    this.loadingOverlay.style.display = 'flex';
    this.updateProgress(0, text);
  }

  hideLoading() {
    this.loadingOverlay.style.display = 'none';
  }

  updateProgress(percentage, text) {
    this.progressFill.style.width = `${percentage}%`;
    this.progressText.textContent = `${Math.round(percentage)}%`;
    if (text) {
      this.loadingText.textContent = text;
    }
  }

  showStats() {
    const completedFiles = this.files.filter((f) => f.status === 'completed');

    if (completedFiles.length === 0) return;

    const totalOriginal = completedFiles.reduce((sum, f) => sum + f.originalSize, 0);
    const totalCompressed = completedFiles.reduce((sum, f) => sum + f.compressedSize, 0);
    const overallRatio = (((totalOriginal - totalCompressed) / totalOriginal) * 100).toFixed(1);
    const spaceSaved = totalOriginal - totalCompressed;
    const processingTime = this.startTime ? (Date.now() - this.startTime) / 1000 : 0;

    this.totalCompressionRatio.textContent = `${overallRatio}%`;
    this.spaceSaved.textContent = this.formatFileSize(spaceSaved);
    this.processingTime.textContent = `${processingTime.toFixed(1)}s`;
    this.successCount.textContent = completedFiles.length.toString();

    this.statsSection.style.display = 'block';
    this.statsSection.classList.add('fade-in');
  }

  hideStats() {
    this.statsSection.style.display = 'none';
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  showNotification(message, type = 'info') {
    // 简单的通知实现
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            padding: 1rem 1.5rem;
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;

    const colors = {
      info: 'var(--info-color)',
      success: 'var(--success-color)',
      warning: 'var(--warning-color)',
      error: 'var(--danger-color)',
    };

    notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <div style="width: 4px; height: 40px; background: ${colors[type] || colors.info}; border-radius: 2px;"></div>
                <div>
                    <div style="font-weight: 600; color: var(--text-color); margin-bottom: 0.25rem;">
                        ${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️'}
                        ${type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.875rem;">
                        ${message}
                    </div>
                </div>
            </div>
        `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  saveSettings() {
    const settings = this.getCompressionSettings();
    localStorage.setItem('compressorSettings', JSON.stringify(settings));
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('compressorSettings');
      if (saved) {
        const settings = JSON.parse(saved);

        if (settings.quality !== undefined) {
          this.qualitySlider.value = settings.quality;
          this.qualityValue.textContent = settings.quality;
        }

        if (settings.format) {
          this.formatSelect.value = settings.format;
        }

        if (settings.preserveAnimation !== undefined) {
          this.preserveAnimationCheckbox.checked = settings.preserveAnimation;
        }

        if (settings.keepOriginalName !== undefined) {
          this.keepOriginalNameCheckbox.checked = settings.keepOriginalName;
        }

        if (settings.keepRatio !== undefined) {
          this.keepRatioCheckbox.checked = settings.keepRatio;
        }
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  }

  // 悬浮设置面板控制
  showSettings() {
    this.settingsOverlay.style.display = 'flex';
    // 使用 setTimeout 确保 display 设置生效后再添加 show 类
    setTimeout(() => {
      this.settingsOverlay.classList.add('show');
    }, 10);
  }

  hideSettings() {
    this.settingsOverlay.classList.remove('show');
    // 等待动画完成后隐藏元素
    setTimeout(() => {
      this.settingsOverlay.style.display = 'none';
    }, 300);
  }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .btn-small {
        padding: 0.5rem 1rem;
        font-size: 0.75rem;
    }
`;
document.head.appendChild(style);

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new ImageCompressorApp();
});

// 防止页面刷新时丢失文件
window.addEventListener('beforeunload', (e) => {
  if (app && app.isProcessing) {
    e.preventDefault();
    e.returnValue = '正在处理文件，确定要离开吗？';
    return '正在处理文件，确定要离开吗？';
  }
});
