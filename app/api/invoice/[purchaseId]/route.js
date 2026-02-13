import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Simple HTML to PDF conversion (for production, consider using a proper PDF library)
function generateInvoiceHTML(invoiceData) {
  const {
    purchase,
    product,
    buyer,
    seller,
    invoiceNumber,
    invoiceDate,
    dueDate
  } = invoiceData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoiceNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #e5e5e5;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
        }
        .invoice-title {
          font-size: 32px;
          font-weight: bold;
          color: #111;
        }
        .invoice-details {
          text-align: right;
        }
        .invoice-details div {
          margin-bottom: 5px;
        }
        .parties {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .party {
          width: 45%;
        }
        .party-title {
          font-weight: bold;
          margin-bottom: 10px;
          color: #666;
          text-transform: uppercase;
          font-size: 12px;
        }
        .party-info {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th,
        .items-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e5e5;
        }
        .items-table th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #374151;
        }
        .text-right {
          text-align: right;
        }
        .total-section {
          margin-left: 60%;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 5px 0;
        }
        .total-row.final {
          border-top: 2px solid #e5e5e5;
          margin-top: 15px;
          padding-top: 15px;
          font-weight: bold;
          font-size: 18px;
          color: #111;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #e5e5e5;
          font-size: 12px;
          color: #666;
          text-align: center;
        }
        .status-badge {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">MoltMart</div>
          <div style="font-size: 14px; color: #666; margin-top: 5px;">AI Agent Marketplace</div>
        </div>
        <div class="invoice-details">
          <div class="invoice-title">INVOICE</div>
          <div><strong>Invoice #:</strong> ${invoiceNumber}</div>
          <div><strong>Date:</strong> ${invoiceDate}</div>
          <div><strong>Status:</strong> <span class="status-badge">${purchase.status}</span></div>
        </div>
      </div>

      <div class="parties">
        <div class="party">
          <div class="party-title">Bill To</div>
          <div class="party-info">
            <div><strong>${buyer.name}</strong></div>
            <div>${buyer.email}</div>
            <div>Customer ID: ${buyer.id.slice(0, 8)}...</div>
          </div>
        </div>
        <div class="party">
          <div class="party-title">Sold By</div>
          <div class="party-info">
            <div><strong>${seller.name}</strong></div>
            <div>${seller.email}</div>
            <div>Seller ID: ${seller.id.slice(0, 8)}...</div>
          </div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Description</th>
            <th>Quantity</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${product.title}</strong><br>
              <small>ID: ${product.id}</small>
            </td>
            <td>${product.description ? product.description.slice(0, 100) + '...' : 'No description'}</td>
            <td>1</td>
            <td class="text-right">$${purchase.amount}</td>
            <td class="text-right">$${purchase.amount}</td>
          </tr>
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-row">
          <span>Subtotal:</span>
          <span>$${purchase.amount}</span>
        </div>
        <div class="total-row">
          <span>Tax:</span>
          <span>$0.00</span>
        </div>
        <div class="total-row final">
          <span>Total:</span>
          <span>$${purchase.amount} ${purchase.currency ? purchase.currency.toUpperCase() : 'USD'}</span>
        </div>
      </div>

      <div class="footer">
        <p><strong>Thank you for your business!</strong></p>
        <p>This is a digital receipt for your purchase on MoltMart.</p>
        <p>Questions? Contact us at support@moltmart.com</p>
        <p>Generated on ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;
}

export async function GET(request, { params }) {
  try {
    const { purchaseId } = params;

    if (!purchaseId) {
      return NextResponse.json(
        { error: 'Purchase ID is required' },
        { status: 400 }
      );
    }

    // Get purchase details with related data
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .select(`
        *,
        products (
          id,
          title,
          description,
          price,
          currency,
          category
        ),
        buyer:profiles!buyer_id (
          id,
          name,
          email
        ),
        seller:profiles!seller_id (
          id,
          name,
          email
        )
      `)
      .eq('id', purchaseId)
      .eq('status', 'completed') // Only allow invoices for completed purchases
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json(
        { error: 'Purchase not found or not completed' },
        { status: 404 }
      );
    }

    // Generate invoice data
    const invoiceNumber = `MM-${purchase.created_at.slice(0, 4)}-${purchaseId.slice(0, 8).toUpperCase()}`;
    const invoiceDate = new Date(purchase.created_at).toLocaleDateString();
    const dueDate = new Date(purchase.created_at).toLocaleDateString(); // Immediate for digital products

    const invoiceData = {
      purchase,
      product: purchase.products,
      buyer: purchase.buyer,
      seller: purchase.seller,
      invoiceNumber,
      invoiceDate,
      dueDate
    };

    // Generate HTML invoice
    const htmlContent = generateInvoiceHTML(invoiceData);

    // For now, return HTML (in production, you'd convert to PDF using puppeteer or similar)
    // This approach allows users to print to PDF from their browser
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="invoice-${invoiceNumber}.html"`
      }
    });

    // Alternative: Return JSON data for client-side PDF generation
    // return NextResponse.json(invoiceData);

  } catch (error) {
    console.error('Invoice generation failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Invoice generation failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}