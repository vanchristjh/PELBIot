/**
 * @swagger
 * tags:
 *   - name: Devices
 *     description: Device management endpoints
 *   - name: Panels
 *     description: Panel data and monitoring
 *   - name: Trends
 *     description: Trend analysis and statistics
 *   - name: Load Profiles
 *     description: Load profile management
 *   - name: Alerts
 *     description: Alert management and monitoring
 *   - name: Alert Management
 *     description: Alert rule creation and management
 *   - name: Reports
 *     description: Report generation and management
 *   - name: Master Data
 *     description: System master data configuration
 *   - name: System
 *     description: System status and configuration
 */

// ============================================
// DEVICES ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: Get all devices
 *     description: Retrieve a list of all registered devices with pagination support
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of devices per page
 *     responses:
 *       200:
 *         description: Successfully retrieved devices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 devices:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Device'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/devices/{id}:
 *   get:
 *     summary: Get device by ID
 *     description: Retrieve detailed information about a specific device
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Device ID
 *     responses:
 *       200:
 *         description: Device found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 device:
 *                   $ref: '#/components/schemas/Device'
 *       404:
 *         description: Device not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/devices:
 *   post:
 *     summary: Create a new device
 *     description: Register a new device in the system
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Main Panel"
 *               type:
 *                 type: string
 *                 enum: [panel, meter, sensor]
 *                 example: "panel"
 *               location:
 *                 type: string
 *                 example: "Building A"
 *               description:
 *                 type: string
 *                 example: "Main electrical panel"
 *     responses:
 *       201:
 *         description: Device created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 deviceId:
 *                   type: integer
 *       400:
 *         description: Invalid input
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/devices/{id}:
 *   put:
 *     summary: Update device
 *     description: Update device information
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Device updated successfully
 *       404:
 *         description: Device not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/devices/{id}:
 *   delete:
 *     summary: Delete device
 *     description: Remove a device from the system
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Device deleted successfully
 *       404:
 *         description: Device not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/devices/status/all:
 *   get:
 *     summary: Get all devices status
 *     description: Get real-time status of all devices
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all device statuses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 statuses:
 *                   type: array
 *                   items:
 *                     type: object
 */

