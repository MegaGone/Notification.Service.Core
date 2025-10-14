import { Model } from "mongoose";
import { ResponseStatus } from "../../../../src/core/shared/domain/entities/response-status.model";
import { NotificationEntity } from "../../../../src/core/notification/domain/entities/notification.entity";
import { PrimitiveNotification } from "../../../../src/core/notification/domain/entities/notification.interface";
import { NOTIFICATION_STATE_ENUM } from "../../../../src/core/notification/domain/constants/notification-state.enum";
import { MongoNotificationInterface } from "../../../../src/core/notification/infrastructure/entities/notification.interface";
import { MongoNotificationRepository } from "../../../../src/core/notification/infrastructure/repositories/mongo-notification.repository";

interface MockedMongoModel {
  create: jest.MockedFunction<(doc: any) => Promise<MongoNotificationInterface>>;
}

const mongoModelMock = (): MockedMongoModel => ({
  create: jest.fn() as jest.MockedFunction<(doc: any) => Promise<MongoNotificationInterface>>,
});

const notificationEntityMock = (overrides?: Partial<PrimitiveNotification>): NotificationEntity => {
  const primitiveData: PrimitiveNotification = {
    id: "notification-uuid-123",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    response: "Email sent successfully",
    templateID: "welcome-email-template",
    responseException: undefined,
    status: NOTIFICATION_STATE_ENUM.SENT,
    recipients: ["user@example.com"],
    ...overrides,
  };
  return NotificationEntity.create(primitiveData);
};

const mongoNotificationMock = (
  overrides?: Partial<MongoNotificationInterface>,
): MongoNotificationInterface =>
  ({
    id: "notification-uuid-123",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    response: "Email sent successfully",
    templateID: "welcome-email-template",
    responseException: undefined,
    status: NOTIFICATION_STATE_ENUM.SENT,
    recipients: "user@example.com",
    ...overrides,
  }) as MongoNotificationInterface;

