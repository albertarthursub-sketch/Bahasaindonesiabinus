import { useState } from 'react';

export default function StudentCodeCardPrinter({ classId, className, students }) {
  const [cardsPerPage, setCardsPerPage] = useState(6); // 3 rows x 2 columns
  const [cardSize, setCardSize] = useState('large'); // small, medium, large
  const [showPreview, setShowPreview] = useState(false);

  const cardSizes = {
    small: { width: '3in', height: '2in', fontSize: '14px', codeSize: '24px' },
    medium: { width: '4in', height: '2.5in', fontSize: '16px', codeSize: '32px' },
    large: { width: '5in', height: '3in', fontSize: '18px', codeSize: '48px' }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    // Create a new print window
    const printWindow = window.open('', '', 'width=800,height=600');
    const size = cardSizes[cardSize];
    
    const html = `
      <html>
        <head>
          <title>Student Code Cards - ${className}</title>
          <style>
            @page {
              margin: 0.5in;
              size: letter;
            }
            
            body {
              margin: 0;
              padding: 0.5in;
              font-family: 'Arial', sans-serif;
              background: white;
            }
            
            .page-header {
              text-align: center;
              margin-bottom: 0.3in;
              border-bottom: 2px solid #333;
              padding-bottom: 0.1in;
            }
            
            .page-header h1 {
              margin: 0;
              font-size: 20px;
              color: #333;
            }
            
            .page-header p {
              margin: 5px 0 0 0;
              font-size: 12px;
              color: #666;
            }
            
            .cards-container {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 0.3in;
              margin-top: 0.3in;
            }
            
            .code-card {
              width: ${size.width};
              height: ${size.height};
              border: 2px solid #0066cc;
              border-radius: 8px;
              padding: 0.25in;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              page-break-inside: avoid;
              position: relative;
              overflow: hidden;
            }
            
            .code-card::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -50%;
              width: 100%;
              height: 100%;
              background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
              pointer-events: none;
            }
            
            .card-content {
              position: relative;
              z-index: 1;
              display: flex;
              flex-direction: column;
              height: 100%;
              justify-content: space-between;
            }
            
            .card-header {
              text-align: center;
            }
            
            .school-name {
              font-size: 10px;
              color: #666;
              margin: 0;
              font-weight: 500;
            }
            
            .class-name {
              font-size: ${size.fontSize};
              font-weight: bold;
              color: #0066cc;
              margin: 2px 0 0 0;
            }
            
            .card-body {
              text-align: center;
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            
            .student-name {
              font-size: ${size.fontSize};
              font-weight: 600;
              color: #333;
              margin-bottom: 0.1in;
              word-break: break-word;
            }
            
            .code-label {
              font-size: 11px;
              color: #666;
              margin-bottom: 3px;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .login-code {
              font-size: ${size.codeSize};
              font-weight: bold;
              color: #0066cc;
              font-family: 'Courier New', monospace;
              letter-spacing: 4px;
              margin: 0;
              font-style: italic;
            }
            
            .card-footer {
              text-align: center;
              font-size: 9px;
              color: #999;
            }
            
            .cut-line {
              border-top: 1px dashed #ccc;
              margin: 0.1in 0;
            }
            
            @media print {
              body {
                margin: 0;
                padding: 0.3in;
              }
              
              .page-header {
                margin-bottom: 0.2in;
              }
              
              .cards-container {
                gap: 0.2in;
              }
              
              .code-card {
                box-shadow: none;
                border: 2px solid #0066cc;
              }
            }
          </style>
        </head>
        <body>
          <div class="page-header">
            <h1>Student Login Code Cards</h1>
            <p><strong>${className}</strong></p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="cards-container">
            ${students.map(student => `
              <div class="code-card">
                <div class="card-content">
                  <div class="card-header">
                    <p class="school-name">Bahasa Learning Platform</p>
                    <p class="class-name">${className}</p>
                  </div>
                  
                  <div class="card-body">
                    <p class="student-name">${student.name}</p>
                    <p class="code-label">Login Code</p>
                    <p class="login-code">${student.loginCode || 'N/A'}</p>
                  </div>
                  
                  <div class="card-footer">
                    <p>Scan or enter code to login</p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
  };

  if (!students || students.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-100 rounded-lg">
        <p className="text-gray-600">No students to print. Add students to the class first.</p>
      </div>
    );
  }

  const size = cardSizes[cardSize];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <h3 className="font-bold text-lg mb-4">Print Student Code Cards</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Card Size</label>
            <select
              value={cardSize}
              onChange={(e) => setCardSize(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="small">Small (3" × 2")</option>
              <option value="medium">Medium (4" × 2.5")</option>
              <option value="large">Large (5" × 3")</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Cards per Page</label>
            <select
              value={cardsPerPage}
              onChange={(e) => setCardsPerPage(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2}>2 cards</option>
              <option value={4}>4 cards</option>
              <option value={6}>6 cards</option>
              <option value={8}>8 cards</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn btn-blue flex-1"
          >
            {showPreview ? '✕ Hide Preview' : '👁️ Preview'}
          </button>
          <button
            onClick={handlePrint}
            className="btn btn-green flex-1"
          >
            🖨️ Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="btn btn-cyan flex-1"
          >
            📥 Download PDF
          </button>
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h4 className="font-bold text-md mb-4">Preview ({students.length} cards)</h4>
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }}
          >
            {students.slice(0, 6).map((student, index) => (
              <div
                key={index}
                style={{
                  width: size.width === '3in' ? '150px' : size.width === '4in' ? '200px' : '250px',
                  height: size.width === '3in' ? '100px' : size.width === '4in' ? '125px' : '150px',
                  border: '2px solid #0066cc',
                  borderRadius: '8px',
                  padding: '8px',
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontSize: size.fontSize,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={{ textAlign: 'center', fontSize: '10px', color: '#666' }}>
                  <p style={{ margin: '0' }}>Bahasa Learning Platform</p>
                  <p style={{ margin: '0', fontWeight: 'bold', color: '#0066cc' }}>{className}</p>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <p style={{ margin: '4px 0', fontWeight: '600', color: '#333' }}>
                    {student.name}
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '9px', color: '#666' }}>
                    Login Code
                  </p>
                  <p style={{ 
                    margin: '0', 
                    fontFamily: 'Courier New, monospace',
                    fontWeight: 'bold',
                    color: '#0066cc',
                    fontSize: size.codeSize,
                    letterSpacing: '2px'
                  }}>
                    {student.loginCode || 'N/A'}
                  </p>
                </div>
                
                <p style={{ textAlign: 'center', fontSize: '8px', color: '#999', margin: '0' }}>
                  Scan or enter code
                </p>
              </div>
            ))}
          </div>
          {students.length > 6 && (
            <p className="text-gray-600 mt-4 text-sm">
              +{students.length - 6} more cards will print on next pages
            </p>
          )}
        </div>
      )}
    </div>
  );
}
