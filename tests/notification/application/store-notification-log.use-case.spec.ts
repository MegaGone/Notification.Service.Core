import { NotificationEntity } from "../../../src/core/notification/domain/entities/notification.entity";
import { NOTIFICATION_STATE_ENUM } from "../../../src/core/notification/domain/constants/notification-state.enum";
import { NotificationRepository } from "../../../src/core/notification/domain/repositories/notification.repository";
import { StoreNotificationLogDto } from "../../../src/core/notification/application/store-notification-log/store-notification-log.dto";
import { StoreNotificationLogUseCase } from "../../../src/core/notification/application/store-notification-log/store-notification-log.use-case";

interface MockedNotificationRepository {
  store: jest.MockedFunction<(notification: NotificationEntity) => Promise<void>>;
}

const notificationRepositoryMock = (): MockedNotificationRepository => {
  return {
    store: jest.fn() as jest.MockedFunction<(notification: NotificationEntity) => Promise<void>>,
  };
};

const storeNotificationLogDtoMock = (
  overrides?: Partial<StoreNotificationLogDto>,
): StoreNotificationLogDto => {
  return {
    response: "Email sent successfully",
    templateID: "welcome-email-template",
    responseException: undefined,
    status: NOTIFICATION_STATE_ENUM.SENT,
    recipients: ["user@example.com"],
    ...overrides,
  };
};

