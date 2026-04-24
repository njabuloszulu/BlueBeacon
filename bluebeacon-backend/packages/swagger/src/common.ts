export type JsonObject = Record<string, unknown>;

export const sharedComponents = {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    }
  },
  parameters: {
    requestId: {
      name: 'x-request-id',
      in: 'header',
      required: false,
      schema: { type: 'string' },
      description: 'Optional request correlation identifier.'
    }
  },
  schemas: {
    Error: {
      type: 'object',
      required: ['message'],
      properties: {
        message: { type: 'string' },
        issues: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    },
    AuditEvent: {
      type: 'object',
      properties: {
        actorId: { type: 'string', nullable: true },
        action: { type: 'string' },
        entity: { type: 'string' },
        entityId: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    },
    Pagination: {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1 },
        pageSize: { type: 'integer', minimum: 1 },
        total: { type: 'integer', minimum: 0 }
      }
    }
  }
} as const;

export function withSharedComponents(spec: JsonObject): JsonObject {
  const components = (spec.components as JsonObject | undefined) ?? {};
  const currentSecurity = (components.securitySchemes as JsonObject | undefined) ?? {};
  const currentParameters = (components.parameters as JsonObject | undefined) ?? {};
  const currentSchemas = (components.schemas as JsonObject | undefined) ?? {};

  return {
    ...spec,
    components: {
      ...components,
      securitySchemes: { ...sharedComponents.securitySchemes, ...currentSecurity },
      parameters: { ...sharedComponents.parameters, ...currentParameters },
      schemas: { ...sharedComponents.schemas, ...currentSchemas }
    }
  };
}
