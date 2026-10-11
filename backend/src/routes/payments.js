const router = require("express").Router();
const {
  createPayment,
  getPaymentStatus,
} = require("../services/paymentServices");

router.post("/", async (req, res) => {
  const { name, phone, provider, amount } = req.body;
  const errors = {};
  if (!name?.trim()) errors.name = "Nom obligatoire";
  if (!/^242\d{9}$/.test(phone ?? "")) errors.phone = "Format 242XXXXXXXXX";
  if (!["MTN", "AIRTEL"].includes(provider)) errors.provider = "Opérateur invalide";
  if (!(Number(amount) > 0)) errors.amount = "Montant invalide";
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  try {
    const result = await createPayment({
      name: name.trim(),
      phone,
      provider,
      amount: Number(amount),
    });
    res.status(201).json(result);
  } catch (err) {
    if (err.name === "TimeoutError") {
      return res.status(504).json({
        error:
          "OpenPay met du temps à répondre. Le paiement a peut-être été initié : vérifie ton téléphone avant de réessayer.",
      });
    }
    console.error(err.cause || err);
    res.status(err.status || 502).json({ error: err.message });
  }
});

router.get("/:reference", async (req, res) => {
  const { reference } = req.params;
  if (!/^[A-Za-z0-9]+$/.test(reference)) {
    return res.status(400).json({ error: "Référence invalide" });
  }
  try {
    res.json(await getPaymentStatus(reference));
  } catch (err) {
    res.status(err.status || 502).json({ error: err.message });
  }
});

module.exports = router;