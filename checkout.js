(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────────────────
  var STRIPE_PK = 'pk_test_REPLACE_WITH_YOUR_PUBLISHABLE_KEY';

  // ── Cart ────────────────────────────────────────────────────────────────────
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem('coded_cart') || '[]'); } catch (e) { cart = []; }

  if (!cart.length) {
    window.location.href = 'product.html';
    return;
  }

  // ── Fade in ──────────────────────────────────────────────────────────────────
  document.body.style.transition = 'opacity 0.4s';
  document.body.style.opacity = '1';

  // ── Render order summary ─────────────────────────────────────────────────────
  var itemsEl     = document.getElementById('checkoutItems');
  var subtotalEl  = document.getElementById('checkoutSubtotal');
  var totalEl     = document.getElementById('checkoutTotal');

  var total = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);

  itemsEl.innerHTML = cart.map(function (item) {
    return '<div class="co-item">' +
      '<div class="co-item-info">' +
        '<div class="co-item-name">' + item.name + '</div>' +
        '<div class="co-item-meta">' + item.colorway + ' &nbsp;·&nbsp; SIZE_' + item.size +
          (item.qty > 1 ? ' &nbsp;·&nbsp; QTY_' + item.qty : '') + '</div>' +
      '</div>' +
      '<div class="co-item-price">$' + (item.price * item.qty) + '</div>' +
    '</div>';
  }).join('');

  subtotalEl.textContent = '$' + total;
  totalEl.textContent    = '$' + total;

  // ── Stripe setup ─────────────────────────────────────────────────────────────
  var stripe   = Stripe(STRIPE_PK);
  var elements = stripe.elements();

  var cardStyle = {
    base: {
      color: '#e8e8e8',
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: '11px',
      letterSpacing: '0.08em',
      '::placeholder': { color: '#444' },
      iconColor: '#2dd47f',
    },
    invalid: { color: '#ff4d4d', iconColor: '#ff4d4d' },
  };

  var card = elements.create('card', { style: cardStyle, hidePostalCode: true });
  card.mount('#card-element');

  card.on('change', function (e) {
    var errEl = document.getElementById('card-errors');
    errEl.textContent = e.error ? e.error.message : '';
  });

  // ── Form submit ───────────────────────────────────────────────────────────────
  var form      = document.getElementById('checkoutForm');
  var submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var firstName = document.getElementById('firstName').value.trim();
    var lastName  = document.getElementById('lastName').value.trim();
    var email     = document.getElementById('email').value.trim();
    var address   = document.getElementById('address').value.trim();
    var city      = document.getElementById('city').value.trim();
    var postal    = document.getElementById('postal').value.trim();
    var country   = document.getElementById('country').value.trim();

    var errEl = document.getElementById('card-errors');
    if (!firstName || !lastName || !email || !address || !city || !postal || !country) {
      errEl.textContent = 'PLEASE FILL IN ALL REQUIRED FIELDS.';
      return;
    }

    submitBtn.textContent = '[PROCESSING...]';
    submitBtn.disabled    = true;
    errEl.textContent     = '';

    var amountCents = total * 100;

    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amountCents }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.error) throw new Error(data.error);
        return stripe.confirmCardPayment(data.clientSecret, {
          payment_method: {
            card: card,
            billing_details: {
              name: firstName + ' ' + lastName,
              email: email,
              address: { line1: address, city: city, postal_code: postal, country: country },
            },
          },
        });
      })
      .then(function (result) {
        if (result.error) {
          errEl.textContent     = result.error.message;
          submitBtn.textContent = '[COMPLETE ORDER]';
          submitBtn.disabled    = false;
        } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          // Clear cart
          try { localStorage.removeItem('coded_cart'); } catch (e) {}

          // Show success
          document.getElementById('checkoutFormState').style.display = 'none';
          var successEl = document.getElementById('checkoutSuccess');
          successEl.style.display = 'flex';
          document.getElementById('successEmail').textContent = email;
          document.getElementById('successRef').textContent =
            '[REF_' + result.paymentIntent.id.slice(-8).toUpperCase() + ']';
        }
      })
      .catch(function (err) {
        var errEl = document.getElementById('card-errors');
        errEl.textContent     = err.message || 'SOMETHING WENT WRONG. PLEASE TRY AGAIN.';
        submitBtn.textContent = '[COMPLETE ORDER]';
        submitBtn.disabled    = false;
      });
  });
})();
