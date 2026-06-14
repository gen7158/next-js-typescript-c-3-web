// ts-pass-lab/ 配下では Tailwind を使わず自前の CSS 変数のみ。
// 親ディレクトリの postcss.config.mjs (tailwindcss) が遡って読まれないよう
// ここで空のプラグインセットを宣言して上書きする。
const config = {
  plugins: {},
};
export default config;
