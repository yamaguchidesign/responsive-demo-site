// ブレークポイント設定機能
document.addEventListener('DOMContentLoaded', function() {
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
    });
    
    // ウィンドウリサイズ時の監視
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            applyBreakpoint();
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

    // ローカルストレージから設定を読み込み
    const savedMode = localStorage.getItem('currentMode') || 'fixed';
    const savedAutoSwitchAbove = localStorage.getItem('autoSwitchAbove') === 'true';
    const savedAutoSwitchBelow = localStorage.getItem('autoSwitchBelow') === 'true';
    const savedThresholdAbove = localStorage.getItem('thresholdAbove') || '1440';
    const savedThresholdBelow = localStorage.getItem('thresholdBelow') || '1440';
    
    thresholdInputAbove.value = savedThresholdAbove;
    thresholdInputBelow.value = savedThresholdBelow;
    autoSwitchAbove.checked = savedAutoSwitchAbove;
    autoSwitchBelow.checked = savedAutoSwitchBelow;

    // デフォルトは固定モード
    modeFixedCSS.media = 'all';
    modeFluidCSS.media = 'none';

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
        } else {
            autoSwitchControl.style.display = 'none';
        }

        // CSSファイルを切り替え（media属性で有効/無効を制御）
        if (mode === 'fluid') {
            modeFixedCSS.media = 'none';
            modeFluidCSS.media = 'all';
        } else if (mode === 'mixed') {
            // 混合モードの場合は自動切り替えのチェックを実行
            checkAutoSwitch();
        } else {
            modeFixedCSS.media = 'all';
            modeFluidCSS.media = 'none';
        }

        // ローカルストレージに保存
        localStorage.setItem('currentMode', mode);
    }

    // 自動切り替えのチェック
    function checkAutoSwitch() {
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
        }, 100);
    });

    // 初期状態を復元
    switchMode(savedMode);

    // 画像モード切り替え
    const imageModeButtons = document.querySelectorAll('.image-mode-btn');
    const imageModeAspectCSS = document.getElementById('mode-image-aspect');
    const imageModeHeightCSS = document.getElementById('mode-image-height');

    // デフォルトはアスペクト比固定モード
    imageModeAspectCSS.media = 'all';
    imageModeHeightCSS.media = 'none';

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
});

