import type { Lesson, LessonLevel } from '@/types/learning';

type FullstackSeed = {
  id: string;
  title: string;
  chapter: string;
  category: string;
  level: LessonLevel;
  minutes: number;
  summary: string;
  concept: string;
  syntax: string;
  code: string;
  output: string;
  focus: string[];
  mistake: string;
  practice: string;
};

const seeds: FullstackSeed[] = [
  { id:'web-client-server',title:'Webとクライアント・サーバー',chapter:'Chapter 9 Webの土台',category:'Web基礎',level:'basic',minutes:35,summary:'ブラウザ、サーバー、DBが協力して画面を作る流れを学びます。',concept:'Webアプリではブラウザがリクエストを送り、サーバーが処理し、必要ならDBを読み書きしてレスポンスを返します。役割を分けて考えることがフルスタック開発の出発点です。',syntax:'Browser -> HTTP Request -> Server -> Database -> Response',code:'type Layer = "browser" | "server" | "database";\nconst flow: Layer[] = ["browser", "server", "database"];\nconsole.log(flow.join(" -> "));',output:'browser -> server -> database',focus:['クライアント','サーバー','データベース','責務'],mistake:'画面に見える処理がすべてブラウザで行われると思う',practice:'Webアプリの処理順を型付き配列で表現する' },
  { id:'http-request-response',title:'HTTPリクエストとレスポンス',chapter:'Chapter 9 Webの土台',category:'HTTP',level:'basic',minutes:40,summary:'メソッド、URL、ヘッダー、ボディ、ステータスコードを整理します。',concept:'HTTPはブラウザとサーバーの会話の形式です。何をしたいかをメソッドで、対象をURLで、結果をステータスコードで表します。',syntax:'GET /api/users -> 200 OK',code:'type HttpResult = { method: "GET" | "POST"; status: number };\nconst result: HttpResult = { method: "GET", status: 200 };\nconsole.log(`${result.method} ${result.status}`);',output:'GET 200',focus:['HTTPメソッド','URL','ヘッダー','ステータスコード'],mistake:'エラー時も常に200を返して本文だけで失敗を表す',practice:'HTTPメソッドとステータスを型で制限する' },
  { id:'html-semantics',title:'HTMLとセマンティクス',chapter:'Chapter 9 Webの土台',category:'HTML',level:'basic',minutes:35,summary:'意味のあるHTML構造とアクセシビリティの基礎を学びます。',concept:'HTMLは見た目ではなく文書の意味と構造を表します。button、nav、mainなど適切な要素を使うと、操作性と検索性が高まります。',syntax:'<main><button type="button">保存</button></main>',code:'type ElementRole = { tag: string; purpose: string };\nconst element: ElementRole = { tag: "button", purpose: "操作" };\nconsole.log(`${element.tag}: ${element.purpose}`);',output:'button: 操作',focus:['セマンティックHTML','フォーム','アクセシビリティ','ARIA'],mistake:'クリックできる要素をすべてdivで作る',practice:'HTML要素と役割の対応をデータ化する' },
  { id:'css-responsive',title:'CSSレイアウトとレスポンシブ',chapter:'Chapter 9 Webの土台',category:'CSS',level:'basic',minutes:45,summary:'Flexbox、Grid、ブレークポイント、モバイル設計を学びます。',concept:'レスポンシブUIでは画面幅に応じて情報の並び方を変えます。固定幅に頼らず、余白、最小幅、折り返しを設計します。',syntax:'grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));',code:'type Layout = { columns: number; mobile: boolean };\nfunction columns(width: number): Layout {\n  return { columns: width < 700 ? 1 : 3, mobile: width < 700 };\n}\nconsole.log(columns(390).columns);',output:'1',focus:['Flexbox','Grid','メディアクエリ','モバイルファースト'],mistake:'PC幅だけで完成と判断する',practice:'画面幅から列数を決定する関数を作る' },
  { id:'browser-devtools',title:'ブラウザ・DOM・DevTools',chapter:'Chapter 9 Webの土台',category:'ブラウザ',level:'standard',minutes:45,summary:'DOM、Network、Consoleを使って問題を切り分けます。',concept:'Webの不具合は画面、通信、JavaScript、サーバーに分けて調べます。DevToolsのNetworkとConsoleは実際の状態を確認する基本道具です。',syntax:'UI -> Network -> Response -> Console',code:'type Check = "UI" | "Network" | "Response" | "Console";\nconst checks: Check[] = ["UI","Network","Response","Console"];\nconsole.log(checks.length);',output:'4',focus:['DOM','Network','Console','デバッグ'],mistake:'画面が動かないときにコードだけを眺め続ける',practice:'デバッグの確認順を配列で表現する' },

  { id:'react-components-jsx',title:'ReactコンポーネントとJSX',chapter:'Chapter 10 Reactフロントエンド',category:'React',level:'basic',minutes:45,summary:'UIを再利用できる部品へ分ける考え方を学びます。',concept:'Reactでは画面を小さなコンポーネントへ分割します。1つの部品が1つの役割を持つようにすると、変更と再利用がしやすくなります。',syntax:'function UserCard() { return <article>...</article>; }',code:'type Component = { name: string; responsibility: string };\nconst card: Component = { name: "UserCard", responsibility: "ユーザー表示" };\nconsole.log(card.name);',output:'UserCard',focus:['コンポーネント','JSX','責務分割','再利用'],mistake:'ページ全体を1つの巨大コンポーネントにする',practice:'コンポーネント名と責務を型で表現する' },
  { id:'react-props',title:'Propsとコンポーネント設計',chapter:'Chapter 10 Reactフロントエンド',category:'React',level:'basic',minutes:45,summary:'親から子へ型安全にデータを渡します。',concept:'Propsはコンポーネントへの入力です。必要な値とイベントだけを渡し、内部実装を外へ漏らさない設計が重要です。',syntax:'type Props = { title: string; onSave: () => void };',code:'type CardProps = { title: string; count?: number };\nfunction label(props: CardProps) { return `${props.title}:${props.count ?? 0}`; }\nconsole.log(label({ title: "Tasks" }));',output:'Tasks:0',focus:['Props','必須・任意','コールバック','単方向データフロー'],mistake:'子コンポーネントが親の状態を直接変更できると思う',practice:'任意Propsを持つ表示関数を作る' },
  { id:'react-state-events',title:'Stateとイベント処理',chapter:'Chapter 10 Reactフロントエンド',category:'React',level:'basic',minutes:50,summary:'画面内で変化する値とユーザー操作を扱います。',concept:'Stateは画面の現在状態です。イベントを受けて次の状態を計算し、Reactに再描画を任せます。直接書き換えず新しい値を作ります。',syntax:'const [count, setCount] = useState(0);',code:'type CounterState = { count: number };\nfunction increment(state: CounterState): CounterState { return { count: state.count + 1 }; }\nconsole.log(increment({ count: 2 }).count);',output:'3',focus:['useState','イベント','イミュータブル','再描画'],mistake:'Stateのオブジェクトを直接変更する',practice:'現在状態から次の状態を返す純粋関数を作る' },
  { id:'react-forms',title:'フォームと入力検証',chapter:'Chapter 10 Reactフロントエンド',category:'フォーム',level:'standard',minutes:55,summary:'入力値、エラー、送信状態を安全に管理します。',concept:'フォームは値だけでなく、未入力、形式エラー、送信中、成功、失敗の状態を持ちます。送信前とサーバー側の両方で検証します。',syntax:'type FormState = { value: string; error?: string };',code:'function validateName(value: string): string | null {\n  return value.trim().length >= 2 ? null : "2文字以上必要です";\n}\nconsole.log(validateName("A"));',output:'2文字以上必要です',focus:['controlled input','バリデーション','送信状態','エラー表示'],mistake:'ブラウザ側の検証だけで安全だと考える',practice:'名前の入力値を検証する関数を作る' },
  { id:'react-hooks-effects',title:'Hooksと副作用',chapter:'Chapter 10 Reactフロントエンド',category:'React',level:'standard',minutes:55,summary:'useEffectが必要な処理と不要な処理を区別します。',concept:'副作用は外部システムとの同期です。計算だけで求められる値をEffectへ入れず、通信、購読、ブラウザAPIなどに限定します。',syntax:'useEffect(() => subscribe(), []);',code:'type Price = { unit: number; count: number };\nfunction total(value: Price) { return value.unit * value.count; }\nconsole.log(total({ unit: 120, count: 3 }));',output:'360',focus:['useEffect','派生値','クリーンアップ','依存配列'],mistake:'計算できる値をEffectでStateへ保存する',practice:'Effectなしで派生値を計算する関数を作る' },

  { id:'next-app-router',title:'Next.js App Router',chapter:'Chapter 11 Next.jsアプリ開発',category:'Next.js',level:'standard',minutes:50,summary:'appディレクトリ、layout、page、動的ルートを学びます。',concept:'App Routerではフォルダ構造がURLとレイアウトになります。ページ、共有レイアウト、loading、errorの責務を分けます。',syntax:'app/products/[id]/page.tsx',code:'function productPath(id: string): string { return `/products/${id}`; }\nconsole.log(productPath("42"));',output:'/products/42',focus:['App Router','layout','page','動的ルート'],mistake:'UI部品をすべてpage.tsxへ詰め込む',practice:'IDから動的ルートのURLを作る' },
  { id:'next-server-client',title:'Server ComponentsとClient Components',chapter:'Chapter 11 Next.jsアプリ開発',category:'Next.js',level:'standard',minutes:55,summary:'サーバーとブラウザの実行境界を理解します。',concept:'Server Componentはサーバーでデータ取得や秘密情報を扱い、Client Componentは状態やイベントを扱います。必要な場所だけuse clientにします。',syntax:'"use client"; // 状態やイベントが必要な境界だけ',code:'type ComponentSide = "server" | "client";\nconst dataView: ComponentSide = "server";\nconst interactiveButton: ComponentSide = "client";\nconsole.log(`${dataView}/${interactiveButton}`);',output:'server/client',focus:['Server Component','Client Component','use client','境界'],mistake:'すべてのファイルへuse clientを書く',practice:'機能ごとの実行場所を型で分類する' },
  { id:'next-data-fetching',title:'データ取得・キャッシュ・再検証',chapter:'Chapter 11 Next.jsアプリ開発',category:'Next.js',level:'advanced',minutes:60,summary:'最新性と速度のバランスを設計します。',concept:'データごとに毎回取得するか、一定時間キャッシュするか、更新後に再検証するかを決めます。正解はデータの変化頻度で異なります。',syntax:'fetch(url, { cache: "no-store" })',code:'type CacheMode = "fresh" | "timed" | "static";\nfunction mode(changesOften: boolean): CacheMode { return changesOften ? "fresh" : "timed"; }\nconsole.log(mode(true));',output:'fresh',focus:['fetch','cache','revalidate','最新性'],mistake:'すべてのデータへ同じキャッシュ設定を使う',practice:'更新頻度からキャッシュ方針を決める' },
  { id:'next-actions-forms',title:'Server Actionsとフォーム処理',chapter:'Chapter 11 Next.jsアプリ開発',category:'Next.js',level:'advanced',minutes:60,summary:'フォーム送信をサーバー処理へ安全につなぎます。',concept:'Server Actionはフォーム処理をサーバーで実行できます。ただし入力値は必ず検証し、認証と認可を確認してからDBを更新します。',syntax:'async function createTask(formData: FormData) { "use server"; }',code:'type ActionResult = { ok: true } | { ok: false; error: string };\nfunction save(title: string): ActionResult { return title.trim() ? { ok: true } : { ok: false, error: "必須" }; }\nconsole.log(save("").ok);',output:'false',focus:['Server Actions','FormData','再検証','段階的拡張'],mistake:'Actionがサーバーで動くため入力検証が不要だと思う',practice:'フォーム値から成功・失敗結果を返す' },

  { id:'node-runtime',title:'Node.jsとサーバー実行環境',chapter:'Chapter 12 バックエンドAPI',category:'Node.js',level:'basic',minutes:45,summary:'ブラウザとNode.jsで使えるAPIの違いを理解します。',concept:'Node.jsはサーバー上でJavaScriptを実行します。ブラウザのDOMはありませんが、環境変数、ファイル、ネットワークなどサーバー向け機能を扱えます。',syntax:'process.env.DATABASE_URL',code:'type Runtime = "browser" | "node";\nfunction canReadSecret(runtime: Runtime) { return runtime === "node"; }\nconsole.log(canReadSecret("node"));',output:'true',focus:['Node.js','ランタイム','環境変数','非同期I/O'],mistake:'APIキーをClient Componentへ埋め込む',practice:'秘密情報を扱える実行環境を判定する' },
  { id:'route-handlers',title:'Route HandlersでAPIを作る',chapter:'Chapter 12 バックエンドAPI',category:'API',level:'standard',minutes:60,summary:'GET、POST、Request、Responseを使ったAPI実装を学びます。',concept:'Route Handlerはapp/api配下でHTTPリクエストを処理します。入力を読み、検証し、処理結果に合ったステータスとJSONを返します。',syntax:'export async function POST(request: Request) { return Response.json(data); }',code:'type ApiResponse = { status: number; body: { message: string } };\nfunction createResponse(ok: boolean): ApiResponse { return ok ? { status: 201, body: { message: "created" } } : { status: 400, body: { message: "invalid" } }; }\nconsole.log(createResponse(true).status);',output:'201',focus:['Route Handler','Request','Response','JSON'],mistake:'失敗理由に関係なく500を返す',practice:'結果に応じたAPIレスポンスを作る' },
  { id:'rest-api-design',title:'REST API設計とCRUD',chapter:'Chapter 12 バックエンドAPI',category:'API設計',level:'standard',minutes:60,summary:'リソース、URL、HTTPメソッド、CRUDを対応させます。',concept:'RESTでは操作名ではなくリソースをURLに置き、GET、POST、PATCH、DELETEで操作を表します。一貫した命名が利用者の理解を助けます。',syntax:'GET /api/tasks, POST /api/tasks, PATCH /api/tasks/:id',code:'type Operation = "create" | "read" | "update" | "delete";\nconst method: Record<Operation,string> = { create:"POST", read:"GET", update:"PATCH", delete:"DELETE" };\nconsole.log(method.update);',output:'PATCH',focus:['REST','CRUD','リソース','冪等性'],mistake:'URLへ/api/createTaskのような動詞を並べる',practice:'CRUD操作をHTTPメソッドへ対応させる' },
  { id:'backend-validation',title:'サーバー側バリデーション',chapter:'Chapter 12 バックエンドAPI',category:'バリデーション',level:'standard',minutes:55,summary:'外部入力をunknownとして検証します。',concept:'HTTPから届く値は信用できません。型注釈だけでは実行時の値を保証できないため、必須、型、長さ、範囲をサーバーで確認します。',syntax:'const body: unknown = await request.json();',code:'type TaskInput = { title: string };\nfunction isTaskInput(value: unknown): value is TaskInput {\n  return typeof value === "object" && value !== null && "title" in value && typeof value.title === "string" && value.title.trim().length > 0;\n}\nconsole.log(isTaskInput({ title: "学習" }));',output:'true',focus:['unknown','型ガード','スキーマ検証','400 Bad Request'],mistake:'TypeScriptの型を付ければ外部入力も正しいと思う',practice:'unknownなAPI入力を型ガードで検証する' },
  { id:'backend-errors-logging',title:'エラー処理とログ設計',chapter:'Chapter 12 バックエンドAPI',category:'運用',level:'advanced',minutes:55,summary:'利用者向けエラーと調査用ログを分けます。',concept:'画面には安全で理解しやすいエラーを返し、サーバーログには原因、処理名、識別子を残します。秘密情報やパスワードは記録しません。',syntax:'{ level: "error", operation: "createTask", requestId }',code:'type Log = { level: "info" | "error"; operation: string };\nconst log: Log = { level: "error", operation: "createTask" };\nconsole.log(`${log.level}:${log.operation}`);',output:'error:createTask',focus:['例外','ログレベル','requestId','機密情報'],mistake:'catchでエラーを握りつぶす、または秘密情報をログへ出す',practice:'構造化ログの最小データを作る' },
  { id:'environment-config',title:'環境変数と設定管理',chapter:'Chapter 12 バックエンドAPI',category:'設定',level:'standard',minutes:45,summary:'開発・本番の設定と秘密情報を安全に分けます。',concept:'接続先やAPIキーはコードへ直書きせず環境変数で渡します。NEXT_PUBLIC_付きの値はブラウザへ公開される点に注意します。',syntax:'DATABASE_URL=postgresql://...',code:'type EnvName = "development" | "test" | "production";\nfunction apiBase(env: EnvName) { return env === "production" ? "https://api.example.com" : "http://localhost:3000"; }\nconsole.log(apiBase("production"));',output:'https://api.example.com',focus:['環境変数','.env','NEXT_PUBLIC','秘密情報'],mistake:'秘密鍵へNEXT_PUBLIC_を付ける',practice:'環境ごとの接続先を選ぶ関数を作る' },

  { id:'sql-basics',title:'SQLとCRUDの基礎',chapter:'Chapter 13 データベース',category:'SQL',level:'basic',minutes:55,summary:'SELECT、INSERT、UPDATE、DELETEを学びます。',concept:'DBはデータを永続化します。SQLでは対象テーブルと条件を明確にし、特にUPDATEとDELETEではWHEREを忘れないことが重要です。',syntax:'SELECT id, title FROM tasks WHERE completed = false;',code:'type TaskRow = { id: number; title: string; completed: boolean };\nconst rows: TaskRow[] = [{ id:1,title:"API",completed:false },{ id:2,title:"DB",completed:true }];\nconsole.log(rows.filter((row)=>!row.completed).length);',output:'1',focus:['SELECT','INSERT','UPDATE','DELETE'],mistake:'UPDATEやDELETEでWHERE条件を付け忘れる',practice:'未完了レコードだけを抽出する' },
  { id:'db-schema-relations',title:'DB設計・主キー・リレーション',chapter:'Chapter 13 データベース',category:'DB設計',level:'standard',minutes:60,summary:'テーブル、主キー、外部キー、1対多を設計します。',concept:'DB設計ではデータの重複を減らし、関係をIDで結びます。ユーザーと投稿のような1対多では子側が外部キーを持ちます。',syntax:'users 1 --- * posts (posts.user_id -> users.id)',code:'type User = { id:number; name:string };\ntype Post = { id:number; userId:number; title:string };\nconst users:User[]=[{id:1,name:"Mio"}];\nconst posts:Post[]=[{id:1,userId:1,title:"Hello"}];\nconsole.log(posts.filter((post)=>post.userId===users[0].id).length);',output:'1',focus:['主キー','外部キー','1対多','正規化'],mistake:'ユーザー名など変更される値を関連付けキーにする',practice:'IDで親子データを関連付ける' },
  { id:'prisma-crud',title:'Prismaで型安全なCRUD',chapter:'Chapter 13 データベース',category:'Prisma',level:'standard',minutes:65,summary:'schema、migration、Prisma Clientの役割を学びます。',concept:'PrismaはDBスキーマから型安全なクライアントを生成します。スキーマ変更、migration、アプリコードの順で整合性を保ちます。',syntax:'await prisma.task.create({ data: { title } });',code:'type CreateTask = { data: { title: string; completed?: boolean } };\nfunction normalize(input: CreateTask) { return { title: input.data.title, completed: input.data.completed ?? false }; }\nconsole.log(normalize({ data:{ title:"Prisma" } }).completed);',output:'false',focus:['schema.prisma','migration','Prisma Client','CRUD'],mistake:'本番DBへ手作業だけで列を追加し履歴を残さない',practice:'Prisma create相当の入力を正規化する' },
  { id:'transactions-indexes',title:'トランザクションとインデックス',chapter:'Chapter 13 データベース',category:'DB設計',level:'advanced',minutes:60,summary:'複数更新の一貫性と検索速度を考えます。',concept:'トランザクションは複数操作をまとめて成功・失敗させます。インデックスは検索を速くしますが、更新コストも増えるため検索条件に合わせます。',syntax:'BEGIN; UPDATE accounts ...; COMMIT;',code:'type Account = { name:string; balance:number };\nfunction transfer(from:Account,to:Account,amount:number):[Account,Account] {\n  if (from.balance < amount) return [from,to];\n  return [{...from,balance:from.balance-amount},{...to,balance:to.balance+amount}];\n}\nconsole.log(transfer({name:"A",balance:100},{name:"B",balance:0},30)[1].balance);',output:'30',focus:['transaction','rollback','index','N+1'],mistake:'途中で失敗すると不整合になる複数更新を別々に確定する',practice:'送金処理を一度に成功させるロジックを作る' },

  { id:'auth-cookies-sessions',title:'Cookie・Session・JWT',chapter:'Chapter 14 認証とセキュリティ',category:'認証',level:'standard',minutes:65,summary:'ログイン状態を維持する代表的な方法を比較します。',concept:'認証後はCookieなどでセッション識別子を送ります。HttpOnly、Secure、SameSiteを設定し、JWTでも署名検証と期限確認が必要です。',syntax:'Set-Cookie: session=...; HttpOnly; Secure; SameSite=Lax',code:'type Session = { userId:string; expiresAt:number };\nfunction active(session:Session,now:number){ return session.expiresAt > now; }\nconsole.log(active({userId:"u1",expiresAt:200},100));',output:'true',focus:['Cookie','Session','JWT','有効期限'],mistake:'localStorageへ長期間有効な認証トークンを無条件で保存する',practice:'セッションの有効期限を判定する' },
  { id:'password-hashing',title:'パスワードとハッシュ',chapter:'Chapter 14 認証とセキュリティ',category:'認証',level:'standard',minutes:50,summary:'パスワードを平文保存しない理由を学びます。',concept:'パスワードは復号できる暗号化ではなく、bcryptやArgon2などの遅いハッシュで保存します。ログイン時は同じアルゴリズムで照合します。',syntax:'hash(password) -> storedHash; verify(password, storedHash)',code:'type CredentialState = "plain" | "hashed";\nfunction safeToStore(state:CredentialState){ return state === "hashed"; }\nconsole.log(safeToStore("hashed"));',output:'true',focus:['hash','salt','bcrypt','Argon2'],mistake:'パスワードを平文または単純なSHAだけで保存する',practice:'保存可能な資格情報状態を判定する' },
  { id:'authorization-roles',title:'認可・所有者確認・ロール',chapter:'Chapter 14 認証とセキュリティ',category:'認可',level:'advanced',minutes:60,summary:'ログイン済みかだけでなく操作権限を確認します。',concept:'認証は誰か、認可は何をしてよいかです。管理者ロールだけでなく、対象データの所有者かもサーバー側で確認します。',syntax:'if (task.userId !== session.user.id) return 403;',code:'type Role = "user" | "admin";\nfunction canDelete(role:Role,ownerId:string,userId:string){ return role==="admin" || ownerId===userId; }\nconsole.log(canDelete("user","u1","u2"));',output:'false',focus:['認証','認可','RBAC','所有者確認'],mistake:'ボタンを非表示にするだけで権限制御したつもりになる',practice:'ロールと所有者から削除権限を判定する' },
  { id:'web-security',title:'XSS・CSRF・CORS・SQL Injection',chapter:'Chapter 14 認証とセキュリティ',category:'セキュリティ',level:'advanced',minutes:75,summary:'Webアプリの代表的な攻撃と防御を学びます。',concept:'外部入力をHTMLやSQLへ直接結合しない、Cookie送信を伴う更新ではCSRF対策をする、CORSは必要なOriginだけ許可することが基本です。',syntax:'parameterized query + output escaping + SameSite',code:'function allowOrigin(origin:string,allowed:string[]){ return allowed.includes(origin); }\nconsole.log(allowOrigin("https://app.example.com",["https://app.example.com"]));',output:'true',focus:['XSS','CSRF','CORS','SQL Injection'],mistake:'CORSを*にすればセキュリティ問題がすべて解決すると思う',practice:'許可Originのホワイトリスト判定を作る' },

  { id:'unit-testing',title:'単体テストとテスト設計',chapter:'Chapter 15 品質と運用',category:'テスト',level:'standard',minutes:55,summary:'正常系、境界値、異常系を小さく検証します。',concept:'単体テストでは副作用の少ない関数を対象に、代表値だけでなく0、空、上限直前などの境界値を確認します。',syntax:'expect(calculateTotal(items)).toBe(300);',code:'function fee(amount:number){ return amount >= 5000 ? 0 : 500; }\nconst cases = [4999,5000].map(fee);\nconsole.log(cases.join(","));',output:'500,0',focus:['unit test','境界値','Arrange Act Assert','モック'],mistake:'正常系1件だけでテスト済みと判断する',practice:'送料無料境界の前後を確認する' },
  { id:'integration-e2e',title:'統合テストとE2Eテスト',chapter:'Chapter 15 品質と運用',category:'テスト',level:'advanced',minutes:60,summary:'API・DB・画面をどの範囲で検証するか学びます。',concept:'統合テストは複数モジュールの接続、E2Eは利用者操作全体を確認します。重要な導線へ絞り、単体テストと役割分担します。',syntax:'UI submit -> API -> DB -> success message',code:'type TestLayer = "unit" | "integration" | "e2e";\nconst loginFlow: TestLayer = "e2e";\nconsole.log(loginFlow);',output:'e2e',focus:['integration','E2E','Playwright','テストピラミッド'],mistake:'すべてを遅いE2Eテストだけで確認する',practice:'利用者導線に適したテスト層を選ぶ' },
  { id:'git-ci',title:'Git・コードレビュー・CI',chapter:'Chapter 15 品質と運用',category:'開発運用',level:'standard',minutes:55,summary:'変更を安全に共有し、自動検査する流れを学びます。',concept:'小さなコミットとPull Requestで変更理由を共有し、CIでLint、型検査、テスト、ビルドを自動実行します。',syntax:'lint -> typecheck -> test -> build',code:'type CheckName = "lint"|"typecheck"|"test"|"build";\nconst pipeline:CheckName[]=["lint","typecheck","test","build"];\nconsole.log(pipeline.join(" -> "));',output:'lint -> typecheck -> test -> build',focus:['Git','Pull Request','CI','自動検査'],mistake:'大量の無関係な変更を1コミットへまとめる',practice:'CIで実行する検査順を表現する' },
  { id:'deploy-monitoring',title:'デプロイ・監視・障害対応',chapter:'Chapter 15 品質と運用',category:'デプロイ',level:'advanced',minutes:65,summary:'本番公開後に必要なログ、メトリクス、ロールバックを学びます。',concept:'デプロイは終了ではありません。稼働確認、エラー率、応答時間、DB接続、ログを監視し、問題時に前バージョンへ戻せるようにします。',syntax:'build -> deploy -> health check -> monitor -> rollback',code:'type Deployment = { status:"healthy"|"degraded"; errorRate:number };\nfunction shouldRollback(value:Deployment){ return value.status==="degraded" || value.errorRate>0.05; }\nconsole.log(shouldRollback({status:"healthy",errorRate:0.01}));',output:'false',focus:['Vercel','ヘルスチェック','監視','ロールバック'],mistake:'公開URLが開けば全機能正常だと判断する',practice:'稼働状態からロールバック要否を判定する' },

  { id:'fullstack-architecture',title:'総合設計: フルスタック構成',chapter:'Chapter 16 卒業制作',category:'総合設計',level:'advanced',minutes:75,summary:'UI、API、DB、認証を責務ごとに設計します。',concept:'実装前にユーザー操作、必要データ、API、DBテーブル、権限、エラー、テストをつなげて設計します。境界を明確にすると修正範囲を小さくできます。',syntax:'Page -> Action/API -> Service -> Database',code:'type LayerName = "page"|"api"|"service"|"database";\nconst architecture:LayerName[]=["page","api","service","database"];\nconsole.log(architecture.join(" -> "));',output:'page -> api -> service -> database',focus:['アーキテクチャ','責務分離','データフロー','設計'],mistake:'画面から直接DB操作するような境界のない設計にする',practice:'アプリの処理層を順番に表現する' },
  { id:'capstone-api-contract',title:'卒業制作1: API契約とデータ設計',chapter:'Chapter 16 卒業制作',category:'卒業制作',level:'advanced',minutes:90,summary:'タスク管理サービスの型、API、DB設計を完成させます。',concept:'画面を作る前にTask、User、入力、レスポンス、エラー形式を定義し、CRUD APIとDBリレーションを対応させます。',syntax:'TaskInput -> POST /api/tasks -> Task -> tasks table',code:'type TaskInput={title:string};\ntype Task=TaskInput&{id:string;completed:boolean};\nfunction createTask(input:TaskInput):Task{return{id:"t1",title:input.title,completed:false};}\nconsole.log(createTask({title:"設計"}).completed);',output:'false',focus:['API契約','データモデル','CRUD','エラー形式'],mistake:'画面ごとに異なるデータ形式を場当たり的に作る',practice:'入力型から永続化後のTaskを作る' },
  { id:'capstone-auth-data',title:'卒業制作2: 認証付きCRUD',chapter:'Chapter 16 卒業制作',category:'卒業制作',level:'advanced',minutes:100,summary:'ユーザーごとにデータを分離し、安全に更新します。',concept:'すべての更新でセッションを確認し、検索条件へuserIdを含めます。IDだけで更新すると他ユーザーのデータへ触れる危険があります。',syntax:'where: { id: taskId, userId: session.user.id }',code:'type Task={id:string;userId:string};\nfunction owns(task:Task,userId:string){return task.userId===userId;}\nconsole.log(owns({id:"t1",userId:"u1"},"u1"));',output:'true',focus:['Session','所有者確認','CRUD','認可'],mistake:'ログイン確認だけで任意IDのデータ更新を許可する',practice:'タスク所有者を確認する' },
  { id:'capstone-release',title:'卒業制作3: テスト・公開・改善',chapter:'Chapter 16 卒業制作',category:'卒業制作',level:'advanced',minutes:100,summary:'テスト、CI、デプロイ、監視まで完結させます。',concept:'主要導線のテスト、環境変数、migration、デプロイ、公開URL確認、ログ確認、バックアップ方針まで揃えて初めて運用可能なWebアプリになります。',syntax:'test -> migrate -> deploy -> smoke test -> monitor',code:'type ReleaseCheck={name:string;passed:boolean};\nconst checks:ReleaseCheck[]=[{name:"test",passed:true},{name:"deploy",passed:true},{name:"smoke",passed:true}];\nconsole.log(checks.every((check)=>check.passed));',output:'true',focus:['リリース','migration','スモークテスト','監視'],mistake:'ローカルで動いた状態を本番完成と考える',practice:'リリース条件がすべて成功したか確認する' },
];

