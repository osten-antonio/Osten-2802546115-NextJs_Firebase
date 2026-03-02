import { render, screen } from "@testing-library/react";
import LogoutButton from "./logout-button";

jest.mock("next/navigation", () => ({ useRouter: jest.fn(() => ({ push: jest.fn(), refresh: jest.fn() })) }));

describe("LogoutButton", () => {
    test("renders correctly", () => {
        render(<LogoutButton />);
        expect(screen.getByRole("button")).toBeInTheDocument();
    });
});
