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
      "The minimal agent framework for research and experimentation.",
    productUrl: "https://github.com/nova-liu/nanoAgent",
  },
  {
    id: "claude-broswer-bridge",
    name: "Claude Browser Bridge",
    logo: "/product/claude-broswer-bridge.png",
    description:
      "Run Claude Code directly in the browser, with the ability to read and control the current page.",
    productUrl: "https://github.com/nova-liu/claude-broswer-bridge",
  },
];
