/**
 * PELBIOT Advanced Reporting Module
 * Comprehensive reporting system with analytics, charts, exports
 * Supports PDF generation, scheduled reports, custom queries
 */

import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Report Generator Class
 */
export class ReportGenerator {
  constructor() {
    this.reports = [];
    this.reportConfigs = {};
  }

  /**
   * Generate PDF Report
   */
  async generatePDFReport(data, fileName = 'report.pdf') {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const outputPath = path.join(__dirname, '..', 'reports', fileName);

        // Ensure reports directory exists
        const reportsDir = path.dirname(outputPath);
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true });
        }

        const stream = fs.createWriteStream(outputPath);

        // Header
        doc.fontSize(20).text('PELBIOT Report', 100, 50);
        doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
        doc.moveTo(50, 100).lineTo(550, 100).stroke();

        // Report Details
        if (data.title) {
          doc.fontSize(16).text(data.title, 50, 120);
        }

        if (data.summary) {
          doc.fontSize(12);
          Object.entries(data.summary).forEach(([key, value], index) => {
            doc.text(`${key}: ${value}`, 50, 160 + index * 20);
          });
        }

        // Data Tables
        let yPosition = 300;
        if (data.tables && Array.isArray(data.tables)) {
          data.tables.forEach(table => {
            doc.fontSize(14).text(table.title, 50, yPosition);
            yPosition += 30;

            // Table header
            const cellWidth = 400 / table.headers.length;
            doc.fontSize(10).font('Helvetica-Bold');

            table.headers.forEach((header, i) => {
              doc.text(header, 50 + i * cellWidth, yPosition, { width: cellWidth - 5 });
            });

            yPosition += 20;

            // Table rows
            doc.font('Helvetica');
            table.rows.forEach(row => {
              row.forEach((cell, i) => {
                doc.text(String(cell), 50 + i * cellWidth, yPosition, { width: cellWidth - 5 });
              });
              yPosition += 20;

              if (yPosition > 700) {
                doc.addPage();
                yPosition = 50;
              }
            });

            yPosition += 20;
          });
        }

        // Charts (as text descriptions for now)
        if (data.charts) {
          yPosition += 20;
          doc.fontSize(12).text('Charts & Visualizations', 50, yPosition);
          yPosition += 20;

          data.charts.forEach(chart => {
            doc.fontSize(10).text(`📊 ${chart.name}`, 50, yPosition);
            yPosition += 15;
          });
        }

        // Footer
        doc.fontSize(9).text('© 2025 PELBIOT. Confidential.', 50, 750, { align: 'center' });

        doc.pipe(stream);
        doc.end();

        stream.on('finish', () => {
          resolve({
            status: 'success',
            message: 'PDF report generated',
            filePath: outputPath,
            fileName
          });
        });

        stream.on('error', reject);
      } catch (error) {
        reject({ status: 'error', message: error.message });
      }
    });
  }

  /**
   * Generate Excel Report
   */
  async generateExcelReport(data, fileName = 'report.xlsx') {
    try {
      const workbook = new ExcelJS.Workbook();
      const reportsDir = path.join(__dirname, '..', 'reports');

      // Ensure reports directory exists
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      // Summary Sheet
      if (data.summary) {
        const summarySheet = workbook.addWorksheet('Summary');
        summarySheet.columns = [
          { header: 'Metric', key: 'metric', width: 30 },
          { header: 'Value', key: 'value', width: 20 }
        ];

        Object.entries(data.summary).forEach(([key, value]) => {
          summarySheet.addRow({ metric: key, value });
        });

        // Style header
        summarySheet.getRow(1).font = { bold: true };
        summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      }

      // Data Tables
      if (data.tables && Array.isArray(data.tables)) {
        data.tables.forEach(table => {
          const sheet = workbook.addWorksheet(table.title.substring(0, 31)); // Max 31 chars

          // Add headers
          const headerRow = sheet.addRow(table.headers);
          headerRow.font = { bold: true };
          headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
          headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

          // Add data rows
          table.rows.forEach(row => {
            sheet.addRow(row);
          });

          // Auto-fit columns
          sheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell?.(cell => {
              const cellLength = String(cell.value).length;
              if (cellLength > maxLength) {
                maxLength = cellLength;
              }
            });
            column.width = Math.min(maxLength + 2, 50);
          });
        });
      }

      const outputPath = path.join(reportsDir, fileName);
      await workbook.xlsx.writeFile(outputPath);

      return {
        status: 'success',
        message: 'Excel report generated',
        filePath: outputPath,
        fileName
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Generate JSON Report
   */
  generateJSONReport(data, fileName = 'report.json') {
    try {
      const reportsDir = path.join(__dirname, '..', 'reports');

      // Ensure reports directory exists
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      const outputPath = path.join(reportsDir, fileName);
      const reportData = {
        generatedAt: new Date().toISOString(),
        generatedBy: 'PELBIOT Report Generator',
        ...data
      };

      fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));

      return {
        status: 'success',
        message: 'JSON report generated',
        filePath: outputPath,
        fileName
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Generate CSV Report
   */
  generateCSVReport(data, fileName = 'report.csv') {
    try {
      const reportsDir = path.join(__dirname, '..', 'reports');

      // Ensure reports directory exists
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }

      let csvContent = '';

      // Summary
      if (data.summary) {
        csvContent += '# SUMMARY\n';
        Object.entries(data.summary).forEach(([key, value]) => {
          csvContent += `${key},${value}\n`;
        });
        csvContent += '\n';
      }

      // Tables
      if (data.tables && Array.isArray(data.tables)) {
        data.tables.forEach(table => {
          csvContent += `# ${table.title}\n`;
          csvContent += table.headers.map(h => `"${h}"`).join(',') + '\n';
          table.rows.forEach(row => {
            csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
          });
          csvContent += '\n';
        });
      }

      const outputPath = path.join(reportsDir, fileName);
      fs.writeFileSync(outputPath, csvContent);

      return {
        status: 'success',
        message: 'CSV report generated',
        filePath: outputPath,
        fileName
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

/**
 * Analytics Engine
 */
export class AnalyticsEngine {
  /**
   * Calculate statistics
   */
  calculateStatistics(data) {
    if (!Array.isArray(data) || data.length === 0) {
      return { error: 'Invalid data' };
    }

    const numbers = data.filter(n => typeof n === 'number');
    const sorted = [...numbers].sort((a, b) => a - b);

    return {
      count: data.length,
      sum: numbers.reduce((a, b) => a + b, 0),
      average: numbers.reduce((a, b) => a + b, 0) / numbers.length,
      median: sorted[Math.floor(sorted.length / 2)],
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      stdDev: this.calculateStdDev(numbers)
    };
  }

  /**
   * Calculate standard deviation
   */
  calculateStdDev(data) {
    const mean = data.reduce((a, b) => a + b) / data.length;
    const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b) / squaredDiffs.length;
    return Math.sqrt(avgSquaredDiff);
  }

  /**
   * Group data by category
   */
  groupByCategory(data, categoryKey) {
    const grouped = {};
    data.forEach(item => {
      const category = item[categoryKey];
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  }

  /**
   * Generate trend data
   */
  generateTrendData(data, dateKey, valueKey, period = 'daily') {
    const grouped = {};

    data.forEach(item => {
      const date = new Date(item[dateKey]);
      let key;

      if (period === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'yearly') {
        key = String(date.getFullYear());
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item[valueKey]);
    });

    // Calculate averages per period
    const trends = [];
    Object.entries(grouped).forEach(([period, values]) => {
      trends.push({
        period,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        total: values.reduce((a, b) => a + b, 0),
        count: values.length
      });
    });

    return trends;
  }
}

/**
 * Report Scheduler
 */
export class ReportScheduler {
  constructor() {
    this.scheduledReports = [];
  }

  /**
   * Schedule recurring report
   */
  scheduleReport(reportConfig, frequency = 'daily') {
    const schedule = {
      id: Math.random().toString(36).substring(7),
      ...reportConfig,
      frequency,
      createdAt: new Date(),
      nextRun: this.calculateNextRun(frequency)
    };

    this.scheduledReports.push(schedule);
    return schedule;
  }

  /**
   * Calculate next run time
   */
  calculateNextRun(frequency) {
    const now = new Date();

    if (frequency === 'hourly') {
      return new Date(now.getTime() + 60 * 60 * 1000);
    } else if (frequency === 'daily') {
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    } else if (frequency === 'weekly') {
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (frequency === 'monthly') {
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }

    return now;
  }

  /**
   * Get all scheduled reports
   */
  getScheduledReports() {
    return this.scheduledReports;
  }

  /**
   * Remove scheduled report
   */
  removeScheduledReport(reportId) {
    const index = this.scheduledReports.findIndex(r => r.id === reportId);
    if (index > -1) {
      this.scheduledReports.splice(index, 1);
      return { status: 'success', message: 'Report removed' };
    }
    return { status: 'error', message: 'Report not found' };
  }
}

const reportingModules = {
  ReportGenerator,
  AnalyticsEngine,
  ReportScheduler
};

export default reportingModules;
