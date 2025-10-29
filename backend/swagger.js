import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PELBIOT API Documentation',
      version: '1.0.0',
      description: 'Comprehensive API documentation for PELBIOT - Panel Electrical Billing IoT System',
      contact: {
        name: 'PELBIOT Team',
        email: 'support@pelbiot.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
        variables: {
          protocol: {
            default: 'http'
          },
          host: {
            default: 'localhost:5000'
          }
        }
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
          description: 'JWT token in Authorization header'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          required: ['success', 'message'],
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'string',
              example: 'Detailed error information'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1
            },
            limit: {
              type: 'integer',
              example: 10
            },
            total: {
              type: 'integer',
              example: 50
            },
            pages: {
              type: 'integer',
              example: 5
            }
          }
        },
        Device: {
          type: 'object',
          required: ['name', 'type'],
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'Main Panel'
            },
            type: {
              type: 'string',
              enum: ['panel', 'meter', 'sensor'],
              example: 'panel'
            },
            location: {
              type: 'string',
              example: 'Building A'
            },
            isActive: {
              type: 'boolean',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Panel: {
          type: 'object',
          required: ['deviceId', 'voltage', 'ampere'],
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            deviceId: {
              type: 'integer',
              example: 1
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            voltage: {
              type: 'number',
              format: 'float',
              example: 220.5
            },
            ampere: {
              type: 'number',
              format: 'float',
              example: 15.2
            },
            power: {
              type: 'number',
              format: 'float',
              example: 3340.6
            },
            energy: {
              type: 'number',
              format: 'float',
              example: 150.5
            },
            frequency: {
              type: 'number',
              format: 'float',
              example: 50.0
            },
            powerFactor: {
              type: 'number',
              format: 'float',
              example: 0.95
            }
          }
        },
        AlertRule: {
          type: 'object',
          required: ['deviceId', 'name', 'metric', 'severity'],
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            deviceId: {
              type: 'integer',
              example: 1
            },
            name: {
              type: 'string',
              example: 'High Power Alert'
            },
            description: {
              type: 'string',
              example: 'Alert when power exceeds 5000W'
            },
            severity: {
              type: 'string',
              enum: ['info', 'warning', 'critical'],
              example: 'critical'
            },
            isEnabled: {
              type: 'boolean',
              example: true
            },
            triggerType: {
              type: 'string',
              enum: ['threshold', 'change', 'pattern'],
              example: 'threshold'
            },
            metric: {
              type: 'string',
              enum: ['power', 'voltage', 'ampere', 'energy', 'temperature', 'load'],
              example: 'power'
            },
            thresholdValue: {
              type: 'number',
              example: 5000
            },
            comparisonOperator: {
              type: 'string',
              enum: ['<', '>', '<=', '>=', '=', '!='],
              example: '>'
            },
            durationSeconds: {
              type: 'integer',
              example: 300
            },
            cooldownSeconds: {
              type: 'integer',
              example: 600
            },
            notificationEnabled: {
              type: 'boolean',
              example: true
            },
            emailRecipients: {
              type: 'string',
              example: 'admin@example.com,ops@example.com'
            },
            lastTriggeredAt: {
              type: 'string',
              format: 'date-time',
              nullable: true
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
        Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            userId: {
              type: 'integer',
              example: 1
            },
            type: {
              type: 'string',
              enum: ['alert', 'report', 'system'],
              example: 'alert'
            },
            title: {
              type: 'string',
              example: 'High Power Alert'
            },
            message: {
              type: 'string',
              example: 'Power consumption exceeded threshold'
            },
            isRead: {
              type: 'boolean',
              example: false
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
              type: 'integer',
              example: 1
            },
            deviceId: {
              type: 'integer',
              example: 1
            },
            reportType: {
              type: 'string',
              enum: ['device_summary', 'trend_analysis', 'alert_history', 'energy_report'],
              example: 'device_summary'
            },
            period: {
              type: 'string',
              enum: ['daily', 'weekly', 'monthly', 'yearly'],
              example: 'monthly'
            },
            format: {
              type: 'string',
              enum: ['pdf', 'csv', 'json'],
              example: 'pdf'
            },
            fileUrl: {
              type: 'string',
              example: '/reports/report_2024_01.pdf'
            },
            generatedAt: {
              type: 'string',
              format: 'date-time'
            },
            expiresAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./backend/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };
