import { NotificationEntity } from "../../../src/core/notification/domain/entities/notification.entity";
import { PrimitiveNotification } from "../../../src/core/notification/domain/entities/notification.interface";
import { NOTIFICATION_STATE_ENUM } from "../../../src/core/notification/domain/constants/notification-state.enum";

const notificationMock = (overrides?: Partial<PrimitiveNotification>): PrimitiveNotification => {
  return {
    id: "123e4567-e89b-12d3-a456-426614174000",
    status: NOTIFICATION_STATE_ENUM.SENT,
    response: "Email sent successfully",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    templateID: "welcome-email-template",
    recipients: ["user@example.com"],
    responseException: undefined,
    ...overrides,
  };
};

describe("NotificationEntity", () => {
  describe("constructor", () => {
    it("should create a notification entity with all attributes", () => {
      const notificationData = notificationMock();

      const entity = new NotificationEntity(notificationData);

      expect(entity).toBeInstanceOf(NotificationEntity);
      expect(entity.toPrimitive()).toEqual(notificationData);
    });

    it("should create notification entity with minimal required fields", () => {
      const minimalData: PrimitiveNotification = {
        templateID: "template-123",
        status: NOTIFICATION_STATE_ENUM.PENDING,
        recipients: "user@test.com",
      };

      const entity = new NotificationEntity(minimalData);

      expect(entity).toBeInstanceOf(NotificationEntity);
      expect(entity.toPrimitive().templateID).toBe("template-123");
      expect(entity.toPrimitive().status).toBe(NOTIFICATION_STATE_ENUM.PENDING);
      expect(entity.toPrimitive().recipients).toBe("user@test.com");
    });

    it("should handle undefined optional fields", () => {
      const dataWithUndefined: PrimitiveNotification = {
        templateID: "template-456",
        status: NOTIFICATION_STATE_ENUM.CORE_FAILURE,
        recipients: ["admin@example.com"],
        id: undefined,
        createdAt: undefined,
        response: undefined,
        responseException: undefined,
      };

      const entity = new NotificationEntity(dataWithUndefined);
      const result = entity.toPrimitive();

      expect(result.id).toBeUndefined();
      expect(result.createdAt).toBeUndefined();
      expect(result.response).toBeUndefined();
      expect(result.responseException).toBeUndefined();
      expect(result.templateID).toBe("template-456");
    });
  });

  describe("create", () => {
    it("should create notification entity using static factory method", () => {
      const notificationData = notificationMock({
        templateID: "password-reset",
        status: NOTIFICATION_STATE_ENUM.SENT,
        recipients: "john.doe@example.com",
      });

      const entity = NotificationEntity.create(notificationData);

      expect(entity).toBeInstanceOf(NotificationEntity);
      expect(entity.toPrimitive()).toEqual(notificationData);
    });

    it("should create entity with all notification states", () => {
      const states = [
        NOTIFICATION_STATE_ENUM.SENT,
        NOTIFICATION_STATE_ENUM.PENDING,
        NOTIFICATION_STATE_ENUM.CORE_FAILURE,
        NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE,
      ];

      states.forEach((status) => {
        const data = notificationMock({ status });
        const entity = NotificationEntity.create(data);

        expect(entity.toPrimitive().status).toBe(status);
      });
    });

    it("should handle single recipient as string", () => {
      const data = notificationMock({
        recipients: "single@example.com",
      });

      const entity = NotificationEntity.create(data);

      expect(entity.toPrimitive().recipients).toBe("single@example.com");
    });

    it("should handle multiple recipients as array", () => {
      const recipients = ["user1@example.com", "user2@example.com", "admin@example.com"];
      const data = notificationMock({ recipients });

      const entity = NotificationEntity.create(data);

      expect(entity.toPrimitive().recipients).toEqual(recipients);
    });

    it("should preserve creation date when provided", () => {
      const createdAt = new Date("2025-03-15T14:30:00.000Z");
      const data = notificationMock({ createdAt });

      const entity = NotificationEntity.create(data);

      expect(entity.toPrimitive().createdAt).toEqual(createdAt);
    });

    it("should handle response and responseException together", () => {
      const data = notificationMock({
        response: "Partial success",
        responseException: "Some warnings occurred",
      });

      const entity = NotificationEntity.create(data);
      const result = entity.toPrimitive();

      expect(result.response).toBe("Partial success");
      expect(result.responseException).toBe("Some warnings occurred");
    });

    it("should create entity with empty response", () => {
      const data = notificationMock({
        response: "",
        status: NOTIFICATION_STATE_ENUM.CORE_FAILURE,
      });

      const entity = NotificationEntity.create(data);

      expect(entity.toPrimitive().response).toBe("");
      expect(entity.toPrimitive().status).toBe(NOTIFICATION_STATE_ENUM.CORE_FAILURE);
    });

    it("should handle long template IDs", () => {
      const longTemplateID = "a".repeat(255);
      const data = notificationMock({
        templateID: longTemplateID,
      });

      const entity = NotificationEntity.create(data);

      expect(entity.toPrimitive().templateID).toBe(longTemplateID);
    });

    it("should handle special characters in fields", () => {
      const data = notificationMock({
        templateID: "template-with-special-chars-!@#$%",
        response: "Response with émojis 🎉 and spëcial çhars <html>",
        responseException: "Exception with symbols: &amp; &lt; &gt;",
      });

      const entity = NotificationEntity.create(data);
      const result = entity.toPrimitive();

      expect(result.templateID).toBe("template-with-special-chars-!@#$%");
      expect(result.response).toBe("Response with émojis 🎉 and spëcial çhars <html>");
      expect(result.responseException).toBe("Exception with symbols: &amp; &lt; &gt;");
    });
  });

  describe("toPrimitive", () => {
    it("should return primitive representation of notification", () => {
      const originalData = notificationMock();
      const entity = NotificationEntity.create(originalData);

      const primitive = entity.toPrimitive();

      expect(primitive).toEqual(originalData);
      expect(primitive).not.toBe(originalData);
    });

    it("should return all fields including optional ones when present", () => {
      const data = notificationMock({
        id: "custom-id-123",
        createdAt: new Date("2025-02-14T12:00:00.000Z"),
        response: "Custom response",
        responseException: "Custom exception",
      });

      const entity = NotificationEntity.create(data);
      const primitive = entity.toPrimitive();

      expect(primitive.id).toBe("custom-id-123");
      expect(primitive.createdAt).toEqual(new Date("2025-02-14T12:00:00.000Z"));
      expect(primitive.response).toBe("Custom response");
      expect(primitive.responseException).toBe("Custom exception");
    });

    it("should return undefined for optional fields when not provided", () => {
      const minimalData: PrimitiveNotification = {
        templateID: "minimal-template",
        status: NOTIFICATION_STATE_ENUM.PENDING,
        recipients: "test@example.com",
      };

      const entity = NotificationEntity.create(minimalData);
      const primitive = entity.toPrimitive();

      expect(primitive.id).toBeUndefined();
      expect(primitive.createdAt).toBeUndefined();
      expect(primitive.response).toBeUndefined();
      expect(primitive.responseException).toBeUndefined();
      expect(primitive.templateID).toBe("minimal-template");
      expect(primitive.status).toBe(NOTIFICATION_STATE_ENUM.PENDING);
      expect(primitive.recipients).toBe("test@example.com");
    });

    it("should maintain data integrity across multiple calls", () => {
      const data = notificationMock();
      const entity = NotificationEntity.create(data);

      const primitive1 = entity.toPrimitive();
      const primitive2 = entity.toPrimitive();

      expect(primitive1).toEqual(primitive2);
      expect(primitive1).not.toBe(primitive2);
    });

    it("should preserve array references for recipients", () => {
      const recipients = ["user1@test.com", "user2@test.com"];
      const data = notificationMock({ recipients });
      const entity = NotificationEntity.create(data);

      const primitive = entity.toPrimitive();

      expect(primitive.recipients).toEqual(recipients);
      expect(Array.isArray(primitive.recipients)).toBe(true);
    });

    it("should handle date objects correctly", () => {
      const createdAt = new Date("2025-01-15T10:30:45.123Z");
      const data = notificationMock({ createdAt });
      const entity = NotificationEntity.create(data);

      const primitive = entity.toPrimitive();

      expect(primitive.createdAt).toEqual(createdAt);
      expect(primitive.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("edge cases and validation", () => {
    it("should handle empty string values", () => {
      const data = notificationMock({
        id: "",
        response: "",
        responseException: "",
      });

      const entity = NotificationEntity.create(data);
      const primitive = entity.toPrimitive();

      expect(primitive.id).toBe("");
      expect(primitive.response).toBe("");
      expect(primitive.responseException).toBe("");
    });

    it("should handle empty array for recipients", () => {
      const data = notificationMock({
        recipients: [],
      });

      const entity = NotificationEntity.create(data);

      expect(entity.toPrimitive().recipients).toEqual([]);
    });

    it("should handle all notification states correctly", () => {
      const testCases = [
        { status: NOTIFICATION_STATE_ENUM.SENT, description: "sent notification" },
        { status: NOTIFICATION_STATE_ENUM.PENDING, description: "pending notification" },
        { status: NOTIFICATION_STATE_ENUM.CORE_FAILURE, description: "core failure notification" },
        {
          status: NOTIFICATION_STATE_ENUM.PROVIDER_FAILURE,
          description: "provider failure notification",
        },
      ];

      testCases.forEach(({ status, description }) => {
        const data = notificationMock({ status });
        const entity = NotificationEntity.create(data);

        expect(entity.toPrimitive().status).toBe(status);
      });
    });

    it("should maintain immutability of internal data", () => {
      const originalData = notificationMock();
      const entity = NotificationEntity.create(originalData);

      const primitive = entity.toPrimitive();
      primitive.templateID = "modified-template";
      primitive.status = NOTIFICATION_STATE_ENUM.CORE_FAILURE;

      const unchangedPrimitive = entity.toPrimitive();
      expect(unchangedPrimitive.templateID).toBe(originalData.templateID);
      expect(unchangedPrimitive.status).toBe(originalData.status);
    });

    it("should handle null values gracefully", () => {
      const dataWithNulls = {
        templateID: "test-template",
        status: NOTIFICATION_STATE_ENUM.SENT,
        recipients: "test@example.com",
        id: null as any,
        createdAt: null as any,
        response: null as any,
        responseException: null as any,
      };

      const entity = NotificationEntity.create(dataWithNulls);
      const primitive = entity.toPrimitive();

      expect(primitive.id).toBeNull();
      expect(primitive.createdAt).toBeNull();
      expect(primitive.response).toBeNull();
      expect(primitive.responseException).toBeNull();
    });
  });
});
