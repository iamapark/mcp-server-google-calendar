// import fs from "fs/promises";
// import axios from "axios";
// import { Logger } from "pino";
// import {
//   saveCredentialsToFile,
//   loadCredentialsFromFile,
//   // startDeviceFlow,
//   // pollForTokens,
//   initializeAuthClient,
//   getAuthenticatedClient,
//   oAuth2Client,
// } from "../googleAuth";

// // Mock external dependencies
// jest.mock("fs/promises");
// jest.mock("axios");
// jest.mock("../logger", () => ({
//   logger: {
//     debug: jest.fn(),
//     error: jest.fn(),
//   },
// }));

// // Mock logger for testing
// const mockLogger: Logger = {
//   debug: jest.fn(),
//   error: jest.fn(),
// } as any;

// describe("Google Auth Module", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe("saveCredentialsToFile", () => {
//     it("should save credentials successfully", async () => {
//       const mockCredentials = { access_token: "test_token" };
//       (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

//       await saveCredentialsToFile(mockCredentials);

//       expect(fs.writeFile).toHaveBeenCalledWith(
//         "token.json",
//         JSON.stringify(mockCredentials)
//       );
//     });

//     it("should throw error when saving fails", async () => {
//       const mockError = new Error("Write failed");
//       (fs.writeFile as jest.Mock).mockRejectedValue(mockError);

//       await expect(saveCredentialsToFile({})).rejects.toThrow(
//         "Failed to store token"
//       );
//     });
//   });

//   describe("loadCredentialsFromFile", () => {
//     it("should load credentials successfully", async () => {
//       const mockCredentials = { access_token: "test_token" };
//       (fs.readFile as jest.Mock).mockResolvedValue(
//         Buffer.from(JSON.stringify(mockCredentials))
//       );

//       const result = await loadCredentialsFromFile();

//       expect(result).toEqual(mockCredentials);
//     });

//     it("should return null when file does not exist", async () => {
//       const error = new Error("File not found") as NodeJS.ErrnoException;
//       error.code = "ENOENT";
//       (fs.readFile as jest.Mock).mockRejectedValue(error);

//       const result = await loadCredentialsFromFile();

//       expect(result).toBeNull();
//     });
//   });

//   describe("startDeviceFlow", () => {
//     it("should start device flow successfully", async () => {
//       const mockResponse = {
//         data: {
//           device_code: "test_device_code",
//           user_code: "test_user_code",
//           verification_url: "http://test.url",
//           interval: 5,
//           expires_in: 300,
//         },
//       };
//       (axios.post as jest.Mock).mockResolvedValue(mockResponse);

//       const result = await startDeviceFlow();

//       expect(result).toEqual(mockResponse.data);
//       expect(axios.post).toHaveBeenCalledWith(
//         "https://oauth2.googleapis.com/device/code",
//         expect.any(Object)
//       );
//     });

//     it("should throw error when device flow start fails", async () => {
//       (axios.post as jest.Mock).mockRejectedValue(new Error("API error"));

//       await expect(startDeviceFlow()).rejects.toThrow(
//         "Failed to start device flow authentication"
//       );
//     });
//   });

//   describe("pollForTokens", () => {
//     it("should poll and return tokens successfully", async () => {
//       const mockTokens = { access_token: "test_token" };
//       (axios.post as jest.Mock).mockResolvedValue({ data: mockTokens });
//       (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

//       const result = await pollForTokens("device_code", 5, 300);

//       expect(result).toEqual(mockTokens);
//     });

//     it("should handle authorization_pending correctly", async () => {
//       const error = new Error("Auth pending");
//       (error as any).response = { data: { error: "authorization_pending" } };
//       (axios.post as jest.Mock)
//         .mockRejectedValueOnce(error)
//         .mockResolvedValueOnce({ data: { access_token: "test_token" } });

//       const result = await pollForTokens("device_code", 1, 300);

//       expect(result).toEqual({ access_token: "test_token" });
//     });

//     it("should throw error on access_denied", async () => {
//       const error = new Error("Access denied");
//       (error as any).response = { data: { error: "access_denied" } };
//       (axios.post as jest.Mock).mockRejectedValue(error);

//       await expect(pollForTokens("device_code", 5, 300)).rejects.toThrow(
//         "User denied access"
//       );
//     });
//   });
// });
