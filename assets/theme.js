/**
 * Aroma Perfume Theme JavaScript
 * Main theme functionality
 */

class ThemeCart {
  constructor() {
    this.drawer = document.querySelector('[data-cart-drawer]');
    this.overlay = document.querySelector('[data-cart-overlay]');
    this.toggleButtons = document.querySelectorAll('[data-cart-toggle]');
    this.closeButtons = document.querySelectorAll('[data-cart-close]');
    
    this.init();
  }

  init() {
    // Toggle cart drawer
    this.toggleButtons.forEach(button => {
      button.addEventListener('click', () => this.open());
    });

    // Close cart drawer
    this.closeButtons.forEach(button => {
      button.addEventListener('click', () => this.close());
    });

    // Close on overlay click
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }

    // Add to cart buttons
    document.addEventListener('click', (e) => {
      const addButton = e.target.closest('[data-product-id]');
      if (addButton && !addButton.closest('.cart-item')) {
        e.preventDefault();
        this.addToCart(addButton.dataset.productId);
      }
    });

    // Cart quantity buttons
    document.addEventListener('click', (e) => {
      const increaseBtn = e.target.closest('[data-cart-increase]');
      const decreaseBtn = e.target.closest('[data-cart-decrease]');
      const removeBtn = e.target.closest('[data-cart-remove]');

      if (increaseBtn) {
        this.updateQuantity(increaseBtn.dataset.cartIncrease, 1);
      } else if (decreaseBtn) {
        this.updateQuantity(decreaseBtn.dataset.cartDecrease, -1);
      } else if (removeBtn) {
        this.removeItem(removeBtn.dataset.cartRemove);
      }
    });

    // Handle product form submission for AJAX cart
    const productForm = document.querySelector('#product-form');
    if (productForm) {
      productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit(productForm);
      });
    }
  }

  async handleFormSubmit(form) {
    const formData = new FormData(form);

    try {
      const response = await fetch(window.shopifyConfig.cart_add_url, {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });

      if (response.ok) {
        await this.refreshCart();
        this.open();
        this.showNotification('Producto agregado al carrito');
      } else {
        const errorData = await response.json();
        this.showNotification(errorData.description || 'Error al agregar al carrito', 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showNotification('Error al agregar al carrito', 'error');
    }
  }

  open() {
    if (this.drawer) {
      this.drawer.classList.add('active');
      this.overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  close() {
    if (this.drawer) {
      this.drawer.classList.remove('active');
      this.overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  async addToCart(productId) {
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            id: productId,
            quantity: 1
          }]
        })
      });

      if (response.ok) {
        await this.refreshCart();
        this.open();
        this.showNotification('Producto agregado al carrito');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showNotification('Error al agregar al carrito', 'error');
    }
  }

  async updateQuantity(key, change) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: key,
          quantity: change
        })
      });

      if (response.ok) {
        await this.refreshCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }

  async removeItem(key) {
    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: key,
          quantity: 0
        })
      });

      if (response.ok) {
        await this.refreshCart();
        this.showNotification('Producto eliminado del carrito');
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  }

  async refreshCart() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      // Update cart count
      const countElements = document.querySelectorAll('[data-cart-count]');
      countElements.forEach(el => {
        el.textContent = cart.item_count;
      });

      // Reload cart drawer content
      const drawerContent = await fetch(window.location.href);
      const html = await drawerContent.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newDrawer = doc.querySelector('[data-cart-drawer]');
      
      if (this.drawer && newDrawer) {
        this.drawer.innerHTML = newDrawer.innerHTML;
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
    }
  }

  showNotification(message, type = 'success') {
    // Simple notification (you can enhance this)
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      background: ${type === 'success' ? '#fbbf24' : '#ef4444'};
      color: ${type === 'success' ? '#0f172a' : 'white'};
      border-radius: 0.5rem;
      font-weight: 500;
      z-index: 99999;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

class MobileMenu {
  constructor() {
    this.toggle = document.querySelector('[data-mobile-menu-toggle]');
    this.menu = document.querySelector('[data-mobile-menu]');
    
    this.init();
  }

  init() {
    if (this.toggle && this.menu) {
      this.toggle.addEventListener('click', () => {
        this.menu.classList.toggle('active');
      });
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ThemeCart();
  new MobileMenu();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }
`;
document.head.appendChild(style);
