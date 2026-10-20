export const somenteDigitos = (valor = '') => String(valor).replace(/\D/g, '');

export function mascaraTelefone(valor) {
  const d = somenteDigitos(valor).slice(0, 11);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// Até 11 dígitos = CPF; acima disso = CNPJ
export function mascaraCpfCnpj(valor) {
  const d = somenteDigitos(valor).slice(0, 14);
  if (d.length <= 11) {
    let r = d.slice(0, 3);
    if (d.length > 3) r += `.${d.slice(3, 6)}`;
    if (d.length > 6) r += `.${d.slice(6, 9)}`;
    if (d.length > 9) r += `-${d.slice(9, 11)}`;
    return r;
  }
  return (
    `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}` +
    `/${d.slice(8, 12)}-${d.slice(12, 14)}`
  );
}

export const cpfCnpjOculto = (valor) =>
  mascaraCpfCnpj(valor).replace(/\d/g, '*');

export function mascaraCep(valor) {
  const d = somenteDigitos(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export const mascaraEmail = (valor = '') =>
  String(valor).replace(/\s/g, '').toLowerCase();

export const emailValido = (valor) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor);

export const telefoneValido = (valor) => {
  const n = somenteDigitos(valor).length;
  return n === 10 || n === 11;
};

export const cpfCnpjValido = (valor) => {
  const n = somenteDigitos(valor).length;
  return n === 11 || n === 14;
};

export function formatarData(iso) {
  if (!iso) return '';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

export const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA',
  'PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];