describe("StoreNotificationLogUseCase", () => {
  let useCase: StoreNotificationLogUseCase;
  let mockRepository: MockedNotificationRepository;

  beforeEach(() => {
    mockRepository = notificationRepositoryMock();
    useCase = new StoreNotificationLogUseCase(mockRepository as unknown as NotificationRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    it("should store notification log successfully with all fields", async () => {
      const dto = storeNotificationLogDtoMock({
        response: "Email delivered successfully",
        templateID: "password-reset-template",
        responseException: undefined,
        status: NOTIFICATION_STATE_ENUM.SENT,
        recipients: "john.doe@example.com",
      });

      mockRepository.store.mockResolvedValue();

      await useCase.execute(dto);

      expect(mockRepository.store).toHaveBeenCalledTimes(1);
      expect(mockRepository.store).toHaveBeenCalledWith(expect.any(NotificationEntity));

      const calledEntity = mockRepository.store.mock.calls[0][0];
      const primitiveData = calledEntity.toPrimitive();

      expect(primitiveData.templateID).toBe("password-reset-template");
      expect(primitiveData.status).toBe(NOTIFICATION_STATE_ENUM.SENT);
      expect(primitiveData.recipients).toBe("john.doe@example.com");
      expect(primitiveData.response).toBe("Email delivered successfully");
      expect(primitiveData.responseException).toBeUndefined();
    });

    it("should store notification log with minimal required fields", async () => {
      const dto: StoreNotificationLogDto = {
        templateID: "minimal-template",
        status: NOTIFICATION_STATE_ENUM.PENDING,
        recipients: "test@example.com",
      };

      mockRepository.store.mockResolvedValue();

      await useCase.execute(dto);

      expect(mockRepository.store).toHaveBeenCalledTimes(1);

      const calledEntity = mockRepository.store.mock.calls[0][0];
      const primitiveData = calledEntity.toPrimitive();

      expect(primitiveData.templateID).toBe("minimal-template");
      expect(primitiveData.status).toBe(NOTIFICATION_STATE_ENUM.PENDING);
      expect(primitiveData.recipients).toBe("test@example.com");
      expect(primitiveData.response).toBeUndefined();
      expect(primitiveData.responseException).toBeUndefined();
    });

    it("should handle single recipient as string", async () => {
      const dto = storeNotificationLogDtoMock({
        recipients: "single-user@example.com",
      });

      mockRepository.store.mockResolvedValue();

      await useCase.execute(dto);

      const calledEntity = mockRepository.store.mock.calls[0][0];
      const primitiveData = calledEntity.toPrimitive();

      expect(primitiveData.recipients).toBe("single-user@example.com");
    });

    it("should handle multiple recipients as array", async () => {
      const recipients = ["user1@example.com", "user2@example.com", "admin@example.com"];
      const dto = storeNotificationLogDtoMock({ recipients });

      mockRepository.store.mockResolvedValue();

      await useCase.execute(dto);

      const calledEntity = mockRepository.store.mock.calls[0][0];
      const primitiveData = calledEntity.toPrimitive();

      expect(primitiveData.recipients).toEqual(recipients);
    });

    it("should store notification with all possible states", async () => {
      const states = [
        NOTIFICATION_STATE_ENUM.SENT,
        NOTIFICATION_STATE_ENUM.PENDING,
        NOTIFICATION_STATE_ENUM.CORE_FAILURE,
        NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE,
      ];

      mockRepository.store.mockResolvedValue();

      for (const status of states) {
        const dto = storeNotificationLogDtoMock({ status });

        await useCase.execute(dto);

        const calledEntity =
          mockRepository.store.mock.calls[mockRepository.store.mock.calls.length - 1][0];
        const primitiveData = calledEntity.toPrimitive();

        expect(primitiveData.status).toBe(status);
      }

      expect(mockRepository.store).toHaveBeenCalledTimes(states.length);
    });

    it("should store notification with response and responseException", async () => {
      const dto = storeNotificationLogDtoMock({
        response: "Partial success with warnings",
        responseException: "Rate limit warning: approaching daily limit",
        status: NOTIFICATION_STATE_ENUM.SENT,
      });

      mockRepository.store.mockResolvedValue();

      await useCase.execute(dto);

      const calledEntity = mockRepository.store.mock.calls[0][0];
      const primitiveData = calledEntity.toPrimitive();

      expect(primitiveData.response).toBe("Partial success with warnings");
      expect(primitiveData.responseException).toBe("Rate limit warning: approaching daily limit");
    });

    it("should store notification with empty response", async () => {
      const dto = storeNotificationLogDtoMock({
        response: "",
        status: NOTIFICATION_STATE_ENUM.CORE_FAILURE,
      });

      mockRepository.store.mockResolvedValue();

      await useCase.execute(dto);

      const calledEntity = mockRepository.store.mock.calls[0][0];
      const primitiveData = calledEntity.toPrimitive();

      expect(primitiveData.response).toBe("");
      expect(primitiveData.status).toBe(NOTIFICATION_STATE_ENUM.CORE_FAILURE);
    });

    it("should handle long template IDs", async () => {
      const longTemplateID = "a".repeat(255);
      const dto = storeNotificationLogDtoMock({
        templateID: longTemplateID,
      });

      mockRepository.store.mockResolvedValue();

      await useCase.execute(dto);

      const calledEntity = mockRepository.store.mock.calls[0][0];
      const primitiveData = calledEntity.toPrimitive();

      expect(primitiveData.templateID).toBe(longTemplateID);
    });

    it("should handle special characters in fields", async () => {
      const dto = storeNotificationLogDtoMock({
        templateID: "template-with-special-chars-!@#$%",
        response: "Response with émojis 🎉 and spëcial çhars <html>",
        responseException: "Exception with symbols: &amp; &lt; &gt;",
      });

      mockRepository.store.mockResolvedValue();

      await useCase.execute(dto);

      const calledEntity = mockRepository.store.mock.calls[0][0];
      const primitiveData = calledEntity.toPrimitive();

      expect(primitiveData.templateID).toBe("template-with-special-chars-!@#$%");
      expect(primitiveData.response).toBe("Response with émojis 🎉 and spëcial çhars <html>");
      expect(primitiveData.responseException).toBe("Exception with symbols: &amp; &lt; &gt;");
    });

    it("should handle empty array for recipients", async () => {
      const dto = storeNotificationLogDtoMock({
        recipients: [],
      });

      mockRepository.store.mockResolvedValue();

      await useCase.execute(dto);

      const calledEntity = mockRepository.store.mock.calls[0][0];
      const primitiveData = calledEntity.toPrimitive();

      expect(primitiveData.recipients).toEqual([]);
    });
  });

  describe("error handling", () => {
    it("should propagate repository errors", async () => {
      const dto = storeNotificationLogDtoMock();
      const repositoryError = new Error("Database connection failed");

      mockRepository.store.mockRejectedValue(repositoryError);

      await expect(useCase.execute(dto)).rejects.toThrow("Database connection failed");
      expect(mockRepository.store).toHaveBeenCalledTimes(1);
    });

    it("should handle repository timeout errors", async () => {
      const dto = storeNotificationLogDtoMock();
      const timeoutError = new Error("Connection timeout");

      mockRepository.store.mockRejectedValue(timeoutError);

      await expect(useCase.execute(dto)).rejects.toThrow("Connection timeout");
    });

    it("should handle repository validation errors", async () => {
      const dto = storeNotificationLogDtoMock();
      const validationError = new Error("Invalid notification data");

      mockRepository.store.mockRejectedValue(validationError);

      await expect(useCase.execute(dto)).rejects.toThrow("Invalid notification data");
    });
  });

  describe("integration with NotificationEntity", () => {
    it("should create NotificationEntity with correct data transformation", async () => {
      const dto = storeNotificationLogDtoMock({
        templateID: "integration-test-template",
        status: NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE,
        recipients: ["integration@test.com"],
        response: "Integration test response",
        responseException: "Integration test exception",
      });

      mockRepository.store.mockResolvedValue();

      await useCase.execute(dto);

      const calledEntity = mockRepository.store.mock.calls[0][0];

      expect(calledEntity).toBeInstanceOf(NotificationEntity);

      const primitiveData = calledEntity.toPrimitive();
      expect(primitiveData.templateID).toBe(dto.templateID);
      expect(primitiveData.status).toBe(dto.status);
      expect(primitiveData.recipients).toBe(dto.recipients);
      expect(primitiveData.response).toBe(dto.response);
      expect(primitiveData.responseException).toBe(dto.responseException);
    });

    it("should handle NotificationEntity creation with undefined optional fields", async () => {
      const dto: StoreNotificationLogDto = {
        templateID: "test-template",
        status: NOTIFICATION_STATE_ENUM.PENDING,
        recipients: "test@example.com",
      };

      mockRepository.store.mockResolvedValue();

      await useCase.execute(dto);

      const calledEntity = mockRepository.store.mock.calls[0][0];
      const primitiveData = calledEntity.toPrimitive();

      expect(primitiveData.response).toBeUndefined();
      expect(primitiveData.responseException).toBeUndefined();
      expect(primitiveData.id).toBeUndefined();
      expect(primitiveData.createdAt).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("should handle null values in optional fields", async () => {
      const dto = {
        templateID: "null-test-template",
        status: NOTIFICATION_STATE_ENUM.SENT,
        recipients: "null-test@example.com",
        response: null as any,
        responseException: null as any,
      };

      mockRepository.store.mockResolvedValue();

      await useCase.execute(dto);

      const calledEntity = mockRepository.store.mock.calls[0][0];
      const primitiveData = calledEntity.toPrimitive();

      expect(primitiveData.response).toBeNull();
      expect(primitiveData.responseException).toBeNull();
    });

    it("should handle very large response strings", async () => {
      const largeResponse = "x".repeat(10000);
      const dto = storeNotificationLogDtoMock({
        response: largeResponse,
      });

      mockRepository.store.mockResolvedValue();

      await useCase.execute(dto);

      const calledEntity = mockRepository.store.mock.calls[0][0];
      const primitiveData = calledEntity.toPrimitive();

      expect(primitiveData.response).toBe(largeResponse);
      expect(primitiveData.response?.length).toBe(10000);
    });

    it("should handle concurrent executions", async () => {
      const dto1 = storeNotificationLogDtoMock({ templateID: "concurrent-1" });
      const dto2 = storeNotificationLogDtoMock({ templateID: "concurrent-2" });
      const dto3 = storeNotificationLogDtoMock({ templateID: "concurrent-3" });

      mockRepository.store.mockResolvedValue();

      await Promise.all([useCase.execute(dto1), useCase.execute(dto2), useCase.execute(dto3)]);

      expect(mockRepository.store).toHaveBeenCalledTimes(3);

      const calls = mockRepository.store.mock.calls;
      const templateIds = calls.map((call) => call[0].toPrimitive().templateID);

      expect(templateIds).toContain("concurrent-1");
      expect(templateIds).toContain("concurrent-2");
      expect(templateIds).toContain("concurrent-3");
    });

    it("should maintain data integrity across multiple executions", async () => {
      const dto = storeNotificationLogDtoMock({
        templateID: "integrity-test",
        status: NOTIFICATION_STATE_ENUM.SENT,
      });

      mockRepository.store.mockResolvedValue();

      await useCase.execute(dto);
      await useCase.execute(dto);
      await useCase.execute(dto);

      expect(mockRepository.store).toHaveBeenCalledTimes(3);

      mockRepository.store.mock.calls.forEach((call) => {
        const primitiveData = call[0].toPrimitive();
        expect(primitiveData.templateID).toBe("integrity-test");
        expect(primitiveData.status).toBe(NOTIFICATION_STATE_ENUM.SENT);
      });
    });
  });
});
