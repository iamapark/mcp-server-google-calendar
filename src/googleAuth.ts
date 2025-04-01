import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import os from "os";

// Load environment variables
dotenv.config();

// Constants
const TOKEN_PATH = path.join(os.homedir(), ".google_token.json");
const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

let oauth2Client: OAuth2Client | null = null;

/**
 * Save credentials to file
 */
export async function saveCredentialsToFile(credentials: any): Promise<void> {
  try {
    await fs.writeFile(TOKEN_PATH, JSON.stringify(credentials));
  } catch (err) {
    throw new Error("Failed to store token");
  }
}

/**
 * Load previously stored credentials
 */
export async function loadCredentialsFromFile(): Promise<any> {
  try {
    const token = await fs.readFile(TOKEN_PATH);
    return JSON.parse(token.toString());
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw err;
  }
}

/**
 * OAuth URL을 생성합니다.
 */
export function generateAuthUrl(): string {
  if (!oauth2Client) {
    throw new Error("OAuth2 클라이언트가 초기화되지 않았습니다.");
  }

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

/**
 * 인증 코드로부터 토큰을 얻습니다.
 */
export async function getTokenFromCode(code: string): Promise<void> {
  if (!oauth2Client) {
    throw new Error("OAuth2 클라이언트가 초기화되지 않았습니다.");
  }

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // 토큰 저장
  await saveToken(tokens);
}

/**
 * OAuth2 클라이언트를 초기화합니다.
 */
export async function initializeAuthClient(): Promise<void> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.REDIRECT_URI || "http://localhost:3001/oauth2callback";

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID와 GOOGLE_CLIENT_SECRET이 필요합니다.");
  }

  oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

  // 저장된 토큰이 있다면 로드
  try {
    const token = await loadToken();
    if (token) {
      oauth2Client.setCredentials(token);
      // 토큰 유효성 검사
      const isValid = await validateToken();
      if (!isValid) {
        await clearToken();
        oauth2Client.revokeCredentials();
      }
    }
  } catch (error) {
    console.error("토큰 로드 실패:", error);
    await clearToken();
  }
}

/**
 * 인증된 클라이언트를 반환합니다.
 */
export function getAuthenticatedClient(): OAuth2Client | null {
  if (!oauth2Client?.credentials?.access_token) {
    return null;
  }
  return oauth2Client;
}

// 토큰 저장
async function saveToken(tokens: any): Promise<void> {
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
}

// 토큰 로드
async function loadToken(): Promise<any> {
  try {
    const data = await fs.readFile(TOKEN_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// 토큰 삭제
async function clearToken(): Promise<void> {
  try {
    await fs.unlink(TOKEN_PATH);
  } catch {
    // 파일이 없어도 무시
  }
}

// 토큰 유효성 검사
async function validateToken(): Promise<boolean> {
  if (!oauth2Client?.credentials?.access_token) {
    return false;
  }

  try {
    const tokenInfo = await oauth2Client.getTokenInfo(
      oauth2Client.credentials.access_token
    );
    return !!tokenInfo.email;
  } catch {
    return false;
  }
}

// OAuth2 클라이언트 export
export { oauth2Client };
