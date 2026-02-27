import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface IncomeRecord {
  id: string;
  source: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'received' | 'pending';
  paymentMode: string;
}

interface ExpenseRecord {
  id: string;
  category: string;
  vendor: string;
  description: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending';
  paymentMode: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  registrationLink: string;
  status: 'draft' | 'published';
  createdAt: string;
  maxParticipants?: number;
  category: string;
  bannerImage?: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  type: 'news' | 'alert' | 'update' | 'general';
  status: 'draft' | 'published';
  createdAt: string;
  expiryDate?: string;
  registrationLink?: string;
}

interface BalanceSheetItem {
  category: string;
  label: string;
  amount: number;
  paymentMode: string;
  type: 'income' | 'expense';
}

interface MemberAccount {
  id: string;
  member_id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  date_joined?: string;
  expiry_date?: string;
  company_name?: string;
  job_title?: string;
  visa_status?: string;
  country: string;
  emirate: string;
}

interface PendingMemberApplication {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  jobTitle: string;
  applicationDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

type ReportData = IncomeRecord[] | ExpenseRecord[] | Event[] | Announcement[] | BalanceSheetItem[] | MemberAccount[] | PendingMemberApplication[];

// Download as CSV
export const downloadAsCSV = (
  data: any[],
  filename: string,
  columns: string[]
) => {
  if (!data || data.length === 0) {
    alert('No data to download');
    return;
  }

  // Create CSV header
  const headers = columns.join(',');
  
  // Create CSV rows
  const rows = data.map(record => {
    return columns.map(col => {
      const value = record[col];
      // Escape quotes and wrap in quotes if contains comma
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};

// Download as Excel
export const downloadAsExcel = (
  data: any[],
  filename: string,
  sheetName: string = 'Report',
  columns?: string[]
) => {
  if (!data || data.length === 0) {
    alert('No data to download');
    return;
  }

  // Prepare data for Excel
  const worksheetData = data.map((record: any) => {
    if (columns) {
      return columns.reduce((acc: any, col) => {
        acc[col] = record[col];
        return acc;
      }, {});
    }
    return record;
  });

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Set column widths
  const colWidths = columns?.map(() => 15) || Object.keys(data[0]).map(() => 15);
  worksheet['!cols'] = colWidths.map(width => ({ wch: width }));

  // Write file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Download as PDF
export const downloadAsPDF = (
  data: any[],
  filename: string,
  title: string,
  columns: { key: string; label: string }[]
) => {
  if (!data || data.length === 0) {
    alert('No data to download');
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add title
  doc.setFontSize(16);
  doc.text(title, pageWidth / 2, 15, { align: 'center' });

  // Add timestamp
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
    pageWidth / 2,
    22,
    { align: 'center' }
  );

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Prepare table data
  const tableData = data.map((record: any) =>
    columns.map((col) => {
      const value = record[col.key];
      if (col.key === 'amount') {
        return typeof value === 'number' ? `AED ${value.toLocaleString()}` : value;
      }
      if (col.key === 'date' || col.key === 'createdAt' || col.key === 'expiryDate') {
        return new Date(value).toLocaleDateString();
      }
      return value || '-';
    })
  );

  // Add table using jspdf-autotable
  autoTable(doc, {
    head: [columns.map((col) => col.label)],
    body: tableData,
    startY: 30,
    theme: 'grid',
    styles: {
      cellPadding: 8,
      font: 'helvetica',
      fontSize: 11,
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { halign: 'left' },
    },
  });

  // Save the PDF
  doc.save(`${filename}.pdf`);
};

// Download Income Report
export const downloadIncomeReport = (
  data: IncomeRecord[],
  format: 'csv' | 'excel' | 'pdf'
) => {
  const filename = `Income_Report_${new Date().toISOString().split('T')[0]}`;
  const columns = ['id', 'source', 'category', 'amount', 'date', 'paymentMode', 'status'];
  const columnLabels = [
    { key: 'id', label: 'ID' },
    { key: 'source', label: 'Source' },
    { key: 'category', label: 'Category' },
    { key: 'amount', label: 'Amount' },
    { key: 'date', label: 'Date' },
    { key: 'paymentMode', label: 'Payment Mode' },
    { key: 'status', label: 'Status' },
  ];

  if (format === 'csv') {
    downloadAsCSV(data, filename, columns);
  } else if (format === 'excel') {
    downloadAsExcel(data, filename, 'Income Records', columns);
  } else if (format === 'pdf') {
    downloadAsPDF(data, filename, 'Income Report (This Week)', columnLabels);
  }
};

// Download Expense Report
export const downloadExpenseReport = (
  data: ExpenseRecord[],
  format: 'csv' | 'excel' | 'pdf'
) => {
  const filename = `Expense_Report_${new Date().toISOString().split('T')[0]}`;
  const columns = ['id', 'category', 'vendor', 'amount', 'date', 'paymentMode', 'status'];
  const columnLabels = [
    { key: 'id', label: 'ID' },
    { key: 'category', label: 'Category' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'amount', label: 'Amount' },
    { key: 'date', label: 'Date' },
    { key: 'paymentMode', label: 'Payment Mode' },
    { key: 'status', label: 'Status' },
  ];

  if (format === 'csv') {
    downloadAsCSV(data, filename, columns);
  } else if (format === 'excel') {
    downloadAsExcel(data, filename, 'Expense Records', columns);
  } else if (format === 'pdf') {
    downloadAsPDF(data, filename, 'Expense Report', columnLabels);
  }
};

// Download Events Report
export const downloadEventsReport = (
  data: Event[],
  format: 'csv' | 'excel' | 'pdf'
) => {
  const filename = `Events_Report_${new Date().toISOString().split('T')[0]}`;
  const columns = ['id', 'title', 'date', 'time', 'location', 'category', 'status'];
  const columnLabels = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'location', label: 'Location' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status' },
  ];

  if (format === 'csv') {
    downloadAsCSV(data, filename, columns);
  } else if (format === 'excel') {
    downloadAsExcel(data, filename, 'Events', columns);
  } else if (format === 'pdf') {
    downloadAsPDF(data, filename, 'Events Report', columnLabels);
  }
};

// Download Announcements Report
export const downloadAnnouncementsReport = (
  data: Announcement[],
  format: 'csv' | 'excel' | 'pdf'
) => {
  const filename = `Announcements_Report_${new Date().toISOString().split('T')[0]}`;
  const columns = ['id', 'title', 'type', 'priority', 'status', 'createdAt'];
  const columnLabels = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Title' },
    { key: 'type', label: 'Type' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created' },
  ];

  if (format === 'csv') {
    downloadAsCSV(data, filename, columns);
  } else if (format === 'excel') {
    downloadAsExcel(data, filename, 'Announcements', columns);
  } else if (format === 'pdf') {
    downloadAsPDF(data, filename, 'Announcements Report', columnLabels);
  }
};

// Download Balance Sheet Report
export const downloadBalanceSheetReport = (
  assets: BalanceSheetItem[],
  liabilities: BalanceSheetItem[],
  format: 'csv' | 'excel' | 'pdf'
) => {
  const filename = `Balance_Sheet_Report_${new Date().toISOString().split('T')[0]}`;

  // Combine assets and liabilities for export
  const allItems = [
    ...assets.map(item => ({ ...item, section: 'Assets' })),
    ...liabilities.map(item => ({ ...item, section: 'Liabilities' }))
  ];

  const columns = ['section', 'category', 'label', 'amount', 'paymentMode', 'type'];
  const columnLabels = [
    { key: 'section', label: 'Section' },
    { key: 'category', label: 'Category' },
    { key: 'label', label: 'Description' },
    { key: 'amount', label: 'Amount' },
    { key: 'paymentMode', label: 'Payment Mode' },
    { key: 'type', label: 'Type' },
  ];

  if (format === 'csv') {
    downloadAsCSV(allItems, filename, columns);
  } else if (format === 'excel') {
    downloadAsExcel(allItems, filename, 'Balance Sheet', columns);
  } else if (format === 'pdf') {
    downloadAsPDF(allItems, filename, 'Balance Sheet Report', columnLabels);
  }
};

// Download Membership Report
export const downloadMembershipReport = (
  data: MemberAccount[],
  format: 'csv' | 'excel' | 'pdf'
) => {
  const filename = `Membership_Report_${new Date().toISOString().split('T')[0]}`;
  const columns = ['id', 'full_name', 'email', 'phone', 'company_name', 'job_title', 'visa_status', 'date_joined', 'expiry_date'];
  const columnLabels = [
    { key: 'id', label: 'ID' },
    { key: 'full_name', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'company_name', label: 'Company' },
    { key: 'job_title', label: 'Job Title' },
    { key: 'visa_status', label: 'Visa Status' },
    { key: 'date_joined', label: 'Date Joined' },
    { key: 'expiry_date', label: 'Expiry Date' },
  ];

  if (format === 'csv') {
    downloadAsCSV(data, filename, columns);
  } else if (format === 'excel') {
    downloadAsExcel(data, filename, 'Membership', columns);
  } else if (format === 'pdf') {
    downloadAsPDF(data, filename, 'Membership Report', columnLabels);
  }
};

// Download Approvals Report
export const downloadApprovalsReport = (
  data: PendingMemberApplication[],
  format: 'csv' | 'excel' | 'pdf'
) => {
  const filename = `Approvals_Report_${new Date().toISOString().split('T')[0]}`;
  const columns = ['id', 'fullName', 'email', 'companyName', 'jobTitle', 'applicationDate', 'status'];
  const columnLabels = [
    { key: 'id', label: 'ID' },
    { key: 'fullName', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'companyName', label: 'Company' },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'applicationDate', label: 'Application Date' },
    { key: 'status', label: 'Status' },
  ];

  if (format === 'csv') {
    downloadAsCSV(data, filename, columns);
  } else if (format === 'excel') {
    downloadAsExcel(data, filename, 'Approvals', columns);
  } else if (format === 'pdf') {
    downloadAsPDF(data, filename, 'Approvals Report', columnLabels);
  }
};
