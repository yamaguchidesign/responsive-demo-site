// ウィンドウサイズ表示機能
function updateWindowSize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const windowSizeText = document.getElementById('window-size-text');
    const deviceText = document.getElementById('device-text');
    const priorityText = document.getElementById('priority-text');
    const display = document.getElementById('window-size-display');
    const meta = getViewportMeta(width);

    if (windowSizeText) windowSizeText.textContent = `${width} × ${height}`;
    if (deviceText) deviceText.textContent = meta.device;
    if (priorityText) priorityText.textContent = `優先度 ${meta.priority}${meta.outOfScope ? '・動作保証外' : ''}`;
    if (display) display.className = `window-size-display priority-${meta.priorityClass}`;

    document.body.classList.toggle('mobile-layout', width <= 767);
    document.body.dataset.priority = meta.priorityClass;
}

function getViewportMeta(width) {
    let device = width <= 767 ? 'SP' : width <= 1024 ? 'Tab' : 'PC';
    if (width >= 1025 && width <= 1279) device = 'Tab横向き／PC小さめ';

    if (width <= 319) return { device, priority: '低', priorityClass: 'out', outOfScope: true };
    if (width <= 359) return { device, priority: '低', priorityClass: 'low' };
    if (width <= 374) return { device, priority: '中', priorityClass: 'medium' };
    if (width <= 414) return { device, priority: '高', priorityClass: 'high' };
    if (width <= 430) return { device, priority: '中', priorityClass: 'medium' };
    if (width <= 767) return { device, priority: '低', priorityClass: 'low' };
    if (width <= 819) return { device, priority: '中', priorityClass: 'medium' };
    if (width <= 1024) return { device, priority: '高', priorityClass: 'high' };
    if (width <= 1279) return { device, priority: '中', priorityClass: 'medium' };
    if (width <= 1440) return { device, priority: '高', priorityClass: 'high' };
    if (width <= 1920) return { device, priority: '中', priorityClass: 'medium' };
    return { device, priority: '低', priorityClass: 'low' };
}

function updateControlsHeight() {
    const settings = document.querySelector('.settings-switcher');
    if (settings) {
        document.documentElement.style.setProperty('--controls-height', `${settings.offsetTop + settings.offsetHeight}px`);
    }
}

// ウィンドウサイズをリアルタイムで更新
window.addEventListener('resize', function() {
    updateWindowSize();
    updateControlsHeight();
});

document.addEventListener('DOMContentLoaded', function() {
    updateWindowSize();
    updateControlsHeight();
    const settingsSwitcher = document.querySelector('.settings-switcher');
    if (settingsSwitcher && 'ResizeObserver' in window) {
        new ResizeObserver(updateControlsHeight).observe(settingsSwitcher);
    }
});

