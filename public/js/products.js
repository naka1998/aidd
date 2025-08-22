class ProductsPage {
  constructor() {
    this.products = [];
    this.currentCategory = '';
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadProducts();
  }

  bindEvents() {
    const categoryFilter = document.getElementById('categoryFilter');
    const closeProductModal = document.getElementById('closeProductModal');
    const addProductBtn = document.getElementById('addProductBtn');
    const closeAddProductModal = document.getElementById('closeAddProductModal');
    const addProductForm = document.getElementById('addProductForm');

    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.currentCategory = e.target.value;
        this.loadProducts();
      });
    }

    if (closeProductModal) {
      closeProductModal.addEventListener('click', () => {
        this.hideModal('productModal');
      });
    }

    if (addProductBtn) {
      addProductBtn.addEventListener('click', () => {
        this.showModal('addProductModal');
      });
    }

    if (closeAddProductModal) {
      closeAddProductModal.addEventListener('click', () => {
        this.hideModal('addProductModal');
      });
    }

    if (addProductForm) {
      addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddProduct();
      });
    }
  }

  async loadProducts() {
    const container = document.getElementById('productsList');
    container.innerHTML = '<div class="loading">商品を読み込み中...</div>';

    try {
      let url = '/api/products';
      if (this.currentCategory) {
        url += `?category=${encodeURIComponent(this.currentCategory)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.data) {
        this.products = data.data;
        this.renderProducts();
      } else {
        container.innerHTML = '<div class="alert alert-error">商品の読み込みに失敗しました</div>';
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      container.innerHTML = '<div class="alert alert-error">商品の読み込み中にエラーが発生しました</div>';
    }
  }

  renderProducts() {
    const container = document.getElementById('productsList');
    
    if (this.products.length === 0) {
      container.innerHTML = '<div class="alert alert-info">商品が見つかりませんでした</div>';
      return;
    }

    container.innerHTML = '';
    this.products.forEach(product => {
      container.appendChild(this.createProductCard(product));
    });
  }

  createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const stockClass = product.stock === 0 ? 'out' : product.stock < 10 ? 'low' : '';
    const stockText = product.stock === 0 ? '在庫切れ' : `在庫: ${product.stock}個`;
    
    card.innerHTML = `
      <div class="product-image" onclick="productsPage.showProductDetails('${product.id}')">
        ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px; cursor: pointer;">` : '画像なし'}
      </div>
      <div class="product-name" onclick="productsPage.showProductDetails('${product.id}')" style="cursor: pointer;">${this.escapeHtml(product.name)}</div>
      <div class="product-description">${this.escapeHtml(product.description)}</div>
      <div class="product-price">¥${product.price.toLocaleString()}</div>
      <div class="product-stock ${stockClass}">${stockText}</div>
      <div class="product-category">カテゴリー: ${this.getCategoryName(product.category)}</div>
      <div style="margin-top: 1rem;">
        <button class="btn btn-primary" onclick="cartManager.addToCart('${product.id}', '${this.escapeHtml(product.name)}', ${product.price}, ${product.stock})" ${product.stock === 0 ? 'disabled' : ''}>
          ${product.stock === 0 ? '在庫切れ' : 'カートに追加'}
        </button>
        <button class="btn btn-secondary" onclick="productsPage.showProductDetails('${product.id}')" style="margin-left: 0.5rem;">
          詳細
        </button>
      </div>
    `;
    
    return card;
  }

  async showProductDetails(productId) {
    try {
      const response = await fetch(`/api/products/${productId}`);
      const data = await response.json();

      if (data.success && data.data) {
        const product = data.data;
        const details = document.getElementById('productDetails');
        
        const stockClass = product.stock === 0 ? 'out' : product.stock < 10 ? 'low' : '';
        const stockText = product.stock === 0 ? '在庫切れ' : `在庫: ${product.stock}個`;

        details.innerHTML = `
          <div style="display: flex; gap: 2rem; margin-bottom: 2rem;">
            <div style="flex: 1;">
              <div class="product-image" style="height: 300px;">
                ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">` : '画像なし'}
              </div>
            </div>
            <div style="flex: 1;">
              <h2>${this.escapeHtml(product.name)}</h2>
              <p style="margin: 1rem 0;">${this.escapeHtml(product.description)}</p>
              <div class="product-price" style="font-size: 2rem; margin: 1rem 0;">¥${product.price.toLocaleString()}</div>
              <div class="product-stock ${stockClass}" style="margin: 1rem 0;">${stockText}</div>
              <div style="margin: 1rem 0;">カテゴリー: ${this.getCategoryName(product.category)}</div>
              <div style="margin: 1rem 0;">作成日: ${new Date(product.createdAt).toLocaleDateString('ja-JP')}</div>
              <button class="btn btn-primary" onclick="cartManager.addToCart('${product.id}', '${this.escapeHtml(product.name)}', ${product.price}, ${product.stock})" ${product.stock === 0 ? 'disabled' : ''}>
                ${product.stock === 0 ? '在庫切れ' : 'カートに追加'}
              </button>
            </div>
          </div>
        `;

        this.showModal('productModal');
      } else {
        alert('商品詳細の取得に失敗しました');
      }
    } catch (error) {
      console.error('Failed to load product details:', error);
      alert('商品詳細の取得中にエラーが発生しました');
    }
  }

  async handleAddProduct() {
    if (!window.authManager.isAuthenticated()) {
      alert('商品追加にはログインが必要です');
      return;
    }

    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const category = document.getElementById('productCategory').value;
    const imageUrl = document.getElementById('productImageUrl').value || undefined;
    const alertElement = document.getElementById('addProductAlert');

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: window.authManager.getAuthHeaders(),
        body: JSON.stringify({ name, description, price, stock, category, imageUrl }),
      });

      const data = await response.json();

      if (data.success) {
        this.showAlert(alertElement, data.message, 'success');
        document.getElementById('addProductForm').reset();
        setTimeout(() => {
          this.hideModal('addProductModal');
          this.loadProducts();
        }, 2000);
      } else {
        this.showAlert(alertElement, data.error, 'error');
      }
    } catch (error) {
      console.error('Add product error:', error);
      this.showAlert(alertElement, '商品追加中にエラーが発生しました', 'error');
    }
  }

  getCategoryName(category) {
    const categories = {
      electronics: '電子機器',
      clothing: '衣類',
      books: '書籍',
      home: 'ホーム・ガーデン',
      sports: 'スポーツ・アウトドア'
    };
    return categories[category] || category;
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
window.productsPage = new ProductsPage();