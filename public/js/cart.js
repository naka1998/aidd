class CartPage {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadCart();
    if (window.authManager.isAuthenticated()) {
      this.loadOrderHistory();
    }
  }

  bindEvents() {
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const closeCheckoutModal = document.getElementById('closeCheckoutModal');
    const confirmOrderBtn = document.getElementById('confirmOrderBtn');

    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', () => {
        if (confirm('カート内の全ての商品を削除しますか？')) {
          window.cartManager.clearCart();
          this.loadCart();
        }
      });
    }

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        this.showCheckoutModal();
      });
    }

    if (closeCheckoutModal) {
      closeCheckoutModal.addEventListener('click', () => {
        this.hideModal('checkoutModal');
      });
    }

    if (confirmOrderBtn) {
      confirmOrderBtn.addEventListener('click', () => {
        this.handleCheckout();
      });
    }
  }

  loadCart() {
    const cart = window.cartManager.cart;
    const emptyCart = document.getElementById('emptyCart');
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');

    if (cart.length === 0) {
      emptyCart.classList.remove('hidden');
      cartItems.classList.add('hidden');
      cartSummary.classList.add('hidden');
      return;
    }

    emptyCart.classList.add('hidden');
    cartItems.classList.remove('hidden');
    cartSummary.classList.remove('hidden');

    cartItems.innerHTML = '';
    cart.forEach(item => {
      cartItems.appendChild(this.createCartItem(item));
    });

    this.updateCartSummary();
  }

  createCartItem(item) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    
    cartItem.innerHTML = `
      <div class="cart-item-image">画像</div>
      <div class="cart-item-details">
        <div class="cart-item-name">${this.escapeHtml(item.name)}</div>
        <div class="cart-item-price">¥${item.price.toLocaleString()}</div>
        <div class="quantity-controls">
          <button class="quantity-btn" onclick="cartPage.updateQuantity('${item.productId}', ${item.quantity - 1})">-</button>
          <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="${item.maxStock}" onchange="cartPage.updateQuantity('${item.productId}', parseInt(this.value))">
          <button class="quantity-btn" onclick="cartPage.updateQuantity('${item.productId}', ${item.quantity + 1})">+</button>
        </div>
        <div>小計: ¥${(item.price * item.quantity).toLocaleString()}</div>
      </div>
      <div>
        <button class="btn btn-secondary" onclick="cartPage.removeFromCart('${item.productId}')">削除</button>
      </div>
    `;
    
    return cartItem;
  }

  updateQuantity(productId, newQuantity) {
    window.cartManager.updateQuantity(productId, newQuantity);
    this.loadCart();
  }

  removeFromCart(productId) {
    if (confirm('この商品をカートから削除しますか？')) {
      window.cartManager.removeFromCart(productId);
      this.loadCart();
    }
  }

  updateCartSummary() {
    const cart = window.cartManager.cart;
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = Math.floor(subtotal * 0.1);
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = subtotal.toLocaleString();
    document.getElementById('tax').textContent = tax.toLocaleString();
    document.getElementById('total').textContent = total.toLocaleString();
  }

  showCheckoutModal() {
    if (!window.authManager.isAuthenticated()) {
      alert('注文するにはログインが必要です');
      return;
    }

    const cart = window.cartManager.cart;
    if (cart.length === 0) {
      alert('カートに商品がありません');
      return;
    }

    const summary = document.getElementById('checkoutSummary');
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = Math.floor(subtotal * 0.1);
    const total = subtotal + tax;

    let summaryHTML = '<h4>注文内容</h4>';
    cart.forEach(item => {
      summaryHTML += `
        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee;">
          <span>${this.escapeHtml(item.name)} x ${item.quantity}</span>
          <span>¥${(item.price * item.quantity).toLocaleString()}</span>
        </div>
      `;
    });

    summaryHTML += `
      <div style="margin-top: 1rem; font-weight: bold;">
        <div style="display: flex; justify-content: space-between;">
          <span>小計:</span>
          <span>¥${subtotal.toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>税金:</span>
          <span>¥${tax.toLocaleString()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 1.2rem; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 2px solid #333;">
          <span>合計:</span>
          <span>¥${total.toLocaleString()}</span>
        </div>
      </div>
    `;

    summary.innerHTML = summaryHTML;
    this.showModal('checkoutModal');
  }

  async handleCheckout() {
    const cart = window.cartManager.cart;
    const alertElement = document.getElementById('checkoutAlert');

    if (!window.authManager.isAuthenticated()) {
      this.showAlert(alertElement, 'ログインが必要です', 'error');
      return;
    }

    const orderItems = cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: window.authManager.getAuthHeaders(),
        body: JSON.stringify({ items: orderItems }),
      });

      const data = await response.json();

      if (data.success) {
        this.showAlert(alertElement, '注文が正常に処理されました！', 'success');
        window.cartManager.clearCart();
        setTimeout(() => {
          this.hideModal('checkoutModal');
          this.loadCart();
          this.loadOrderHistory();
        }, 2000);
      } else {
        this.showAlert(alertElement, data.error, 'error');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      this.showAlert(alertElement, '注文処理中にエラーが発生しました', 'error');
    }
  }

  async loadOrderHistory() {
    if (!window.authManager.isAuthenticated()) {
      return;
    }

    const orderHistory = document.getElementById('orderHistory');
    const ordersList = document.getElementById('ordersList');
    
    orderHistory.classList.remove('hidden');

    try {
      const response = await fetch(`/api/orders/user/${window.authManager.user.id}`, {
        headers: window.authManager.getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success && data.data) {
        if (data.data.length === 0) {
          ordersList.innerHTML = '<div class="alert alert-info">注文履歴がありません</div>';
          return;
        }

        ordersList.innerHTML = '';
        data.data.forEach(order => {
          ordersList.appendChild(this.createOrderCard(order));
        });
      } else {
        ordersList.innerHTML = '<div class="alert alert-error">注文履歴の読み込みに失敗しました</div>';
      }
    } catch (error) {
      console.error('Failed to load order history:', error);
      ordersList.innerHTML = '<div class="alert alert-error">注文履歴の読み込み中にエラーが発生しました</div>';
    }
  }

  createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const statusClass = {
      pending: 'warning',
      confirmed: 'info',
      shipped: 'primary',
      delivered: 'success'
    }[order.status] || 'secondary';

    const statusText = {
      pending: '処理中',
      confirmed: '確認済み',
      shipped: '発送済み',
      delivered: '配送完了'
    }[order.status] || order.status;

    let itemsHTML = '';
    order.items.forEach(item => {
      itemsHTML += `<div>${this.escapeHtml(item.name)} x ${item.quantity} - ¥${(item.price * item.quantity).toLocaleString()}</div>`;
    });

    card.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <strong>注文ID:</strong> ${order.id.substring(0, 8)}...
      </div>
      <div style="margin-bottom: 1rem;">
        <strong>注文日:</strong> ${new Date(order.createdAt).toLocaleDateString('ja-JP')}
      </div>
      <div style="margin-bottom: 1rem;">
        <strong>ステータス:</strong> <span class="badge badge-${statusClass}">${statusText}</span>
      </div>
      <div style="margin-bottom: 1rem;">
        <strong>商品:</strong><br>
        ${itemsHTML}
      </div>
      <div style="font-size: 1.2rem; font-weight: bold;">
        合計: ¥${order.totalAmount.toLocaleString()}
      </div>
    `;
    
    return card;
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  showAlert(element, message, type) {
    if (element) {
      element.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// ページの初期化
window.cartPage = new CartPage();