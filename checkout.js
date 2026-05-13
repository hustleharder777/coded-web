(function () {
  'use strict';

  var STRIPE_PK = 'pk_test_REPLACE_WITH_YOUR_PUBLISHABLE_KEY';

  // ── Cart ─────────────────────────────────────────────────────────────────────
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem('coded_cart') || '[]'); } catch (e) { cart = []; }

  if (!cart.length) {
    window.location.href = 'product.html';
    return;
  }

  // ── Fade in ───────────────────────────────────────────────────────────────────
  document.body.style.transition = 'opacity 0.4s';
  document.body.style.opacity = '1';

  // ── Totals ────────────────────────────────────────────────────────────────────
  var total = cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0);

  // Desktop summary panel
  var desktopItems   = document.getElementById('checkoutItems');
  var desktopSubtotal = document.getElementById('checkoutSubtotal');
  var desktopTotal   = document.getElementById('checkoutTotal');

  desktopItems.innerHTML = cart.map(function (item) {
    return '<div class="co-item">' +
      '<div class="co-item-info">' +
        '<div class="co-item-name">' + item.name + '</div>' +
        '<div class="co-item-meta">' + item.colorway + ' &nbsp;·&nbsp; SIZE_' + item.size +
          (item.qty > 1 ? ' &nbsp;·&nbsp; QTY_' + item.qty : '') + '</div>' +
      '</div>' +
      '<div class="co-item-price">$' + (item.price * item.qty) + '</div>' +
    '</div>';
  }).join('');
  desktopSubtotal.textContent = '$' + total;
  desktopTotal.textContent    = '$' + total;

  // Mobile order manifest (below form)
  document.getElementById('manifestItems').innerHTML = cart.map(function (item) {
    return '<div class="manifest-row">' +
      '<span class="manifest-name">' + item.name + '</span>' +
      '<span class="manifest-meta">SIZE_' + item.size +
        (item.qty > 1 ? ' &nbsp;·&nbsp; QTY_' + item.qty : '') + '</span>' +
      '<span class="manifest-price">$' + (item.price * item.qty) + '</span>' +
    '</div>';
  }).join('');

  // Fixed bar total
  document.getElementById('bottomTotal').textContent = '$' + total;

  // ── Stripe ────────────────────────────────────────────────────────────────────
  var stripe   = Stripe(STRIPE_PK);
  var elements = stripe.elements();
  var card = elements.create('card', {
    style: {
      base: {
        color: '#e8e8e8',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '12px',
        letterSpacing: '0.06em',
        '::placeholder': { color: '#3a3a3a' },
        iconColor: '#2dd47f',
      },
      invalid: { color: '#ff4d4d', iconColor: '#ff4d4d' },
    },
    hidePostalCode: true,
  });
  card.mount('#card-element');

  // ── Validation ────────────────────────────────────────────────────────────────
  var cardComplete = false;
  var submitBtn    = document.getElementById('submitBtn');
  var requiredIds  = ['firstName', 'lastName', 'email', 'address', 'city', 'postal', 'country'];

  function checkFormValid() {
    var allFilled = requiredIds.every(function (id) {
      return document.getElementById(id).value.trim().length > 0;
    });
    submitBtn.disabled = !(allFilled && cardComplete);
  }

  requiredIds.forEach(function (id) {
    var el = document.getElementById(id);
    el.addEventListener('input', function () {
      el.classList.remove('checkout-input--error');
      checkFormValid();
    });
  });

  card.on('change', function (e) {
    cardComplete = e.complete;
    document.getElementById('card-errors').textContent = e.error ? e.error.message : '';
    checkFormValid();
  });

  // ── Form submit ───────────────────────────────────────────────────────────────
  var form  = document.getElementById('checkoutForm');
  var errEl = document.getElementById('card-errors');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Highlight any empty required fields
    var firstBad = null;
    requiredIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el.value.trim()) {
        el.classList.add('checkout-input--error');
        if (!firstBad) firstBad = el;
      }
    });
    if (firstBad) { firstBad.focus(); return; }

    var firstName = document.getElementById('firstName').value.trim();
    var lastName  = document.getElementById('lastName').value.trim();
    var email     = document.getElementById('email').value.trim();
    var address   = document.getElementById('address').value.trim();
    var city      = document.getElementById('city').value.trim();
    var postal    = document.getElementById('postal').value.trim();
    var country   = document.getElementById('country').value.trim();

    submitBtn.textContent = '[PROCESSING...]';
    submitBtn.disabled    = true;
    errEl.textContent     = '';

    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total * 100 }),
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
          errEl.textContent = result.error.message;
          submitBtn.textContent = '[COMPLETE ORDER]';
          submitBtn.disabled    = false;
        } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          try { localStorage.removeItem('coded_cart'); } catch (e2) {}
          document.getElementById('checkoutBottomBar').style.display = 'none';
          document.getElementById('checkoutFormState').style.display = 'none';
          var successEl = document.getElementById('checkoutSuccess');
          successEl.style.display = 'flex';
          document.getElementById('successEmail').textContent = email;
          document.getElementById('successRef').textContent =
            '[REF_' + result.paymentIntent.id.slice(-8).toUpperCase() + ']';
        }
      })
      .catch(function (err) {
        errEl.textContent     = err.message || 'SOMETHING WENT WRONG. PLEASE TRY AGAIN.';
        submitBtn.textContent = '[COMPLETE ORDER]';
        submitBtn.disabled    = false;
      });
  });
})();
