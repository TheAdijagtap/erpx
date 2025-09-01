export const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

export const formatDateIN = (d?: Date | string) =>
  d ? new Date(d).toLocaleDateString('en-IN') : "";
