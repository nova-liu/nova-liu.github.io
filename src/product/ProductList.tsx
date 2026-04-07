import NavigationBar from "../navigation/NavigationBar";
import { products } from "./productConfig";
import "./ProductList.css";

export default function ProductList() {
  return (
    <div className="product-list">
      <NavigationBar />

      <main className="product-list__content">
        <div className="product-list__container">
          <header className="product-list__header">
            <h1 className="product-list__title">Products</h1>
            <p className="product-list__description">
              A selection of projects I built.
            </p>
          </header>

          <div className="product-list__grid">
            {products.map((product, index) => (
              <a
                key={product.id}
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="product-list__card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="product-list__logo-wrapper">
                  <img
                    src={product.logo}
                    alt={`${product.name} logo`}
                    className="product-list__logo"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const fallback = target.nextSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  <div className="product-list__logo-fallback">LOGO</div>
                </div>

                <div className="product-list__info">
                  <h2 className="product-list__name">{product.name}</h2>
                  <p className="product-list__intro">{product.description}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
