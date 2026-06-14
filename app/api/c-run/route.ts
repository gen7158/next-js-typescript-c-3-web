import { NextResponse } from "next/server";

export const runtime = "nodejs";

type WandboxResponse = {
  status?: string;
  signal?: string;
  compiler_output?: string;
  compiler_error?: string;
  compiler_message?: string;
  program_output?: string;
  program_error?: string;
  program_message?: string;
};

function normalizeOutput(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { code?: unknown; stdin?: unknown; expectedOutput?: unknown };
    const code = typeof body.code === "string" ? body.code : "";
    const stdin = typeof body.stdin === "string" ? body.stdin : "";
    const expectedOutput = typeof body.expectedOutput === "string" ? body.expectedOutput : "";

    if (!code.trim()) return NextResponse.json({ error: "実行するコードが空です。" }, { status: 400 });
    if (code.length > 30_000 || stdin.length > 4_000) {
      return NextResponse.json({ error: "コードまたは入力が長すぎます。" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    const response = await fetch("https://wandbox.org/api/compile.json", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        compiler: "gcc-head-c",
        code,
        stdin,
        options: "warning",
        "compiler-option-raw": "-std=c17\n-Wall\n-Wextra\n-pedantic",
      }),
      signal: controller.signal,
      cache: "no-store",
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      return NextResponse.json({ error: `C実行サービスへ接続できませんでした（HTTP ${response.status}）。` }, { status: 502 });
    }

    const value = await response.json() as WandboxResponse;
    const compilerOutput = [value.compiler_output, value.compiler_error, value.compiler_message].filter(Boolean).join("\n").trim();
    const stdout = value.program_output ?? "";
    const stderr = [value.program_error, value.program_message]
      .filter((item) => item && item !== value.program_output)
      .join("\n")
      .trim();
    const exitCode = Number.parseInt(value.status ?? "1", 10);
    const compiled = exitCode === 0 && !compilerOutput.toLowerCase().includes("error:");
    const outputMatched = normalizeOutput(stdout) === normalizeOutput(expectedOutput);

    return NextResponse.json({
      command: "gcc main.c -std=c17 -Wall -Wextra -pedantic && ./a.out",
      compilerOutput,
      stdout,
      stderr,
      exitCode,
      signal: value.signal ?? "",
      compiled,
      outputMatched,
      passed: compiled && outputMatched,
    });
  } catch (error) {
    const message = error instanceof Error && error.name === "AbortError"
      ? "Cコードの実行がタイムアウトしました。無限ループがないか確認してください。"
      : "Cコードを実行できませんでした。通信状態を確認して再実行してください。";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
