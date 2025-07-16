import { Resend } from 'resend';

let resend: Resend | null = null;

const getResend = () => {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resend = new Resend(apiKey);
  }
  return resend;
};

export interface WinnerEmailData {
  userEmail: string;
  userName: string;
  prizeName: string;
  prizeValue: string;
  phoneNumber: string;
}

export const createWinnerEmailTemplate = (data: WinnerEmailData) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎉 You Won! Claim Your Prize Now!</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f0f2f5;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #2C5CDC 0%, #F76D46 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
        }
        
        .logo-text {
            background: white;
            color: #2C5CDC;
            padding: 15px 30px;
            border-radius: 50px;
            display: inline-block;
            font-size: 24px;
            font-weight: 900;
            margin-bottom: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .logo-flame {
            color: #F76D46;
            font-size: 28px;
        }
        
        .header-title {
            font-size: 36px;
            font-weight: 900;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header-subtitle {
            font-size: 18px;
            color: #FFD700;
            font-weight: 600;
        }
        
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        
        .winner-section {
            margin-bottom: 40px;
        }
        
        .trophy {
            font-size: 60px;
            margin-bottom: 20px;
            display: block;
        }
        
        .winner-title {
            font-size: 32px;
            font-weight: 900;
            color: #2C5CDC;
            margin-bottom: 10px;
        }
        
        .winner-name {
            font-size: 20px;
            color: #666;
            margin-bottom: 30px;
        }
        
        .prize-box {
            background: linear-gradient(135deg, #FFD700 0%, #F76D46 100%);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            color: white;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .prize-label {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 10px;
            color: #2C5CDC;
        }
        
        .prize-name {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .prize-value {
            font-size: 48px;
            font-weight: 900;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .call-section {
            background: #2C5CDC;
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
        }
        
        .call-title {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 15px;
        }
        
        .call-text {
            font-size: 16px;
            margin-bottom: 20px;
            line-height: 1.6;
        }
        
        .phone-button {
            background: linear-gradient(135deg, #FFD700 0%, #F76D46 100%);
            color: #2C5CDC;
            padding: 20px 40px;
            border-radius: 50px;
            text-decoration: none;
            font-size: 28px;
            font-weight: 900;
            display: inline-block;
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
            border: 3px solid white;
            transition: transform 0.3s ease;
        }
        
        .phone-button:hover {
            transform: translateY(-2px);
        }
        
        .urgent-note {
            background: #fff3cd;
            border: 2px solid #FFD700;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 30px;
            color: #856404;
        }
        
        .urgent-title {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 10px;
            color: #F76D46;
        }
        
        .urgent-list {
            text-align: left;
            padding-left: 20px;
        }
        
        .urgent-list li {
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .footer {
            background: #333;
            color: white;
            text-align: center;
            padding: 30px;
        }
        
        .footer-logo {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .footer-text {
            font-size: 14px;
            color: #ccc;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 0 10px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .header-title {
                font-size: 28px;
            }
            
            .winner-title {
                font-size: 24px;
            }
            
            .prize-value {
                font-size: 36px;
            }
            
            .phone-button {
                font-size: 24px;
                padding: 15px 30px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Simple Header -->
        <div class="header">
            <div class="logo-text">
                D<span class="logo-flame">🔥</span>NE FOR YOU PROS
            </div>
            <h1 class="header-title">🎉 CONGRATULATIONS! 🎉</h1>
            <p class="header-subtitle">You Won Our Scratch & Win Game!</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <!-- Winner Section -->
            <div class="winner-section">
                <div class="trophy">🏆</div>
                <h2 class="winner-title">WINNER!</h2>
                <p class="winner-name">Dear ${data.userName},</p>
            </div>
            
            <!-- Prize Box -->
            <div class="prize-box">
                <div class="prize-label">🎁 YOUR PRIZE</div>
                <div class="prize-name">${data.prizeName}</div>
                <div class="prize-value">${data.prizeValue}</div>
            </div>
            
            <!-- Call Section -->
            <div class="call-section">
                <h3 class="call-title">🔥 CLAIM YOUR PRIZE NOW!</h3>
                <p class="call-text">
                    Call us immediately to claim your prize and schedule your installation!
                </p>
                <a href="tel:${data.phoneNumber}" class="phone-button">
                    📞 ${data.phoneNumber}
                </a>
            </div>
            
            <!-- Important Notes -->
            <div class="urgent-note">
                <h3 class="urgent-title">📋 Important Information:</h3>
                <ul class="urgent-list">
                    <li>Have your winning confirmation email ready when you call</li>
                    <li>Prize must be claimed within 30 days of winning</li>
                    <li>Installation scheduled at your convenience</li>
                    <li>All parts and labor included in your prize value</li>
                    <li>Professional installation by certified technicians</li>
                </ul>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-logo">Done For You Pros</div>
            <p class="footer-text">
                Our 20 Connection New Parts Installations Program<br>
                is already Protecting 300,000+ Home Owners nationwide
            </p>
            <p class="footer-text">© 2025 Done For You Pros. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
};

export const sendWinnerEmail = async (data: WinnerEmailData): Promise<boolean> => {
  try {
    const resend = getResend();
    
    // For testing, provide clearer error messages
    console.log('Attempting to send email to:', data.userEmail);
    
    const { data: result, error } = await resend.emails.send({
      from: 'Done For You Pros Winner <winner@amazingworldmedia.com>',
      to: data.userEmail,
      subject: '🎉 YOU WON! Claim Your $591 Prize from Done For You Pros!',
      html: createWinnerEmailTemplate(data),
    });

    if (error) {
      console.error('Error sending winner email:', error);
      // Check if it's a domain verification error
      if (error.message && error.message.includes('domain is not verified')) {
        console.error('Domain verification required. Use onboarding@resend.dev for testing.');
      }
      return false;
    }

    console.log('Winner email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Unexpected error sending winner email:', error);
    return false;
  }
};

export const sendTestEmail = async (testEmail: string): Promise<boolean> => {
  const testData: WinnerEmailData = {
    userEmail: testEmail,
    userName: 'Test Winner',
    prizeName: 'Replace Water Lines & Gas Valves On All Home Appliances',
    prizeValue: '$591',
    phoneNumber: '(310) 295-6355'
  };

  return await sendWinnerEmail(testData);
};