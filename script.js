// モード切り替え機能
document.addEventListener('DOMContentLoaded', function() {
    // 文字サイズモード切り替え
    const modeButtons = document.querySelectorAll('.mode-btn');
    const modeFixedCSS = document.getElementById('mode-fixed');
    const modeFluidCSS = document.getElementById('mode-fluid');

    // デフォルトは固定モード
    modeFixedCSS.media = 'all';
    modeFluidCSS.media = 'none';

    modeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            
            // アクティブ状態を更新
            modeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // CSSファイルを切り替え（media属性で有効/無効を制御）
            if (mode === 'fluid') {
                modeFixedCSS.media = 'none';
                modeFluidCSS.media = 'all';
            } else {
                modeFixedCSS.media = 'all';
                modeFluidCSS.media = 'none';
            }
        });
    });

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

