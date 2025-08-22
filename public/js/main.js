class ECommerceApp {
  constructor() {
    this.init();
  }

  init() {
    this.loadFeaturedProducts();
  }

  async loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    
    try {
      const response = await fetch('/api/products?limit=6');
      const data = await response.json();

      if (data.success && data.data) {
        container.innerHTML = '';
        data.data.forEach(product => {
          container.appendChild(this.createProductCard(product));
        });
      } else {
        container.innerHTML = '<div class="alert alert-error">商品の読み込みに失敗しました</div>';
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      container.innerHTML = '<div class="alert alert-error">商品の読み込み中にエラーが発生しました</div>';
    }
  }

  createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const stockClass = product.stock === 0 ? 'out' : product.stock < 10 ? 'low' : '';
    const stockText = product.stock === 0 ? '在庫切れ' : `在庫: ${product.stock}個`;
    
    card.innerHTML = `
      <div class="product-image">
        ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">` : '画像なし'}
      </div>
      <div class="product-name">${this.escapeHtml(product.name)}</div>
      <div class="product-description">${this.escapeHtml(product.description)}</div>
      <div class="product-price">¥${product.price.toLocaleString()}</div>
      <div class="product-stock ${stockClass}">${stockText}</div>
      <button class="btn btn-primary" onclick="cartManager.addToCart('${product.id}', '${this.escapeHtml(product.name)}', ${product.price}, ${product.stock})" ${product.stock === 0 ? 'disabled' : ''}>
        ${product.stock === 0 ? '在庫切れ' : 'カートに追加'}
      </button>
    `;
    
    return card;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

class CartManager {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.updateCartDisplay();
  }

  addToCart(productId, name, price, maxStock) {
    if (!window.authManager.isAuthenticated()) {
      alert('カートに追加するにはログインが必要です');
      return;
    }

    const existingItem = this.cart.find(item => item.productId === productId);
    
    if (existingItem) {
      if (existingItem.quantity < maxStock) {
        existingItem.quantity++;
        this.showAlert('商品をカートに追加しました', 'success');
      } else {
        this.showAlert('在庫が不足しています', 'error');
        return;
      }
    } else {
      this.cart.push({
        productId,
        name,
        price,
        quantity: 1,
        maxStock
      });
      this.showAlert('商品をカートに追加しました', 'success');
    }
    
    this.saveCart();
    this.updateCartDisplay();
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.productId !== productId);
    this.saveCart();
    this.updateCartDisplay();
  }

  updateQuantity(productId, newQuantity) {
    const item = this.cart.find(item => item.productId === productId);
    if (item) {
      if (newQuantity <= 0) {
        this.removeFromCart(productId);
      } else if (newQuantity <= item.maxStock) {
        item.quantity = newQuantity;
        this.saveCart();
        this.updateCartDisplay();
      } else {
        this.showAlert('在庫が不足しています', 'error');
      }
    }
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.updateCartDisplay();
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  updateCartDisplay() {
    // ここでカートアイコンの数を更新できます
    const cartCount = this.cart.reduce((total, item) => total + item.quantity, 0);
    // カートアイコンがあれば更新
  }

  getCartTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  showAlert(message, type) {
    // 簡単なアラート表示
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      document.body.removeChild(alertDiv);
    }, 3000);
  }
}

// モーダル関連のユーティリティ
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.add('hidden');
  }
});

// ESCキーでモーダルを閉じる
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.add('hidden');
    });
  }
});

// アプリケーションとカートマネージャーの初期化
window.ecommerceApp = new ECommerceApp();
window.cartManager = new CartManager();