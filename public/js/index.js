// Add SDK credentials
// REPLACE WITH YOUR PUBLIC KEY AVAILABLE IN: https://developers.mercadopago.com/panel
const mercadopago = new MercadoPago('TEST-36e4bd92-d3a8-49b5-979b-18c9be51c2f0', {
  locale: 'pt-BR' // The most common are: 'pt-BR', 'es-AR' and 'en-US'
});

const fakeProduct = {
  id: '1234',
  title: 'Celular',
  picture_url: `${document.location.origin}/img/product.png`,
  description: 'Celular de Tienda e-commerce',
  quantity: 1,
  price: 10
};
const fakePayer = {
  name: 'Lalo',  
  "surname": "Landa",
  email: 'est_user_92801501@testuser.com',
  "phone": {
    area_code: '55',
    number: '98529-8743'
  },
  "identification": {
    type: 'CPF',
    number: '19119119100'
  },
  "address": {
    street_name: 'falsa',
    street_number: 123,
    zip_code: '78134-190'
  }
};

// Handle call to backend and generate preference.
document.getElementById("checkout-btn").addEventListener("click", function() {

  $('#checkout-btn').attr("disabled", true);
  /* TODO: gerar a preferência de pagamento, você deve:
  [] Enviar as informações do item que está sendo adquirido.
  [] Enviar os detalhes do pagador.
  [] Enviar o URL onde as notificações de pagamento serão recebidas.
  [] Enviar o número do pedido (external_reference)
  [] Limitar a quantidade de parcelas conforme solicitado.
  [] Não oferecer o meio de pagamento solicitado
  */
  const orderData = {
    ...fakeProduct,
    quantity: document.getElementById("quantity").value,
    description: document.getElementById("product-description").innerHTML,
    price: document.getElementById("unit-price").innerHTML,
    MP_DEVICE_SESSION_ID: window.MP_DEVICE_SESSION_ID
  };
    
  fetch("/create_preference", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
    .then(function(response) {
        return response.json();
    })
    .then(function(preference) {
        // createCheckoutButton(preference.id); processar os pagamentos no momínio do cliente

        window.location.href = preference.init_point;
        
        $(".shopping-cart").fadeOut(500);
        setTimeout(() => {
            $(".container_payment").show(500).fadeIn();
        }, 500);
    })
    .catch(function() {
        alert("Unexpected error");
        $('#checkout-btn').attr("disabled", false);
    });
});


// ---------------------------------------------------- Usar esse bloco para processar os pagamentos no momínio do cliente ----------------------------
// Create preference when click on checkout button
// function createCheckoutButton(preferenceId) {
//   // Initialize the checkout
//   mercadopago.checkout({
//     preference: {
//       id: preferenceId
//     },
//     render: {
//       container: '#button-checkout', // Class name where the payment button will be displayed
//       label: 'Pague a compra', // Change the payment button text (optional)
//     }
//   });
// }
// ------------------------------ fim -------------------------------------

// Handle price update
function updatePrice() {
  let quantity = document.getElementById("quantity").value;
  let unitPrice = document.getElementById("unit-price").innerHTML;
  let amount = parseInt(unitPrice) * parseInt(quantity);

  document.getElementById("cart-total").innerHTML = "$ " + amount;
  document.getElementById("summary-price").innerHTML = "$ " + unitPrice;
  document.getElementById("summary-quantity").innerHTML = quantity;
  document.getElementById("summary-total").innerHTML = "$ " + amount;
}

document.getElementById("quantity").addEventListener("change", updatePrice);
updatePrice();  

// Go back
document.getElementById("go-back").addEventListener("click", function() {
  $(".container_payment").fadeOut(500);
  setTimeout(() => {
      $(".shopping-cart").show(500).fadeIn();
  }, 500);
  $('#checkout-btn').attr("disabled", false);  
});