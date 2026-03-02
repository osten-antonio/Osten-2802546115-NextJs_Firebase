import { render, screen } from "@testing-library/react";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import DashboardPage from "./page";
import { App } from "firebase-admin/app";

jest.mock("next/navigation", () => ({ redirect: jest.fn((url: string) => { throw new Error(`NEXT_REDIRECT:${url}`) }) }));
jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("@/lib/firebase-admin", () => ({ adminAuth: { verifyIdToken: jest.fn() } }));
jest.mock("@/components/logout-button", () => ({ __esModule: true, default: () => <button>Logout</button> }));

const mockCookies = cookies as jest.Mock;
const mockVerifyIdToken = (adminAuth as any).verifyIdToken as jest.Mock; // intellisense keeps erroring wihtout any

const validToken = { uid: "test-uid-123", email: "test@example.com", email_verified: true };

describe("DashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies.mockResolvedValue({ get: jest.fn().mockReturnValue({ value: "valid-token" }) });
    mockVerifyIdToken.mockResolvedValue(validToken);
  });

  it("redirects to /login if no session cookie", async () => {
    mockCookies.mockResolvedValue({ get: jest.fn().mockReturnValue(undefined) });
    await expect(DashboardPage()).rejects.toThrow("NEXT_REDIRECT:/login");
  });

  it("redirects to /login if verifyIdToken throws", async () => {
    mockVerifyIdToken.mockRejectedValue(new Error("Invalid token"));
    await expect(DashboardPage()).rejects.toThrow("NEXT_REDIRECT:/login");
  });

  it("renders dashboard heading and logout button", async () => {
    render(await DashboardPage());
    expect(screen.getByRole("heading", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("displays user email and UID", async () => {
    render(await DashboardPage());
    expect(screen.getByText(/test@example\.com/)).toBeInTheDocument();
    expect(screen.getByText(/test-uid-123/)).toBeInTheDocument();
  });

  it("shows email verified status", async () => {
    render(await DashboardPage());
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });
});
