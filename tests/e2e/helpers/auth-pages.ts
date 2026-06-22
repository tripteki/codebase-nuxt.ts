import { expect, type Locator, type Page, type Response, } from "@playwright/test";

export class AuthPages
{
    constructor (private readonly page: Page)
    {
    }

    private async waitForAppReady (): Promise<void>
    {
        await this.page.waitForLoadState ("domcontentloaded");
        await this.page.waitForFunction (() =>
        {
            const root = document.querySelector ("#__nuxt") as HTMLElement & {
                __vue_app__?: unknown;
            };

            return !! root?.__vue_app__;
        }, { timeout: 15_000, });
    }

    private async fillField (field: Locator, value: string): Promise<void>
    {
        await expect (field).toBeVisible ();
        await field.click ();
        await field.fill (value);
        await expect (field).toHaveValue (value);
    }

    private async submitAndWaitForApi (
        button: Locator,
        apiPath: string
    ): Promise<Response>
    {
        await expect (button).toBeVisible ();
        await expect (button).toBeEnabled ();

        const [ response, ] = await Promise.all ([
            this.page.waitForResponse (
                (candidate) =>
                    candidate.url ().includes (apiPath)
                    && candidate.request ().method () === "POST",
                { timeout: 30_000, }
            ),
            button.click (),
        ]);

        return response;
    }

    async gotoHome (): Promise<void>
    {
        await this.page.goto ("/", { waitUntil: "domcontentloaded", });
        await this.waitForAppReady ();
    }

    async clickGetStartedExpectLogin (): Promise<void>
    {
        await this.page.getByRole ("link", { name: "Get Started", }).click ();
        await expect (this.page).toHaveURL (/\/admin\/auth\/login/, { timeout: 15_000, });
        await expect (this.page.getByRole ("heading", { name: "Login", })).toBeVisible ();
    }

    async gotoLogin (): Promise<void>
    {
        await this.page.goto ("/admin/auth/login", { waitUntil: "domcontentloaded", });
        await this.waitForAppReady ();
        await expect (this.page.getByRole ("heading", { name: "Login", })).toBeVisible ();
    }

    async gotoRegister (): Promise<void>
    {
        await this.page.goto ("/admin/auth/register", { waitUntil: "domcontentloaded", });
        await this.waitForAppReady ();
        await expect (this.page.getByRole ("heading", { name: "Create Account", })).toBeVisible ();
    }

    async gotoForgotPassword (): Promise<void>
    {
        await this.page.goto ("/admin/auth/forgot-password", { waitUntil: "domcontentloaded", });
        await this.waitForAppReady ();
        await expect (this.page.getByRole ("heading", { name: "Forgot Password", })).toBeVisible ();
    }

    async fillLogin (email: string, password: string): Promise<void>
    {
        await this.fillField (this.page.getByRole ("textbox", { name: "Email Address", }), email);
        await this.fillField (this.page.locator ("#password"), password);
    }

    private async isRateLimited (response: Response): Promise<boolean>
    {
        if (response.status () === 429)
        {
            return true;
        }

        const body = await response.text ().catch (() => "");

        if (/too many/i.test (body))
        {
            return true;
        }

        return this.page.getByText (/too many attempts/i).isVisible ().catch (() => false);
    }

    async submitLogin (options?: { retryOnRateLimit?: boolean; }): Promise<Response>
    {
        const button = this.page.getByRole ("button", { name: "Log In", });
        const apiPath = "/api/auth/login";

        if (options?.retryOnRateLimit === false)
        {
            return this.submitAndWaitForApi (button, apiPath);
        }

        for (let attempt = 0; attempt < 5; attempt++)
        {
            const response = await this.submitAndWaitForApi (button, apiPath);

            if (! await this.isRateLimited (response))
            {
                return response;
            }

            await this.page.waitForTimeout (21_000);
        }

        return this.submitAndWaitForApi (button, apiPath);
    }

    async login (
        email: string,
        password: string,
        options?: { skipGoto?: boolean; retryOnRateLimit?: boolean; }
    ): Promise<Response>
    {
        if (! options?.skipGoto)
        {
            await this.gotoLogin ();
        }

        await this.fillLogin (email, password);

        return this.submitLogin ({ retryOnRateLimit: options?.retryOnRateLimit, });
    }

    async fillRegister (input: {
        name: string;
        email: string;
        password: string;
        passwordConfirmation: string;
    }): Promise<void>
    {
        await this.fillField (this.page.getByRole ("textbox", { name: "Name", }), input.name);
        await this.fillField (this.page.getByRole ("textbox", { name: "Email Address", }), input.email);
        await this.fillField (this.page.locator ("#password"), input.password);
        await this.fillField (this.page.locator ("#password_confirmation"), input.passwordConfirmation);
    }

