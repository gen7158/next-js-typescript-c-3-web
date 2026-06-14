import type { Question, QuestionDifficulty, QuestionType } from "@/types/question";

type Seed = {
  question: string;
  answer: string | number | boolean;
  choices?: string[];
  code?: string;
  explanation: string;
  type?: QuestionType;
  difficulty?: QuestionDifficulty;
};

const categories: { name: string; seeds: Seed[] }[] = [
  {
    name: "C言語の基本",
    seeds: [
      { question: "Cプログラムの実行が始まる関数はどれですか。", choices: ["start", "main", "printf", "include"], answer: 1, explanation: "Cプログラムはmain関数から実行されます。" },
      { question: "C言語は一般にどの方式で実行ファイルへ変換されますか。", choices: ["コンパイル", "逐次翻訳のみ", "画像変換", "暗号化"], answer: 0, explanation: "ソースコードをコンパイラで機械語へ変換します。" },
      { question: "文の末尾に通常付ける記号を入力してください。", answer: ";", type: "fill", explanation: "C言語の文は通常セミコロンで区切ります。" },
      { question: "/* と */ で囲まれた部分は実行される。", answer: false, type: "trueFalse", explanation: "その部分はコメントであり、処理として実行されません。" },
      { question: "正常終了を表すmain関数の一般的な戻り値はどれですか。", choices: ["-1", "0", "1", "100"], answer: 1, explanation: "return 0; は正常終了を表します。" },
      { question: "次のコードの出力はどれですか。", code: "printf(\"C言語\\n\");", choices: ["C言語", "\"C言語\"", "C言語\\n", "何も表示しない"], answer: 0, type: "output", difficulty: "standard", explanation: "\\nは改行として働き、引用符自体は表示されません。" },
    ],
  },
  {
    name: "printf / scanf",
    seeds: [
      { question: "整数をprintfで表示する変換指定子はどれですか。", choices: ["%c", "%s", "%d", "%f"], answer: 2, explanation: "%dはint型の整数に使います。" },
      { question: "scanfでint型変数nへ入力する正しい形はどれですか。", choices: ["scanf(\"%d\", n)", "scanf(\"%d\", &n)", "scanf(n, \"%d\")", "scanf(\"&d\", n)"], answer: 1, explanation: "入力先のアドレスを渡すため&nとします。" },
      { question: "次の出力を選んでください。", code: "int n = 5;\nprintf(\"n=%d\", n);", choices: ["n=n", "n=%d", "n=5", "5=n"], answer: 2, type: "output", explanation: "%dがnの値5に置き換わります。" },
      { question: "double型をscanfで読む変換指定子はどれですか。", choices: ["%d", "%c", "%lf", "%s"], answer: 2, difficulty: "standard", explanation: "scanfでdouble型を読むときは%lfを使います。" },
      { question: "printf(\"%%\"); は % を1つ表示する。", answer: true, type: "trueFalse", explanation: "printf内で%%はパーセント記号そのものを表します。" },
      { question: "幅5で整数12を右寄せ表示する指定を選んでください。", choices: ["%5d", "%d5", "%05s", "%-d"], answer: 0, difficulty: "exam", explanation: "%5dは表示幅を5文字にします。" },
    ],
  },
  {
    name: "変数と型",
    seeds: [
      { question: "整数を保存する代表的な型はどれですか。", choices: ["int", "char[]", "void", "include"], answer: 0, explanation: "intは整数型です。" },
      { question: "1文字を保存する型はどれですか。", choices: ["double", "char", "long long[]", "string"], answer: 1, explanation: "char型は1文字を保存します。" },
      { question: "正しい文字定数を選んでください。", choices: ["\"A\"", "'A'", "`A`", "A"], answer: 1, explanation: "文字定数はシングルクォートで囲みます。" },
      { question: "次の出力はどれですか。", code: "int a = 3;\ndouble b = 2.0;\nprintf(\"%.1f\", a + b);", choices: ["5", "5.0", "3.2", "エラー"], answer: 1, type: "output", difficulty: "standard", explanation: "intの3はdoubleへ変換され、5.0になります。" },
      { question: "unsigned intは負の値を表すための型である。", answer: false, type: "trueFalse", explanation: "unsignedは0以上の整数を扱います。" },
      { question: "変数宣言と同時に最初の値を入れることを何と呼びますか。", choices: ["初期化", "比較", "分岐", "展開"], answer: 0, difficulty: "exam", explanation: "宣言時に値を設定することを初期化と呼びます。" },
    ],
  },
  {
    name: "演算子",
    seeds: [
      { question: "7 / 2 の結果はどれですか（両方int型）。", choices: ["3", "3.5", "4", "1"], answer: 0, explanation: "整数同士の除算では小数部分が切り捨てられます。" },
      { question: "7 % 3 の結果はどれですか。", choices: ["0", "1", "2", "3"], answer: 1, explanation: "%は割り算の余りを求めます。" },
      { question: "等しいか比較する演算子を入力してください。", answer: "==", type: "fill", explanation: "==は比較、=は代入です。" },
      { question: "次の出力はどれですか。", code: "int x = 2;\nprintf(\"%d\", x++);", choices: ["1", "2", "3", "未定義"], answer: 1, type: "output", difficulty: "standard", explanation: "後置++は元の値2を使った後に3へ増やします。" },
      { question: "&&は、左右の条件が両方真のとき真になる。", answer: true, type: "trueFalse", explanation: "&&は論理積ANDです。" },
      { question: "次の値はどれですか。", code: "int x = 2 + 3 * 4;", choices: ["20", "14", "24", "11"], answer: 1, type: "reading", difficulty: "exam", explanation: "乗算が加算より先なので3*4=12、その後2を足して14です。" },
    ],
  },
  {
    name: "if文",
    seeds: [
      { question: "次の出力はどれですか。", code: "int x = 8;\nif (x >= 5) printf(\"A\");\nelse printf(\"B\");", choices: ["A", "B", "AB", "なし"], answer: 0, type: "output", explanation: "8は5以上なのでif側を実行します。" },
      { question: "xが0でないことを表す条件はどれですか。", choices: ["x = 0", "x != 0", "x == 0", "x := 0"], answer: 1, explanation: "!=は等しくないことを比較します。" },
      { question: "ifの条件式では0が偽、0以外が真として扱われる。", answer: true, type: "trueFalse", explanation: "C言語では0が偽、0以外が真です。" },
      { question: "次の出力はどれですか。", code: "int n = 60;\nif (n > 60) printf(\"A\");\nelse if (n == 60) printf(\"B\");\nelse printf(\"C\");", choices: ["A", "B", "C", "BC"], answer: 1, type: "output", difficulty: "standard", explanation: "nは60と等しいため2番目の条件が真です。" },
      { question: "偶数かどうかを判定する条件を選んでください。", choices: ["n / 2 == 0", "n % 2 == 0", "n % 2 == 1", "n * 2 == 0"], answer: 1, difficulty: "standard", explanation: "2で割った余りが0なら偶数です。" },
      { question: "次の最終的なxの値はどれですか。", code: "int x = 5;\nif (x = 0) x = 9;\nelse x = 2;", choices: ["0", "2", "5", "9"], answer: 1, type: "reading", difficulty: "exam", explanation: "x=0は代入です。式の値0は偽なのでelseが実行されx=2です。" },
    ],
  },
  {
    name: "switch文",
    seeds: [
      { question: "switch文でどのcaseにも一致しない場合の処理はどれですか。", choices: ["else", "otherwise", "default", "finally"], answer: 2, explanation: "defaultが一致しない場合を担当します。" },
      { question: "caseの処理を終えてswitchを抜ける文はどれですか。", choices: ["stop", "break", "return only", "next"], answer: 1, explanation: "breakでswitch文を抜けます。" },
      { question: "次の出力はどれですか。", code: "int n = 2;\nswitch(n) {\ncase 1: printf(\"A\"); break;\ncase 2: printf(\"B\"); break;\ndefault: printf(\"C\");\n}", choices: ["A", "B", "C", "BC"], answer: 1, type: "output", explanation: "case 2に一致してBを表示し、breakします。" },
      { question: "caseラベルには通常、実行時に変わる変数を書ける。", answer: false, type: "trueFalse", explanation: "caseには整数定数式を使います。" },
      { question: "次の出力はどれですか。", code: "int n = 1;\nswitch(n) {\ncase 1: printf(\"A\");\ncase 2: printf(\"B\"); break;\n}", choices: ["A", "B", "AB", "なし"], answer: 2, type: "output", difficulty: "standard", explanation: "case 1にbreakがないためcase 2へ続き、ABと表示します。" },
      { question: "switchの式に最も適する型はどれですか。", choices: ["構造体", "整数型", "配列型", "関数型"], answer: 1, difficulty: "exam", explanation: "switchは整数型の値による分岐に使います。" },
    ],
  },
  {
    name: "for文",
    seeds: [
      { question: "次の出力はどれですか。", code: "for (int i=0; i<3; i++) printf(\"%d\", i);", choices: ["012", "123", "0123", "321"], answer: 0, type: "output", explanation: "iは0、1、2の3回です。" },
      { question: "for文の3つの式の順はどれですか。", choices: ["条件・更新・初期化", "初期化・条件・更新", "更新・条件・初期化", "初期化・更新・条件"], answer: 1, explanation: "for (初期化; 条件; 更新) の順です。" },
      { question: "次の繰り返し回数は何回ですか。", code: "for (int i = 1; i <= 5; i += 2) { }", choices: ["2", "3", "4", "5"], answer: 1, type: "reading", explanation: "iは1、3、5となるため3回です。" },
      { question: "for (;;) は条件を省略した無限ループとして使える。", answer: true, type: "trueFalse", difficulty: "standard", explanation: "3つの式は省略でき、条件省略時は真として扱われます。" },
      { question: "次の出力はどれですか。", code: "int s=0;\nfor(int i=1;i<=4;i++) s+=i;\nprintf(\"%d\",s);", choices: ["4", "6", "10", "11"], answer: 2, type: "output", difficulty: "standard", explanation: "1+2+3+4で10です。" },
      { question: "次のprintfは何回実行されますか。", code: "for(int i=0;i<2;i++)\n  for(int j=0;j<3;j++)\n    printf(\"*\");", choices: ["2", "3", "5", "6"], answer: 3, type: "reading", difficulty: "exam", explanation: "外側2回×内側3回で6回です。" },
    ],
  },
  {
    name: "while文",
    seeds: [
      { question: "次の出力はどれですか。", code: "int n=3;\nwhile(n>0){printf(\"%d\",n);n--;}", choices: ["012", "123", "321", "210"], answer: 2, type: "output", explanation: "3から1ずつ減り、3、2、1を表示します。" },
      { question: "while文は最初の条件が偽なら本体を0回実行する。", answer: true, type: "trueFalse", explanation: "whileは本体より前に条件を判定します。" },
      { question: "do while文が本体を実行する最小回数は何回ですか。", choices: ["0", "1", "2", "条件次第で未定"], answer: 1, explanation: "条件判定が後なので最低1回実行します。" },
      { question: "次の出力はどれですか。", code: "int i=0;\ndo { printf(\"%d\",i); i++; } while(i<0);", choices: ["なし", "0", "01", "無限"], answer: 1, type: "output", difficulty: "standard", explanation: "doの本体を1回実行して0を表示した後、条件が偽になります。" },
      { question: "無限ループを防ぐため特に確認すべきものはどれですか。", choices: ["コメント", "変数の更新", "ヘッダ名", "文字列の長さだけ"], answer: 1, difficulty: "standard", explanation: "条件に使う変数が終了方向へ更新される必要があります。" },
      { question: "次の最終的なsの値はどれですか。", code: "int i=1,s=0;\nwhile(i<=4){s+=i*i;i++;}", choices: ["10", "16", "20", "30"], answer: 3, type: "reading", difficulty: "exam", explanation: "1+4+9+16で30です。" },
    ],
  },
  {
    name: "配列",
    seeds: [
      { question: "要素数5の配列で使える最後の添字はどれですか。", choices: ["3", "4", "5", "6"], answer: 1, explanation: "添字は0から始まるため最後は4です。" },
      { question: "次の出力はどれですか。", code: "int a[3]={4,5,6};\nprintf(\"%d\",a[1]);", choices: ["4", "5", "6", "エラー"], answer: 1, type: "output", explanation: "添字1は2番目の要素5です。" },
      { question: "int a[4] = {1, 2}; のa[3]は0で初期化される。", answer: true, type: "trueFalse", explanation: "初期値を省略した残りの要素は0になります。" },
      { question: "次の合計はどれですか。", code: "int a[]={2,4,6};\nint s=0;\nfor(int i=0;i<3;i++) s+=a[i];", choices: ["6", "10", "12", "24"], answer: 2, type: "reading", difficulty: "standard", explanation: "2+4+6で12です。" },
      { question: "2次元配列 int a[2][3] の要素数はどれですか。", choices: ["2", "3", "5", "6"], answer: 3, difficulty: "standard", explanation: "2行×3列で6要素です。" },
      { question: "次の出力はどれですか。", code: "int a[3]={1,2,3};\nfor(int i=2;i>=0;i--) printf(\"%d\",a[i]);", choices: ["123", "321", "012", "210"], answer: 1, type: "output", difficulty: "exam", explanation: "添字2、1、0の順に読むので321です。" },
    ],
  },
  {
    name: "文字",
    seeds: [
      { question: "文字Aを表す正しい記述はどれですか。", choices: ["A", "'A'", "\"A\"", "[A]"], answer: 1, explanation: "1文字の定数はシングルクォートで囲みます。" },
      { question: "%cは1文字を表示する変換指定子である。", answer: true, type: "trueFalse", explanation: "%cは文字として表示します。" },
      { question: "次の出力はどれですか。", code: "char c='A';\nprintf(\"%c\",c+1);", choices: ["A", "B", "C", "1"], answer: 1, type: "output", difficulty: "standard", explanation: "連続する文字コードを前提にAの次のBになります。" },
      { question: "1文字を標準入力から読む関数はどれですか。", choices: ["getchar", "putchar", "puts", "printf"], answer: 0, explanation: "getchar()は標準入力から1文字読みます。" },
      { question: "1文字を標準出力へ出す関数はどれですか。", choices: ["getchar", "putchar", "scanf", "gets"], answer: 1, explanation: "putcharは指定した1文字を表示します。" },
      { question: "getcharの戻り値をint型で受ける主な理由はどれですか。", choices: ["小数を読むため", "EOFも区別するため", "文字列にするため", "高速化だけのため"], answer: 1, difficulty: "exam", explanation: "すべてのunsigned char値に加えてEOFを表す必要があります。" },
    ],
  },
  {
    name: "文字列",
    seeds: [
      { question: "Cの文字列の末尾にある特別な文字はどれですか。", choices: ["\\n", "\\t", "\\0", "EOFだけ"], answer: 2, explanation: "\\0は文字列の終わりを示すヌル文字です。" },
      { question: "文字列をprintfで表示する変換指定子はどれですか。", choices: ["%c", "%s", "%d", "%x"], answer: 1, explanation: "%sでヌル終端文字列を表示します。" },
      { question: "次のstrlenの結果はどれですか。", code: "strlen(\"C言語\")", choices: ["必ず3", "必ず4", "文字コードによってバイト数が異なる", "0"], answer: 2, difficulty: "exam", explanation: "strlenは文字数ではなくバイト数を数え、実行環境の文字コードで異なります。" },
      { question: "次の出力はどれですか。", code: "char s[]=\"CAT\";\nprintf(\"%c\",s[2]);", choices: ["C", "A", "T", "\\0"], answer: 2, type: "output", explanation: "添字2は3文字目のTです。" },
      { question: "2つの文字列の内容比較にはstrcmpを利用できる。", answer: true, type: "trueFalse", difficulty: "standard", explanation: "==では配列内容を比較できないためstrcmpを使います。" },
      { question: "char s[] = \"abc\"; の配列要素数はどれですか。", choices: ["2", "3", "4", "5"], answer: 2, difficulty: "standard", explanation: "a、b、cに末尾の\\0を加えて4要素です。" },
    ],
  },
  {
    name: "関数",
    seeds: [
      { question: "関数へ渡す値を何と呼びますか。", choices: ["引数", "添字", "ラベル", "指令"], answer: 0, explanation: "関数へ渡す値は引数です。" },
      { question: "関数が呼び出し元へ返す値を指定する文はどれですか。", choices: ["break", "continue", "return", "case"], answer: 2, explanation: "return式で値を返して関数を終了します。" },
      { question: "次の出力はどれですか。", code: "int add(int a,int b){return a+b;}\nprintf(\"%d\",add(2,3));", choices: ["2", "3", "5", "23"], answer: 2, type: "output", explanation: "addは2+3の5を返します。" },
      { question: "値を返さない関数の戻り値型はどれですか。", choices: ["null", "empty", "void", "none"], answer: 2, explanation: "戻り値がないことをvoidで表します。" },
      { question: "仮引数を変更すると、通常の値渡しでは呼び出し元の変数も必ず変わる。", answer: false, type: "trueFalse", difficulty: "standard", explanation: "値渡しでは値のコピーを受け取るため元の変数は変わりません。" },
      { question: "関数を定義より前で呼ぶとき、型を知らせる宣言は何ですか。", choices: ["case宣言", "プロトタイプ宣言", "配列宣言", "ラベル宣言"], answer: 1, difficulty: "exam", explanation: "プロトタイプ宣言で戻り値型と引数型を知らせます。" },
    ],
  },
  {
    name: "プリプロセッサ",
    seeds: [
      { question: "printfを使うため通常読み込むヘッダはどれですか。", choices: ["math.h", "stdio.h", "string.h", "ctype.h"], answer: 1, explanation: "printfはstdio.hで宣言されています。" },
      { question: "#include <stdio.h> の末尾にはセミコロンが必要である。", answer: false, type: "trueFalse", explanation: "プリプロセッサ指令の末尾にセミコロンは付けません。" },
      { question: "記号定数を定義する指令はどれですか。", choices: ["#define", "#case", "#const", "#value"], answer: 0, explanation: "#defineでコンパイル前の置換を定義します。" },
      { question: "次の出力はどれですか。", code: "#define N 3\nprintf(\"%d\",N*2);", choices: ["3", "5", "6", "N*2"], answer: 2, type: "output", difficulty: "standard", explanation: "Nが3に置き換わり3*2で6です。" },
      { question: "次のマクロで square(1+2) の結果として起こる問題はどれですか。", code: "#define square(x) x*x", choices: ["9になる", "5になる", "0になる", "コンパイル不能"], answer: 1, type: "reading", difficulty: "exam", explanation: "1+2*1+2と置換され5です。#define square(x) ((x)*(x))のように括弧が必要です。" },
      { question: "自作ヘッダmy.hを同じプロジェクトから読む形はどれですか。", choices: ["#include <my.h>だけ", "#include \"my.h\"", "#import my.h", "include(my.h)"], answer: 1, difficulty: "standard", explanation: "自作ヘッダは通常ダブルクォートで指定します。" },
    ],
  },
  {
    name: "ctype.h",
    seeds: [
      { question: "文字が数字か判定する関数はどれですか。", choices: ["isalpha", "isdigit", "toupper", "strlen"], answer: 1, explanation: "isdigitは'0'〜'9'かを判定します。" },
      { question: "英字かどうかを判定する関数はどれですか。", choices: ["isalpha", "tolower", "putchar", "strcmp"], answer: 0, explanation: "isalphaは英字かを判定します。" },
      { question: "小文字を大文字へ変換する関数はどれですか。", choices: ["tolower", "toupper", "isupper", "islower"], answer: 1, explanation: "toupperで可能なら大文字へ変換します。" },
      { question: "isalphaの真の戻り値は必ず1である。", answer: false, type: "trueFalse", difficulty: "standard", explanation: "真の場合は0以外であり、必ず1とは限りません。" },
      { question: "次の出力として適切なものはどれですか。", code: "printf(\"%c\",tolower('Q'));", choices: ["Q", "q", "0", "1"], answer: 1, type: "output", explanation: "tolowerは大文字Qを小文字qへ変換します。" },
      { question: "空白文字か判定する関数はどれですか。", choices: ["isspace", "isblankだけが唯一", "isempty", "isnull"], answer: 0, difficulty: "exam", explanation: "isspaceは空白、改行、タブなどを判定します。" },
    ],
  },
  {
    name: "コード読解",
    seeds: [
      { question: "次の最終的なaの値はどれですか。", code: "int a=2;\na=a+3;\na=a*2;", choices: ["5", "7", "10", "12"], answer: 2, type: "reading", explanation: "2+3で5、その後5*2で10です。" },
      { question: "次の出力はどれですか。", code: "int a=1,b=2,t;\nt=a;a=b;b=t;\nprintf(\"%d%d\",a,b);", choices: ["11", "12", "21", "22"], answer: 2, type: "output", explanation: "一時変数を使ってaとbを交換するため21です。" },
      { question: "次の出力はどれですか。", code: "int x=4;\nif(x%2) printf(\"A\"); else printf(\"B\");", choices: ["A", "B", "AB", "なし"], answer: 1, type: "output", difficulty: "standard", explanation: "4%2は0で偽なのでBです。" },
      { question: "次の最終的なnはどれですか。", code: "int n=1;\nfor(int i=0;i<3;i++) n*=2;", choices: ["2", "4", "6", "8"], answer: 3, type: "reading", difficulty: "standard", explanation: "1を3回2倍して2、4、8です。" },
      { question: "次の出力はどれですか。", code: "int a[]={5,2,8};\nint m=a[0];\nfor(int i=1;i<3;i++) if(a[i]<m)m=a[i];\nprintf(\"%d\",m);", choices: ["2", "5", "8", "15"], answer: 0, type: "reading", difficulty: "exam", explanation: "より小さい値へmを更新しているため最小値2です。" },
      { question: "次の出力はどれですか。", code: "int c=0;\nfor(int i=1;i<=5;i++) if(i%2==1)c++;\nprintf(\"%d\",c);", choices: ["2", "3", "4", "5"], answer: 1, type: "reading", difficulty: "exam", explanation: "1〜5の奇数は1、3、5の3個です。" },
    ],
  },
  {
    name: "実行結果予測",
    seeds: [
      { question: "次の出力はどれですか。", code: "printf(\"%d\",3+4*2);", choices: ["14", "11", "10", "7"], answer: 1, type: "output", explanation: "4*2を先に計算して3+8=11です。" },
      { question: "次の出力はどれですか。", code: "int x=5;\nprintf(\"%d %d\",x,x+1);", choices: ["5 5", "5 6", "6 5", "6 6"], answer: 1, type: "output", explanation: "xは5のままで、x+1だけが6です。" },
      { question: "次の出力はどれですか。", code: "for(int i=1;i<=3;i++) printf(\"%d \",i*i);", choices: ["1 2 3", "1 4 9", "2 4 6", "0 1 4"], answer: 1, type: "output", difficulty: "standard", explanation: "1、2、3の2乗を順に表示します。" },
      { question: "次の出力はどれですか。", code: "int n=10;\nwhile(n>3)n-=3;\nprintf(\"%d\",n);", choices: ["0", "1", "3", "4"], answer: 1, type: "output", difficulty: "standard", explanation: "10→7→4→1となり、1で条件が偽です。" },
      { question: "次の出力はどれですか。", code: "int s=0;\nfor(int i=0;i<5;i++){if(i==3)break;s+=i;}\nprintf(\"%d\",s);", choices: ["3", "6", "7", "10"], answer: 0, type: "output", difficulty: "exam", explanation: "i=3で加算前に終了するため0+1+2=3です。" },
      { question: "次の出力はどれですか。", code: "int s=0;\nfor(int i=0;i<5;i++){if(i==2)continue;s+=i;}\nprintf(\"%d\",s);", choices: ["7", "8", "10", "12"], answer: 1, type: "output", difficulty: "exam", explanation: "2だけ飛ばし、0+1+3+4=8です。" },
    ],
  },
  {
    name: "総合問題",
    seeds: [
      { question: "次の平均値はどれですか（整数除算）。", code: "int a[]={60,70,80};\nint sum=0;\nfor(int i=0;i<3;i++)sum+=a[i];\nprintf(\"%d\",sum/3);", choices: ["60", "70", "75", "210"], answer: 1, type: "reading", explanation: "合計210を3で割り70です。" },
      { question: "次の出力はどれですか。", code: "int n=5;\nif(n%2==0) printf(\"even\");\nelse printf(\"odd\");", choices: ["even", "odd", "5", "なし"], answer: 1, type: "output", explanation: "5は2で割った余りが1なので奇数です。" },
      { question: "配列の最大値を探すとき、初期値として安全なのはどれですか。", choices: ["常に0", "配列の最初の要素", "常に100", "要素数"], answer: 1, difficulty: "standard", explanation: "負数だけの配列にも対応するため最初の要素を候補にします。" },
      { question: "次の出力はどれですか。", code: "int f(int n){return n*n;}\nint s=0;\nfor(int i=1;i<=3;i++)s+=f(i);\nprintf(\"%d\",s);", choices: ["6", "9", "12", "14"], answer: 3, type: "reading", difficulty: "exam", explanation: "1²+2²+3²=1+4+9=14です。" },
      { question: "次の文字列に含まれる'A'の数はどれですか。", code: "char s[]=\"ABACA\";\nint c=0;\nfor(int i=0;s[i]!='\\0';i++)if(s[i]=='A')c++;", choices: ["1", "2", "3", "5"], answer: 2, type: "reading", difficulty: "exam", explanation: "添字0、2、4の3か所がAです。" },
      { question: "合格条件が60点以上のとき、境界値として特に確認すべき組はどれですか。", choices: ["0と100だけ", "59と60", "30と40", "60と70だけ"], answer: 1, difficulty: "exam", explanation: "条件の境界直前59と境界値60を確認すると>と>=の違いを検証できます。" },
    ],
  },
];

export const questions: Question[] = categories.flatMap((category, categoryIndex) =>
  category.seeds.map((seed, questionIndex) => ({
    id: `q-${String(categoryIndex + 1).padStart(2, "0")}-${String(questionIndex + 1).padStart(2, "0")}`,
    category: category.name,
    difficulty: seed.difficulty ?? (questionIndex < 2 ? "basic" : questionIndex < 4 ? "standard" : "exam"),
    type: seed.type ?? "choice",
    question: seed.question,
    code: seed.code,
    choices: seed.choices,
    answer: seed.answer,
    explanation: seed.explanation,
    examTip: `${category.name}は、値の変化と境界条件を順に確認する問題がよく出ます。`,
  })),
);

export const questionById = Object.fromEntries(questions.map((question) => [question.id, question]));
export const questionCategories = categories.map((category) => category.name);