describe("MongoNotificationRepository", () => {
  let repository: MongoNotificationRepository;
  let mockModel: MockedMongoModel;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    mockModel = mongoModelMock();
    repository = new MongoNotificationRepository(
      mockModel as unknown as Model<MongoNotificationInterface>,
    );
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
  });

  describe("store", () => {
    it("should store notification successfully with all fields", async () => {
      const notificationEntity = notificationEntityMock({
        id: "test-notification-123",
        response: "Email delivered successfully",
        templateID: "password-reset-template",
        responseException: undefined,
        status: NOTIFICATION_STATE_ENUM.SENT,
        recipients: ["john.doe@example.com"],
        createdAt: new Date("2025-01-15T10:30:00.000Z"),
      });

      const mongoRecord = mongoNotificationMock({
        id: "test-notification-123",
        response: "Email delivered successfully",
        templateID: "password-reset-template",
        recipients: "john.doe@example.com",
      });

      mockModel.create.mockResolvedValue(mongoRecord);

      await repository.store(notificationEntity);

      expect(mockModel.create).toHaveBeenCalledTimes(1);
      expect(mockModel.create).toHaveBeenCalledWith({
        id: "test-notification-123",
        response: "Email delivered successfully",
        templateID: "password-reset-template",
        responseException: undefined,
        status: NOTIFICATION_STATE_ENUM.SENT,
        recipients: "john.doe@example.com",
        createdAt: expect.any(Date),
      });
    });

    it("should store notification with minimal required fields", async () => {
      const notificationEntity = notificationEntityMock({
        templateID: "minimal-template",
        status: NOTIFICATION_STATE_ENUM.PENDING,
        recipients: "test@example.com",
        id: undefined,
        createdAt: undefined,
        response: undefined,
        responseException: undefined,
      });

      const mongoRecord = mongoNotificationMock({
        templateID: "minimal-template",
        status: NOTIFICATION_STATE_ENUM.PENDING,
        recipients: "test@example.com",
      });

      mockModel.create.mockResolvedValue(mongoRecord);

      await repository.store(notificationEntity);

      expect(mockModel.create).toHaveBeenCalledWith({
        id: undefined,
        templateID: "minimal-template",
        status: NOTIFICATION_STATE_ENUM.PENDING,
        recipients: "test@example.com",
        createdAt: undefined,
        response: undefined,
        responseException: undefined,
      });
    });

    it("should convert array recipients to string", async () => {
      const recipients = ["user1@example.com", "user2@example.com", "admin@example.com"];
      const notificationEntity = notificationEntityMock({
        recipients: recipients,
      });

      const mongoRecord = mongoNotificationMock({
        recipients: recipients.toString(),
      });

      mockModel.create.mockResolvedValue(mongoRecord);

      await repository.store(notificationEntity);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipients: "user1@example.com,user2@example.com,admin@example.com",
        }),
      );
    });

    it("should handle single recipient as string", async () => {
      const notificationEntity = notificationEntityMock({
        recipients: "single-user@example.com",
      });

      const mongoRecord = mongoNotificationMock({
        recipients: "single-user@example.com",
      });

      mockModel.create.mockResolvedValue(mongoRecord);

      await repository.store(notificationEntity);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipients: "single-user@example.com",
        }),
      );
    });

    it("should store notification with all possible states", async () => {
      const states = [
        NOTIFICATION_STATE_ENUM.SENT,
        NOTIFICATION_STATE_ENUM.PENDING,
        NOTIFICATION_STATE_ENUM.CORE_FAILURE,
        NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE,
      ];

      for (const status of states) {
        const notificationEntity = notificationEntityMock({ status });
        const mongoRecord = mongoNotificationMock({ status });

        mockModel.create.mockResolvedValue(mongoRecord);

        await repository.store(notificationEntity);

        expect(mockModel.create).toHaveBeenCalledWith(
          expect.objectContaining({
            status: status,
          }),
        );
      }

      expect(mockModel.create).toHaveBeenCalledTimes(states.length);
    });

    it("should store notification with response and responseException", async () => {
      const notificationEntity = notificationEntityMock({
        response: "Partial success with warnings",
        responseException: "Rate limit warning: approaching daily limit",
        status: NOTIFICATION_STATE_ENUM.SENT,
      });

      const mongoRecord = mongoNotificationMock({
        response: "Partial success with warnings",
        responseException: "Rate limit warning: approaching daily limit",
      });

      mockModel.create.mockResolvedValue(mongoRecord);

      await repository.store(notificationEntity);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          response: "Partial success with warnings",
          responseException: "Rate limit warning: approaching daily limit",
        }),
      );
    });

    it("should store notification with empty response", async () => {
      const notificationEntity = notificationEntityMock({
        response: "",
        status: NOTIFICATION_STATE_ENUM.CORE_FAILURE,
      });

      const mongoRecord = mongoNotificationMock({
        response: "",
        status: NOTIFICATION_STATE_ENUM.CORE_FAILURE,
      });

      mockModel.create.mockResolvedValue(mongoRecord);

      await repository.store(notificationEntity);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          response: "",
          status: NOTIFICATION_STATE_ENUM.CORE_FAILURE,
        }),
      );
    });

    it("should handle long template IDs", async () => {
      const longTemplateID = "a".repeat(255);
      const notificationEntity = notificationEntityMock({
        templateID: longTemplateID,
      });

      const mongoRecord = mongoNotificationMock({
        templateID: longTemplateID,
      });

      mockModel.create.mockResolvedValue(mongoRecord);

      await repository.store(notificationEntity);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          templateID: longTemplateID,
        }),
      );
    });

    it("should handle special characters in fields", async () => {
      const notificationEntity = notificationEntityMock({
        templateID: "template-with-special-chars-!@#$%",
        response: "Response with émojis 🎉 and spëcial çhars <html>",
        responseException: "Exception with symbols: &amp; &lt; &gt;",
      });

      const mongoRecord = mongoNotificationMock({
        templateID: "template-with-special-chars-!@#$%",
        response: "Response with émojis 🎉 and spëcial çhars <html>",
        responseException: "Exception with symbols: &amp; &lt; &gt;",
      });

      mockModel.create.mockResolvedValue(mongoRecord);

      await repository.store(notificationEntity);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          templateID: "template-with-special-chars-!@#$%",
          response: "Response with émojis 🎉 and spëcial çhars <html>",
          responseException: "Exception with symbols: &amp; &lt; &gt;",
        }),
      );
    });

    it("should handle empty array for recipients", async () => {
      const notificationEntity = notificationEntityMock({
        recipients: [],
      });

      const mongoRecord = mongoNotificationMock({
        recipients: "",
      });

      mockModel.create.mockResolvedValue(mongoRecord);

      await repository.store(notificationEntity);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipients: "",
        }),
      );
    });

    it("should preserve date objects correctly", async () => {
      const createdAt = new Date("2025-01-15T10:30:45.123Z");
      const notificationEntity = notificationEntityMock({
        createdAt: createdAt,
      });

      const mongoRecord = mongoNotificationMock({
        createdAt: createdAt,
      });

      mockModel.create.mockResolvedValue(mongoRecord);

      await repository.store(notificationEntity);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          createdAt: createdAt,
        }),
      );
    });
  });

  describe("error handling", () => {
    it("should throw ResponseStatus error when database operation fails", async () => {
      const notificationEntity = notificationEntityMock();
      const dbError = new Error("Database connection failed");

      mockModel.create.mockRejectedValue(dbError);

      await expect(repository.store(notificationEntity)).rejects.toThrow(ResponseStatus);
      await expect(repository.store(notificationEntity)).rejects.toThrow("Internal server error.");

      expect(mockModel.create).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR][INFRA][MONGO NOTIFICATION REPO][STORE]"),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Database connection failed"),
      );
    });

    it("should handle validation errors from MongoDB", async () => {
      const notificationEntity = notificationEntityMock();
      const validationError = new Error("Validation failed: templateID is required");

      mockModel.create.mockRejectedValue(validationError);

      await expect(repository.store(notificationEntity)).rejects.toThrow(ResponseStatus);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Validation failed: templateID is required"),
      );
    });

    it("should handle duplicate key errors", async () => {
      const notificationEntity = notificationEntityMock();
      const duplicateError = new Error("E11000 duplicate key error");

      mockModel.create.mockRejectedValue(duplicateError);

      await expect(repository.store(notificationEntity)).rejects.toThrow(ResponseStatus);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("E11000 duplicate key error"),
      );
    });

    it("should handle timeout errors", async () => {
      const notificationEntity = notificationEntityMock();
      const timeoutError = new Error("Connection timeout");

      mockModel.create.mockRejectedValue(timeoutError);

      await expect(repository.store(notificationEntity)).rejects.toThrow(ResponseStatus);

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Connection timeout"));
    });

    it("should handle network errors", async () => {
      const notificationEntity = notificationEntityMock();
      const networkError = new Error("ECONNREFUSED");

      mockModel.create.mockRejectedValue(networkError);

      await expect(repository.store(notificationEntity)).rejects.toThrow(ResponseStatus);

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("ECONNREFUSED"));
    });
  });

  describe("data transformation", () => {
    it("should correctly transform NotificationEntity to MongoDB document", async () => {
      const primitiveData: PrimitiveNotification = {
        id: "transform-test-123",
        createdAt: new Date("2025-02-01T12:00:00.000Z"),
        response: "Transform test response",
        templateID: "transform-template",
        responseException: "Transform exception",
        status: NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE,
        recipients: ["transform1@test.com", "transform2@test.com"],
      };

      const notificationEntity = NotificationEntity.create(primitiveData);
      const mongoRecord = mongoNotificationMock();

      mockModel.create.mockResolvedValue(mongoRecord);

      await repository.store(notificationEntity);

      expect(mockModel.create).toHaveBeenCalledWith({
        id: "transform-test-123",
        createdAt: new Date("2025-02-01T12:00:00.000Z"),
        response: "Transform test response",
        templateID: "transform-template",
        responseException: "Transform exception",
        status: NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE,
        recipients: "transform1@test.com,transform2@test.com",
      });
    });

    it("should handle null values in optional fields", async () => {
      const notificationEntity = notificationEntityMock({
        id: null as any,
        createdAt: null as any,
        response: null as any,
        responseException: null as any,
      });

      const mongoRecord = mongoNotificationMock();
      mockModel.create.mockResolvedValue(mongoRecord);

      await repository.store(notificationEntity);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: null,
          createdAt: null,
          response: null,
          responseException: null,
        }),
      );
    });

    it("should handle very large response strings", async () => {
      const largeResponse = "x".repeat(10000);
      const notificationEntity = notificationEntityMock({
        response: largeResponse,
      });

      const mongoRecord = mongoNotificationMock({
        response: largeResponse,
      });

      mockModel.create.mockResolvedValue(mongoRecord);

      await repository.store(notificationEntity);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          response: largeResponse,
        }),
      );
    });

    it("should handle recipients with special email formats", async () => {
      const specialEmails = [
        "user+tag@example.com",
        "user.name@sub.domain.com",
        "user_name@example-domain.co.uk",
      ];

      const notificationEntity = notificationEntityMock({
        recipients: specialEmails,
      });

      const mongoRecord = mongoNotificationMock({
        recipients: specialEmails.toString(),
      });

      mockModel.create.mockResolvedValue(mongoRecord);

      await repository.store(notificationEntity);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipients:
            "user+tag@example.com,user.name@sub.domain.com,user_name@example-domain.co.uk",
        }),
      );
    });
  });

  describe("edge cases", () => {
    it("should handle concurrent store operations", async () => {
      const notification1 = notificationEntityMock({ templateID: "concurrent-1" });
      const notification2 = notificationEntityMock({ templateID: "concurrent-2" });
      const notification3 = notificationEntityMock({ templateID: "concurrent-3" });

      const mongoRecord1 = mongoNotificationMock({ templateID: "concurrent-1" });
      const mongoRecord2 = mongoNotificationMock({ templateID: "concurrent-2" });
      const mongoRecord3 = mongoNotificationMock({ templateID: "concurrent-3" });

      mockModel.create
        .mockResolvedValueOnce(mongoRecord1)
        .mockResolvedValueOnce(mongoRecord2)
        .mockResolvedValueOnce(mongoRecord3);

      await Promise.all([
        repository.store(notification1),
        repository.store(notification2),
        repository.store(notification3),
      ]);

      expect(mockModel.create).toHaveBeenCalledTimes(3);

      const calls = mockModel.create.mock.calls;
      expect(calls[0][0].templateID).toBe("concurrent-1");
      expect(calls[1][0].templateID).toBe("concurrent-2");
      expect(calls[2][0].templateID).toBe("concurrent-3");
    });

    it("should maintain data integrity across multiple operations", async () => {
      const notificationEntity = notificationEntityMock({
        templateID: "integrity-test",
        status: NOTIFICATION_STATE_ENUM.SENT,
      });

      const mongoRecord = mongoNotificationMock({
        templateID: "integrity-test",
        status: NOTIFICATION_STATE_ENUM.SENT,
      });

      mockModel.create.mockResolvedValue(mongoRecord);

      await repository.store(notificationEntity);
      await repository.store(notificationEntity);
      await repository.store(notificationEntity);

      expect(mockModel.create).toHaveBeenCalledTimes(3);

      mockModel.create.mock.calls.forEach((call) => {
        expect(call[0].templateID).toBe("integrity-test");
        expect(call[0].status).toBe(NOTIFICATION_STATE_ENUM.SENT);
      });
    });

    it("should handle entities with undefined recipients gracefully", async () => {
      const notificationEntity = notificationEntityMock({
        recipients: undefined as any,
      });

      const mongoRecord = mongoNotificationMock();
      mockModel.create.mockResolvedValue(mongoRecord);

      await expect(repository.store(notificationEntity)).rejects.toThrow(ResponseStatus);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR][INFRA][MONGO NOTIFICATION REPO][STORE]"),
      );
    });

    it("should handle very long recipient lists", async () => {
      const manyRecipients = Array.from({ length: 1000 }, (_, i) => `user${i}@example.com`);
      const notificationEntity = notificationEntityMock({
        recipients: manyRecipients,
      });

      const mongoRecord = mongoNotificationMock({
        recipients: manyRecipients.toString(),
      });

      mockModel.create.mockResolvedValue(mongoRecord);

      await repository.store(notificationEntity);

      expect(mockModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipients: manyRecipients.join(","),
        }),
      );
    });
  });
});
