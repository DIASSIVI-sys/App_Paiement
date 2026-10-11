const { randomUUID } = require("crypto");

async function createPayment({ name, phone, provider, amount }) {
  const response = await fetch(
    `${process.env.OPENPAY_BASE_URL}/v1/transaction/payment`,
    {
      method: "POST",
      headers: {
        "XO-API-KEY": process.env.OPENPAY_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount,
        payment_phone_number: phone,
        provider,
        customer_external_id: randomUUID(),
        customer: { name, phone },
      }),
      signal: AbortSignal.timeout(60000),
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("OpenPay a répondu :", response.status, data);
    const err = new Error(
      data.message || data.error || `Erreur OpenPay (${response.status})`,
    );
    err.status = response.status;
    throw err;
  }

  return data;
}

async function getPaymentStatus(reference) {
  const response = await fetch(
    `${process.env.OPENPAY_BASE_URL}/v1/transaction/status/${encodeURIComponent(reference)}`,
    {
      headers: {
        "XO-API-KEY": process.env.OPENPAY_API_KEY,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("OpenPay (statut) :", response.status, data);
    const err = new Error(
      data.message || data.error || `Erreur OpenPay (${response.status})`,
    );
    err.status = response.status;
    throw err;
  }

  return data;
}

module.exports = { createPayment, getPaymentStatus };