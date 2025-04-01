import express from "express";
import { getTokenFromCode } from "./googleAuth";

let authCompletionCallback:
  | ((success: boolean, error?: string) => void)
  | null = null;

const app = express();

app.get("/oauth2callback", async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    res.send(`
      <html>
        <body>
          <h2>인증 실패</h2>
          <p>오류: ${error}</p>
          <script>window.close();</script>
        </body>
      </html>
    `);
    authCompletionCallback?.(false, String(error));
    return;
  }

  if (!code) {
    res.send(`
      <html>
        <body>
          <h2>인증 실패</h2>
          <p>인증 코드가 없습니다.</p>
          <script>window.close();</script>
        </body>
      </html>
    `);
    authCompletionCallback?.(false, "인증 코드가 없습니다.");
    return;
  }

  try {
    await getTokenFromCode(String(code));
    res.send(`
      <html>
        <body>
          <h2>인증 성공</h2>
          <p>Google Calendar 인증이 완료되었습니다. 이 창을 닫으셔도 됩니다.</p>
          <script>window.close();</script>
        </body>
      </html>
    `);
    authCompletionCallback?.(true);
  } catch (error) {
    res.send(`
      <html>
        <body>
          <h2>인증 실패</h2>
          <p>오류: ${error instanceof Error ? error.message : String(error)}</p>
          <script>window.close();</script>
        </body>
      </html>
    `);
    authCompletionCallback?.(false, String(error));
  }
});

let server: any = null;

export function startAuthServer(): Promise<void> {
  return new Promise((resolve) => {
    server = app.listen(3001, () => {
      console.error(
        "OAuth 콜백 서버가 http://localhost:3001 에서 시작되었습니다."
      );
      resolve();
    });
  });
}

export function stopAuthServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }
    server.close((err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function setAuthCompletionCallback(
  callback: (success: boolean, error?: string) => void
): void {
  authCompletionCallback = callback;
}
