const https = require('https');
const express = require("express");
const app = express();
const cors = require("cors");
const mercadopago = require("mercadopago");
const port = process.env.PORT || 3000;

// REPLACE WITH YOUR ACCESS TOKEN AVAILABLE IN: https://developers.mercadopago.com/panel
mercadopago.configure({
	access_token: 'APP_USR-334491433003961-030821-12d7475807d694b645722c1946d5ce5a-725736327', //"TEST-7033352672141865-072112-1dcc4a93344995b15aaa32ddd66d7d3f-333811006",
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
  res.status(200).sendFile("success.html", { root: "./public" });
}); 
app.get("/failure", function (req, res) {
  res.status(200).sendFile("failure.html", { root: "./public" });
}); 
app.get("/pending", function (req, res) {
  res.status(200).sendFile("pending.html", { root: "./public" });
}); 

app.post("/notifications", function (req, res) { // https://www.mercadopago.com.br/developers/pt/docs/notifications/webhooks/webhooks

  // TODO: criar um JSON disso: 
  // ?collection_id=[PAYMENT_ID]&collection_status=approved&external_reference=[EXTERNAL_REFERENCE]&payment_type=credit_card
  // &preference_id=[PREFERENCE_ID]&site_id=[SITE_ID]&processing_mode=aggregator&merchant_account_id=null
  /*
    3) Você precisará desenvolver um receptor de notificação e especificá-lo em
       notification_url. O tratamento correto dessas notificações de pagamento será
       analisado. Será necessário que você nos envie o JSON que recebe na URL de
       notificação, será verificado se corresponde à preferência gerada. 
 */
  const jsonReceiveInURL = req.query;
  console.log('<<<<<<<<<<<<<<< jsonReceiveInURL >>>>>>>>>>>>>>>>\n\n', jsonReceiveInURL,'\n\n');

  res.status(200).json(jsonReceiveInURL);
}); 

// Obter o domínio que está executando a aplicação
var child_process = require("child_process");
child_process.exec("hostname -f", function(err, stdout, stderr) {
  var hostname = stdout.trim();
});

app.post("/create_preference", (req, res) => {
  const MP_DEVICE_SESSION_ID = req.body.MP_DEVICE_SESSION_ID;
  const { payment_methods, payer } = require('./payment-configure/index');
  console.log('\n\n\req.body\n\n', req.body)
  const reqOptions = {
    host: 'api.mercadopago.com',
    path: '/checkout/preferences',
    port: 443,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer APP_USR-334491433003961-030821-12d7475807d694b645722c1946d5ce5a-725736327',
      'X-meli-session-id': MP_DEVICE_SESSION_ID,
      'x-integrator-id': 'dev_24c65fb163bf11ea96500242ac130004',
    }
  };

	let preference = { // Todas as propriedades preenchidas: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/checkout-customization/preferences
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

  const MPRequest = https.request(reqOptions, (MPResponse) => {
    MPResponse.setEncoding('utf8');
    MPResponse.on('data', data => {
      console.log('\n\n\nhttps\n\n', typeof data)
      res.json({
				init_point: JSON.parse(data).init_point
			});
    });
  });
  const strData = JSON.stringify(preference);
  console.log('\n\n\n\n', strData, '\n\n')
  MPRequest.write(strData);
  MPRequest.end();


	// mercadopago.preferences.create(preference, { headers:  { 'X-meli-session-id': MP_DEVICE_SESSION_ID, 'integrator_id': 'dev_24c65fb163bf11ea96500242ac130004' } })
	// 	.then(function (response) {

	// 		res.json({
	// 			init_point: response.body.init_point
	// 		});
	// 	}).catch(function (error) {
	// 		console.log(error);
	// 	});
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
