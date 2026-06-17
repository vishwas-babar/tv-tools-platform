declare module "@cashfreepayments/cashfree-js" {
  export interface CashfreeCheckoutOptions {
    paymentSessionId: string;
    redirectTarget?: "_self" | "_blank" | "_top" | "_modal";
  }

  export interface CashfreeCheckoutResult {
    error?: {
      message?: string;
    };
  }

  export interface CashfreeInstance {
    checkout(options: CashfreeCheckoutOptions): Promise<CashfreeCheckoutResult>;
  }

  export interface LoadOptions {
    mode: "sandbox" | "production";
  }

  export function load(options: LoadOptions): Promise<CashfreeInstance | null>;
}