    async submitRegister (options?: { retryOnRateLimit?: boolean; }): Promise<Response>
    {
        const button = this.page.getByRole ("button", { name: "Create Account", });
        const apiPath = "/api/auth/register";

        if (options?.retryOnRateLimit === false)
        {
            return this.submitAndWaitForApi (button, apiPath);
        }

        for (let attempt = 0; attempt < 4; attempt++)
        {
            const response = await this.submitAndWaitForApi (button, apiPath);

            if (! await this.isRateLimited (response))
            {
                return response;
            }

            await this.page.waitForTimeout (21_000);
        }

        return this.submitAndWaitForApi (button, apiPath);
    }

    async fillForgotPassword (email: string): Promise<void>
    {
        await this.fillField (this.page.getByRole ("textbox", { name: "Email Address", }), email);
    }

    async submitForgotPassword (): Promise<Response>
    {
        const button = this.page.getByRole ("button", { name: "Email Password Reset Link", });
        const apiPath = "/api/auth/forgot-password";

        for (let attempt = 0; attempt < 4; attempt++)
        {
            const response = await this.submitAndWaitForApi (button, apiPath);

            if (response.status () !== 429)
            {
                return response;
            }

            await this.page.waitForTimeout (21_000);
        }

        return this.submitAndWaitForApi (button, apiPath);
    }

    async expectDashboard (): Promise<void>
    {
        await expect (this.page).toHaveURL (/\/admin\/dashboard/, { timeout: 15_000, });
        await expect (this.page.getByRole ("heading", { name: "Dashboard", })).toBeVisible ({ timeout: 15_000, });
    }

    async expectAuthError (): Promise<void>
    {
        await this.expectValidationError ();
    }

    async expectValidationError (): Promise<void>
    {
        const fieldError = this.page.locator ("p.text-red-600, p.text-red-400");
        const alert = this.page.getByRole ("alert");

        await expect (fieldError.or (alert).first ()).toBeVisible ({ timeout: 10_000, });
    }

    async expectFieldError (fieldId: string): Promise<void>
    {
        const field = this.page.locator (`#${fieldId}`);
        const container = field.locator ("xpath=parent::div");

        await expect (
            container.locator ("p.text-red-600, p.text-red-400").first ()
        ).toBeVisible ({ timeout: 10_000, });
    }

    async loginExpectSuccess (
        email: string,
        password: string,
        options?: { skipGoto?: boolean; }
    ): Promise<void>
    {
        await this.login (email, password, { skipGoto: options?.skipGoto, });
        await this.expectDashboard ();
    }

    async expectGuestRedirect (path: string): Promise<void>
    {
        await this.page.goto (path, { waitUntil: "domcontentloaded", });
        await expect (this.page).toHaveURL (/\/admin\/auth\/login/, { timeout: 15_000, });
        await expect (this.page.getByRole ("heading", { name: "Login", })).toBeVisible ();
    }

    async expectAuthenticatedRedirectFrom (path: string): Promise<void>
    {
        await this.page.goto (path, { waitUntil: "domcontentloaded", });
        await this.page.waitForURL (/\/admin\/dashboard/, { timeout: 20_000, waitUntil: "domcontentloaded", });
        await expect (this.page.getByRole ("heading", { name: "Dashboard", })).toBeVisible ({ timeout: 15_000, });
    }

    async expectAuthenticatedRedirectFromLogin (): Promise<void>
    {
        await this.expectAuthenticatedRedirectFrom ("/admin/auth/login");
    }

    async gotoResetPasswordWithToken (email: string, token = "invalid-token"): Promise<void>
    {
        await this.page.goto (
            `/admin/auth/reset-password?token=${encodeURIComponent (token)}&email=${encodeURIComponent (email)}`,
            { waitUntil: "domcontentloaded", }
        );
        await this.waitForAppReady ();
        await expect (this.page.getByRole ("heading", { name: "Reset Password", })).toBeVisible ();
    }

    async fillResetPassword (password: string, passwordConfirmation: string): Promise<void>
    {
        await this.fillField (this.page.locator ("#password"), password);
        await this.fillField (this.page.locator ("#password_confirmation"), passwordConfirmation);
    }

    async submitResetPassword (): Promise<Response>
    {
        const button = this.page.getByTestId ("reset-password-button");
        const apiPath = "/api/auth/reset-password";

        for (let attempt = 0; attempt < 4; attempt++)
        {
            const response = await this.submitAndWaitForApi (button, apiPath);

            if (! await this.isRateLimited (response))
            {
                return response;
            }

            await this.page.waitForTimeout (21_000);
        }

        return this.submitAndWaitForApi (button, apiPath);
    }

    async logout (): Promise<void>
    {
        const logoutButton = this.page.getByTestId ("logout-button");

        await expect (logoutButton).toBeVisible ({ timeout: 15_000, });

        await Promise.all ([
            this.page.waitForURL (/\/admin\/auth\/login/, { timeout: 15_000, waitUntil: "domcontentloaded", }),
            logoutButton.click (),
        ]);
    }
}
