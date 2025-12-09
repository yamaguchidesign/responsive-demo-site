// ウィンドウサイズ表示機能
function updateWindowSize() {
    const windowSizeText = document.getElementById('window-size-text');
    if (windowSizeText) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        windowSizeText.textContent = `${width} × ${height}`;
    }
}

// ウィンドウサイズをリアルタイムで更新
window.addEventListener('resize', function() {
    updateWindowSize();
});

// ブレークポイント設定機能
document.addEventListener('DOMContentLoaded', function() {
    // 初期表示
    updateWindowSize();
    
    const breakpointInput = document.getElementById('breakpoint-input');
    const breakpointUpdateBtn = document.getElementById('breakpoint-update-btn');
    
    // ローカルストレージからブレークポイントを読み込み
    const savedBreakpoint = localStorage.getItem('breakpoint') || '768';
    breakpointInput.value = savedBreakpoint;
    
    // ブレークポイントを適用する関数
    function applyBreakpoint() {
        const breakpoint = parseInt(breakpointInput.value) || 768;
        const windowWidth = window.innerWidth;
        
        // bodyにクラスを追加/削除
        if (windowWidth <= breakpoint) {
            document.body.classList.add('mobile-layout');
        } else {
            document.body.classList.remove('mobile-layout');
        }
    }
    
    // 更新ボタンのイベント
    breakpointUpdateBtn.addEventListener('click', function() {
        const breakpoint = parseInt(breakpointInput.value) || 768;
        localStorage.setItem('breakpoint', breakpoint);
        applyBreakpoint();
        // 混合モードが有効な場合はチェックを実行
        if (document.querySelector('.mode-btn[data-mode="mixed"]')?.classList.contains('active')) {
            // checkAutoSwitch関数は後で定義されるので、イベントを発火
            window.dispatchEvent(new Event('breakpointUpdated'));
        }
    });
    
    // ウィンドウリサイズ時の監視
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            applyBreakpoint();
            // 混合モードが有効な場合はチェックを実行
            if (document.querySelector('.mode-btn[data-mode="mixed"]')?.classList.contains('active')) {
                window.dispatchEvent(new Event('breakpointUpdated'));
            }
        }, 100);
    });
    
    // 初期適用
    applyBreakpoint();
});

// モード切り替え機能
document.addEventListener('DOMContentLoaded', function() {
    // 文字サイズモード切り替え
    const modeButtons = document.querySelectorAll('.mode-btn');
    const modeFixedCSS = document.getElementById('mode-fixed');
    const modeFluidCSS = document.getElementById('mode-fluid');
    const autoSwitchControl = document.getElementById('auto-switch-control');
    const autoSwitchAbove = document.getElementById('auto-switch-above');
    const autoSwitchBelow = document.getElementById('auto-switch-below');
    const thresholdInputAbove = document.getElementById('threshold-input-above');
    const thresholdInputBelow = document.getElementById('threshold-input-below');
    
    // 最低文字サイズ関連
    const minFontsizeControl = document.getElementById('min-fontsize-control');
    const minFontsizeInput = document.getElementById('min-fontsize-input');
    const minFontsizeUpdateBtn = document.getElementById('min-fontsize-update-btn');

    // ローカルストレージから設定を読み込み
    const savedMode = localStorage.getItem('currentMode') || 'fixed';
    const savedAutoSwitchAbove = localStorage.getItem('autoSwitchAbove') === 'true';
    const savedAutoSwitchBelow = localStorage.getItem('autoSwitchBelow') === 'true';
    const savedThresholdAbove = localStorage.getItem('thresholdAbove') || '1440';
    const savedThresholdBelow = localStorage.getItem('thresholdBelow') || '1440';
    const savedMinFontsize = localStorage.getItem('minFontsize') || '12';
    
    thresholdInputAbove.value = savedThresholdAbove;
    thresholdInputBelow.value = savedThresholdBelow;
    autoSwitchAbove.checked = savedAutoSwitchAbove;
    autoSwitchBelow.checked = savedAutoSwitchBelow;
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
        const activeButton = Array.from(modeButtons).find(btn => btn.getAttribute('data-mode') === mode);
        if (activeButton) {
            activeButton.classList.add('active');
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
    }

    // 自動切り替えのチェック
    function checkAutoSwitch() {
        // モバイルレイアウト（SP）の場合は常に固定モード
        if (document.body.classList.contains('mobile-layout')) {
            modeFixedCSS.media = 'all';
            modeFluidCSS.media = 'none';
            return;
        }

        const windowWidth = window.innerWidth;
        let shouldBeFluid = false;
        
        // 両方のチェックボックスが選択されている場合、どちらかの条件を満たせば可変モード
        if (autoSwitchAbove.checked && autoSwitchBelow.checked) {
            const thresholdAbove = parseInt(thresholdInputAbove.value) || 1440;
            const thresholdBelow = parseInt(thresholdInputBelow.value) || 1440;
            if (windowWidth >= thresholdAbove || windowWidth <= thresholdBelow) {
                shouldBeFluid = true;
            }
        } else if (autoSwitchAbove.checked) {
            const threshold = parseInt(thresholdInputAbove.value) || 1440;
            if (windowWidth >= threshold) {
                shouldBeFluid = true;
            }
        } else if (autoSwitchBelow.checked) {
            const threshold = parseInt(thresholdInputBelow.value) || 1440;
            if (windowWidth <= threshold) {
                shouldBeFluid = true;
            }
        }

        // モードを切り替え（CSSのみ、ボタンのアクティブ状態は変更しない）
        if (shouldBeFluid) {
            modeFixedCSS.media = 'none';
            modeFluidCSS.media = 'all';
        } else {
            modeFixedCSS.media = 'all';
            modeFluidCSS.media = 'none';
        }
    }

    // 手動モード切り替え
    modeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            switchMode(mode);
        });
    });

    // 自動切り替えチェックボックスのイベント
    autoSwitchAbove.addEventListener('change', function() {
        localStorage.setItem('autoSwitchAbove', this.checked);
        
        if (Array.from(modeButtons).find(btn => btn.getAttribute('data-mode') === 'mixed')?.classList.contains('active')) {
            checkAutoSwitch();
        }
    });

    autoSwitchBelow.addEventListener('change', function() {
        localStorage.setItem('autoSwitchBelow', this.checked);
        
        if (Array.from(modeButtons).find(btn => btn.getAttribute('data-mode') === 'mixed')?.classList.contains('active')) {
            checkAutoSwitch();
        }
    });

    // 閾値入力のイベント
    thresholdInputAbove.addEventListener('change', function() {
        const value = parseInt(this.value) || 1440;
        this.value = value;
        localStorage.setItem('thresholdAbove', value);
        
        if (Array.from(modeButtons).find(btn => btn.getAttribute('data-mode') === 'mixed')?.classList.contains('active')) {
            checkAutoSwitch();
        }
    });

    thresholdInputBelow.addEventListener('change', function() {
        const value = parseInt(this.value) || 1440;
        this.value = value;
        localStorage.setItem('thresholdBelow', value);
        
        if (Array.from(modeButtons).find(btn => btn.getAttribute('data-mode') === 'mixed')?.classList.contains('active')) {
            checkAutoSwitch();
        }
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

    // ブレークポイント更新時のイベント
    window.addEventListener('breakpointUpdated', function() {
        checkAutoSwitch();
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
            this.classList.add('active');

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

