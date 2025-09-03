export const STRIPE_LIFETIME_LINK = import.meta.env
  .VITE_STRIPE_LIFETIME_PAYMENT_LINK as string;

if (import.meta.env.DEV && !STRIPE_LIFETIME_LINK) {
  // eslint-disable-next-line no-console
  console.error(
    "Missing VITE_STRIPE_LIFETIME_PAYMENT_LINK. Set it in your .env file."
  );
}

