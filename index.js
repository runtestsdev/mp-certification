const express = require("express");
const app = express();
const cors = require("cors");
const mercadopago = require("mercadopago");
const port = process.env.PORT || 3000;

mercadopago.configure({
	access_token: 'APP_USR-334491433003961-030821-12d7475807d694b645722c1946d5ce5a-725736327',
  integrator_id: 'dev_24c65fb163bf11ea96500242ac130004'
});  

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(express.static("./public"));

app.get("/", function (req, res) {
  res.status(200).sendFile("index.html", { root: "./public" });
}); 

app.get("/success", function (req, res) {
  const jsonReceiveInURL = req.query;
  console.log('\n\n<<<<<<< Informação da rota "/success" >>>>>>>\n', jsonReceiveInURL);
  res.status(200).sendFile("success.html", { root: "./public" });
}); 
app.get("/failure", function (req, res) {
  const jsonReceiveInURL = req.query;
  console.log('\n\n<<<<<<< Informação da rota "/failure" >>>>>>>\n', jsonReceiveInURL);
  res.status(200).sendFile("failure.html", { root: "./public" });
}); 
app.get("/pending", function (req, res) {
  const jsonReceiveInURL = req.query;
  console.log('\n\n<<<<<<< Informação da rota "/pending" >>>>>>>\n', jsonReceiveInURL);
  res.status(200).sendFile("pending.html", { root: "./public" });
}); 

app.post("/notifications", function (req, res) { // https://www.mercadopago.com.br/developers/pt/docs/notifications/webhooks/webhooks
  /*
    3) Você precisará desenvolver um receptor de notificação e especificá-lo em
       notification_url. O tratamento correto dessas notificações de pagamento será
       analisado. Será necessário que você nos envie o JSON que recebe na URL de
       notificação, será verificado se corresponde à preferência gerada. 
 */
  const jsonReceiveInURL = req.query;
  console.log('\n\n<<<<<<< Informação da rota "/notifications" >>>>>>>\n', jsonReceiveInURL);
  res.status(200).json(jsonReceiveInURL);
}); 

app.post("/create_preference", (req, res) => {
  const MP_DEVICE_SESSION_ID = req.body.MP_DEVICE_SESSION_ID;
  const { payment_methods, payer } = require('./payment-configure/index');
	const preference = { // Todas as propriedades preenchidas: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/checkout-customization/preferences
		"items": [
			{
				id: req.body.id,
				title: req.body.title,
				picture_url: req.body.picture_url,
				description: req.body.description,
				quantity: Number(req.body.quantity),
				unit_price: Number(req.body.price),
        currency_id: "BRL",
			}
		],
		"back_urls": {
			"success": 'https://mpago-certification.herokuapp.com/success', //"https://webhook.site/16ebe948-048a-4563-9c55-b24f72d92fcb/success", //"http://localhost:8080/feedback",
			"failure": 'https://mpago-certification.herokuapp.com/failure', //"https://webhook.site/16ebe948-048a-4563-9c55-b24f72d92fcb/failure", //"http://localhost:8080/feedback",
			"pending": 'https://mpago-certification.herokuapp.com/pending' // "https://webhook.site/16ebe948-048a-4563-9c55-b24f72d92fcb/pending", //"http://localhost:8080/feedback"
		},
    "payer": payer,
    "payment_methods": { ...payment_methods },
		"auto_return": "approved",
    "external_reference": "mrgenesis@hotmail.com",
    "notification_url": 'https://mpago-certification.herokuapp.com/notifications' //"https://webhook.site/16ebe948-048a-4563-9c55-b24f72d92fcb/notifications",
	};
  
	mercadopago.preferences.create(preference, { headers:  { 'X-meli-session-id': MP_DEVICE_SESSION_ID } })
		.then(function (response) {
      console.log('<<<<<<< Informação da "response" da preferência >>>>>>>', response);
			res.json({
				init_point: response.body.init_point
			});
		}).catch(function (error) {
			console.log(error);
		});
    console.log('<<<<<<< Informação do "header" da requisição >>>>>>>', {
      'user-agent': 'MercadoPago Node.js SDK v1.5.8 (node v17.7.2-x64-linux)',
      'x-product-id': 'bc32b6ntrpp001u8nhkg',
      'x-tracking-id': 'platform:v17|v17.7.2,type:SDK1.5.8,so;',
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: 'Bearer APP_USR-334491433003961-030821-12d7475807d694b645722c1946d5ce5a-725736327',
      'x-integrator-id': 'dev_24c65fb163bf11ea96500242ac130004',
      'X-meli-session-id': MP_DEVICE_SESSION_ID
    })
    console.log('<<<<<<< Informação da "preference" >>>>>>>', preference);
});

app.get('/feedback', function(req, res) {
	res.json({
		Payment: req.query.payment_id,
		Status: req.query.status,
		MerchantOrder: req.query.merchant_order_id
	});
});

app.listen(port, () => {
  console.log(`The server is now running on Port ${port}`);
});
