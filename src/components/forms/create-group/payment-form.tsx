'use client';

type Props = {
  userId: string;
  affiliate: boolean;
  stripeId?: string;
};

// WIP: connect the use payment hook

const PaymentForm = ({ userId, affiliate, stripeId }: Props) => {
  return <div>PaymentForm</div>;
};

export default PaymentForm;
