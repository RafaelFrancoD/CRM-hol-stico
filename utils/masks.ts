// utils/masks.ts

export const maskCPF = (value: string): string => {
  if (!value) return "";
  value = value.replace(/\D/g, ''); // Remove all non-digits
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return value.slice(0, 14); // Max length of ###.###.###-##
};

export const maskPhone = (value: string): string => {
  if (!value) return "";
  value = value.replace(/\D/g, '');
  value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
  value = value.replace(/(\d{5})(\d)/, '$1-$2');
  return value.slice(0, 15); // Max length of (##) #####-####
};

export const maskRG = (value: string): string => {
  if (!value) return "";
  // This is a common format, but not universal. It's a UX improvement.
  value = value.replace(/\D/g, ''); 
  value = value.replace(/(\d{2})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d{1})$/, '$1-$2');
  return value.slice(0, 12); // Max length of ##.###.###-#
};
