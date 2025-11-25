// モード切り替え機能
document.addEventListener('DOMContentLoaded', function() {
    // 文字サイズモード切り替え
    const modeButtons = document.querySelectorAll('.mode-btn');
    const modeFixedCSS = document.getElementById('mode-fixed');
    const modeFluidCSS = document.getElementById('mode-fluid');
    const autoSwitchAbove = document.getElementById('auto-switch-above');
    const autoSwitchBelow = document.getElementById('auto-switch-below');
    const thresholdInputAbove = document.getElementById('threshold-input-above');
    const thresholdInputBelow = document.getElementById('threshold-input-below');

    // ローカルストレージから設定を読み込み
    const savedAutoSwitchMode = localStorage.getItem('autoSwitchMode') || '';
    const savedThresholdAbove = localStorage.getItem('thresholdAbove') || '1440';
    const savedThresholdBelow = localStorage.getItem('thresholdBelow') || '1440';
    
    thresholdInputAbove.value = savedThresholdAbove;
    thresholdInputBelow.value = savedThresholdBelow;
    
    if (savedAutoSwitchMode === 'above') {
        autoSwitchAbove.checked = true;
    } else if (savedAutoSwitchMode === 'below') {
        autoSwitchBelow.checked = true;
    }

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

        // CSSファイルを切り替え（media属性で有効/無効を制御）
        if (mode === 'fluid') {
            modeFixedCSS.media = 'none';
            modeFluidCSS.media = 'all';
        } else {
            modeFixedCSS.media = 'all';
            modeFluidCSS.media = 'none';
        }
    }

    // 自動切り替えのチェック
    function checkAutoSwitch() {
        const windowWidth = window.innerWidth;
        
        if (autoSwitchAbove.checked) {
            const threshold = parseInt(thresholdInputAbove.value) || 1440;
            if (windowWidth >= threshold) {
                switchMode('fluid');
            } else {
                switchMode('fixed');
            }
        } else if (autoSwitchBelow.checked) {
            const threshold = parseInt(thresholdInputBelow.value) || 1440;
            if (windowWidth <= threshold) {
                switchMode('fluid');
            } else {
                switchMode('fixed');
            }
        }
    }

    // 手動モード切り替え
    modeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 自動切り替えを無効化
            autoSwitchAbove.checked = false;
            autoSwitchBelow.checked = false;
            localStorage.setItem('autoSwitchMode', '');

            const mode = this.getAttribute('data-mode');
            switchMode(mode);
        });
    });

    // 自動切り替えラジオボタンのイベント
    autoSwitchAbove.addEventListener('change', function() {
        if (this.checked) {
            autoSwitchBelow.checked = false;
            localStorage.setItem('autoSwitchMode', 'above');
            checkAutoSwitch();
        }
    });

    autoSwitchBelow.addEventListener('change', function() {
        if (this.checked) {
            autoSwitchAbove.checked = false;
            localStorage.setItem('autoSwitchMode', 'below');
            checkAutoSwitch();
        }
    });

    // 閾値入力のイベント
    thresholdInputAbove.addEventListener('change', function() {
        const value = parseInt(this.value) || 1440;
        this.value = value;
        localStorage.setItem('thresholdAbove', value);
        
        if (autoSwitchAbove.checked) {
            checkAutoSwitch();
        }
    });

    thresholdInputBelow.addEventListener('change', function() {
        const value = parseInt(this.value) || 1440;
        this.value = value;
        localStorage.setItem('thresholdBelow', value);
        
        if (autoSwitchBelow.checked) {
            checkAutoSwitch();
        }
    });

    // ウィンドウリサイズ時の自動切り替え
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (autoSwitchAbove.checked || autoSwitchBelow.checked) {
                checkAutoSwitch();
            }
        }, 100);
    });

    // 初期状態で自動切り替えが有効な場合は実行
    if (autoSwitchAbove.checked || autoSwitchBelow.checked) {
        checkAutoSwitch();
    }

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

