# Advanced Reporting - PDF Exports & Custom Reports

**Status**: ✅ IMPLEMENTED (Feature 2 Complete)

## Overview

The Advanced Reporting system provides comprehensive report generation capabilities including PDF exports, CSV data exports, email delivery, and report scheduling.

## Architecture

### Components

1. **Report Service** (`backend/utils/reportService.js`)
   - Core reporting engine using PDFKit
   - Multiple report templates
   - CSV export functionality
   - Email delivery integration

2. **Report Controller** (`backend/controllers/reportController.js`)
   - Business logic for report operations
   - Database logging of reports
   - Report management

3. **Report Routes** (`backend/routes/reports.js`)
   - RESTful API endpoints
   - Authentication protection
   - Report scheduling

### Report Types

#### 1. Device Summary Report
- **Description**: Comprehensive overview of device performance
- **Contents**:
  - Device information and status
  - Panel data summary (voltage, ampere, power)
  - Power trends over period
  - Alert summary by severity
- **Endpoint**: `POST /api/reports/device-summary`
- **Request**:
  ```json
  {
    "deviceId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "sendEmail": true,
    "recipientEmail": "user@example.com"
  }
  ```

#### 2. Trend Analysis Report
- **Description**: Detailed analysis of power, energy, temperature, or load trends
- **Contents**:
  - Metric selection (power, energy, temperature, load)
  - Daily trend data with statistics
  - Peak values, minimums, and averages
  - Summary statistics
- **Endpoint**: `POST /api/reports/trend-analysis`
- **Request**:
  ```json
  {
    "deviceId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "metric": "power",
    "sendEmail": true,
    "recipientEmail": "user@example.com"
  }
  ```

#### 3. Alert History Report
- **Description**: Complete alert log for analysis and compliance
- **Contents**:
  - All alerts within period
  - Severity distribution
  - Alert status tracking
  - Trend analysis of alert patterns
- **Endpoint**: `POST /api/reports/alert-history`
- **Request**:
  ```json
  {
    "deviceId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "sendEmail": true,
    "recipientEmail": "user@example.com"
  }
  ```

#### 4. Energy Consumption Report
- **Description**: Energy consumption analysis and forecasting
- **Contents**:
  - Daily energy consumption
  - Average daily power consumption
  - Peak power analysis
  - Total consumption summary
- **Endpoint**: `POST /api/reports/energy`
- **Request**:
  ```json
  {
    "deviceId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "sendEmail": true,
    "recipientEmail": "user@example.com"
  }
  ```

#### 5. CSV Export
- **Description**: Data export for external analysis
- **Types**:
  - `summary` - Panel summary data
  - `trends` - Trend analysis data
  - `alerts` - Alert history data
- **Endpoint**: `POST /api/reports/csv-export`
- **Request**:
  ```json
  {
    "deviceId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "reportType": "trends"
  }
  ```

## API Endpoints

### Report Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/device-summary` | Generate device summary PDF |
| POST | `/api/reports/trend-analysis` | Generate trend analysis PDF |
| POST | `/api/reports/alert-history` | Generate alert history PDF |
| POST | `/api/reports/energy` | Generate energy report PDF |
| POST | `/api/reports/csv-export` | Generate CSV export |

### Report Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/all` | Get all reports (paginated) |
| GET | `/api/reports/my-reports` | Get user's reports (paginated) |
| GET | `/api/reports/files` | List generated report files |

### Report Scheduling

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/schedule` | Schedule periodic report |
| POST | `/api/reports/cleanup` | Cleanup old reports |

## Features

### PDF Generation
- Professional PDF layout with branding
- Automatic page breaks for long reports
- Embedded charts and statistics
- Timestamp and metadata tracking

### Email Integration
- Automatic email delivery with attachments
- HTML-formatted report summaries
- Recipient preferences
- Attachment size optimization

### Data Export
- Multiple export formats (PDF, CSV)
- Customizable data fields
- Data compression for large datasets
- Format validation

### Report Storage
- Local file system storage (`/backend/reports/`)
- Database record keeping
- Automatic cleanup of old reports
- File size tracking

### Security
- Authentication required for all endpoints
- Role-based access control
- Data encryption for sensitive reports
- Audit logging of report access

## Usage Examples

### Generate and Email Device Summary Report
```bash
curl -X POST http://localhost:5000/api/reports/device-summary \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "deviceId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "sendEmail": true,
    "recipientEmail": "admin@example.com"
  }'
```

### Get All Reports
```bash
curl http://localhost:5000/api/reports/all?page=1&limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Export Trends as CSV
```bash
curl -X POST http://localhost:5000/api/reports/csv-export \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "deviceId": 1,
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "reportType": "trends"
  }'
```

## Database Schema

### Reports Table
```sql
CREATE TABLE reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  report_type VARCHAR(50),
  start_date DATE,
  end_date DATE,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_report_type (report_type),
  INDEX idx_created_at (created_at)
);
```

## Configuration

Environment variables:
- `REPORTS_DIR` - Directory for storing generated reports (default: `/backend/reports/`)
- `REPORT_CLEANUP_DAYS` - Days to retain reports (default: 30)
- `REPORT_MAX_SIZE` - Maximum report size in MB (default: 50)

## Performance Considerations

- Reports are generated asynchronously to prevent blocking
- Large date ranges may take longer to process
- CSV files are more suitable for large datasets than PDF
- Automatic cleanup removes reports older than 30 days
- Reports are cached in the file system

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (missing fields)
- `401` - Unauthorized
- `500` - Server error

Error responses include detailed messages:
```json
{
  "error": "Failed to generate report",
  "details": "Device not found"
}
```

## Future Enhancements

- [ ] Advanced scheduling with cron jobs
- [ ] Report templates customization
- [ ] Excel export support
- [ ] Chart visualization in PDFs
- [ ] Multi-language reports
- [ ] Report caching
- [ ] Bulk report generation
- [ ] Report versioning

## Integration Points

- **Email Service**: Uses `emailService.sendReportEmail()` for delivery
- **Database**: Logs reports to `reports` table
- **Authentication**: Protected by `authMiddleware`
- **Notifications**: Can trigger notifications on report generation

## Troubleshooting

### PDF Generation Fails
- Check file permissions in `/backend/reports/` directory
- Verify PDFKit is installed: `npm list pdfkit`
- Check device data exists for the date range

### Email Not Sent
- Verify SMTP credentials in `.env`
- Check `emailService.verifyEmailService()` on server startup
- Review email service logs

### Missing Report Data
- Verify data exists in database for the date range
- Check database connection
- Review query results in logs

## Security Notes

- Reports are stored on disk; consider encryption for sensitive data
- Access logs track all report requests
- Reports should not contain personal data without consent
- Automatic cleanup prevents disk space issues
- Consider adding data masking for sensitive values
