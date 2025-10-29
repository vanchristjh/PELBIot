/**
 * PELBIOT API - Swagger Documentation
 * Complete OpenAPI 3.0 specification for all API endpoints
 */

export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'PELBIOT API',
    version: '2.0.0',
    description: 'Production-grade IoT Device Management & Monitoring System',
    contact: {
      name: 'PELBIOT Support',
      email: 'support@pelbiot.com'
    },
    license: {
      name: 'Apache 2.0'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development Server'
    },
    {
      url: 'https://api.pelbiot.com',
      description: 'Production Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Token'
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key'
      }
    },
    schemas: {
      User: {
        type: 'object',
        required: ['email', 'password', 'role'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          email: {
            type: 'string',
            format: 'email'
          },
          username: {
            type: 'string'
          },
          role: {
            type: 'string',
            enum: ['superadmin', 'admin', 'operator', 'viewer']
          },
          password: {
            type: 'string',
            minLength: 8
          },
          department: {
            type: 'string'
          },
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'suspended']
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Device: {
        type: 'object',
        required: ['deviceId', 'deviceName', 'location'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          deviceId: {
            type: 'string',
            description: 'Unique device identifier'
          },
          deviceName: {
            type: 'string'
          },
          deviceType: {
            type: 'string',
            enum: ['meter', 'transformer', 'breaker', 'sensor', 'gateway']
          },
          location: {
            type: 'object',
            properties: {
              latitude: { type: 'number' },
              longitude: { type: 'number' },
              address: { type: 'string' }
            }
          },
          status: {
            type: 'string',
            enum: ['online', 'offline', 'error', 'maintenance']
          },
          manufacturer: {
            type: 'string'
          },
          model: {
            type: 'string'
          },
          serialNumber: {
            type: 'string'
          },
          installDate: {
            type: 'string',
            format: 'date'
          },
          firmware: {
            type: 'string'
          },
          lastUpdate: {
            type: 'string',
            format: 'date-time'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Alert: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          deviceId: {
            type: 'string'
          },
          severity: {
            type: 'string',
            enum: ['critical', 'high', 'medium', 'low', 'info']
          },
          type: {
            type: 'string'
          },
          message: {
            type: 'string'
          },
          status: {
            type: 'string',
            enum: ['active', 'acknowledged', 'resolved']
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          resolvedAt: {
            type: 'string',
            format: 'date-time'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Report: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          title: {
            type: 'string'
          },
          type: {
            type: 'string',
            enum: ['device-summary', 'trend-analysis', 'alert-history', 'energy', 'custom']
          },
          format: {
            type: 'string',
            enum: ['pdf', 'excel', 'csv', 'json']
          },
          status: {
            type: 'string',
            enum: ['pending', 'processing', 'completed', 'failed']
          },
          createdBy: {
            type: 'string'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          completedAt: {
            type: 'string',
            format: 'date-time'
          },
          filePath: {
            type: 'string'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          status: {
            type: 'integer'
          },
          error: {
            type: 'string'
          },
          message: {
            type: 'string'
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array'
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              pages: { type: 'integer' }
            }
          }
        }
      }
    },
    responses: {
      BadRequest: {
        description: 'Bad Request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      Forbidden: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      NotFound: {
        description: 'Not Found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      InternalError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      }
    }
  },
  security: [
    { bearerAuth: [] },
    { apiKey: [] }
  ],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'username'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  username: { type: 'string' },
                  password: { type: 'string', minLength: 8 },
                  role: { type: 'string', default: 'viewer' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                    token: { type: 'string' }
                  }
                }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    token: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/api/devices': {
      get: {
        tags: ['Devices'],
        summary: 'List all devices',
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 }
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20 }
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['online', 'offline', 'error'] }
          },
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'List of devices',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Device' }
                }
              }
            }
          },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      },
      post: {
        tags: ['Devices'],
        summary: 'Create new device',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Device' }
            }
          }
        },
        responses: {
          201: {
            description: 'Device created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Device' }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' }
        }
      }
    },
    '/api/devices/{deviceId}': {
      get: {
        tags: ['Devices'],
        summary: 'Get device details',
        parameters: [
          {
            name: 'deviceId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Device details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Device' }
              }
            }
          },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },
      put: {
        tags: ['Devices'],
        summary: 'Update device',
        parameters: [
          {
            name: 'deviceId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Device' }
            }
          }
        },
        responses: {
          200: {
            description: 'Device updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Device' }
              }
            }
          },
          404: { $ref: '#/components/responses/NotFound' }
        }
      },
      delete: {
        tags: ['Devices'],
        summary: 'Delete device',
        parameters: [
          {
            name: 'deviceId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Device deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    message: { type: 'string' }
                  }
                }
              }
            }
          },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/api/alerts': {
      get: {
        tags: ['Alerts'],
        summary: 'Get alerts',
        parameters: [
          {
            name: 'severity',
            in: 'query',
            schema: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] }
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['active', 'acknowledged', 'resolved'] }
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 }
          }
        ],
        responses: {
          200: {
            description: 'List of alerts',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Alert' }
                }
              }
            }
          }
        }
      }
    },
    '/api/alerts/{alertId}/acknowledge': {
      post: {
        tags: ['Alerts'],
        summary: 'Acknowledge alert',
        parameters: [
          {
            name: 'alertId',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          200: {
            description: 'Alert acknowledged',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Alert' }
              }
            }
          }
        }
      }
    },
    '/api/reports/advanced/generate': {
      post: {
        tags: ['Reports'],
        summary: 'Generate report in multiple formats',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['data', 'format'],
                properties: {
                  format: {
                    type: 'string',
                    enum: ['pdf', 'excel', 'json', 'csv']
                  },
                  data: {
                    type: 'object',
                    description: 'Report data'
                  },
                  fileName: {
                    type: 'string',
                    description: 'Output file name'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Report generated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                    filePath: { type: 'string' },
                    fileName: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/reports/advanced/analytics/statistics': {
      post: {
        tags: ['Reports'],
        summary: 'Calculate statistics',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['data'],
                properties: {
                  data: {
                    type: 'array',
                    items: { type: 'number' }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Statistics calculated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    statistics: {
                      type: 'object',
                      properties: {
                        count: { type: 'integer' },
                        sum: { type: 'number' },
                        average: { type: 'number' },
                        median: { type: 'number' },
                        min: { type: 'number' },
                        max: { type: 'number' },
                        stdDev: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/reports/advanced/analytics/trends': {
      post: {
        tags: ['Reports'],
        summary: 'Generate trend analysis',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['data', 'dateKey', 'valueKey'],
                properties: {
                  data: { type: 'array' },
                  dateKey: { type: 'string' },
                  valueKey: { type: 'string' },
                  period: {
                    type: 'string',
                    enum: ['daily', 'monthly', 'yearly'],
                    default: 'daily'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Trends generated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    trends: { type: 'array' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/reports/advanced/schedule': {
      post: {
        tags: ['Reports'],
        summary: 'Schedule recurring report',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['reportConfig'],
                properties: {
                  reportConfig: { type: 'object' },
                  frequency: {
                    type: 'string',
                    enum: ['hourly', 'daily', 'weekly', 'monthly'],
                    default: 'daily'
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Report scheduled',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    schedule: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      },
      get: {
        tags: ['Reports'],
        summary: 'Get all scheduled reports',
        responses: {
          200: {
            description: 'Scheduled reports',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    reports: { type: 'array' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication endpoints'
    },
    {
      name: 'Devices',
      description: 'Device management endpoints'
    },
    {
      name: 'Alerts',
      description: 'Alert management endpoints'
    },
    {
      name: 'Reports',
      description: 'Report generation and analytics'
    }
  ]
};

export default swaggerDefinition;
