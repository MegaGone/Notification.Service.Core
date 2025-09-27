interface ContentProcessingResult {
  error?: string;
  success: boolean;
  content?: string;
}

export class ContentFieldReplacerMapper {
  public static replace(content: string, fields: Record<string, unknown>): ContentProcessingResult {
    try {
      let processedContent = content;

      // PATTERN 1: @Model.map["FieldName"]
      processedContent = processedContent.replace(
        /@Model\.map\["([^"]+)"\]/g,
        (match, fieldName) => fields[fieldName]?.toString() || match,
      );

      // PATTERN 2: @Model.map['FieldName'] (single quotes)
      processedContent = processedContent.replace(
        /@Model\.map\['([^']+)'\]/g,
        (match, fieldName) => fields[fieldName]?.toString() || match,
      );

      // PATTERN 3: {{FieldName}}
      processedContent = processedContent.replace(/\{\{([^}]+)\}\}/g, (match, fieldName) => {
        const trimmedField = fieldName.trim();
        return fields[trimmedField]?.toString() || match;
      });

      return {
        success: true,
        content: processedContent,
      };
    } catch (error) {
      console.log(`[ERROR][MAPPER][CONTENT_FIELD_REPLACER][REPLACE] ${JSON.stringify(error)}`);
      return {
        success: false,
        error: `[CONTENT_FIELD_REPLACER] ${JSON.stringify(error)}`,
      };
    }
  }
}
