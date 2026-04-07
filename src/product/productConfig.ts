export interface Product {
  id: string;
  name: string;
  // Supports common image formats such as svg, png, jpg/jpeg, and webp.
  logo: string;
  description: string;
  productUrl: string;
}

export const products: Product[] = [
  {
    id: "nano-agent",
    name: "Nano Agent",
    logo: "/product/nanoAgent.svg",
    description:
      "A multi-agent terminal collaboration experiment built on OpenAI-compatible Chat Completions.",
    productUrl: "https://github.com/nova-liu/nanoAgent",
  },
];
