const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const amount = parseFloat(urlParams.get('amount'));
const method = urlParams.get('method');
const bookingId = urlParams.get('bookingId');

const host = window.location.hostname;          
const protocol = window.location.protocol;

const PAYMENT_BASE = window.location.origin;

const MAIN_BASE = `${protocol}//${host}:8080`;


console.log("Amount:", amount);
console.log("Method:", method);
console.log("Token:", token);
console.log("BookingId:", bookingId);

document.getElementById('display-amount').textContent = `€${amount.toFixed(2)}`;
document.getElementById('display-method').textContent = formatPaymentMethod(method);
document.getElementById('display-token').textContent = token;

function formatPaymentMethod(method) {
    const methods = {
        'CREDIT_CARD': 'Credit Card',
        'PAYPAL': 'PayPal',
        'INVOICE': 'Invoice',
        'ON_SITE': 'Pay On-Site'
    };
    return methods[method] || method;
}

document.getElementById('cancel-btn').addEventListener('click', function () {
    window.location.href = `${MAIN_BASE}/booking/payment/${bookingId}`;
});

document.getElementById('confirm-btn').addEventListener('click', async function () {
    document.getElementById('overview-card').style.display = 'none';
    showResult('processing', 'Processing Payment', 'Please wait...', '');

    try {
        const response = await fetch(`${PAYMENT_BASE}/api/payment/pay`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingId)
        });

        const result = await response.text();
        await sendWebhook(result === "PAYMENT_SUCCESS" ? "SUCCESS" : "FAILURE");

        if (result === "PAYMENT_SUCCESS") {
            showResult('success', 'Payment Successful', 'You can now close this tab.', '');

            if (window.opener && !window.opener.closed) {
                setTimeout(() => {
                    window.opener.location.replace(
                        `${MAIN_BASE}/booking/confirmation/${bookingId}`
                    );
                    window.close();
                }, 1500);
            }
        } else {
            showResult(
                'error',
                'Payment Failed',
                'Your payment could not be completed.',
                'Please try again or choose another payment method.'
            );

            document.getElementById("result-actions").innerHTML = `
        <button class="btn-retry" onclick="location.reload()">Retry</button>
        <button class="btn-redirect" onclick="closeAndReturn()">Try another method</button>
    `;
        }



    } catch (error) {
        console.error("Payment error:", error);

        await sendWebhook("FAILURE");

        showResult('error', 'Service Error', 'Please try again later.', '');

        document.getElementById("result-actions").innerHTML = `
            <button class="btn-retry" onclick="location.reload()">Retry</button>
        `;
    }
});

async function sendWebhook(status) {
    const webhookData = {
        bookingId: bookingId,
        token: token,
        status: status
    };

    try {
        const response = await fetch(`${MAIN_BASE}/api/webhooks/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookData)
        });

        if (!response.ok) {
            console.error('Webhook failed:', response.statusText);
        }
    } catch (error) {
        console.error('Error sending webhook:', error);
    }
}

function showResult(type, title, text, detail) {
    const resultCard = document.getElementById('result-card');
    const resultIcon = document.getElementById('result-icon');
    const resultTitle = document.getElementById('result-title');
    const resultText = document.getElementById('result-text');
    const resultDetail = document.getElementById('result-detail');

    resultIcon.className = `result-icon ${type}`;
    resultTitle.textContent = title;
    resultText.textContent = text;
    resultDetail.textContent = detail;

    resultCard.style.display = 'block';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function closeAndReturn() {
    if (window.opener && !window.opener.closed) {
        window.opener.focus();
    }
    window.close();
}