// モード切り替え機能
document.addEventListener('DOMContentLoaded', function() {
    // 文字サイズモード切り替え
    const modeButtons = document.querySelectorAll('.mode-btn');
    const modeFixedCSS = document.getElementById('mode-fixed');
    const modeFluidCSS = document.getElementById('mode-fluid');
    const autoSwitchControl = document.getElementById('auto-switch-control');
    
    // 最低文字サイズ関連
    const minFontsizeControl = document.getElementById('min-fontsize-control');
    const minFontsizeInput = document.getElementById('min-fontsize-input');
    const minFontsizeUpdateBtn = document.getElementById('min-fontsize-update-btn');

    // ローカルストレージから設定を読み込み
    const savedMode = localStorage.getItem('currentMode') || 'fixed';
    const savedMinFontsize = localStorage.getItem('minFontsize') || '12';
    minFontsizeInput.value = savedMinFontsize;

    // デフォルトは固定モード
    modeFixedCSS.media = 'all';
    modeFluidCSS.media = 'none';

    // 最低文字サイズを適用する関数
    function applyMinFontsize() {
        const minFontsize = parseInt(minFontsizeInput.value) || 12;
        const windowWidth = window.innerWidth;
        // 1280px基準で1.25vw = 16px → 実際のフォントサイズを計算
        const calculatedFontsize = windowWidth * 0.0125; // 1.25vw
        
        // 計算値が最低文字サイズより小さい場合は最低文字サイズを適用
        if (calculatedFontsize < minFontsize) {
            document.documentElement.style.fontSize = minFontsize + 'px';
        } else {
            document.documentElement.style.fontSize = '';
        }
    }

    // 最低文字サイズ更新ボタンのイベント
    minFontsizeUpdateBtn.addEventListener('click', function() {
        const value = parseInt(minFontsizeInput.value) || 12;
        minFontsizeInput.value = value;
        localStorage.setItem('minFontsize', value);
        applyMinFontsize();
    });

    // モードを切り替える関数
    function switchMode(mode) {
        // アクティブ状態を更新
        modeButtons.forEach(btn => btn.classList.remove('active'));
        modeButtons.forEach(btn => btn.setAttribute('aria-checked', 'false'));
        const activeButton = Array.from(modeButtons).find(btn => btn.getAttribute('data-mode') === mode);
        if (activeButton) {
            activeButton.classList.add('active');
            activeButton.setAttribute('aria-checked', 'true');
        }

        // 混合モードの場合は自動切り替えUIを表示
        if (mode === 'mixed') {
            autoSwitchControl.style.display = 'flex';
            minFontsizeControl.style.display = 'none';
        } else if (mode === 'fluid') {
            minFontsizeControl.style.display = 'flex';
            autoSwitchControl.style.display = 'none';
        } else {
            autoSwitchControl.style.display = 'none';
            minFontsizeControl.style.display = 'none';
        }

        // CSSファイルを切り替え（media属性で有効/無効を制御）
        if (mode === 'fluid') {
            modeFixedCSS.media = 'none';
            modeFluidCSS.media = 'all';
            applyMinFontsize();
        } else if (mode === 'mixed') {
            // 混合モードの場合は自動切り替えのチェックを実行
            document.documentElement.style.fontSize = '';
            checkAutoSwitch();
        } else {
            modeFixedCSS.media = 'all';
            modeFluidCSS.media = 'none';
            document.documentElement.style.fontSize = '';
        }

        // ローカルストレージに保存
        localStorage.setItem('currentMode', mode);
        document.body.dataset.textMode = mode;
        requestAnimationFrame(updateControlsHeight);
    }

    // 自動切り替えのチェック
    function checkAutoSwitch() {
        const priority = getViewportMeta(window.innerWidth).priorityClass;
        if (priority === 'high') {
            modeFixedCSS.media = 'all';
            modeFluidCSS.media = 'none';
        } else {
            modeFixedCSS.media = 'none';
            modeFluidCSS.media = 'all';
            applyMinFontsize();
        }
    }

    // 手動モード切り替え
    modeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            switchMode(mode);
        });
    });

    // ウィンドウリサイズ時の自動切り替え
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (Array.from(modeButtons).find(btn => btn.getAttribute('data-mode') === 'mixed')?.classList.contains('active')) {
                checkAutoSwitch();
            }
            // fluidモード時は最低文字サイズをチェック
            if (Array.from(modeButtons).find(btn => btn.getAttribute('data-mode') === 'fluid')?.classList.contains('active')) {
                applyMinFontsize();
            }
        }, 100);
    });

    // 初期状態を復元
    switchMode(savedMode);

    // 画像モード切り替え
    const imageModeButtons = document.querySelectorAll('.image-mode-btn');
    const imageModeAspectCSS = document.getElementById('mode-image-aspect');
    const imageModeHeightCSS = document.getElementById('mode-image-height');
    const imageModeFluidCSS = document.getElementById('mode-image-fluid');
    const imageFluidCheckbox = document.getElementById('image-fluid-checkbox');

    // ローカルストレージから画像幅可変設定を読み込み
    const savedImageFluid = localStorage.getItem('imageFluid') === 'true';
    imageFluidCheckbox.checked = savedImageFluid;

    // デフォルトはアスペクト比固定モード
    imageModeAspectCSS.media = 'all';
    imageModeHeightCSS.media = 'none';
    imageModeFluidCSS.media = savedImageFluid ? 'all' : 'none';

    imageModeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const imageMode = this.getAttribute('data-image-mode');
            
            // アクティブ状態を更新
            imageModeButtons.forEach(btn => btn.classList.remove('active'));
            imageModeButtons.forEach(btn => btn.setAttribute('aria-checked', 'false'));
            this.classList.add('active');
            this.setAttribute('aria-checked', 'true');

            // CSSファイルを切り替え（media属性で有効/無効を制御）
            if (imageMode === 'height') {
                imageModeAspectCSS.media = 'none';
                imageModeHeightCSS.media = 'all';
            } else {
                imageModeAspectCSS.media = 'all';
                imageModeHeightCSS.media = 'none';
            }
        });
    });

    // 画像幅可変チェックボックスのイベント
    imageFluidCheckbox.addEventListener('change', function() {
        localStorage.setItem('imageFluid', this.checked);
        imageModeFluidCSS.media = this.checked ? 'all' : 'none';
    });
});