export const fullstackLessons: Lesson[] = seeds.map((seed, index) => ({
  id: seed.id,
  step: 28 + index,
  title: seed.title,
  chapter: seed.chapter,
  category: seed.category,
  level: seed.level,
  source: 'built-in',
  minutes: seed.minutes,
  summary: seed.summary,
  learningGoals: [
    `${seed.title}の役割をWeb全体の流れの中で説明できる`,
    `${seed.focus.slice(0, 2).join('と')}を使う場面を判断できる`,
    'フロントエンドとバックエンドの責務を区別できる',
    seed.practice,
  ],
  whyImportant: seed.concept,
  pitfalls: [
    seed.mistake,
    '利用者から届く値をそのまま信用する',
    '動作確認を画面表示だけで終わらせ、通信・データ・ログを確認しない',
  ],
  keyPoints: seed.focus,
  syntax: seed.syntax,
  code: seed.code,
  output: seed.output,
  lineByLine: [
    `この例では${seed.focus[0]}を中心に、扱うデータの形を定義します。`,
    '処理を小さな型または関数へ分け、入力と出力を追いやすくします。',
    `最後に「${seed.output}」となることを確認します。`,
  ],
  sections: [
    {
      title: 'Web全体での役割',
      description: seed.concept,
      points: [
        `${seed.focus[0]}がブラウザ・サーバー・DBのどこに属するか確認する`,
        '入力、処理、保存、出力の順にデータを追う',
        '失敗時にどの層がどのエラーを返すか考える',
      ],
    },
    {
      title: '実装するときの判断',
      description: `${seed.title}を実装するときは、正常系だけでなく未入力、不正値、権限不足、通信失敗も設計します。`,
      points: [
        '秘密情報はサーバー側だけで扱う',
        '外部入力は実行時に検証する',
        '処理結果に合うステータス・ログ・UIを用意する',
      ],
      code: seed.syntax,
    },
  ],
  comparisons: [
    `${seed.focus[0]}と${seed.focus[1] ?? '関連機能'}は役割が異なります。実行場所と責務を基準に使い分けます。`,
    'ブラウザでの入力チェックは操作性向上、サーバーでの入力チェックはデータ保護のために必要です。',
  ],
  extraExamples: [{
    title: '境界値と失敗時も考える',
    description: 'サンプルの入力を変え、正常時と失敗時の戻り値がどう変わるか確認します。',
    code: seed.code,
    output: seed.output,
  }],
  checkpoints: [
    { question: `${seed.title}はWebアプリのどの問題を解決しますか？`, answer: seed.concept },
    { question: '実装時に最も避けたい間違いは何ですか？', answer: seed.mistake },
    { question: '本番を意識して追加確認するものは何ですか？', answer: '入力検証、権限、失敗時のレスポンス、ログ、テスト、秘密情報の扱いを確認します。' },
  ],
  exercise: {
    id: `${seed.id}-exercise`,
    title: `${seed.title}の設計判断をコードで確認`,
    description: `${seed.practice}演習です。Web固有APIを直接動かす代わりに、同じデータ設計と判断ロジックをTypeScriptで実行します。`,
    requirements: [`${seed.focus[0]}を意識した型を使う`, 'anyを使わない', `「${seed.output}」を出力する`],
    starterCode: [
      '// この下にコードを書いてください。',
      '// 分からないときは上の「書き方ガイド」を開きましょう。',
      '',
    ].join('\n'),
    solution: seed.code,
    expectedOutput: seed.output,
    hints: [seed.syntax, `重要語: ${seed.focus.join('、')}`, seed.mistake],
    guideSteps: [
      `STEP 1: ${seed.focus[0]}を表す型と入力データを用意する`,
      `STEP 2: 「${seed.practice}」ための正常時の処理を書く`,
      'STEP 3: 未入力・不正値・権限不足など、失敗時の分岐を追加する',
      `STEP 4: console.logで「${seed.output}」を出力し、期待値と比べる`,
    ],
    examPoint: 'コードの実行場所、外部入力、権限、永続化、失敗時の扱いを分けて確認します。',
  },
  review: [seed.title, ...seed.focus, seed.practice].slice(0, 7),
}));
