import { ResendSmtpProvider } from "../../../../src/core/notification/infrastructure/providers/resend-smtp.provider";
import { NOTIFICATION_STATE_ENUM } from "../../../../src/core/notification/domain/constants/notification-state.enum";

jest.mock("resend", () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn(),
      },
    })),
  };
});

jest.mock("../../../../src/configuration/resend.configuration", () => ({
  RESEND_API_KEY: "test-api-key-123",
}));

interface MockedResendClient {
  emails: {
    send: jest.MockedFunction<(params: any) => Promise<{ data?: any; error?: any }>>;
  };
}

interface MockedResendConstructor {
  new (apiKey: string): MockedResendClient;
}

interface ResendSuccessResponse {
  data: {
    id: string;
    from: string;
    to: string | string[];
    created_at: string;
  };
  error?: undefined;
}

interface ResendErrorResponse {
  data?: undefined;
  error: {
    name: string;
    message: string;
  };
}

describe("ResendSmtpProvider", () => {
  let provider: ResendSmtpProvider;
  let mockResendClient: MockedResendClient;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    const { Resend } = require("resend") as { Resend: MockedResendConstructor };

    provider = new ResendSmtpProvider();

    mockResendClient = (provider as any)._client as MockedResendClient;

    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
  });

  describe("constructor", () => {
    it("should initialize Resend client with API key", () => {
      const { Resend } = require("resend");

      new ResendSmtpProvider();

      expect(Resend).toHaveBeenCalledWith("test-api-key-123");
    });
  });

  describe("SendEmailWithTemplate - success cases", () => {
    it("should send email successfully with all parameters", async () => {
      const mockResponse: ResendSuccessResponse = {
        data: {
          id: "email-id-123",
          from: "test@example.com",
          to: "recipient@example.com",
          created_at: "2025-01-15T10:30:00Z",
        },
      };

      mockResendClient.emails.send.mockResolvedValue(mockResponse);

      const result = await provider.SendEmailWithTemplate(
        "test@example.com",
        "Test Subject",
        "recipient@example.com",
        "<html><body>Test Template</body></html>",
      );

      expect(result).toEqual({
        response: JSON.stringify(mockResponse.data),
        responseException: "",
        status: NOTIFICATION_STATE_ENUM.SENT,
      });

      expect(mockResendClient.emails.send).toHaveBeenCalledWith({
        from: "test@example.com",
        to: "recipient@example.com",
        html: "<html><body>Test Template</body></html>",
        subject: "Test Subject",
      });
    });

    it("should handle single recipient as string", async () => {
      const mockResponse: ResendSuccessResponse = {
        data: {
          id: "email-id-456",
          from: "sender@example.com",
          to: "single@example.com",
          created_at: "2025-01-15T11:00:00Z",
        },
      };

      mockResendClient.emails.send.mockResolvedValue(mockResponse);

      const result = await provider.SendEmailWithTemplate(
        "sender@example.com",
        "Single Recipient Test",
        "single@example.com",
        "<p>Hello World</p>",
      );

      expect(result.status).toBe(NOTIFICATION_STATE_ENUM.SENT);
      expect(result.responseException).toBe("");
      expect(mockResendClient.emails.send).toHaveBeenCalledWith({
        from: "sender@example.com",
        to: "single@example.com",
        html: "<p>Hello World</p>",
        subject: "Single Recipient Test",
      });
    });

    it("should handle multiple recipients as array", async () => {
      const recipients = ["user1@example.com", "user2@example.com", "admin@example.com"];
      const mockResponse: ResendSuccessResponse = {
        data: {
          id: "email-id-789",
          from: "bulk@example.com",
          to: recipients,
          created_at: "2025-01-15T12:00:00Z",
        },
      };

      mockResendClient.emails.send.mockResolvedValue(mockResponse);

      const result = await provider.SendEmailWithTemplate(
        "bulk@example.com",
        "Bulk Email Test",
        recipients,
        "<div>Bulk message</div>",
      );

      expect(result.status).toBe(NOTIFICATION_STATE_ENUM.SENT);
      expect(mockResendClient.emails.send).toHaveBeenCalledWith({
        from: "bulk@example.com",
        to: recipients,
        html: "<div>Bulk message</div>",
        subject: "Bulk Email Test",
      });
    });

    it("should handle complex HTML templates", async () => {
      const complexTemplate = `
        <html>
          <head><title>Complex Template</title></head>
          <body>
            <h1>Welcome {{name}}</h1>
            <p>Your order #{{orderNumber}} has been processed.</p>
            <div style="color: red;">Total: $\{{amount}}</div>
          </body>
        </html>
      `;

      const mockResponse: ResendSuccessResponse = {
        data: {
          id: "complex-email-123",
          from: "orders@shop.com",
          to: "customer@example.com",
          created_at: "2025-01-15T13:00:00Z",
        },
      };

      mockResendClient.emails.send.mockResolvedValue(mockResponse);

      const result = await provider.SendEmailWithTemplate(
        "orders@shop.com",
        "Order Confirmation",
        "customer@example.com",
        complexTemplate,
      );

      expect(result.status).toBe(NOTIFICATION_STATE_ENUM.SENT);
      expect(result.response).toBe(JSON.stringify(mockResponse.data));
    });

    it("should handle empty response data gracefully", async () => {
      const mockResponse = {
        data: null,
        error: undefined,
      };

      mockResendClient.emails.send.mockResolvedValue(mockResponse);

      const result = await provider.SendEmailWithTemplate(
        "test@example.com",
        "Empty Data Test",
        "recipient@example.com",
        "<p>Test</p>",
      );

      expect(result).toEqual({
        response: "",
        responseException: "",
        status: NOTIFICATION_STATE_ENUM.SENT,
      });
    });

    it("should handle special characters in email content", async () => {
      const specialContent = "<p>Héllo Wörld! 🎉 Special chars: àáâãäåæçèéêë</p>";
      const mockResponse: ResendSuccessResponse = {
        data: {
          id: "special-chars-email",
          from: "test@example.com",
          to: "recipient@example.com",
          created_at: "2025-01-15T14:00:00Z",
        },
      };

      mockResendClient.emails.send.mockResolvedValue(mockResponse);

      const result = await provider.SendEmailWithTemplate(
        "test@example.com",
        "Special Characters Test",
        "recipient@example.com",
        specialContent,
      );

      expect(result.status).toBe(NOTIFICATION_STATE_ENUM.SENT);
      expect(mockResendClient.emails.send).toHaveBeenCalledWith({
        from: "test@example.com",
        to: "recipient@example.com",
        html: specialContent,
        subject: "Special Characters Test",
      });
    });
  });

  describe("SendEmailWithTemplate - error cases", () => {
    it("should handle Resend API errors", async () => {
      const mockErrorResponse: ResendErrorResponse = {
        error: {
          name: "validation_error",
          message: "Invalid email address",
        },
      };

      mockResendClient.emails.send.mockResolvedValue(mockErrorResponse);

      const result = await provider.SendEmailWithTemplate(
        "invalid-email",
        "Test Subject",
        "recipient@example.com",
        "<p>Test</p>",
      );

      expect(result).toEqual({
        response: "",
        responseException: `[RESEND] ${JSON.stringify(mockErrorResponse.error)}`,
        status: NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE,
      });
    });

    it("should handle network errors and exceptions", async () => {
      const networkError = new Error("Network connection failed");
      mockResendClient.emails.send.mockRejectedValue(networkError);

      const result = await provider.SendEmailWithTemplate(
        "test@example.com",
        "Test Subject",
        "recipient@example.com",
        "<p>Test</p>",
      );

      expect(result).toEqual({
        status: NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE,
        responseException: `[RESEND] ${JSON.stringify(networkError)}`,
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR][SERVICE][RESEND][SEND_EMAIL_WITH_TEMPLATE]"),
      );
    });

    it("should handle timeout errors", async () => {
      const timeoutError = new Error("Request timeout");
      mockResendClient.emails.send.mockRejectedValue(timeoutError);

      const result = await provider.SendEmailWithTemplate(
        "test@example.com",
        "Timeout Test",
        "recipient@example.com",
        "<p>Timeout test</p>",
      );

      expect(result.status).toBe(NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE);
      expect(result.responseException).toContain("[RESEND]");
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it("should handle rate limit errors", async () => {
      const rateLimitError: ResendErrorResponse = {
        error: {
          name: "rate_limit_exceeded",
          message: "Too many requests. Please try again later.",
        },
      };

      mockResendClient.emails.send.mockResolvedValue(rateLimitError);

      const result = await provider.SendEmailWithTemplate(
        "test@example.com",
        "Rate Limit Test",
        "recipient@example.com",
        "<p>Rate limit test</p>",
      );

      expect(result.status).toBe(NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE);
      expect(result.responseException).toContain("rate_limit_exceeded");
    });

    it("should handle authentication errors", async () => {
      const authError: ResendErrorResponse = {
        error: {
          name: "authentication_error",
          message: "Invalid API key",
        },
      };

      mockResendClient.emails.send.mockResolvedValue(authError);

      const result = await provider.SendEmailWithTemplate(
        "test@example.com",
        "Auth Error Test",
        "recipient@example.com",
        "<p>Auth test</p>",
      );

      expect(result.status).toBe(NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE);
      expect(result.responseException).toContain("authentication_error");
    });

    it("should handle malformed JSON in error responses", async () => {
      const malformedError = { toString: () => "Malformed error object" };
      mockResendClient.emails.send.mockRejectedValue(malformedError);

      const result = await provider.SendEmailWithTemplate(
        "test@example.com",
        "Malformed Error Test",
        "recipient@example.com",
        "<p>Test</p>",
      );

      expect(result.status).toBe(NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE);
      expect(result.responseException).toContain("[RESEND]");
    });
  });

  describe("data validation and edge cases", () => {
    it("should handle empty string parameters", async () => {
      const mockResponse: ResendSuccessResponse = {
        data: {
          id: "empty-params-test",
          from: "",
          to: "",
          created_at: "2025-01-15T15:00:00Z",
        },
      };

      mockResendClient.emails.send.mockResolvedValue(mockResponse);

      const result = await provider.SendEmailWithTemplate("", "", "", "");

      expect(result.status).toBe(NOTIFICATION_STATE_ENUM.SENT);
      expect(mockResendClient.emails.send).toHaveBeenCalledWith({
        from: "",
        to: "",
        html: "",
        subject: "",
      });
    });

    it("should handle very long email content", async () => {
      const longContent = "<p>" + "x".repeat(100000) + "</p>";
      const mockResponse: ResendSuccessResponse = {
        data: {
          id: "long-content-test",
          from: "test@example.com",
          to: "recipient@example.com",
          created_at: "2025-01-15T16:00:00Z",
        },
      };

      mockResendClient.emails.send.mockResolvedValue(mockResponse);

      const result = await provider.SendEmailWithTemplate(
        "test@example.com",
        "Long Content Test",
        "recipient@example.com",
        longContent,
      );

      expect(result.status).toBe(NOTIFICATION_STATE_ENUM.SENT);
    });

    it("should handle empty recipients array", async () => {
      const mockResponse: ResendSuccessResponse = {
        data: {
          id: "empty-recipients-test",
          from: "test@example.com",
          to: [],
          created_at: "2025-01-15T17:00:00Z",
        },
      };

      mockResendClient.emails.send.mockResolvedValue(mockResponse);

      const result = await provider.SendEmailWithTemplate(
        "test@example.com",
        "Empty Recipients Test",
        [],
        "<p>Test</p>",
      );

      expect(result.status).toBe(NOTIFICATION_STATE_ENUM.SENT);
      expect(mockResendClient.emails.send).toHaveBeenCalledWith({
        from: "test@example.com",
        to: [],
        html: "<p>Test</p>",
        subject: "Empty Recipients Test",
      });
    });

    it("should handle very long subject lines", async () => {
      const longSubject = "A".repeat(1000);
      const mockResponse: ResendSuccessResponse = {
        data: {
          id: "long-subject-test",
          from: "test@example.com",
          to: "recipient@example.com",
          created_at: "2025-01-15T18:00:00Z",
        },
      };

      mockResendClient.emails.send.mockResolvedValue(mockResponse);

      const result = await provider.SendEmailWithTemplate(
        "test@example.com",
        longSubject,
        "recipient@example.com",
        "<p>Test</p>",
      );

      expect(result.status).toBe(NOTIFICATION_STATE_ENUM.SENT);
    });

    it("should handle special email formats", async () => {
      const specialEmails = [
        "user+tag@example.com",
        "user.name@sub.domain.com",
        "user_name@example-domain.co.uk",
      ];

      const mockResponse: ResendSuccessResponse = {
        data: {
          id: "special-emails-test",
          from: "test@example.com",
          to: specialEmails,
          created_at: "2025-01-15T19:00:00Z",
        },
      };

      mockResendClient.emails.send.mockResolvedValue(mockResponse);

      const result = await provider.SendEmailWithTemplate(
        "test@example.com",
        "Special Emails Test",
        specialEmails,
        "<p>Test</p>",
      );

      expect(result.status).toBe(NOTIFICATION_STATE_ENUM.SENT);
    });
  });

  describe("concurrent operations", () => {
    it("should handle multiple concurrent email sends", async () => {
      const mockResponse1: ResendSuccessResponse = {
        data: {
          id: "concurrent-1",
          from: "test@example.com",
          to: "user1@example.com",
          created_at: "2025-01-15T20:00:00Z",
        },
      };
      const mockResponse2: ResendSuccessResponse = {
        data: {
          id: "concurrent-2",
          from: "test@example.com",
          to: "user2@example.com",
          created_at: "2025-01-15T20:01:00Z",
        },
      };
      const mockResponse3: ResendSuccessResponse = {
        data: {
          id: "concurrent-3",
          from: "test@example.com",
          to: "user3@example.com",
          created_at: "2025-01-15T20:02:00Z",
        },
      };

      mockResendClient.emails.send
        .mockResolvedValueOnce(mockResponse1)
        .mockResolvedValueOnce(mockResponse2)
        .mockResolvedValueOnce(mockResponse3);

      const promises = [
        provider.SendEmailWithTemplate(
          "test@example.com",
          "Concurrent 1",
          "user1@example.com",
          "<p>Test 1</p>",
        ),
        provider.SendEmailWithTemplate(
          "test@example.com",
          "Concurrent 2",
          "user2@example.com",
          "<p>Test 2</p>",
        ),
        provider.SendEmailWithTemplate(
          "test@example.com",
          "Concurrent 3",
          "user3@example.com",
          "<p>Test 3</p>",
        ),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results.every((result) => result.status === NOTIFICATION_STATE_ENUM.SENT)).toBe(true);
      expect(mockResendClient.emails.send).toHaveBeenCalledTimes(3);
    });

    it("should handle mixed success and failure in concurrent operations", async () => {
      const successResponse: ResendSuccessResponse = {
        data: {
          id: "success-1",
          from: "test@example.com",
          to: "success@example.com",
          created_at: "2025-01-15T21:00:00Z",
        },
      };
      const errorResponse: ResendErrorResponse = {
        error: { name: "validation_error", message: "Invalid email" },
      };

      mockResendClient.emails.send
        .mockResolvedValueOnce(successResponse)
        .mockResolvedValueOnce(errorResponse)
        .mockRejectedValueOnce(new Error("Network error"));

      const promises = [
        provider.SendEmailWithTemplate(
          "test@example.com",
          "Success",
          "success@example.com",
          "<p>Success</p>",
        ),
        provider.SendEmailWithTemplate(
          "test@example.com",
          "API Error",
          "invalid-email",
          "<p>Error</p>",
        ),
        provider.SendEmailWithTemplate(
          "test@example.com",
          "Network Error",
          "network@example.com",
          "<p>Network</p>",
        ),
      ];

      const results = await Promise.all(promises);

      expect(results[0].status).toBe(NOTIFICATION_STATE_ENUM.SENT);
      expect(results[1].status).toBe(NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE);
      expect(results[2].status).toBe(NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE);
    });
  });

  describe("response formatting", () => {
    it("should properly format successful response with all data fields", async () => {
      const mockResponse: ResendSuccessResponse = {
        data: {
          id: "format-test-123",
          from: "formatted@example.com",
          to: "recipient@example.com",
          created_at: "2025-01-15T22:00:00Z",
        },
      };

      mockResendClient.emails.send.mockResolvedValue(mockResponse);

      const result = await provider.SendEmailWithTemplate(
        "formatted@example.com",
        "Format Test",
        "recipient@example.com",
        "<p>Format test</p>",
      );

      expect(result.response).toBe(JSON.stringify(mockResponse.data));
      expect(result.responseException).toBe("");
      expect(result.status).toBe(NOTIFICATION_STATE_ENUM.SENT);
    });

    it("should properly format error response", async () => {
      const errorResponse: ResendErrorResponse = {
        error: {
          name: "format_error",
          message: "Formatting test error",
        },
      };

      mockResendClient.emails.send.mockResolvedValue(errorResponse);

      const result = await provider.SendEmailWithTemplate(
        "test@example.com",
        "Error Format Test",
        "recipient@example.com",
        "<p>Error test</p>",
      );

      expect(result.response).toBe("");
      expect(result.responseException).toBe(`[RESEND] ${JSON.stringify(errorResponse.error)}`);
      expect(result.status).toBe(NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE);
    });

    it("should handle undefined data and error fields", async () => {
      const undefinedResponse = {
        data: undefined,
        error: undefined,
      };

      mockResendClient.emails.send.mockResolvedValue(undefinedResponse);

      const result = await provider.SendEmailWithTemplate(
        "test@example.com",
        "Undefined Test",
        "recipient@example.com",
        "<p>Undefined test</p>",
      );

      expect(result.response).toBe("");
      expect(result.responseException).toBe("");
      expect(result.status).toBe(NOTIFICATION_STATE_ENUM.SENT);
    });
  });
});