// ============================================
// PANELS ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/panels/device/{deviceId}:
 *   get:
 *     summary: Get panel data by device
 *     description: Retrieve panel readings for a specific device with pagination
 *     tags: [Panels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Successfully retrieved panel data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 panels:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Panel'
 */

/**
 * @swagger
 * /api/panels/latest/{deviceId}:
 *   get:
 *     summary: Get latest panel reading
 *     description: Get the most recent panel reading for a device
 *     tags: [Panels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Latest panel data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 panel:
 *                   $ref: '#/components/schemas/Panel'
 */

/**
 * @swagger
 * /api/panels:
 *   post:
 *     summary: Create panel reading
 *     description: Record a new panel reading
 *     tags: [Panels]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deviceId:
 *                 type: integer
 *               voltage:
 *                 type: number
 *               ampere:
 *                 type: number
 *               power:
 *                 type: number
 *               energy:
 *                 type: number
 *     responses:
 *       201:
 *         description: Panel reading created
 *       400:
 *         description: Invalid input
 */

// ============================================
// TRENDS ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/trends/{deviceId}:
 *   get:
 *     summary: Get trend data
 *     description: Retrieve trend analysis data for a device
 *     tags: [Trends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [hourly, daily, weekly, monthly]
 *           default: daily
 *     responses:
 *       200:
 *         description: Trend data retrieved successfully
 */

/**
 * @swagger
 * /api/trends/statistics/{deviceId}:
 *   get:
 *     summary: Get trend statistics
 *     description: Get statistical analysis for trends
 *     tags: [Trends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */

// ============================================
// LOAD PROFILES ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/load-profiles/{deviceId}:
 *   get:
 *     summary: Get load profile
 *     description: Retrieve load profile data for a device
 *     tags: [Load Profiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Load profile retrieved successfully
 */

/**
 * @swagger
 * /api/load-profiles:
 *   post:
 *     summary: Create load profile
 *     description: Create a new load profile
 *     tags: [Load Profiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Load profile created
 */

// ============================================
// ALERTS ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/alerts/{deviceId}:
 *   get:
 *     summary: Get device alerts
 *     description: Retrieve all alerts for a device
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
 */

/**
 * @swagger
 * /api/alerts:
 *   post:
 *     summary: Create alert
 *     description: Create a new alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Alert created
 */

// ============================================
// ALERT MANAGEMENT ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/alert-management/rules:
 *   post:
 *     summary: Create alert rule
 *     description: Create a new alert rule with conditions and triggers
 *     tags: [Alert Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *               - name
 *               - metric
 *               - severity
 *             properties:
 *               deviceId:
 *                 type: integer
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [info, warning, critical]
 *               triggerType:
 *                 type: string
 *                 enum: [threshold, change, pattern]
 *               metric:
 *                 type: string
 *                 enum: [power, voltage, ampere, energy, temperature, load]
 *               thresholdValue:
 *                 type: number
 *               comparisonOperator:
 *                 type: string
 *                 enum: ['<', '>', '<=', '>=', '=', '!=']
 *               durationSeconds:
 *                 type: integer
 *               cooldownSeconds:
 *                 type: integer
 *               notificationEnabled:
 *                 type: boolean
 *               emailRecipients:
 *                 type: string
 *     responses:
 *       201:
 *         description: Alert rule created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 ruleId:
 *                   type: integer
 */

/**
 * @swagger
 * /api/alert-management/rules/device/{deviceId}:
 *   get:
 *     summary: Get device alert rules
 *     description: Retrieve all alert rules for a specific device
 *     tags: [Alert Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Alert rules retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 rules:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AlertRule'
 */

/**
 * @swagger
 * /api/alert-management/rules/{ruleId}:
 *   get:
 *     summary: Get alert rule details
 *     description: Retrieve detailed information about a specific alert rule
 *     tags: [Alert Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ruleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Alert rule retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 rule:
 *                   $ref: '#/components/schemas/AlertRule'
 */

/**
 * @swagger
 * /api/alert-management/rules/{ruleId}:
 *   put:
 *     summary: Update alert rule
 *     description: Update an existing alert rule
 *     tags: [Alert Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ruleId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *               thresholdValue:
 *                 type: number
 *               emailRecipients:
 *                 type: string
 *     responses:
 *       200:
 *         description: Alert rule updated successfully
 */

/**
 * @swagger
 * /api/alert-management/rules/{ruleId}:
 *   delete:
 *     summary: Delete alert rule
 *     description: Remove an alert rule from the system
 *     tags: [Alert Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ruleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Alert rule deleted successfully
 */

/**
 * @swagger
 * /api/alert-management/rules/{ruleId}/toggle:
 *   patch:
 *     summary: Toggle alert rule
 *     description: Enable or disable an alert rule
 *     tags: [Alert Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ruleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Alert rule toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 isEnabled:
 *                   type: boolean
 */

/**
 * @swagger
 * /api/alert-management/rules/{ruleId}/conditions:
 *   post:
 *     summary: Add alert condition
 *     description: Add a new condition to an alert rule
 *     tags: [Alert Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ruleId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - metric
 *               - operator
 *               - value
 *             properties:
 *               conditionType:
 *                 type: string
 *               metric:
 *                 type: string
 *               operator:
 *                 type: string
 *               value:
 *                 type: number
 *               unit:
 *                 type: string
 *               logicalOperator:
 *                 type: string
 *                 enum: [AND, OR]
 *     responses:
 *       201:
 *         description: Condition added successfully
 */

/**
 * @swagger
 * /api/alert-management/conditions/{conditionId}:
 *   delete:
 *     summary: Delete alert condition
 *     description: Remove a condition from an alert rule
 *     tags: [Alert Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conditionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Condition deleted successfully
 */

/**
 * @swagger
 * /api/alert-management/rules/{ruleId}/triggers:
 *   get:
 *     summary: Get trigger history
 *     description: Retrieve trigger history for an alert rule
 *     tags: [Alert Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ruleId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Trigger history retrieved successfully
 */

/**
 * @swagger
 * /api/alert-management/triggers/{triggerId}/acknowledge:
 *   put:
 *     summary: Acknowledge alert trigger
 *     description: Mark an alert trigger as acknowledged or resolved
 *     tags: [Alert Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: triggerId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [acknowledged, resolved]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trigger acknowledged successfully
 */

/**
 * @swagger
 * /api/alert-management/rules/{ruleId}/test:
 *   post:
 *     summary: Test alert rule
 *     description: Test an alert rule against current device data
 *     tags: [Alert Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ruleId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Test completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 triggered:
 *                   type: boolean
 *                 testData:
 *                   type: object
 */

// ============================================
// REPORTS ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/reports/generate:
 *   post:
 *     summary: Generate report
 *     description: Generate a new report with specified format and type
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceId
 *               - reportType
 *               - period
 *             properties:
 *               deviceId:
 *                 type: integer
 *               reportType:
 *                 type: string
 *                 enum: [device_summary, trend_analysis, alert_history, energy_report]
 *               period:
 *                 type: string
 *                 enum: [daily, weekly, monthly, yearly]
 *               format:
 *                 type: string
 *                 enum: [pdf, csv, json]
 *               dateFrom:
 *                 type: string
 *                 format: date
 *               dateTo:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Report generation started
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 reportId:
 *                   type: integer
 */

/**
 * @swagger
 * /api/reports/{reportId}:
 *   get:
 *     summary: Get report
 *     description: Retrieve a generated report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Report'
 */

/**
 * @swagger
 * /api/reports/device/{deviceId}:
 *   get:
 *     summary: Get device reports
 *     description: List all reports generated for a device
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deviceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Device reports retrieved successfully
 */

/**
 * @swagger
 * /api/reports/email/{reportId}:
 *   post:
 *     summary: Email report
 *     description: Send a report via email
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipients:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *     responses:
 *       200:
 *         description: Report sent via email successfully
 */

/**
 * @swagger
 * /api/reports/{reportId}:
 *   delete:
 *     summary: Delete report
 *     description: Delete a generated report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Report deleted successfully
 */

// ============================================
// MASTER DATA ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/master-data/metrics:
 *   get:
 *     summary: Get metrics
 *     description: Retrieve all available metrics
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 */

/**
 * @swagger
 * /api/master-data/units:
 *   get:
 *     summary: Get units
 *     description: Retrieve all available units
 *     tags: [Master Data]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Units retrieved successfully
 */

// ============================================
// SYSTEM ENDPOINTS
// ============================================

/**
 * @swagger
 * /api/system/health:
 *   get:
 *     summary: Health check
 *     description: Check system health status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

/**
 * @swagger
 * /api/system/config:
 *   get:
 *     summary: Get system configuration
 *     description: Retrieve system configuration and settings
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuration retrieved successfully
 */
